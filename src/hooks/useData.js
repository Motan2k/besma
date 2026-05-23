import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function useQuery(queryFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await queryFn();
    if (error) setError(error.message);
    else setData(data);
    setLoading(false);
  }, deps); // eslint-disable-line

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useLocatii() {
  return useQuery(() =>
    supabase.from('locatii').select('*').order('nume')
  );
}

export function useMasini(filters = {}) {
  const { locatieId, isAdmin } = useAuth();
  return useQuery(() => {
    let q = supabase
      .from('masini')
      .select(`*, locatii(id, nume), profiles!sofer_id(id, full_name, phone)`)
      .order('nr_inmatriculare');
    if (filters.locatieId) q = q.eq('locatie_id', filters.locatieId);
    if (filters.status) q = q.eq('status', filters.status);
    return q;
  }, [filters.locatieId, filters.status, locatieId, isAdmin]);
}

export function useDocumente(filters = {}) {
  return useQuery(() => {
    let q = supabase
      .from('documente')
      .select(`*, masini(id, nr_inmatriculare, locatie_id, locatii(nume))`)
      .order('data_expirare');
    if (filters.masinaId) q = q.eq('masina_id', filters.masinaId);
    if (filters.tip) q = q.eq('tip', filters.tip);
    return q;
  }, [filters.masinaId, filters.tip]);
}

export function useDocumenteExpira(zile = 30) {
  return useQuery(() =>
    supabase.rpc('documente_care_expira', { zile }), [zile]
  );
}

export function useServicii(filters = {}) {
  return useQuery(() => {
    let q = supabase
      .from('servicii')
      .select(`*, masini(id, nr_inmatriculare, marca, model), servicii_documente(id, nume_fisier, fisier_url)`)
      .order('data_interventie', { ascending: false });
    if (filters.masinaId) q = q.eq('masina_id', filters.masinaId);
    return q;
  }, [filters.masinaId]);
}

export function useProfiles(filters = {}) {
  return useQuery(() => {
    let q = supabase.from('profiles').select('*, locatii(id, nume)').order('full_name');
    if (filters.role) q = q.eq('role', filters.role);
    if (filters.locatieId) q = q.eq('locatie_id', filters.locatieId);
    return q;
  }, [filters.role, filters.locatieId]);
}

export function useMasiniActions() {
  const adaugaMasina = async (data) => {
    const { data: result, error } = await supabase.from('masini').insert(data).select().single();
    return { data: result, error };
  };
  const updateMasina = async (id, data) => {
    const { data: result, error } = await supabase
      .from('masini').update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    return { data: result, error };
  };
  return { adaugaMasina, updateMasina };
}

export function useDocumenteActions() {
  const adaugaDocument = async (data) => {
    const { data: result, error } = await supabase.from('documente').insert(data).select().single();
    return { data: result, error };
  };
  const uploadFisier = async (bucket, path, file) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return { url: null, error };
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: publicUrl, error: null };
  };
  return { adaugaDocument, uploadFisier };
}

export function useServiciiActions() {
  const adaugaServiciu = async (data) => {
    const { data: result, error } = await supabase.from('servicii').insert(data).select().single();
    return { data: result, error };
  };
  const uploadDocumentServiciu = async (serviciuId, file) => {
    const path = `${serviciuId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('servicii').upload(path, file);
    if (error) return { error };
    const { data: { publicUrl } } = supabase.storage.from('servicii').getPublicUrl(path);
    await supabase.from('servicii_documente').insert({
      serviciu_id: serviciuId,
      nume_fisier: file.name,
      fisier_url: publicUrl,
      tip_fisier: file.type,
      dimensiune: file.size,
    });
    return { url: publicUrl, error: null };
  };
  return { adaugaServiciu, uploadDocumentServiciu };
}