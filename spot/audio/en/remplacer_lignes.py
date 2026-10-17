#!/usr/bin/env python3
"""Re-records only some lines of an approved take and splices them in, so the rest of the narration
stays identical. Writes a lossless WAV take plus its merged character alignment.
Usage: python3 audio/en/remplacer_lignes.py prise1 prise2 20 21   (0-based line numbers, contiguous)"""
import base64, json, os, subprocess, sys
from pathlib import Path
import numpy as np
import requests
sys.path.insert(0, str(Path(__file__).resolve().parent))
from voix_el import ICI, VOIX, MODELE, TAGS, parler

SR = 44100
MARGE = 0.28  # silence kept around each joint (s)


def pcm(fichier):
    b = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(fichier), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(b, np.float32).astype(np.float64)


def bornes_lignes(al, lignes_parlees):
    chars, deb, fin = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    texte, cur, res = "".join(chars).lower(), 0, []
    for l in lignes_parlees:
        p = texte.find(l.lower(), cur)
        assert p >= 0, l
        q = p + len(l) - 1
        while q > p and not chars[q].isalnum(): q -= 1
        res.append((p, q, deb[p], fin[q]))
        cur = p + len(l)
    return res


def main(ancienne, nouvelle, i0, i1):
    vieux = json.loads((ICI / "voix" / f"{ancienne}.alignement.json").read_text(encoding="utf-8"))
    lignes = [l.strip() for l in (ICI / "texte_voix.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
    parlees = [parler(l) for l in lignes]
    vb = bornes_lignes(vieux["alignment"], vieux["lignes_parlees"])
    # New segment: lines i0..i1, with the same delivery tags.
    texte = " ".join((TAGS[i] + " " if i in TAGS else "") + parlees[i] for i in range(i0, i1 + 1))
    if i0 not in TAGS: texte = "[confident] " + texte
    r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}/with-timestamps", params={"output_format": "mp3_44100_128"},
                      headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
                      json={"text": texte, "model_id": MODELE, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "speed": 1.05}}, timeout=300)
    if r.status_code != 200: sys.exit(f"✗ {r.status_code} {r.text[:400]}")
    d = r.json()
    seg_mp3 = ICI / "voix" / f"{nouvelle}.segment.mp3"
    seg_mp3.write_bytes(base64.b64decode(d["audio_base64"]))
    na = d["alignment"]
    nb = bornes_lignes(na, parlees[i0:i1 + 1])
    # Cuts: after the end of line i0-1 and before the start of line i1+1 in the old take; trim the new segment to its speech.
    coupe_a = vb[i0 - 1][3] + MARGE
    # Cut in the old gap before line i1+1 (never into its first word: some gaps are only 50 ms).
    coupe_b = (vb[i1][3] + vb[i1 + 1][2]) / 2 if i1 + 1 < len(vb) else len(pcm(ICI / "voix" / f"{ancienne}.mp3")) / SR
    s_deb, s_fin = max(0.0, nb[0][2] - 0.05), nb[-1][3] + MARGE
    old = pcm(ICI / "voix" / f"{ancienne}.mp3")
    seg = pcm(seg_mp3)
    fondu = int(0.01 * SR)
    a, s, b = old[: int(coupe_a * SR)].copy(), seg[int(s_deb * SR): int(s_fin * SR)].copy(), old[int(coupe_b * SR):].copy()
    for x in (a, s): x[-fondu:] *= np.linspace(1, 0, fondu)
    for x in (s, b): x[:fondu] *= np.linspace(0, 1, fondu)
    audio = np.concatenate([a, s, b])
    sortie = ICI / "voix" / f"{nouvelle}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", str(sortie)], input=audio.tobytes(), check=True)
    # Merged alignment: old chars before line i0, new chars of the segment, old chars from line i1+1, each time-shifted.
    oa = vieux["alignment"]
    decal_s = coupe_a - s_deb
    decal_b = (coupe_a + (s_fin - s_deb)) - coupe_b
    p_a = vb[i0][0]
    p_b = vb[i1 + 1][0] if i1 + 1 < len(vb) else len(oa["characters"])
    q0 = nb[0][0]
    fusion = {"characters": [], "character_start_times_seconds": [], "character_end_times_seconds": []}
    def ajouter(al, de, a_, dt):
        for k in range(de, a_):
            fusion["characters"].append(al["characters"][k])
            fusion["character_start_times_seconds"].append(round(al["character_start_times_seconds"][k] + dt, 3))
            fusion["character_end_times_seconds"].append(round(al["character_end_times_seconds"][k] + dt, 3))
    ajouter(oa, 0, p_a, 0.0)
    ajouter(na, q0, len(na["characters"]), decal_s)
    fusion["characters"].append(" "); fusion["character_start_times_seconds"].append(fusion["character_end_times_seconds"][-1]); fusion["character_end_times_seconds"].append(fusion["character_end_times_seconds"][-1])
    ajouter(oa, p_b, len(oa["characters"]), decal_b)
    (ICI / "voix" / f"{nouvelle}.alignement.json").write_text(json.dumps({
        "texte_envoye": "".join(fusion["characters"]), "lignes": lignes, "lignes_parlees": parlees, "alignment": fusion,
        "montage": {"base": ancienne, "lignes_refaites": list(range(i0, i1 + 1)), "coupe_a": coupe_a, "coupe_b": coupe_b}}, ensure_ascii=False), encoding="utf-8")
    print(f"✓ {sortie.name}: lines {i0 + 1}-{i1 + 1} replaced, {len(audio) / SR:.2f} s (was {len(old) / SR:.2f} s)")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]))
