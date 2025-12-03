# Marble Majesty UI

Configurator de mese personalizate cu vizualizare 3D.

## 🚀 Deployment pe GitHub Pages

Proiectul este configurat pentru deploy automat pe GitHub Pages.

### Setup inițial

1. **Activează GitHub Pages în repository:**
   - Mergi la Settings → Pages
   - Selectează "GitHub Actions" ca sursă pentru deployment

2. **Actualizează base path în `vite.config.ts`:**
   - Dacă repo-ul tău este `username/marble-majesty-ui`, base path-ul este deja configurat
   - Dacă repo-ul are alt nume, actualizează linia `base: '/marble-majesty-ui/'` cu numele corect

3. **Push pe branch-ul principal:**
   - Workflow-ul se va declanșa automat la push pe `main` sau `master`
   - Sau poți declanșa manual din Actions → Deploy to GitHub Pages → Run workflow

### Modele 3D

Modelele 3D (`.glb` files) din `public/models/` sunt incluse în repository și vor fi disponibile în build-ul de producție.

## 🛠️ Development

```bash
# Instalează dependențele
npm install

# Rulează development server
npm run dev

# Build pentru producție
npm run build

# Preview build-ul local
npm run preview
```

## 📁 Structura Proiectului

- `src/` - Cod sursă React/TypeScript
- `public/models/` - Modele 3D (GLB files)
- `.github/workflows/` - GitHub Actions workflows pentru deploy

## 🔧 Configurare

### Variabile de mediu

Nu sunt necesare variabile de mediu pentru deployment pe GitHub Pages. Proxy-ul pentru AllInStone funcționează doar în development.

## 📝 Note

- Modelele 3D trebuie să fie în `public/models/` pentru a fi accesibile
- Build-ul este optimizat pentru GitHub Pages cu base path configurat
- Workflow-ul folosește GitHub Actions pentru deploy automat

