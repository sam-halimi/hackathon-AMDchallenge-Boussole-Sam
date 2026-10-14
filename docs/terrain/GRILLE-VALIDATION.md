# Grille de validation

Une ligne par affirmation de l'application. On la remplit pendant ou juste après chaque rencontre. Quand une ligne est validée par la bonne personne, on peut retirer « non validé » de l'écran concerné, et seulement elle.

| Écran | Ce qui est affirmé | Fichier source | Qui doit valider | Validé par, date | Correction faite |
|---|---|---|---|---|---|
| Étapes 1 à 8 | Ordre de la prise en charge | `app/src/lib/careSteps.ts` | Centre désigné, CVASM | | |
| Étape 4 | « En urgence dans les 5 à 7 jours, sur rendez-vous ensuite » | `careSteps.ts` | Centre désigné | | |
| Étape 5 | « Prophylaxie VIH dans les 72 h, contraception d'urgence jusqu'à 5 jours » | `careSteps.ts` | Centre désigné | | |
| Étape 6 | « Trousse jusqu'à 5 à 7 jours selon les sources » | `careSteps.ts` | Centre désigné | | |
| Étape 3 | Gestes pour préserver les preuves | `careSteps.ts` | Centre désigné, SPVM | | |
| Où aller | Délais restants par examen (moteur de règles) | `app/src/lib/rules.ts` | Centre désigné | | |
| Où aller | Chacune des 24 ressources (nom, public, horaires) | `app/src/lib/resources.ts` | Chaque organisme pour sa fiche | | |
| Où aller | Les 4 mentions « À confirmer » | `resources.ts` | Organisme concerné | | |
| Mon récit | Les 10 questions et leurs mots | `app/src/components/Recit.tsx` | CALACS, intervenantes | | |
| Mon dossier | Contenu du dossier, consentement, envoi | `app/src/components/Dossier.tsx` | Rebâtir ou service juridique | | |
| Rappel | Déroulé de l'appel juridique | `app/src/components/Rappel.tsx` | Rebâtir | | |
| Vie privée | Les 8 promesses | `app/src/components/ViePrivee.tsx` | Juriste (loi 25), sécurité | | |
| Outil soignant | Consentements, checklist, chronologie IA | `app/src/components/Demo.tsx` | Infirmière ou médecin de centre désigné | | |
| Partout | Ton, vocabulaire, inclusion | Toute l'app | CALACS, comité aviseur | | |

## Compte rendu type (une page par rencontre)

- **Qui** (nom, rôle, organisme) et **date**
- **Ce qui a été parcouru**
- **Erreurs factuelles** relevées, avec la source donnée par la personne
- **Formulations à changer**, telles que proposées
- **Ce qui manque**
- **Ce que la personne accepte** : être citée, être recontactée, rejoindre le comité
