import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'notificari@besmatracking.ro';
const APP_URL = Deno.env.get('APP_URL') || 'https://besma-wlin.vercel.app';

const ZILE_ALERTA = [30, 14, 7];

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Găsește toate documentele care expiră în 30, 14 sau 7 zile
    const { data: documente, error: docErr } = await supabase
      .from('documente')
      .select(`
        id, tip, data_expirare, asigurator, nr_polita,
        masini (
          id, nr_inmatriculare, marca, model,
          locatie_id,
          locatii (id, nume)
        )
      `)
      .gte('data_expirare', new Date().toISOString().split('T')[0]);

    if (docErr) throw docErr;

    // Găsește super adminii
    const { data: superAdmins } = await supabase
      .from('profiles')
      .select('id, full_name, locatie_id')
      .eq('role', 'super_admin');

    const { data: superAdminUsers } = await supabase.auth.admin.listUsers();
    const superAdminEmails = superAdmins?.map(sa => {
      const user = superAdminUsers?.users?.find(u => u.id === sa.id);
      return { email: user?.email, nume: sa.full_name };
    }).filter(x => x.email) || [];

    // Găsește managerii per locație
    const { data: manageri } = await supabase
      .from('profiles')
      .select('id, full_name, locatie_id')
      .eq('role', 'manager');

    const { data: manageriUsers } = await supabase.auth.admin.listUsers();

    const azi = new Date();
    azi.setHours(0, 0, 0, 0);

    let emailuriTrimise = 0;
    let erori = 0;

    for (const doc of documente || []) {
      const expirare = new Date(doc.data_expirare);
      expirare.setHours(0, 0, 0, 0);
      const zileRamase = Math.ceil((expirare - azi) / (1000 * 60 * 60 * 24));

      // Verifică dacă e una din zilele de alertă
      if (!ZILE_ALERTA.includes(zileRamase)) continue;

      // Verifică dacă am trimis deja notificare azi pentru acest document
      const tipNotificare = `expirare_${zileRamase}`;
      const { data: notifExistenta } = await supabase
        .from('notificari')
        .select('id')
        .eq('document_id', doc.id)
        .eq('tip', tipNotificare)
        .gte('created_at', new Date().toISOString().split('T')[0])
        .single();

      if (notifExistenta) continue; // Deja trimis azi

      // Construiește lista de destinatari
      const destinatari = [...superAdminEmails];

      // Adaugă managerul locației
      if (doc.masini?.locatie_id) {
        const managerLocatie = manageri?.find(m => m.locatie_id === doc.masini.locatie_id);
        if (managerLocatie) {
          const managerUser = manageriUsers?.users?.find(u => u.id === managerLocatie.id);
          if (managerUser?.email) {
            destinatari.push({ email: managerUser.email, nume: managerLocatie.full_name });
          }
        }
      }

      // Elimină duplicate
      const destinatariUnici = destinatari.filter((d, i, arr) =>
        arr.findIndex(x => x.email === d.email) === i
      );

      // Trimite email fiecărui destinatar
      const emailuriDestinatar = [];
      for (const dest of destinatariUnici) {
        const emailBody = generateEmailHTML({
          destinatar: dest.nume || dest.email,
          doc, zileRamase, appUrl: APP_URL,
        });

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `BesmaTracking <${FROM_EMAIL}>`,
            to: [dest.email],
            subject: generateSubject(doc, zileRamase),
            html: emailBody,
          }),
        });

        if (res.ok) {
          emailuriTrimise++;
          emailuriDestinatar.push(dest.email);
        } else {
          erori++;
          console.error('Eroare trimitere email:', await res.text());
        }
      }

      // Salvează notificarea în baza de date
      await supabase.from('notificari').insert({
        document_id: doc.id,
        masina_id: doc.masini?.id,
        tip: tipNotificare,
        trimis_la: emailuriDestinatar,
        trimis_at: new Date().toISOString(),
        succes: emailuriDestinatar.length > 0,
      });
    }

    return new Response(
      JSON.stringify({ success: true, emailuriTrimise, erori }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Eroare edge function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generateSubject(doc, zileRamase) {
  const urgenta = zileRamase <= 7 ? '🔴 URGENT' : zileRamase <= 14 ? '🟡 Atenție' : '🔵 Informare';
  return `${urgenta} — ${doc.tip} expiră în ${zileRamase} zile · ${doc.masini?.nr_inmatriculare}`;
}

function generateEmailHTML({ destinatar, doc, zileRamase, appUrl }) {
  const culoare = zileRamase <= 7 ? '#A32D2D' : zileRamase <= 14 ? '#854F0B' : '#185FA5';
  const bgCuloare = zileRamase <= 7 ? '#FCEBEB' : zileRamase <= 14 ? '#FAEEDA' : '#E6F1FB';
  const urgentaText = zileRamase <= 7 ? 'URGENT — Acțiune necesară imediat' : zileRamase <= 14 ? 'Atenție — Acțiune necesară în curând' : 'Informare — Document care expiră în curând';

  const dataExpirare = new Date(doc.data_expirare).toLocaleDateString('ro-RO', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Alertă expirare document</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:#0C1B2E;border-radius:12px 12px 0 0;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-family:Georgia,serif;font-size:22px;color:white;font-weight:bold;">BesmaTracking</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:3px;">Management flotă auto</div>
              </td>
              <td align="right">
                <div style="background:#185FA5;border-radius:8px;padding:8px 14px;font-size:12px;color:white;font-weight:500;">Alertă document</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ALERT BANNER -->
        <tr><td style="background:${bgCuloare};padding:16px 32px;border-left:4px solid ${culoare};">
          <div style="font-size:13px;font-weight:600;color:${culoare};">${urgentaText}</div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:white;padding:32px;">
          <p style="font-size:15px;color:#1a1a18;margin:0 0 20px;">Bună ${destinatar},</p>
          <p style="font-size:14px;color:#5F5E5A;line-height:1.6;margin:0 0 24px;">
            Documentul de mai jos expiră în <strong style="color:${culoare};">${zileRamase} zile</strong>.
            Te rugăm să iei măsurile necesare pentru reînnoire.
          </p>

          <!-- DOCUMENT CARD -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;border-radius:10px;padding:20px;margin-bottom:24px;">
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom:12px;">
                    <div style="font-size:11px;color:#888780;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Mașină</div>
                    <div style="font-size:15px;font-weight:700;color:#1a1a18;font-family:monospace;">${doc.masini?.nr_inmatriculare}</div>
                    <div style="font-size:12px;color:#5F5E5A;">${doc.masini?.marca} ${doc.masini?.model}</div>
                  </td>
                  <td width="50%" style="padding-bottom:12px;">
                    <div style="font-size:11px;color:#888780;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Tip document</div>
                    <div style="font-size:15px;font-weight:700;color:#1a1a18;">${doc.tip}</div>
                    ${doc.asigurator ? `<div style="font-size:12px;color:#5F5E5A;">${doc.asigurator}</div>` : ''}
                  </td>
                </tr>
                <tr>
                  <td width="50%">
                    <div style="font-size:11px;color:#888780;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Locație</div>
                    <div style="font-size:13px;color:#1a1a18;">${doc.masini?.locatii?.nume || '—'}</div>
                  </td>
                  <td width="50%">
                    <div style="font-size:11px;color:#888780;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Data expirării</div>
                    <div style="font-size:13px;font-weight:600;color:${culoare};">${dataExpirare}</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- ZILE RAMASE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgCuloare};border-radius:8px;padding:16px;margin-bottom:28px;text-align:center;">
            <tr><td>
              <div style="font-size:42px;font-weight:700;color:${culoare};line-height:1;">${zileRamase}</div>
              <div style="font-size:13px;color:${culoare};margin-top:4px;">zile rămase</div>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${appUrl}/documente" style="display:inline-block;background:#185FA5;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:500;">
                Deschide BesmaTracking
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#F5F4F0;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
          <p style="font-size:11px;color:#888780;margin:0;">
            Acest email a fost trimis automat de BesmaTracking.<br/>
            © 2026 BesmaTracking — Management flotă auto
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
