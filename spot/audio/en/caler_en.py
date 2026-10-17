#!/usr/bin/env python3
"""Times the English video on the voice: writes src/en/minutage.json from the ElevenLabs
character alignment (audio/en/voix/<take>.alignement.json). No Whisper needed: the alignment
gives the start and end of every character of the text that was spoken.

Usage: python3 audio/en/caler_en.py audio/en/voix/prise1.mp3"""
import json, sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
PRE_ROLL = 1.0
TENUE_LOGO = 2.6
CARTON = 2.5
FPS = 60
B = "/buˈsɔl/"
# (name, line, word to find in the line as spoken, occurrence)
MOTS_CLES = [
    ("cornell", 0, "cornell", 1), ("drugged", 1, "drugged", 1), ("raped", 1, "raped", 1), ("fraternity", 1, "fraternity", 1),
    ("lawyer", 2, "lawyer", 1), ("kit", 2, "kit", 1), ("weeks", 2, "weeks", 1), ("dna", 2, "dna", 1),
    ("essay", 3, "essay", 1), ("charges", 3, "charges", 1), ("american", 4, "american", 1),
    ("six", 5, "six", 1), ("police", 5, "police", 1),
    ("expiry", 6, "expiry", 1), ("twelve", 6, "twelve", 1), ("seventytwo", 6, "seventy", 1),
    ("three", 7, "three", 1), ("stress", 7, "stress", 1), ("order", 8, "order", 1),
    ("guided", 9, "guided", 1), ("step", 9, "step", 1), ("boussole", 10, B, 1), ("guides", 10, "guides", 1),
    ("support", 11, "support", 1), ("nine", 11, "nine", 1), ("account", 11, "account", 1),
    ("exit", 12, "exit", 1), ("gone", 12, "gone", 1), ("weather", 12, "weather", 1),
    ("steps", 13, "steps", 1), ("deadline", 13, "deadline", 1), ("source", 13, "source", 1),
    ("story", 14, "story", 1), ("once", 14, "once", 1), ("encrypted", 14, "encrypted", 1),
    ("montreal", 15, "montreal", 1), ("lawyer2", 15, "lawyer", 1), ("choose", 15, "choose", 1),
    ("nurses", 16, "nurses", 1), ("sorted", 16, "sorted", 1), ("night", 16, "night", 1),
    ("third", 17, "third", 1), ("paperwork", 17, "documentation", 1), ("quarter", 17, "quarter", 1),
    ("ground", 18, "ground", 1), ("centres", 18, "centres", 1), ("clinics", 18, "clinics", 1), ("researchers", 18, "researchers", 1),
    ("never", 19, "never", 1), ("institutions", 19, "institutions", 1), ("eighty", 19, "eighty", 1), ("fifteen", 19, "fifteen", 1),
    ("profitable", 20, "profitable", 1), ("french", 20, "french", 1), ("english", 20, "english", 1), ("small", 20, "small", 1),
    ("montreal3", 20, "montreal", 1), ("right", 20, "right", 1), ("canada", 20, "canada", 1), ("world", 20, "world", 1), ("reach", 20, "reach", 1),
    ("samuel", 21, "samuel", 1), ("polytechnique", 21, "polytechnique", 1), ("entrepreneur", 21, "entrepreneur", 1), ("catalyst", 21, "catalyst", 1),
    ("pilot", 22, "pilot", 1), ("research", 22, "research", 1), ("hundred", 22, "hundred", 1),
    ("boussole_end", 23, B, 1), ("alone", 23, "alone", 1),
]


def main(fichier):
    d = json.loads(Path(fichier).with_suffix(".alignement.json").read_text(encoding="utf-8"))
    al = d["alignment"]
    chars, deb, fin = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    texte = "".join(chars).lower()
    phrases, curseur, positions = [], 0, []
    for i, (ecrit, parle) in enumerate(zip(d["lignes"], d["lignes_parlees"])):
        p = texte.find(parle.lower(), curseur)
        if p < 0:
            sys.exit(f"✗ line {i + 1} not found in the alignment")
        q = p + len(parle) - 1
        while q > p and not chars[q].isalnum():  # end on the last letter, not the punctuation
            q -= 1
        positions.append(p)
        phrases.append({"texte": ecrit, "debut": round(deb[p] + PRE_ROLL, 3), "fin": round(fin[q] + PRE_ROLL, 3)})
        curseur = p + len(parle)
    cles = {}
    for nom, k, mot, occ in MOTS_CLES:
        p0, ligne = positions[k], d["lignes_parlees"][k].lower()
        j = -1
        for _ in range(occ):
            j = ligne.find(mot.lower(), j + 1)
        if j < 0:
            cles[nom] = phrases[k]["debut"]
            print(f"  ⚠ « {mot} » not found in line {k + 1}: sentence start used")
        else:
            cles[nom] = round(deb[p0 + j] + PRE_ROLL, 3)
    fin_voix = phrases[-1]["fin"]
    debut_carton = round(fin_voix + TENUE_LOGO, 3)
    total = round(debut_carton + CARTON, 3)
    res = {"fps": FPS, "pre_roll": PRE_ROLL, "voix": Path(fichier).name, "duree_voix": round(fin[-1], 3),
           "debut_carton": debut_carton, "duree_totale": total, "images": int(round(total * FPS)), "phrases": phrases, "cles": cles}
    sortie = RACINE / "src" / "en" / "minutage.json"
    sortie.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ {sortie.relative_to(RACINE)}: {len(phrases)} sentences, {len(cles)} keywords, total {total} s ({res['images']} frames)")
    for p in phrases:
        print(f"  {p['debut']:6.2f} → {p['fin']:6.2f}  {p['texte'][:70]}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ICI / "voix" / "prise1.mp3"))
