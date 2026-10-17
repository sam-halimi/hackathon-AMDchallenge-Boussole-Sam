#!/usr/bin/env python3
"""Lengthens an approved score by repeating whole bars (no regeneration), so the music follows a
longer voice take without changing its sound. The loop starts on a downbeat found near `vers`.
Usage: python3 audio/en/allonger_musique.py musiqueB1 musiqueB2 50.0 5   (source, output, around which second, how many bars)"""
import subprocess, sys
from pathlib import Path
import numpy as np
from scipy import signal

ICI = Path(__file__).resolve().parent
SR = 48000
MESURE = 4.702 / 2  # one bar at ~102 bpm, measured by autocorrelation of the spectral flux


def main(src, dst, vers, nb):
    b = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(ICI / "musique" / f"{src}.mp3"), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(b, np.float32).astype(np.float64).reshape(-1, 2)
    mono = x.mean(1)
    hop = 256
    S = np.abs(signal.stft(mono, SR, nperseg=2048, noverlap=2048 - hop)[2])
    flux = np.maximum(0, np.diff(np.log1p(S * 100), axis=1)).sum(0)
    fr = SR / hop
    a, z = int((vers - 1.2) * fr), int((vers + 1.2) * fr)
    i = a + int(np.argmax(flux[a:z]))
    debut = i / fr
    L = int(round(nb * MESURE * SR))
    d = int(round(debut * SR))
    # Snap the end of the loop to the onset nearest one whole number of bars later.
    k = int((debut + nb * MESURE) * fr)
    k = k - 6 + int(np.argmax(flux[k - 6:k + 7]))
    L = int(round(k / fr * SR)) - d
    boucle = x[d:d + L].copy()
    f = int(0.03 * SR)
    t = np.linspace(0, np.pi / 2, f)[:, None]
    tete = x[: d + L].copy()
    # Equal-power crossfade at the only new joint: end of the first pass → start of the repeat.
    tete[-f:] = tete[-f:] * np.cos(t) + boucle[:f] * np.sin(t)
    sortie = np.concatenate([tete, boucle[f:], x[d + L:]])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", str(ICI / "musique" / f"{dst}.wav")],
                   input=sortie.tobytes(), check=True)
    print(f"✓ {dst}.wav: {nb} bars repeated from {debut:.3f} s (loop {L / SR:.3f} s), {len(x) / SR:.2f} → {len(sortie) / SR:.2f} s")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4]))
