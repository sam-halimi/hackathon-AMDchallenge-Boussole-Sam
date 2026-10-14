# Revue trimestrielle des ressources

Les numéros, adresses et horaires changent. Une erreur sur une ligne d'aide peut empêcher quelqu'un d'être aidé. La date de la dernière vérification est affichée dans « Où aller ».

## Tous les trois mois (prochaine : janvier 2027)

1. Pour chacune des 24 ressources de `app/src/lib/resources.ts`, ouvrir le site officiel et vérifier : nom, numéro, adresse, horaires, public.
2. Pour chaque mention « À confirmer » : chercher une source officielle. Si elle existe, retirer `toConfirm` et noter la source dans `research-resources.md`. Sinon, la laisser.
3. Reporter toute modification dans la version anglaise (`app/src/lib/en.ts`). Le test `en.test.ts` vérifie que les numéros sont identiques dans les deux langues.
4. Mettre à jour `RESOURCES_VERIFIED` dans `app/src/lib/site.ts`.
5. `npm run lint`, `npm test`, `npm run build`, puis déployer.

## Règles

- Ne jamais retirer « À confirmer » sans source officielle.
- Ne jamais afficher l'adresse d'un organisme qui la garde confidentielle (CALACS, MCVI).
- Ne jamais ajouter une ressource sans son site officiel.
- Organismes uniquement, jamais de professionnels nommés.
