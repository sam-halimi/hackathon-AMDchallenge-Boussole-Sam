#!/usr/bin/env python3
"""Original score for the English spot (ElevenLabs Music), built on the cut's structure.
Section lengths come from src/en/minutage.json, so the lift lands on "Meet Boussole".
Usage: python3 audio/en/musique_el.py musique1"""
import json, os, sys
from pathlib import Path
import requests

ICI = Path(__file__).resolve().parent
M = json.loads((ICI.parent.parent / "src" / "en" / "minutage.json").read_text(encoding="utf-8"))
P = lambda n: M["phrases"][n]["debut"]
K = M["cles"]
total = M["duree_totale"]
# Section boundaries (seconds): problem / question / product / evidence / ask / end.
bornes = [0, P(9) - 0.3, P(10) - 0.2, P(16) - 0.2, P(21) - 0.2, P(23) - 0.2, total]
NEG = ["vocals", "singing", "choir", "lyrics", "sad", "melancholic", "horror", "aggressive", "dubstep", "cheesy", "corporate ukulele"]
SECTIONS = [
    ("[Intro]\nTense, focused pulse. Muted piano ostinato over a soft kick, ticking hi-hat, low synth bass. Restrained, investigative, forward motion.",
     ["modern cinematic", "minimal electronic", "documentary underscore", "muted felt piano", "pulsing synth bass", "soft kick", "102 bpm"]),
    ("[Breakdown]\nEverything drops out. A single sustained pad and a soft rising swell, like holding a breath.",
     ["ambient pad", "rising swell", "suspended", "airy", "minimal"]),
    ("[Build]\nOpen directly on a bright downbeat, no intro. Bright lift. Warm plucked synths and piano chords in a major key, light claps, gentle side-chained pads. Hopeful, clear, modern tech.",
     ["uplifting", "bright", "plucked synth", "piano chords", "light claps", "warm", "major key", "102 bpm"]),
    ("[Main]\nConfident and driving. Fuller drums, steady eighth-note bass, strings layered under the plucks. Purposeful momentum.",
     ["confident", "driving", "full drums", "strings", "momentum", "inspiring", "102 bpm"]),
    ("[Peak]\nWarm and open. Wide strings and piano carry the melody, drums simplify. Sincere and hopeful.",
     ["warm", "open", "wide strings", "piano melody", "sincere", "hopeful"]),
    ("[Outro]\nResolve to the home chord. Piano and a soft pad ring out, gentle final hit then a clean decay to silence.",
     ["resolution", "piano", "soft pad", "gentle ending", "clean decay"]),
]

def main(nom, partie):
    # partie "B": the hopeful half only, from "Meet Boussole" to the end (exact start, by construction).
    sections, limites = (SECTIONS[2:], [P(10) - 0.2] + bornes[3:]) if partie == "B" else (SECTIONS, bornes)
    chunks = []
    for (texte, styles), a, b in zip(sections, limites, limites[1:]):
        chunks.append({"text": texte, "duration_ms": max(3000, int(round((b - a) * 1000))),
                       "positive_styles": styles, "negative_styles": NEG, "context_adherence": "high"})
    print("sections (s):", [round(c["duration_ms"] / 1000, 1) for c in chunks], "total", round(sum(c["duration_ms"] for c in chunks) / 1000, 1))
    r = requests.post("https://api.elevenlabs.io/v1/music", params={"output_format": "mp3_44100_128"},
                      headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
                      json={"composition_plan": {"chunks": chunks}, "model_id": "music_v2_5"}, timeout=600)
    if r.status_code != 200:
        print("✗", r.status_code, r.text[:800]); sys.exit(1)
    sortie = ICI / "musique"; sortie.mkdir(exist_ok=True)
    (sortie / f"{nom}.mp3").write_bytes(r.content)
    (sortie / f"{nom}.plan.json").write_text(json.dumps({"partie": partie, "bornes": limites, "chunks": chunks}, indent=1), encoding="utf-8")
    print("✓", sortie / f"{nom}.mp3")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "musique1", sys.argv[2] if len(sys.argv) > 2 else "tout")
