#!/usr/bin/env python3
"""Cale l'image sur la voix : produit src/boussole/minutage.json à partir de l'analyse de la prise retenue.

- Début et fin de chaque phrase (horodatage Whisper), corrigés par la détection de silence de ffmpeg
  (Whisper colle parfois un mot au précédent : on reprend la fin du silence qui précède).
- Instants de quelques mots-clés, pour synchroniser les gestes (clic, coup, apparition) au mot près.
- Décalage de départ (pré-roll) et durées de la fin (tenue du logo, carton de fin).

Usage : python3 audio/caler.py audio/voix/prise1.mp3"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
PRE_ROLL = 1.0      # secondes avant le premier mot (l'horloge s'installe)
TENUE_LOGO = 3.0     # secondes de logo après le dernier mot
CARTON = 2.5         # carton de fin animé
FPS = 60

# Mots-clés : (nom, numéro de phrase, mot à trouver dans la phrase, occurrence)
MOTS_CLES = [
    ("cornell", 0, "cornell", 1), ("droguee", 1, "droguée", 1), ("violee", 1, "violée", 1), ("fraternite", 1, "fraternité", 1),
    ("avocat", 2, "avocat", 1), ("deux_jours", 2, "jours", 1), ("campus", 2, "campus", 1), ("trousse", 2, "trousse", 1),
    ("trois_semaines", 3, "semaines", 1), ("adn", 3, "adn", 1), ("exclus", 4, "exclus", 1), ("reflexion", 4, "réflexion", 1),
    ("aucune", 5, "aucune", 1), ("etats_unis", 6, "états", 1), ("six", 7, "six", 1), ("police", 7, "police", 1),
    ("mille", 8, "mille", 1), ("cinquante_deux", 8, "52", 1), ("prison", 8, "prison", 1), ("date_limite", 9, "limite", 1),
    ("douze", 9, "12", 1), ("soixante_douze", 9, "72", 1), ("trois_quatre", 10, "trois", 1), ("stress", 10, "stress", 1),
    ("personne", 11, "personne", 1), ("ordre", 11, "ordre", 1), ("commencer", 12, "commencer", 1),
    ("guidait", 13, "guidait", 1), ("pas_a_pas", 13, "pas", 1), ("boussole", 14, "boussole", 1), ("guide", 14, "guide", 1),
    ("premier_ecran", 15, "écran", 1), ("ecoute", 15, "écoute", 1), ("neuf_un_un", 15, "9", 1), ("compte", 16, "compte", 1),
    ("quitter", 17, "quitter", 1), ("geste", 17, "geste", 1), ("meteo", 17, "météo", 1),
    ("etapes", 18, "étapes", 1), ("une_a_la_fois", 18, "fois", 1), ("delais", 18, "délais", 1), ("sources", 18, "sources", 1),
    ("recit", 19, "récit", 1), ("une_seule", 19, "seule", 1), ("chiffre", 19, "chiffré", 1), ("jsp", 20, "sais", 1),
    ("carte", 21, "carte", 1), ("examen", 21, "examen", 1), ("soutien", 21, "soutien", 1), ("juridique", 21, "juridique", 1),
    ("dossier", 22, "dossier", 1), ("service_juridique", 22, "juridique", 1), ("accord", 23, "accord", 1), ("rappelee", 23, "rappelée", 1),
    ("soignants", 24, "soignants", 1), ("prelevement", 24, "prélèvement", 1), ("delai", 24, "délai", 1),
    ("note", 25, "note", 1), ("horodatee", 25, "rodat", 1), ("premiere_nuit", 25, "nuit", 1),
    ("gratuite", 26, "gratuite", 1), ("hors_ligne", 26, "ligne", 1), ("remplace", 27, "remplace", 1), ("relie", 27, "relie", 1),
    ("cvasm", 28, "cvasm", 1), ("calacs", 28, "calac", 1), ("rebatir", 28, "rebâtir", 1), ("cavac", 28, "cavac", 1), ("uqam", 28, "chair", 1),
    ("recherche", 29, "recherche", 1), ("blessure", 29, "blessure", 1),
    ("affiches", 30, "affiches", 1), ("cartes", 30, "cartes", 1), ("sous_verres", 30, "sous", 1),
    ("jamais", 31, "jamais", 1), ("institutions", 31, "institutions", 1), ("sante", 31, "santé", 1), ("cegeps", 31, "cégeps", 1), ("juridiques", 31, "juridiques", 1),
    ("pilote", 32, "pilote", 1), ("cent_onze", 32, "111", 1), ("seuil", 32, "seuil", 1),
    ("rentable", 33, "rentable", 1), ("quebec", 33, "québec", 1), ("ontario", 33, "ontario", 1), ("canada", 33, "canada", 1),
    ("samuel", 34, "samuel", 1), ("polytechnique", 34, "polytechnique", 1),
    ("etablissement", 35, "établissement", 1), ("partenaire", 35, "partenaire", 1), ("deux_cent_cinquante", 35, "250", 1),
    ("humain", 36, "humain", 1), ("temps", 36, "temps", 1), ("boussole_fin", 37, "boussole", 1), ("aucune_victime", 37, "aucune", 1),
]


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s.split("'")[-1])  # « l'assistant » → « assistant »


def silences(fichier):
    sortie = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(fichier), "-af", "silencedetect=noise=-40dB:d=0.18", "-f", "null", "-"],
                            capture_output=True, text=True).stderr
    debuts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", sortie)]
    fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", sortie)]
    return list(zip(debuts, fins))


def main(fichier):
    analyse = json.loads(Path(fichier).with_suffix(".json").read_text(encoding="utf-8"))
    sil = silences(fichier)
    mots = analyse["mots"]
    phrases = []
    for i, p in enumerate(analyse["phrases"]):
        debut, fin = p["debut"], p["fin"]
        # Début corrigé : fin d'un silence proche (Whisper peut coller le premier mot au précédent).
        proches = [f for (d, f) in sil if debut - 0.25 <= f <= debut + 1.2]
        if proches and i > 0:
            debut = max(debut, proches[0]) if proches[0] - debut < 1.2 else debut
        phrases.append({"texte": p["texte"], "debut": round(debut + PRE_ROLL, 3), "fin": round(fin + PRE_ROLL, 3)})
    # Mots-clés : recherche dans la fenêtre temporelle de la phrase.
    cles = {}
    for nom, k, mot, occ in MOTS_CLES:
        a = analyse["phrases"][k]["debut"] - 0.3
        b = analyse["phrases"][k]["fin"] + 0.3
        trouves = [w for w in mots if a <= w["debut"] <= b and norm(w["mot"]).startswith(norm(mot))]
        if len(trouves) >= occ:
            w = trouves[occ - 1]
            debut = w["debut"]
            if k > 0 and phrases[k]["debut"] - PRE_ROLL > debut:  # mot collé au silence précédent
                debut = phrases[k]["debut"] - PRE_ROLL
            cles[nom] = round(debut + PRE_ROLL, 3)
        else:
            cles[nom] = phrases[k]["debut"]
            print(f"  ⚠ mot-clé « {mot} » introuvable dans la phrase {k + 1} : début de phrase utilisé")
    duree_voix = analyse["duree"]
    fin_voix = phrases[-1]["fin"]
    debut_carton = round(fin_voix + TENUE_LOGO, 3)
    total = round(debut_carton + CARTON, 3)
    res = {
        "fps": FPS, "pre_roll": PRE_ROLL, "voix": Path(fichier).name, "duree_voix": duree_voix,
        "debut_carton": debut_carton, "duree_totale": total, "images": int(round(total * FPS)),
        "phrases": phrases, "cles": cles,
    }
    sortie = RACINE / "src" / "boussole" / "minutage.json"
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ {sortie.relative_to(RACINE)} : {len(phrases)} phrases, {len(cles)} mots-clés, durée totale {total} s ({res['images']} images à {FPS} i/s)")
    for p in phrases:
        print(f"  {p['debut']:6.2f} → {p['fin']:6.2f}  {p['texte']}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ICI / "voix" / "prise1.mp3"))
