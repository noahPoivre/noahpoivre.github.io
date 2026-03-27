# Portfolio — Poivre Noah

Portfolio personnel développé en HTML/CSS/JS pur, déployable sur **GitHub Pages**.

## 📄 Pages

- `index.html` — Page principale (hero, projets, compétences, stages, veille, contact)

## 🚀 Déployer sur GitHub Pages

1. **Crée un dépôt GitHub** nommé `portfolio` (ou `ton-username.github.io` pour une URL plus propre)
2. **Upload les fichiers** :
   - Via l'interface GitHub : *Add file → Upload files*
   - Ou via Git en ligne de commande :
     ```bash
     git init
     git add .
     git commit -m "Initial commit — portfolio"
     git branch -M main
     git remote add origin https://github.com/TON-USERNAME/portfolio.git
     git push -u origin main
     ```
3. **Active GitHub Pages** :
   - Va dans *Settings → Pages*
   - Source : `main` branch, dossier `/ (root)`
   - Clique sur **Save**
4. Ton portfolio sera accessible à : `https://ton-username.github.io/portfolio`

## 🛠 Technologies

- HTML5 / CSS3 / JavaScript vanilla
- Google Fonts (DM Serif Display, DM Mono, DM Sans)
- Devicons CDN pour les logos de compétences
- Aucune dépendance à installer

## ✏️ Personnalisation

- Remplace l'e-mail de contact dans `index.html` (ligne `mailto:`)
- Ajoute ton lien LinkedIn dans la section contact
- Ajoute tes projets dans la grille `.projects-grid`
- Modifie les couleurs via les variables CSS dans `:root`
