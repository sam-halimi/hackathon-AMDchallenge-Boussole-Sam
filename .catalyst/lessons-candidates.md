
## 2026-10-16 · Spot motion design (retours de Samuel sur la V1 Boussole)
- La musique et les bruitages synthétisés du gabarit `spot-motion-design` sont jugés « bidon » et reconnaissables d'un spot à l'autre : prévoir une vraie source musicale et de vrais bruitages, différents à chaque projet.
- La voix ElevenLabs « Ines » (Higgsfield) a été jugée trop robotique ; une mesure Whisper ne suffit pas à juger le naturel : faire écouter deux ou trois voix à Samuel avant la prise complète.
- Un spot de 4 min est trop lent : viser plus court et plus dynamique, même quand on reprend toute une présentation.
- Citer une étude : capture ciblée de la ligne exacte en langue originale, source en langue originale, jamais retranscrite ni traduite dans la police du film.
- Toujours les vrais logos des organismes cités (chercher plus loin quand le site bloque les robots).

## 2026-10-17 · Capture d'une phrase d'étude (puppeteer)
- `getBoundingClientRect` donne des coordonnées viewport ; `page.screenshot({clip})` attend des coordonnées document. Après un `scrollIntoView`, ajouter `window.scrollX/scrollY` au cadre du clip, sinon le surlignage tombe sur d'autres lignes. Toujours vérifier par une surimpression des rectangles avant d'animer.
- Une citation chiffrée se dit avec son périmètre exact : Hendrich 35,3 % = part du temps de *pratique* infirmière, d'où « over a third of their practice time », pas « a third of their time ».

## 2026-10-17 · Audio ElevenLabs (spot EN)
- Voix : endpoint `text-to-speech/{voice}/with-timestamps` en UNE requête (prosodie cohérente) → alignement par caractère ; le minutage se cale directement dessus (`audio/en/caler_en.py`), plus besoin de Whisper. Les tags `[confident]` restent dans l'alignement mais ne sont pas prononcés (vérifié par transcription).
- Plan gratuit/Starter : `mp3_44100_192` refusé (Creator+) → `mp3_44100_128`.
- Musique `music_v2_5` : les `duration_ms` des sections sont IGNORÉES (doc : respect_sections_durations sans effet sur v2/v2.5) ; la longueur totale est respectée. Pour caler une bascule au mot près, générer deux morceaux et couper sur la bascule (A filtré passe-bas sur la question, B démarre sur le logo).
- Le connecteur ElevenLabs « voix » de claude.ai ne fait ni musique ni bruitages ; la clé API (`ELEVENLABS_API_KEY`) couvre voix + musique + SFX.

## 2026-10-17 · Promotion validée par Samuel
Toutes les leçons « spot motion design » ci-dessus ont été versées, à sa demande explicite, dans le skill `~/.agents/skills/spot-motion-design` (SKILL.md, références 09 à 12, modèle `assets/modele-boussole-en/`).
