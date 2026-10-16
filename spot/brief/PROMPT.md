# Boussole · Spot de présentation

## 1. Concept
« Par où commencer ? ». La vidéo reprend la présentation dans son ordre : une affaire réelle et récente (Cornell, faits allégués), les chiffres canadiens qui montrent que ce n'est pas un cas isolé, la question pivot, puis Boussole, écran par écran, avec un parcours concret à la souris. Viennent ensuite le réseau qu'elle relie, les organismes sollicités, la recherche, la communication prévue, le modèle d'affaires, l'équipe et la demande.
- Public : jury de l'AMD Challenge, organismes du terrain, financeurs publics.
- Promesse : « Pour qu'aucune victime ne cherche seule quoi faire. »
- Ton : sobre et grave pour l'affaire (aucun effet choc, aucun glitch), puis clair et apaisant pour l'application. Voix féminine, posée.
- Format : 16:9 (1920 × 1080), 60 images par seconde, environ 4 min 07.

## 2. Direction artistique
- Couleurs de l'application : papier `#FFF9F3`, panneau `#F6EFE8`, encre `#2D2440`, violet `#6A4CE0`, corail `#FF8A65` (encre `#A63D1B`), ciel `#1F5FA8`, sauge `#1E6F54`, ambre `#8F4E0A`. Nuit aubergine (`#1B1428` → `#0D0914`) pour l'acte 1.
- Police : Nunito (celle de l'application), fonte variable.
- Bascule : le papier s'ouvre en cercle sur « pas à pas ? », l'aiguille du logo trouve le nord sur « Boussole ».
- Vraies interfaces : captures HD (téléphone 390 × 844 à l'échelle 3, outil soignant 1440 × 900 à l'échelle 2), curseur qui clique au mot près, anneaux de surlignage, zooms de caméra.
- Lueur réservée au logo. Grain léger. Flou de mouvement discret sur les zooms.

## 3. Découpage
Le minutage réel est dans `src/boussole/minutage.json` ; les fenêtres de scènes dans `src/boussole/temps.ts` (mêmes formules dans `audio/composer.py`).

| Acte | Scènes | Image |
|---|---|---|
| 1. L'affaire | ouverture, presse, frise, aucune | « Octobre 2024 · Université Cornell » ; titres NBC, NPR, CBS ; frise fléchée : 2 jours, 3 semaines (l'ADN se dissout), mai 2025 avec le titre FOX19 sur les travaux écrits ; « Aucune accusation. » |
| 1. Les chiffres | canada, entonnoir, delais, tspt, personne, commencer | 100 points dont 6 s'allument ; entonnoir 1 000 → 52 ; barres 12 h et 72 h ; 3 personnes sur 4 ; nuage de questions ; « Par où commencer ? » dans le silence |
| Bascule | guide, logo | papier qui s'ouvre, cinq pas ; logo, aiguille, « L'application qui guide les victimes de violences sexuelles » |
| 2. L'application | arrivee, quitter, etapes, recit, carte, dossier, soignant, horsLigne | zoom sur Écoute 24 h et 911 ; clic sur « Quitter » puis page météo ; étape 1 → étape 4, délai et source surlignés ; récit chiffré, clic sur « Je ne sais pas » ; carte et légende ; double consentement cliqué, rappel ; outil soignant (prélèvements, chronologie) ; accueil hors ligne |
| 3. Preuves et modèle | relie, organismes, recherche, com, modele, pilote, croissance | réseau autour du logo ; cinq cartes d'organismes ; pages d'études, zoom sur Campbell (2008) ; affiche, carte de poche, sous-verre ; payeurs → Boussole, 0 $ pour la victime ; jauge 111 000 $ sous le seuil de 139 000 $ ; courbe des revenus puis carte du Canada |
| Fin | equipe, demande, humain, final, carton | photo de Samuel Halimi ; trois demandes ; citation ; logo, promesse, code QR, adresse ; « réalisé par Samuel Halimi » |

