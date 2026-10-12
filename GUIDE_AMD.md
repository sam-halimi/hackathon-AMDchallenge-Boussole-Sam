# Guide : servir l'IA de Boussole sur AMD Developer Cloud

But : faire tourner la **chronologie assistée par IA** de l'outil soignant (`#/demo`, étape 4) sur un modèle open source servi par **vLLM sur GPU AMD Instinct (ROCm)**, puis le montrer au jury.

Temps estimé : 30 à 45 minutes. Tout ce qui suit est à faire **par toi** : je n'ai ni compte ni accès à AMD Developer Cloud.

> Sources des étapes de console : le tutoriel lablab.ai [« AMD Developer Cloud Tutorial: Host Your First LLM on AMD GPU »](https://lablab.ai/ai-tutorials/amd-developer-cloud-host-llm-vllm) (24 mars 2026) et l'article AMD [« How to Get Started on the AMD Developer Cloud »](https://www.amd.com/en/developer/resources/technical-articles/2025/how-to-get-started-on-the-amd-developer-cloud-.html). L'interface peut avoir changé : en cas d'écart, suis le lien **Quick Start** de la console.

---

## 0. Ce qu'il faut savoir avant de commencer

- **Coût** : un droplet 1 × MI300X était affiché à 1,99 $/h dans le tutoriel lablab (mars 2026). Les crédits du programme développeur ont une date d'expiration : vérifie dans **Billing**.
- **Éteindre ne suffit pas** : selon ce même tutoriel, il faut **détruire** (Destroy) le droplet pour arrêter la facturation.
- **Le port 8000 de vLLM est public** sur ces droplets (Docker passe outre le pare-feu UFW, d'après le tutoriel) et vLLM n'exige **aucune authentification par défaut**. On lance donc **toujours** vLLM avec `--api-key`.
- **Données** : seules des notes **fictives et pseudonymisées** partent vers le modèle. Le serveur de Boussole refuse l'envoi si un identifiant direct (téléphone, courriel, date de naissance, n° RAMQ, code postal, adresse) est encore présent.

## 1. Compte et crédits

1. Inscris-toi au **AMD AI Developer Program** (bouton « Sign up with AMD » de la page du hackathon sur lablab.ai).
2. Connecte-toi à **AMD Developer Cloud** avec ce compte.
3. Dans **Billing** : ajoute un moyen de paiement si la console l'exige (sans lui, le bouton « Create GPU Droplet » reste grisé d'après le tutoriel) et vérifie le solde et l'expiration des crédits.

## 2. Clé SSH (sur ton ordinateur)

```bash
ssh-keygen -t ed25519 -C "boussole-amd"     # Entrée pour l'emplacement par défaut
cat ~/.ssh/id_ed25519.pub                   # à coller dans la console
```

## 3. Créer le droplet GPU

**GPU Droplets → Create GPU Droplet** :

| Réglage | Choix |
|---|---|
| Région | celle qui a des MI300X disponibles (le tutoriel cite ATL1) |
| Plan GPU | **MI300X × 1** (suffisant ; 8 GPU est inutile ici) |
| Image | **vLLM** (Quick Start : vLLM + ROCm préinstallés dans un conteneur Docker) |
| Clé SSH | celle de l'étape 2 |

Clique sur **Create GPU Droplet**, attends le statut **Active** (quelques minutes) et note l'**adresse IP publique**.

## 4. Lancer vLLM avec une clé

```bash
ssh root@<IP>
docker exec -it rocm /bin/bash          # conteneur de l'image Quick Start vLLM
```

Dans le conteneur :

```bash
# 1. Vérifier que le GPU AMD est vu par ROCm (capture d'écran utile pour le jury)
rocm-smi        # ou : amd-smi

# 2. Générer une clé (garde-la : elle ira dans VLLM_API_KEY)
export VLLM_API_KEY=$(openssl rand -hex 32); echo "$VLLM_API_KEY"

# 3. Servir le modèle (API compatible OpenAI sur le port 8000)
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 --port 8000 \
  --api-key "$VLLM_API_KEY" \
  --max-model-len 16384 \
  > /tmp/vllm.log 2>&1 &

tail -f /tmp/vllm.log     # attendre « Application startup complete », puis Ctrl+C
```

`vllm serve Qwen/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000 --api-key "$VLLM_API_KEY"` est l'écriture équivalente sur les versions récentes de vLLM.

**Pourquoi ce modèle** : Qwen2.5-7B-Instruct est sous licence Apache 2.0, n'exige pas de jeton Hugging Face et tient largement sur un MI300X. C'est un point de départ : tu peux essayer un modèle plus gros (ex. `Qwen/Qwen2.5-32B-Instruct`), relancer le benchmark et garder le meilleur compromis qualité/latence. Si le modèle choisi est « gated » sur Hugging Face, exporte `HF_TOKEN` avant de lancer vLLM.

## 5. Tester l'endpoint depuis ton ordinateur

```bash
export IP=<IP> KEY=<VLLM_API_KEY>
curl -s http://$IP:8000/v1/models -H "Authorization: Bearer $KEY"
curl -s http://$IP:8000/v1/chat/completions -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"model":"Qwen/Qwen2.5-7B-Instruct","messages":[{"role":"user","content":"Réponds OK."}],"max_tokens":5}'
```

Sans l'en-tête `Authorization`, la réponse doit être **401** : c'est la preuve que la clé protège l'endpoint.

## 6. Brancher Boussole

```bash
cd app
cp .env.example .env
```

Dans `app/.env` :

```
VLLM_BASE_URL=http://<IP>:8000/v1
VLLM_MODEL=Qwen/Qwen2.5-7B-Instruct
VLLM_API_KEY=<la clé>
VLLM_LABEL=AMD Developer Cloud · Instinct MI300X · vLLM/ROCm
```

```bash
npm install
npm run dev                      # http://localhost:5173/#/demo → étape 4 → « Générer la chronologie »
curl -s localhost:5173/api/health   # {"configured":true,"reachable":true,...}
```

Le bandeau au-dessus de la chronologie doit afficher **« Réponse IA en direct · AMD Developer Cloud · … »**. S'il affiche « Réponse IA PRÉ-ENREGISTRÉE », la raison est écrite entre parenthèses (endpoint injoignable, clé refusée, délai dépassé…).

Si l'endpoint refuse `response_format` (vieille version de vLLM), ajoute `VLLM_JSON_SCHEMA=0` : les garde-fous côté serveur restent actifs.

## 7. Benchmark (résultats pour le README)

```bash
npm run bench                              # 3 notes fictives × 3 passages, concurrence 1 et 4
npm run bench -- --runs 5 --concurrency 1,4,8
```

Le script écrit `app/bench/results.md`. Copie le tableau dans la section **Benchmark** du `README.md` racine, avec la date, le modèle et la version de vLLM (`pip show vllm` dans le conteneur).

## 8. Rendre l'appli accessible au jury (au moment où tu le décides)

La clé ne doit jamais aller dans le navigateur : la route `/api/timeline` la garde côté serveur. Deux options, toutes deux testées en local avec le faux serveur.

**Option A : tout sur le droplet AMD (le plus simple, tout le produit tourne sur AMD)**

```bash
# sur le droplet (hors du conteneur rocm) : Node 22 ou plus
git clone <ton dépôt> && cd <dépôt>/app && npm ci && npm run build
cp .env.example .env    # VLLM_BASE_URL=http://127.0.0.1:8000/v1 + la clé
HOST=0.0.0.0 PORT=8080 npm start
```

L'appli et l'API sont alors sur `http://<IP>:8080`. Pour une URL **HTTPS** (nécessaire pour installer la PWA sur un téléphone), mets un proxy TLS devant (ex. Caddy avec un nom de domaine).

**Option B : appli sur Vercel, IA sur AMD**

Le dossier `app/api/` contient la même route en fonction serverless. Dans le projet Vercel (racine : `app/`), définis `VLLM_BASE_URL`, `VLLM_MODEL`, `VLLM_API_KEY`, `VLLM_LABEL` dans les variables d'environnement, puis déploie (`npx vercel deploy` pour un aperçu privé, `--prod` quand tu es prêt). Attention : entre Vercel et le droplet, l'appel passe en HTTP clair tant que vLLM n'est pas derrière un proxy TLS ; la clé y circule. Pour une démo sur données fictives, c'est acceptable ; sinon, mets un proxy TLS devant vLLM.

## 9. Preuves pour le jury

- Capture de `rocm-smi` (ou `amd-smi`) et de `/tmp/vllm.log` montrant le modèle chargé.
- Capture de l'appli avec le bandeau « Réponse IA en direct · AMD Developer Cloud ».
- Le tableau du benchmark dans le README.
- Dans la vidéo : 10 secondes sur l'étape 4 en direct, bandeau visible.

## 10. Après la démo

- **Détruire** le droplet (Destroy) pour arrêter la facturation.
- Changer la clé si elle a été partagée.
