#!/usr/bin/env python3
"""Soundtrack of the English spot: ElevenLabs voice (Zoë), ElevenLabs score in two halves,
ElevenLabs sound effects placed on the on-screen events, then mix and master.

- Score: part A (tense pulse, musique1 from 0 s) until "Meet Boussole"; during "What if…" it is
  filtered and lowered (the breath before the switch). Part B (musiqueB1) starts exactly on the logo.
- Voice: no compressor or limiter; the music is ducked under it (sidechain) and sits 14 LU below
  it while she speaks.
- Master: −14 LUFS integrated / −1 dBTP (fixed gain, then 4× oversampled peak limiter).
Cues use the same formulas as src/en/temps.ts and the scenes.
Usage: python3 audio/en/composer_en.py → audio/en/rendu/{mix_pre_master,mix_master}.wav"""
import json, math, re, subprocess
from pathlib import Path
import numpy as np
import pyloudnorm as pyln
from scipy import signal

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
SORTIE = ICI / "rendu"; SORTIE.mkdir(exist_ok=True)
SR = 48000
M = json.loads((RACINE / "src" / "en" / "minutage.json").read_text(encoding="utf-8"))
N = int(math.ceil(M["duree_totale"] * SR))
P = lambda n: M["phrases"][n]["debut"]
K = lambda nom: M["cles"][nom]
ECART_LU = 14.0


def lire(fichier):
    brut = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(fichier), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(brut, dtype=np.float32).astype(np.float64).reshape(-1, 2)


def ecrire_wav(fichier, st):
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", str(fichier)],
                       input=np.clip(st, -1, 1).astype(np.float32).tobytes())
    assert p.returncode == 0


def poser(piste, son, t, gain_db=0.0):
    i0 = int(round(t * SR))
    if i0 >= len(piste): return
    if i0 < 0: son, i0 = son[-i0:], 0
    n = min(len(son), len(piste) - i0)
    piste[i0:i0 + n] += son[:n] * 10 ** (gain_db / 20)


def rampe(n, a, b):
    return np.linspace(a, b, max(n, 1))


def enveloppe_voix(mono):
    rms = np.sqrt(signal.sosfilt(signal.butter(2, 30, fs=SR, output="sos"), mono ** 2).clip(0))
    bloc, acc = rms[::48], 0.0
    out = np.zeros_like(bloc)
    a_att, a_rel = math.exp(-1 / (0.02 * 1000)), math.exp(-1 / (0.35 * 1000))
    for i, v in enumerate(bloc):
        acc = a_att * acc + (1 - a_att) * v if v > acc else a_rel * acc + (1 - a_rel) * v
        out[i] = acc
    return np.interp(np.arange(len(rms)), np.arange(len(out)) * 48, out)


def musique():
    mus = np.zeros((N, 2))
    debut_b = P(10) - 0.2           # part B begins on the logo, exactly
    debut_guide = P(9) - 0.2        # "What if someone guided them"
    a = lire(ICI / "musique" / "musique1.mp3")[: int(debut_b * SR)].copy()
    a[: int(0.4 * SR)] *= rampe(int(0.4 * SR), 0, 1)[:, None]
    # The breath: low-pass and −7 dB over "What if…", fading into the cut.
    i_g = int(debut_guide * SR)
    filtre = signal.sosfiltfilt(signal.butter(4, 500, fs=SR, output="sos"), a, axis=0)
    m = np.clip((np.arange(len(a)) - i_g) / (0.6 * SR), 0, 1)[:, None]
    a = a * (1 - m) + filtre * m * 10 ** (-7 / 20)
    a[-int(0.06 * SR):] *= rampe(int(0.06 * SR), 1, 0)[:, None]
    poser(mus, a, 0)
    b = lire(ICI / "musique" / "musiqueB2.wav")
    b[: int(0.015 * SR)] *= rampe(int(0.015 * SR), 0, 1)[:, None]
    poser(mus, b, debut_b)
    return mus