## 4. Texte de la voix
Dans `audio/texte_voix.txt` (une ligne = une phrase = un plan). Nombres en lettres ; sigles écrits comme ils se disent (Calacs, Cavac, Uqam).

## 5. Vérification des faits
- Cornell : faits **allégués**, aucune condamnation, aucun nom. Selon l'avocat de la plaignante, pas de trousse proposée au centre de santé du campus deux jours après ; trousse demandée trois semaines après, « l'ADN avait disparu » (CBS, 2 et 6 oct. 2026). Sanctions de mai 2025 : deux exclus, deux suspendus ; pour d'autres, des travaux de réflexion (Cornell Daily Sun d'après les dossiers du New York Times ; FOX19 / Gray News, 28 sept. 2026, « lawsuit claims »). Enquête rouverte, aucune accusation (NPR, 29 sept. 2026 ; AP, 14 oct. 2026).
- 6 % des agressions sexuelles signalées à la police, contre 36 % des voies de fait : Statistique Canada, ESG 2019 (Cotter, 2021).
- Sur 1 000 affaires déclarées : 360 accusations, 219 au tribunal, 104 condamnations, 52 peines de prison : Juristat, décisions 2015-2019 (Cotter, 2024).
- GHB décelable environ 12 h ; ADN du sperme jusqu'à 72 h : ASB 121 (2021), ligne directrice canadienne (CMAJ, 2025), OMS (2024).
- 75 % de stress post-traumatique à un mois : Dworkin et coll., Trauma, Violence & Abuse (2023), 22 échantillons, 2 106 victimes.
- « Seconde blessure » (« second rape ») : Campbell, American Psychologist (2008).
- Organismes : sollicités par courriel le 16 octobre 2026 ; aucun ne valide Boussole à ce jour (mention à l'écran).
- Pilote : 6 centres × 9 600 $ × 1,5 an + 25 000 $ ≈ 111 000 $, sous le seuil de 139 000 $ (SCT, 2026-2027).
- Projections, scénario de base : revenus 116, 495, 922, 1 193, 1 471 k$ ; coûts 306, 517, 799, 1 066, 1 313 k$ ; rentable en 2029 (`pitch/recherche/projections.json`).
- Application : captures de la démo avec données fictives ; envoi du dossier simulé en bêta (mention à l'écran).

## 6. Voix
ElevenLabs multilingue via Higgsfield (`text2speech_v2`). Audition de six voix féminines sur la même phrase, mesurées avec Whisper : Ines retenue (français à 99,9 %, 2,4 mots par seconde, variation de hauteur 4,2 demi-tons, pauses sur la ponctuation). Remplaçantes : Nora, Helena. Deux prises du texte complet, prise 1 retenue (« Boussole » et « Quitter » bien prononcés).

## 7. Musique, bruitages, mixage
Synthétisés par `audio/composer.py`. Acte 1 : nappe en ré mineur, piano rare, pulsation qui monte doucement à partir des chiffres, silence net sur « Par où commencer ? ». Bascule : nappe aiguë. Acte 2 : ré majeur à 84 battements par minute, arpèges à partir de l'application, pied léger à partir des preuves, retour au calme sur la citation finale. Bruitages discrets : souffles aux transitions, clics du curseur, carillons doux, aucun glitch. Voix à −20 LUFS, musique 16 LU dessous, master −14 LUFS / −1 dBTP.

## 8. Adaptations du gabarit NOVA
| Gabarit | Ici | Raison |
|---|---|---|
| 60 à 70 s | 4 min 07 | Demande : reprendre toute la présentation |
| Voix masculine « Julian » | Voix féminine « Ines » | Demande : voix de femme apaisante |
| Glitch, buzz, secousses | Retirés (une seule secousse sur « Aucune accusation ») | Sujet grave, interface calme |
| 16:9 et 9:16 | 16:9 d'abord | Durée du rendu ; le 9:16 demande un cadrage propre à chaque scène |
| Fraunces, Source Sans | Nunito | Police de l'application |
