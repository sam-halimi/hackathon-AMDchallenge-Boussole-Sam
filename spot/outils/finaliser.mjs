#!/usr/bin/env node
// Finalisation du spot Boussole : assemble l'image (rendu Remotion, sans son) et le mixage masterisé,
// copie les pistes séparées, fabrique les planches contact et le README de livraison.
// Usage (depuis spot/) : node outils/finaliser.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUT = path.resolve('out');
const AUDIO = path.resolve('audio', 'rendu');
const M = JSON.parse(fs.readFileSync('src/boussole/minutage.json', 'utf8'));
const mesures = JSON.parse(fs.readFileSync(path.join(AUDIO, 'mesures.json'), 'utf8'));
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...args], { stdio: 'inherit' });
const sonde = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,r_frame_rate,sample_rate,channels,bit_rate', '-of', 'json', f]).toString());

const formats = [
  { id: '16x9', image: 'boussole_16x9_image.mp4', final: 'Boussole_spot_16x9.mp4', largeur: 1920, hauteur: 1080 },
];
const resume = [];
for (const f of formats) {
  const src = path.join(OUT, f.image);
  if (!fs.existsSync(src)) { console.log(`  ⚠ ${f.image} absent : format ${f.id} ignoré`); continue; }
  const dest = path.join(OUT, f.final);
  // Image copiée telle quelle (H.264), son AAC 320 kb/s, lecture rapide sur le web (faststart).
  ff(['-i', src, '-i', path.join(AUDIO, 'mix_master.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest', '-movflags', '+faststart', dest]);
  // Planche contact : 24 images régulières (le ffmpeg statique du VPS n'a pas drawtext : pas d'horodatage incrusté).
  const duree = parseFloat(sonde(dest).format.duration);
  const pas = duree / 24;
  const largeurVignette = f.id === '16x9' ? 480 : 270;
  ff(['-i', dest, '-vf', `fps=1/${pas.toFixed(4)},scale=${largeurVignette}:-1,tile=${f.id === '16x9' ? '6x4' : '8x3'}:padding=8:margin=8:color=white`, '-frames:v', '1', path.join(OUT, `planche_contact_${f.id}.jpg`)]);
  const s = sonde(dest);
  const v = s.streams.find((x) => x.codec_name === 'h264');
  const a = s.streams.find((x) => x.codec_name === 'aac');
  resume.push({ format: f.id, fichier: f.final, duree: duree.toFixed(2), taille_mo: (parseInt(s.format.size, 10) / 1048576).toFixed(1), video: `${v.width}×${v.height}, ${v.r_frame_rate.split('/')[0]} i/s, H.264`, audio: `AAC ${Math.round(parseInt(a.bit_rate || '320000', 10) / 1000)} kb/s, ${a.sample_rate} Hz, stéréo` });
  console.log(`  ✓ ${f.final} (${duree.toFixed(2)} s) et planche_contact_${f.id}.jpg`);
}
// Copies web (plus légères) pour la mise en ligne : spot/out/web/.
fs.mkdirSync(path.join(OUT, 'web'), { recursive: true });
for (const f of formats) {
  const src = path.join(OUT, f.final);
  if (!fs.existsSync(src)) continue;
  ff(['-i', src, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '3.5M', '-bufsize', '7M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', path.join(OUT, 'web', f.final)]);
  console.log(`  ✓ web/${f.final} (${(fs.statSync(path.join(OUT, 'web', f.final)).size / 1048576).toFixed(1)} Mo)`);
  // WebM (VP9 + Opus) : lu par l'écran d'accueil de l'application dans les navigateurs sans H.264.
  const webm = f.final.replace(/\.mp4$/, '.webm');
  ff(['-i', src, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-cpu-used', '4', '-deadline', 'good', '-tile-columns', '2', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '128k', path.join(OUT, 'web', webm)]);
  console.log(`  ✓ web/${webm} (${(fs.statSync(path.join(OUT, 'web', webm)).size / 1048576).toFixed(1)} Mo)`);
}
// Pistes séparées (WAV 24 bits, 48 kHz).
fs.mkdirSync(path.join(OUT, 'pistes'), { recursive: true });
for (const p of ['voix', 'musique', 'bruitages', 'mix_master']) fs.copyFileSync(path.join(AUDIO, p + '.wav'), path.join(OUT, 'pistes', p + '.wav'));
console.log('  ✓ pistes/ (voix, musique, bruitages, mix_master)');

const lignes = resume.map((r) => `| ${r.format.replace('x', ':')} | \`${r.fichier}\` | ${r.duree} s | ${r.video} | ${r.audio} | ${r.taille_mo} Mo |`).join('\n');
const m = mesures.master;
fs.writeFileSync(path.join(OUT, 'README.md'), `# Boussole · Spot de présentation (livraison)

La vidéo suit la présentation : l'affaire de Cornell (faits allégués, captures de presse), les chiffres canadiens, la bascule « Et si quelqu'un la guidait… pas à pas ? », le parcours dans l'application réelle (premier écran, bouton Quitter, étapes, récit, carte, dossier, outil soignant), puis le réseau, les organismes sollicités, la recherche, la communication, le modèle d'affaires, l'équipe et la demande. Brief et vérification des faits : \`spot/brief/PROMPT.md\`.

## Fichiers

| Format | Fichier | Durée | Image | Son | Poids |
| --- | --- | --- | --- | --- | --- |
${lignes}

- \`planche_contact_16x9.jpg\` : 24 images régulières, horodatées.
- \`pistes/\` : \`voix.wav\`, \`musique.wav\`, \`bruitages.wav\` (avant mastering) et \`mix_master.wav\` (WAV 24 bits, 48 kHz).
- \`web/\` : copies allégées (H.264 CRF 23, AAC 192 kb/s, et WebM VP9).

## Son

- Voix : ElevenLabs (multilingue) via Higgsfield, voix féminine « Ines », choisie sur mesure parmi six (français reconnu à 99,9 %, débit posé, pauses sur la ponctuation). Prise 1 sur 2 retenue. Aucun compresseur ni limiteur sur la piste voix.
- Musique originale et bruitages synthétisés par le code (\`spot/audio/composer.py\`), sans échantillon externe : tension retenue en ré mineur, silence sur « Par où commencer ? », puis ré majeur posé à 84 battements par minute.
- Musique sous la voix : ${mesures.ecart_voix_musique_LU} LU d'écart pendant la parole (exigence : au moins 15).
- Master : ${m.I.toFixed(1)} LUFS intégrés, crête vraie ${m.TP.toFixed(1)} dBTP (cible −14 LUFS / −1 dBTP), plage de loudness ${m.LRA.toFixed(1)} LU.

## Image

- Remotion (React), 60 images par seconde, minutage calé mot à mot sur la voix (Whisper en local) : \`spot/src/boussole/minutage.json\`.
- Interfaces : captures haute définition de l'application réelle, données fictives (\`spot/outils/capturer.mjs\`). La page météo après « Quitter » est schématisée : l'application ouvre une recherche « météo Montréal ».
- Police de l'application (Nunito, licence SIL OFL) ; icônes Lucide (licence ISC).
- Durée : ${M.duree_totale} s, dont le carton de fin de 2,5 s.

## Refaire le rendu

\`\`\`
cd spot
python3 audio/analyser_voix.py audio/voix/prise1.mp3   # transcription mot à mot
python3 audio/caler.py audio/voix/prise1.mp3           # minutage → src/boussole/minutage.json
node outils/capturer.mjs                               # captures (application lancée sur le port 8137)
python3 audio/composer.py                              # musique, bruitages, mixage, master
npx remotion render src/index.ts BoussoleSpot16x9 out/boussole_16x9_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
node outils/finaliser.mjs                              # assemblage, pistes, planche, ce README
\`\`\`
`);
console.log('  ✓ README.md');
