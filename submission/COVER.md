# Cover image (16:9)

Fichier prêt : `cover.png` (1920×1080, 145 Ko), rendu depuis `cover.html` (couleurs et logo de l'appli).

## Texte de la couverture

- **Marque** : Boussole
- **Titre** : Step by step, after sexual assault.
- **Sous-titre** : Where to go, telling your story once, a file only if you decide. Care-team notes structured by an open model, validated line by line.
- **Pastilles** : AMD Token Factory · DeepSeek-V4-Flash — Installable PWA — Health & Wellbeing
- **Signature** : The AI guides, the human decides.
- **Mention** : Montréal · fictional data

## Règles

- Aucun logo AMD ni lablab (marques déposées) : le nom suffit.
- Aucune image de personne, aucune scène de violence.
- Si vous changez de modèle ou de GPU, mettez la pastille à jour.

## Régénérer le PNG

```bash
# Chromium + Playwright requis (npm i --no-save playwright)
node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('file://'+process.cwd()+'/submission/cover.html');await p.screenshot({path:'submission/cover.png'});await b.close()})()"
```

Ou : ouvrir `cover.html` dans Chrome, fenêtre 1920×1080, capture d'écran.
