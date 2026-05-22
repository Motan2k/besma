export const locatii = [
  { id: 1, nume: 'București', adresa: 'Str. Mihai Eminescu 14, Sector 2', tip: 'Sediu central', manageri: 2 },
  { id: 2, nume: 'Cluj-Napoca', adresa: 'Bd. Eroilor 42, Cluj', tip: 'Sucursală Nord-Vest', manageri: 1 },
  { id: 3, nume: 'Timișoara', adresa: 'Calea Sagului 110, Timișoara', tip: 'Sucursală Vest', manageri: 1 },
  { id: 4, nume: 'Iași', adresa: 'Str. Anastasie Panu 28, Iași', tip: 'Sucursală Est', manageri: 1 },
];

export const soferi = [
  { id: 1, nume: 'Ion Popescu', email: 'ion.popescu@firma.ro', telefon: '0722 123 456', locatie_id: 1, masina_id: 1, initiale: 'IP', culoare: 'blue' },
  { id: 2, nume: 'Maria Ionescu', email: 'maria.ionescu@firma.ro', telefon: '0744 987 654', locatie_id: 2, masina_id: 2, initiale: 'MI', culoare: 'green' },
  { id: 3, nume: 'Andrei Dumitrescu', email: 'andrei.d@firma.ro', telefon: '0733 456 789', locatie_id: 4, masina_id: 4, initiale: 'AD', culoare: 'pink' },
  { id: 4, nume: 'Elena Radu', email: 'elena.radu@firma.ro', telefon: '0755 321 098', locatie_id: 1, masina_id: 5, initiale: 'ER', culoare: 'amber' },
];

export const masini = [
  {
    id: 1, marca: 'Dacia', model: 'Logan', an: 2022, culoare: 'Alb',
    nr_inmatriculare: 'B 123 ABC', vin: 'UU1LSDB2564820011',
    combustibil: 'Benzină', km: 87400, locatie_id: 1, sofer_id: 1,
    status: 'activa', gps: true, gps_status: 'online',
    rca: { asigurator: 'Allianz', polita: 'POL-2024-88821', start: '2025-06-01', expira: '2026-06-01' },
    itp: { expira: '2027-08-15' },
    rovigneta: { tip: '1 an', expira: '2027-03-01' },
  },
  {
    id: 2, marca: 'Skoda', model: 'Octavia', an: 2021, culoare: 'Gri',
    nr_inmatriculare: 'CJ 45 XYZ', vin: 'TMBEG7NE0M0123456',
    combustibil: 'Diesel', km: 102100, locatie_id: 2, sofer_id: 2,
    status: 'service', gps: true, gps_status: 'online',
    rca: { asigurator: 'Generali', polita: 'POL-2025-44321', start: '2025-07-01', expira: '2026-07-01' },
    itp: { expira: '2026-06-05' },
    rovigneta: { tip: '1 an', expira: '2027-01-10' },
  },
  {
    id: 3, marca: 'Ford', model: 'Transit', an: 2020, culoare: 'Alb',
    nr_inmatriculare: 'TM 88 DEF', vin: 'WF0XXXTTGXKR12345',
    combustibil: 'Diesel', km: 64200, locatie_id: 3, sofer_id: null,
    status: 'activa', gps: true, gps_status: 'online',
    rca: { asigurator: 'Omniasig', polita: 'POL-2025-77001', start: '2025-08-01', expira: '2026-08-01' },
    itp: { expira: '2026-11-20' },
    rovigneta: { tip: '1 an', expira: '2026-06-20' },
  },
  {
    id: 4, marca: 'Volkswagen', model: 'Passat', an: 2023, culoare: 'Negru',
    nr_inmatriculare: 'IS 22 GHI', vin: 'WVWZZZ3CZ9E123456',
    combustibil: 'Hybrid', km: 41800, locatie_id: 4, sofer_id: 3,
    status: 'activa', gps: true, gps_status: 'offline',
    rca: { asigurator: 'Generali', polita: 'POL-2025-11245', start: '2025-06-25', expira: '2026-06-25' },
    itp: { expira: '2027-04-10' },
    rovigneta: { tip: '1 an', expira: '2027-02-15' },
  },
  {
    id: 5, marca: 'Renault', model: 'Kangoo', an: 2019, culoare: 'Alb',
    nr_inmatriculare: 'B 77 JKL', vin: 'VF1FW0ZBC5123456',
    combustibil: 'Benzină', km: 128000, locatie_id: 1, sofer_id: 4,
    status: 'activa', gps: true, gps_status: 'online',
    rca: { asigurator: 'Omniasig', polita: 'POL-2026-55443', start: '2026-04-10', expira: '2027-04-10' },
    itp: { expira: '2027-03-15' },
    rovigneta: { tip: '1 an', expira: '2027-01-20' },
  },
];

export const servicii = [
  {
    id: 1, masina_id: 1, data: '2026-05-12', km: 87400,
    titlu: 'Schimb ulei + filtru aer',
    descriere: 'Ulei 5W-40 Castrol 5L, filtru ulei Mann, filtru aer K&N',
    service_auto: 'Auto Total SRL', cost: 520,
    urmator_data: null, urmator_km: 95000,
    documente: ['factura_87400.pdf'],
  },
  {
    id: 2, masina_id: 2, data: '2026-05-08', km: 102100,
    titlu: 'Plăcuțe frână față',
    descriere: 'Brembo Sport P06 021, verificare și rectificare discuri față',
    service_auto: 'Service Cluj Pro', cost: 780,
    urmator_data: '2026-11-01', urmator_km: null,
    documente: ['factura_102100.pdf'],
  },
  {
    id: 3, masina_id: 3, data: '2026-05-03', km: 64200,
    titlu: 'Schimb anvelope vară',
    descriere: 'Michelin Pilot Sport 4, 205/55R16, echilibrare și geometrie',
    service_auto: 'Vulcanizare Rapid TM', cost: 1200,
    urmator_data: '2026-10-01', urmator_km: null,
    documente: [],
  },
  {
    id: 4, masina_id: 4, data: '2026-04-21', km: 41800,
    titlu: 'Revizie completă 40.000 km',
    descriere: 'Ulei 0W-30, filtre ulei/aer/habitaclu/combustibil, bujii, curea distribuție + rolă tensionare',
    service_auto: 'VW Service Iași', cost: 2450,
    urmator_data: null, urmator_km: 80000,
    documente: ['revizie_40000.pdf', 'garantie_curea.pdf'],
  },
  {
    id: 5, masina_id: 5, data: '2026-03-15', km: 125000,
    titlu: 'Schimb amortizoare față',
    descriere: 'Monroe Original față stânga + dreapta, fluidizare direcție',
    service_auto: 'Auto Total SRL', cost: 950,
    urmator_data: null, urmator_km: null,
    documente: ['factura_amort.pdf'],
  },
];

// Calcul zile rămase până la expirare
export function zileRamase(dataExpirare) {
  const azi = new Date();
  const exp = new Date(dataExpirare);
  const diff = Math.ceil((exp - azi) / (1000 * 60 * 60 * 24));
  return diff;
}

export function statusExpirare(zile) {
  if (zile <= 0) return 'expirat';
  if (zile <= 14) return 'critic';
  if (zile <= 30) return 'atentie';
  return 'valid';
}

export function formatData(dataStr) {
  if (!dataStr) return '—';
  const d = new Date(dataStr);
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
