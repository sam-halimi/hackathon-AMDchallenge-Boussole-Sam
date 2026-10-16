#!/usr/bin/env python3
"""Modèle économique de Boussole (16 octobre 2026) : économies estimées, prix au pourcentage, projections allégées.
Toutes les sources sont dans ECONOMIES.md. Chaque hypothèse est marquée H et doit être mesurée pendant le pilote."""
import json
from pathlib import Path

# --- Économies estimées pour 1 000 victimes accompagnées par an -------------------------------
INF_TAUX = 40.26 * 1.35        # infirmière clinicienne, échelon 9 (FIQ 2025-2026) + 35 % d'avantages sociaux (H)
MIN_DOC = 3 * 60 * 0.353 * 0.24  # examen 3 h (Ciancone 2000) × 35,3 % de documentation (Hendrich 2008) × −24 % (Poissant 2005)
IVAC_ADMIN = 35_048_298 / 27_904  # frais d'administration IVAC 2024 / demandes reçues (rapport LAPVIC 2024-2025)
REBATIR_CONSULT = 3_000_000 / (89_102 / 3.4)  # 3 M$ par an / consultations annuelles (≈ 115 $, calcul)
TSPT_AN = 19_630                # coût excédentaire d'une personne atteinte de TSPT, un an (Davis 2022, $ US 2018, pris tel quel : prudent)

economies = {
    "soignants": 1000 * MIN_DOC / 60 * INF_TAUX,                 # temps de documentation infirmier
    "ivac": 1000 * 0.40 * IVAC_ADMIN * 0.20,                     # H : 40 % demandent l'IVAC ; dossier complet = −20 % de traitement
    "rebatir": 1000 * 0.30 * REBATIR_CONSULT,                    # H : 30 % consultent ; une consultation de moins grâce au dossier préparé
    "sante_mentale": 1000 * 0.02 * TSPT_AN,                      # H : 2 points de TSPT en moins à un an (41,5 % → 39,5 %)
}
total = sum(economies.values())
par_victime = total / 1000
PART = 0.15                     # Boussole facture environ 15 % des économies estimées
prix_victime = par_victime * PART

# --- Projections, scénario de base (k$) -------------------------------------------------------
ANS = [2027, 2028, 2029, 2030, 2031]
base_rev = {
    "centres": [5 * 9.6 + 5 * 4, 20 * 9.6 + 15 * 4, 40 * 9.6 + 20 * 4, 0, 0],
    "licence": [0, 0, 0, 300, 300],
    "etablissements": [4 * 9 + 4 * 3, 15 * 9 + 11 * 3, 30 * 9 + 15 * 3, 45 * 9 + 15 * 3, 60 * 9 + 15 * 3],
    "juridique": [0, 27, 27 + 51, 27 + 51 + 75, 27 + 51 + 75],
    "ontario": [0, 0, 0, 0, 10 * 9.6 + 10 * 4],
}
base_couts_detail = {
    "Fondateur": [24, 55, 70, 80, 90],
    "Développement (Mitacs puis embauches)": [15, 105, 180, 270, 360],
    "Soutien et formation des équipes": [0, 20, 70, 140, 210],
    "Conformité (Loi 25, sécurité, assurance, juriste)": [35, 25, 30, 35, 40],
    "Hébergement au Québec": [4, 8, 15, 25, 35],
    "Comité aviseur": [6, 8, 10, 10, 12],
    "Communication et ventes": [8, 15, 40, 55, 90],
    "Divers": [5, 10, 15, 20, 25],
}
prudent_rev = [65, 214, 415, 557, 680]
prudent_couts = [97, 200, 300, 380, 450]

rev = [round(sum(v[i] for v in base_rev.values())) for i in range(5)]
couts = [sum(v[i] for v in base_couts_detail.values()) for i in range(5)]
res = [r - c for r, c in zip(rev, couts)]
cum = [sum(res[: i + 1]) for i in range(5)]
sortie = {
    "economies_par_1000_victimes": {k: round(v) for k, v in economies.items()},
    "economies_total_par_victime": round(par_victime),
    "minutes_documentation_par_examen": round(MIN_DOC, 1),
    "taux_horaire_infirmiere_charge": round(INF_TAUX, 2),
    "cout_admin_ivac_par_demande": round(IVAC_ADMIN),
    "cout_consultation_rebatir": round(REBATIR_CONSULT),
    "part_facturee": PART,
    "prix_par_victime": round(prix_victime),
    "annees": ANS,
    "base": {"revenus_detail": {k: [round(x) for x in v] for k, v in base_rev.items()}, "rev": rev, "cost": couts, "res": res, "cum": cum, "couts_detail": base_couts_detail},
    "prudent": {"rev": prudent_rev, "cost": prudent_couts, "res": [r - c for r, c in zip(prudent_rev, prudent_couts)]},
}
Path(__file__).with_name("projections.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=1), encoding="utf-8")
print(json.dumps(sortie, ensure_ascii=False, indent=1))
