# FleetRO — Management flotă auto

Aplicație demo React pentru managementul flotei auto.

## Pornire rapidă

```bash
# 1. Instalează dependențele
npm install

# 2. Pornește aplicația
npm start

# Se deschide automat la http://localhost:3000
```

## Conturi demo

| Email | Parolă | Rol |
|-------|--------|-----|
| admin@fleetro.ro | admin123 | Super Admin |
| manager@fleetro.ro | manager123 | Manager |
| sofer@fleetro.ro | sofer123 | Șofer |

## Structura proiectului

```
src/
├── components/
│   ├── auth/         → LoginPage (login, activare cont, reset parolă)
│   ├── layout/       → Sidebar, AppLayout
│   ├── dashboard/    → Dashboard cu statistici și expirări
│   ├── masini/       → Listă mașini cu filtre
│   ├── documente/    → RCA / ITP / Rovignetă cu status expirare
│   ├── service/      → Istoric intervenții service
│   ├── locatii/      → Gestionare locații / sucursale
│   └── soferi/       → Gestionare șoferi
├── context/
│   └── AuthContext   → Autentificare + roluri (demo)
├── data/
│   └── demo.js       → Date fictive + funcții utilitare
└── index.css         → Stiluri globale
```

## Pași următori (conectare Supabase)

1. Creează proiect pe [supabase.com](https://supabase.com)
2. Rulează schema SQL din `supabase/schema.sql` (urmează)
3. Adaugă `.env` cu:
   ```
   REACT_APP_SUPABASE_URL=https://xxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=xxx
   ```
4. Înlocuiește `AuthContext` cu clientul Supabase real
5. Înlocuiește datele din `demo.js` cu query-uri Supabase
