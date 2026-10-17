#!/usr/bin/env python3
"""English voice (ElevenLabs, voice Zoë) with character timestamps.

Reads audio/en/texte_voix.txt (one line = one sentence of the video), adds delivery tags,
asks ElevenLabs for speech + alignment in ONE request (coherent prosody), and writes:
  audio/en/voix/<take>.mp3 and audio/en/voix/<take>.alignement.json
Usage: python3 audio/en/voix_el.py prise1 [speed]"""
import base64, json, os, sys
from pathlib import Path
import requests

ICI = Path(__file__).resolve().parent
VOIX = "m1Edok6RLyT2Hz3OljNi"  # Zoë, young Canadian woman, clear and matter-of-fact
MODELE = "eleven_v4"
# Delivery tags, placed where the tone changes (index = line number, 0-based).
TAGS = {0: "[confident]", 9: "[curious]", 10: "[warmly]", 11: "[confident]", 19: "[confident]", 21: "[warmly]", 23: "[warmly]"}
# Pronunciation: Boussole is French (boo-SOL).
PRONONCE = {"Boussole": "/buˈsɔl/", "Halimi": "/hɑˈliːmi/"}

def parler(ligne):
    for mot, ipa in PRONONCE.items():
        ligne = ligne.replace(mot, ipa)
    return ligne

def main(prise, vitesse):
    lignes = [l.strip() for l in (ICI / "texte_voix.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
    morceaux = []
    for i, l in enumerate(lignes):
        morceaux.append((TAGS[i] + " " if i in TAGS else "") + parler(l))
    texte = " ".join(morceaux)
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOIX}/with-timestamps",
        params={"output_format": "mp3_44100_128"},
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
        json={"text": texte, "model_id": MODELE, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "speed": vitesse}},
        timeout=300,
    )
    if r.status_code != 200:
        print("✗", r.status_code, r.text[:600]); sys.exit(1)
    d = r.json()
    sortie = ICI / "voix"; sortie.mkdir(exist_ok=True)
    (sortie / f"{prise}.mp3").write_bytes(base64.b64decode(d["audio_base64"]))
    (sortie / f"{prise}.alignement.json").write_text(json.dumps({
        "texte_envoye": texte, "lignes": lignes, "lignes_parlees": [parler(l) for l in lignes],
        "alignment": d.get("alignment"), "normalized_alignment": d.get("normalized_alignment"),
    }, ensure_ascii=False), encoding="utf-8")
    print("✓", sortie / f"{prise}.mp3", len(texte), "caractères envoyés")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "prise1", float(sys.argv[2]) if len(sys.argv) > 2 else 1.05)
