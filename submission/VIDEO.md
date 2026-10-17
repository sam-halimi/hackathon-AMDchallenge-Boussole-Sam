# Vidéo de démo : consignes d'export et trame

> **Superseded.** The submitted video is the English motion-design spot (YouTube). This file describes an earlier recording plan.


## Contraintes lablab

- **Durée ≤ 5 min** (viser 2 min 30 à 3 min 30).
- **Fichier < 300 Mo.**

## Export conseillé

| Réglage | Valeur |
|---|---|
| Conteneur / codecs | MP4, H.264 (`yuv420p`) + AAC |
| Image | 1920×1080, 30 i/s (60 i/s seulement si la vidéo reste < 300 Mo) |
| Débit | 6 Mb/s max en vidéo, 192 kb/s en audio → environ 230 Mo pour 5 min, bien moins pour 3 min |
| Son | −14 LUFS intégré, −1 dBTP |
| Sous-titres | anglais incrustés (l'interface est en français) |

```bash
ffmpeg -i montage.mov -c:v libx264 -preset slow -crf 21 -maxrate 6M -bufsize 12M -pix_fmt yuv420p \
  -r 30 -c:a aac -b:a 192k -movflags +faststart boussole-demo.mp4
ls -lh boussole-demo.mp4                                          # doit rester < 300 Mo
ffprobe -v error -show_entries format=duration -of csv=p=0 boussole-demo.mp4   # ≤ 300 s
```

Rendus Remotion existants : `cd video && npx remotion render <Composition> out/x.mp4 --codec=h264 --crf=20`, puis la commande ffmpeg ci-dessus si besoin.

## Attention aux anciennes vidéos

Les vidéos et spots existants (`pitch/VIDEO.md`, `spot-v1/`, `spot-v2/`) ont été faits pour un autre concours : la voix off du spot v1 dit « L'IA, Claude, range les notes » et l'outil soignant y montrait une réponse pré-enregistrée. **Pour ce hackathon, l'IA tourne sur un modèle open source servi sur AMD** : ne réutilisez pas ces plans tels quels sans corriger le texte.

## Trame proposée (≈ 3 min)

| Temps | Plan | À montrer |
|---|---|---|
| 0:00–0:20 | Le problème | 3 faits sourcés du README, à l'écran, sans image choc |
| 0:20–1:05 | La personne, sur téléphone | Diapos d'arrivée → compte → fenêtre des étapes → carte avec un badge « À confirmer » → dossier, double confirmation (envoi simulé) |
| 1:05–1:20 | PWA | Installation, puis mode avion : l'espace s'ouvre, bandeau « hors ligne » |
| 1:20–2:15 | Outil soignant **en direct sur AMD** | Consentement, « Ne sait pas » → règle « à confirmer », « Ce que l'IA voit », **Générer** → bandeau « Réponse IA en direct · AMD Developer Cloud · modèle · latence », validation ligne par ligne |
| 2:15–2:35 | Preuve AMD | Terminal : `rocm-smi`, log vLLM, `curl /v1/models` (masquer l'IP et la clé) |
| 2:35–2:50 | Garde-fous | Ajouter un numéro de téléphone dans les notes → « Envoi à l'IA bloqué » ; export + journal intègre / altération détectée |
| 2:50–3:10 | Benchmark + suite | Tableau MI300X, pilote, « The AI guides, the human decides. » |

Avant d'enregistrer : endpoint AMD actif, `.env` rempli, `curl localhost:5173/api/health` → `"reachable":true`, notifications coupées, données fictives seulement.
