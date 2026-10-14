# Faire valider Boussole par le terrain

Objectif : que les personnes qui accueillent les victimes à Montréal relisent Boussole, corrigent ce qui est faux, et que le mot « non validé » disparaisse des écrans pour de bonnes raisons. Rien ici ne demande d'argent ni de partenariat officiel au départ : seulement une heure de relecture.

## Le principe

1. **On demande une relecture, pas un partenariat.** Une heure, sur un sujet précis (les délais médicaux, le ton, les ressources). C'est facile à accepter.
2. **On ne teste jamais avec des personnes concernées sans un organisme qui encadre.** Pas d'annonce publique, pas de recrutement direct sur les réseaux sociaux.
3. **On garde une trace de chaque retour** : qui, quand, quoi, ce qu'on a changé (voir la grille).
4. **On ne cite un organisme que s'il l'a accepté par écrit.** Avant ça, Boussole reste « projet indépendant ».

## Par où commencer, cette semaine

| Jour | Action | Fichier |
|---|---|---|
| 1 | Créer l'adresse dédiée du projet, la donner à Claude pour publier « Qui sommes-nous » et la politique de confidentialité | `app/src/lib/site.ts` |
| 1 | Relire la fiche de présentation et l'ajuster à ta voix | [FICHE.md](FICHE.md) |
| 2 | Envoyer les trois premiers courriels : centre désigné, CALACS, Rebâtir | [COURRIELS.md](COURRIELS.md) |
| 2 | Appeler le CVASM en heures de bureau pour demander à qui écrire (ligne administrative, pas la ligne d'aide) | |
| 7 | Relancer une fois, poliment, ceux qui n'ont pas répondu | [COURRIELS.md](COURRIELS.md) |
| 10 à 20 | Rencontres d'une heure, en visio ; on partage l'écran et on parcourt l'app ensemble | [GRILLE-VALIDATION.md](GRILLE-VALIDATION.md) |
| 20 à 30 | Corriger, publier la nouvelle version, renvoyer à chacun ce qui a changé grâce à lui | |
| 30 et après | Proposer aux organismes qui ont répondu de rejoindre le comité aviseur | [COMITE.md](COMITE.md) |

**Ne jamais utiliser les lignes d'aide (Info-aide, CALACS, CAVAC) pour présenter le projet** : elles sont réservées aux personnes qui ont besoin d'aide. Passer par les courriels ou les numéros administratifs indiqués sur les sites.

## Qui contacter, dans l'ordre

| Pour valider | Qui | Pourquoi eux |
|---|---|---|
| Délais médicaux, déroulé de l'examen, trousse | L'équipe du centre désigné adulte de Montréal (CIUSSS du Centre-Sud, Hôpital Notre-Dame) et le CVASM | Ce sont eux qui appliquent le protocole ; c'est la validation qui pèse le plus |
| Ton, mots, ce qu'une personne peut lire juste après | Un CALACS (par exemple Trêve pour Elles) ou le regroupement provincial des CALACS | Intervenantes au contact quotidien des personnes concernées |
| Orientation, ligne d'écoute | Info-aide violence sexuelle | Boussole renvoie vers eux partout dans l'app |
| Droits, plainte, IVAC, rappel juridique | Rebâtir, puis Juripop ou Info Justice | Le parcours « Mon dossier » et le rappel simulent leur service |
| Victimes d'actes criminels en général | CAVAC de Montréal | Accompagnement judiciaire, IVAC |

Les coordonnées publiques de ces organismes sont dans `app/src/lib/resources.ts` (sites officiels vérifiés le 4 octobre 2026).

## Ce qu'on leur envoie

- La fiche d'une page ([FICHE.md](FICHE.md), à exporter en PDF).
- Le lien de la démo : https://boussole-ux-v2.vercel.app (et `#/demo` pour l'outil soignant).
- Trois questions précises, adaptées à chacun (voir les courriels).

## Ensuite

- Le comité aviseur : [COMITE.md](COMITE.md).
- La revue trimestrielle des ressources : [REVUE-RESSOURCES.md](REVUE-RESSOURCES.md).
- L'élargissement au Québec puis au Canada : [EXPANSION.md](EXPANSION.md).
