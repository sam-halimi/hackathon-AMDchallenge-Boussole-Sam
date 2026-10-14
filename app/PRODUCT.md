# Product

<!-- impeccable:product-schema 1 -->

> Rédigé le 14 octobre 2026 à partir du brief de Sam (refonte `ux-v2`) et du dépôt, puis validé par Sam le même jour avec le plan de la V2.

## Platform

web

## Users

- **La personne accompagnée** : une personne qui vient de vivre une agression sexuelle à Montréal. Elle ouvre Boussole pour savoir quoi faire, où aller, et garder une trace de son récit. *(confirmé par le brief)*
  - Situation principale : seule, sur son téléphone, dans les heures ou les jours qui suivent, fatiguée ou en état de choc, parfois sur un appareil partagé ou surveillé.
  - Niveau d'aisance numérique à supposer : le plus faible. Règle de Sam : « une grand-mère doit s'y retrouver ». *(confirmé par le brief)*
- **L'équipe soignante d'un centre désigné** : utilise l'outil `#/demo` (consentement, dossier guidé, prélèvements, chronologie, export). Aujourd'hui, cet outil sert surtout de démonstration sur ordinateur, avec des données fictives.

## Product Purpose

Accompagner pas à pas une personne après une agression sexuelle à Montréal : la mettre en lien avec une ligne d'écoute, lui montrer l'ordre de la prise en charge, lui indiquer où aller, lui permettre d'écrire son récit une seule fois et, si elle le décide, de préparer un dossier pour un service juridique.

Réussite : la personne trouve la prochaine chose à faire sans réfléchir à l'interface, ne se sent jamais pressée ni jugée, et garde le contrôle de ce qui est écrit, gardé ou transmis.

## Positioning

- Le récit reste sur l'appareil, chiffré avec le mot de passe de la personne ; aucun serveur Boussole ne le reçoit.
- L'espace de la personne n'utilise aucune IA : étapes sourcées et moteur de règles déterministe. L'IA n'existe que dans l'outil soignant, sous garde-fous, et ne décide de rien (« l'IA guide, l'humain décide »).
- L'incertitude est affichée, jamais masquée : badge « À confirmer », délais « indicatifs », envois « simulés ».

## Operating Context

- Téléphone d'abord (PWA installable, utilisable hors ligne) ; ordinateur en second.
- Parcours de la personne : diapos d'arrivée → création d'un compte local chiffré → fenêtre des étapes de prise en charge → onglets Accueil, Mon récit, Où aller, Mon dossier, Vie privée ; envoi simulé à Rebâtir puis choix d'un créneau de rappel.
- Parcours soignant (`#/demo`) : consentement → dossier guidé → prélèvements prioritaires → chronologie assistée par IA → export avec journal chaîné SHA-256.
- Statut : bêta de test et prototype de hackathon (AMD). Données fictives uniquement, règles cliniques non validées.

## Capabilities and Constraints

Tout ce qui suit existe et doit continuer de fonctionner *(confirmé par le brief)* :

- diapos d'arrivée ; compte chiffré (PBKDF2 310 000 itérations + AES-GCM 256) ; verrouillage ; effacement complet ;
- fenêtre des étapes de prise en charge (8 étapes sourcées) ;
- récit enregistré et chiffré automatiquement, « Je ne sais pas » comme réponse à part entière ;
- carte Leaflet / OpenStreetMap et liste des ressources ;
- dossier à sections au choix, export, impression, envoi **simulé** avec consentement et double confirmation ;
- choix d'un créneau de rappel (simulé) ;
- outil soignant complet ;
- PWA hors ligne (service worker produit au build) ;
- bouton « Quitter rapidement » sur tous les écrans de l'espace de la personne : il verrouille l'espace et remplace la page par un site neutre *(décidé le 14 octobre 2026)* ;
- la fenêtre des étapes s'ouvre à chaque connexion *(comportement confirmé le 14 octobre 2026)*.

Contraintes non négociables *(confirmées par le brief)* :

- aucun numéro de téléphone, adresse ni coordonnée ne change (`src/lib/resources.ts`, `src/lib/careSteps.ts`) ;
- les badges « À confirmer » et les mentions de sécurité restent visibles ;
- `npm run build`, `npm run lint` et `npm test` passent à chaque commit ;
- la V1 est figée : étiquette `v1-avant-ux`, branche `claude/nice-brahmagupta-1czgr5`.

Points non tranchés :

- langues : français seulement aujourd'hui ; version anglaise non décidée ;
- usage réel de l'outil soignant hors démonstration.

## Brand Commitments

- Nom : Boussole. Signature : « On vous accompagne, pas à pas. »
- Ton : vouvoiement, phrases courtes, aucune injonction, aucun jugement. Formulations existantes à conserver : « Vous décidez de tout », « Rien n'est obligatoire », « Je ne sais pas est une réponse ».
- Contrainte de Sam, contraignante pour tout travail visuel : interface calme et rassurante, sans effet tape-à-l'œil, sans aucune animation qui stresse.
- Une action principale par écran. Pas de défilement à l'intérieur des fenêtres, pas de débordement horizontal.

## Evidence on Hand

- Recherche sourcée des ressources montréalaises : `src/lib/research-resources.md` (vérifiée le 4 octobre 2026).
- Garde-fous et limites : `../SAFETY.md`.
- Tests : pseudonymisation, règles, ressources, garde-fous de la chronologie, route IA.
- Absent, à ne pas inventer : tests avec des personnes concernées, validation clinique des règles, témoignages, partenariat effectif avec Rebâtir ou un centre désigné.

## Product Principles

1. **La personne décide.** Chaque étape est un choix ; refuser, s'arrêter et revenir sont toujours possibles et toujours visibles.
2. **Une chose à la fois.** Un écran porte une action principale ; le reste attend sans réclamer l'attention.
3. **L'aide humaine d'abord.** La ligne d'écoute et le 911 restent à un geste, sur tous les écrans de l'espace.
4. **Dire ce qui est incertain.** « À confirmer », « indicatif », « simulé » : jamais retirés pour alléger l'écran.
5. **Ne rien faire perdre.** Aucune action ne détruit ni n'envoie quoi que ce soit sans confirmation explicite.

## Accessibility & Inclusion

- Demande explicite de Sam : texte lisible, zones de clic larges, contraste vérifié, mobile d'abord.
- Cible : WCAG 2.2 AA, zones de clic d'au moins 48 px, texte courant d'au moins 16 px, `prefers-reduced-motion` respecté.
- Public en état de stress aigu : charge cognitive minimale, aucun compte à rebours, aucun mouvement non déclenché par la personne.