def bruitages():
    S = {nom: lire(ICI / "sfx" / f"{nom}.mp3") for nom in ["tap", "swish", "pop", "marker", "papier", "tampon", "montee", "impact", "scintille", "verrou", "frappe", "points"]}
    for nom, s in S.items():
        S[nom] = s / max(1e-6, np.max(np.abs(s)))
    sfx = np.zeros((N, 2))
    logo = P(10) - 0.3
    coupe = K("paperwork") + 0.5
    cues = [
        ("swish", P(1) - 0.22, -13), ("swish", P(1) + 0.08, -15), ("swish", P(1) + 0.38, -15),  # press cuttings slide in (soft, no paper)
        ("tampon", K("charges") - 0.05, -4),                                  # "No charges."
        ("points", K("six") - 0.15, -12),                                     # the 6 dots light up
        ("swish", K("twelve") - 0.15, -14), ("swish", K("seventytwo") - 0.15, -14),
        ("papier", P(7) - 0.2, -10), ("marker", K("three") - 0.2, -9),       # Dworkin abstract
        ("montee", logo - len(S["montee"]) / SR + 0.05, -9),                  # breath before the switch
        ("impact", logo, -4), ("scintille", K("boussole") - 0.1, -12),
        ("swish", P(11) - 0.3, -14),
        ("tap", K("exit") + 0.05, -8), ("swish", K("gone") - 0.25, -12),
        ("tap", K("steps") + 0.35, -8), ("pop", K("deadline") - 0.05, -13), ("pop", K("source") - 0.05, -13),
        ("frappe", K("story") - 0.1, -15), ("verrou", K("encrypted") - 0.2, -10),
        ("swish", K("lawyer2") - 0.5, -13), ("tap", K("choose"), -8),
        ("swish", P(16) - 0.25, -13), ("pop", K("sorted") - 0.2, -13),
        ("papier", P(17) - 0.2, -10), ("marker", K("third") - 0.15, -9),
        ("papier", coupe - 0.35, -11), ("marker", K("quarter") - 0.6, -9),
        ("pop", K("centres") - 0.35, -12), ("pop", K("centres") - 0.23, -14), ("pop", K("clinics") - 0.35, -12),
        ("pop", K("clinics") - 0.23, -14), ("pop", K("researchers") - 0.35, -12),
        ("pop", K("never") - 0.35, -11), ("swish", K("eighty") - 0.5, -14), ("pop", K("fifteen") - 0.2, -11),
        ("pop", K("french") - 0.25, -12), ("pop", K("english") - 0.25, -12),                 # FR and EN phones
        ("swish", K("small") - 0.6, -12), ("swish", K("canada") - 0.45, -12), ("swish", K("world") - 0.45, -11),
        ("swish", P(21) - 0.25, -13),
        ("pop", K("pilot") - 0.35, -11), ("pop", K("research") - 0.35, -11), ("pop", K("hundred") - 0.35, -10),
        ("impact", P(23) - 0.3, -9), ("scintille", P(23) - 0.1, -13),
    ]
    for nom, t, g in cues:
        poser(sfx, S[nom], t, g)
    return sfx


def mesurer(fichier):
    s = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(fichier), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    r = s[s.rindex("Summary:"):]
    return (float(re.search(r"I:\s+(-?[\d.]+) LUFS", r).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", r).group(1)),
            float(re.search(r"LRA:\s+(-?[\d.]+) LU", r).group(1)))


def master(entree, sortie, cible=-14.0, plafond_tp=-1.0):
    I0, _, _ = mesurer(entree)
    gain, plafond = cible - I0, 10 ** ((plafond_tp - 0.35) / 20)
    for _ in range(6):
        f = f"volume={gain:.3f}dB,aresample=192000,alimiter=limit={plafond:.4f}:attack=0.6:release=45:asc=1:level=false,aresample=48000"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(entree), "-af", f, "-c:a", "pcm_s24le", str(sortie)], check=True)
        I, TP, LRA = mesurer(sortie)
        if abs(I - cible) <= 0.1 and TP <= plafond_tp + 0.01: break
        gain += cible - I
        if TP > plafond_tp: plafond *= 10 ** ((plafond_tp - TP - 0.1) / 20)
    return {"I": I, "TP": TP, "LRA": LRA, "gain_db": round(gain, 2)}


def main():
    mesure = pyln.Meter(SR)
    voix = np.zeros((N, 2))
    poser(voix, lire(ICI / "voix" / M["voix"]), M["pre_roll"])
    voix *= 10 ** ((-20 - mesure.integrated_loudness(voix)) / 20)
    mus, sfx = musique(), bruitages()
    env = enveloppe_voix(voix[:, 0])
    seuil = np.percentile(env[env > 1e-5], 20)
    reduction = np.clip(20 * np.log10(np.maximum(env, 1e-9) / seuil), 0, 1) * 8.0   # up to −8 dB under the voice
    duck = 10 ** (-reduction / 20)
    parle = env > seuil
    lm = mesure.integrated_loudness(mus[parle] * duck[parle][:, None])
    lv = mesure.integrated_loudness(voix[parle])
    mus = mus * 10 ** ((lv - ECART_LU - lm) / 20) * duck[:, None]
    sfx *= 10 ** ((-25 - mesure.integrated_loudness(sfx)) / 20)
    mix = voix + mus + sfx
    for nom, piste in [("voix", voix), ("musique", mus), ("bruitages", sfx)]:
        ecrire_wav(SORTIE / f"{nom}.wav", piste)
    ecrire_wav(SORTIE / "mix_pre_master.wav", mix / max(1.0, np.max(np.abs(mix)) / 0.98))
    ecart = mesure.integrated_loudness(voix[parle]) - mesure.integrated_loudness(mus[parle])
    res = master(SORTIE / "mix_pre_master.wav", SORTIE / "mix_master.wav")
    print(f"Voice / music gap while speaking: {ecart:.1f} LU · master {res['I']:.2f} LUFS, true peak {res['TP']:.2f} dBTP, LRA {res['LRA']:.1f}")
    (SORTIE / "mesures.json").write_text(json.dumps({"ecart_voix_musique_LU": round(ecart, 1), "master": res}, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
