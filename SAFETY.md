# Boussole: safety, privacy and human oversight

Boussole supports people after a sexual assault in Montréal, and the care teams who receive them. Its rule is simple: **the AI guides, the human decides.** This document explains how the prototype handles wrong or unsupported AI output, sensitive information, uncertain results and risky decisions, and what is still missing.

> **Status: hackathon prototype.** Fictional data only. Not a medical device. The clinical rules have **not** been validated by clinicians, and the product has not been tested with survivors. Nothing here replaces emergency services (911), Info-aide violence sexuelle (1 888 933-9007) or a medical team.

## 1. What the AI does, and what it never does

The only AI feature is in the **care-team tool** (`#/demo`, step 4): it turns free-text clinical notes into a **factual timeline** with a verbatim quote for every line. It calls the open model **DeepSeek-V4-Flash** served by **AMD Token Factory** on AMD GPUs, through an OpenAI-compatible API. Only pseudonymised text is sent. AMD keeps prompts and outputs for about 2 days (trial terms), so the demo uses **fictional data only**, and the app says so next to the button that sends the notes and in the privacy policy.

| The AI does | The AI never does (enforced, not just requested) |
|---|---|
| Order facts in time | Name or hint at a culprit |
| Quote the exact source sentence | Score or judge the person's credibility |
| Flag gaps in memory as "information not available", neutrally | Treat gaps or contradictions in the person's account as a problem |
| Flag **record** inconsistencies (timestamps, samples, signatures) | Give a diagnosis or legal qualification |
| Suggest | Decide, write to the record, or send anything |

The person's own space (`#/`) uses **no AI at all**: care steps, resources and time windows come from sourced content and a deterministic rule engine.

## 2. Wrong or unsupported AI output

Every model response goes through server-side checks (`app/server/timeline.js`) **before** it reaches the screen:

1. **Schema check.** The output must match the exact JSON schema (also enforced at generation time through `response_format`). Malformed output is retried once, then the request fails over (see §4).
2. **Citation check.** Each event's `source` must appear **verbatim** in the notes actually sent to the model (whitespace and typographic quotes normalised). Each record inconsistency must quote all its sources. Anything else is **removed** as *unsupported*.
3. **Forbidden content.** Lines that name a culprit ("coupable", "suspect", "l'agresseur est…"), judge credibility ("peu fiable", "ment", "exagère", "crédibilité"), score the person, qualify the facts legally or state a diagnosis are **removed**.
4. **Nothing is rewritten.** Removed items are listed to the care team with the reason ("N suggestion(s) removed automatically by the guardrails").
5. **Human validation.** Every remaining line shows *Validate / Reject*. Only validated lines go to the export. Every decision is written to a SHA-256 hash-chained custody log; tampering is detected and shown.

Tests: `app/server/timeline.test.js`, `app/server/handler.test.js` (including a mock model that invents a quote and a credibility judgement: both are removed).

## 3. Sensitive information

| Risk | Mitigation in the prototype |
|---|---|
| Identifiers reaching the model | Pseudonymisation **in the browser** before sending: known identity (name, first/last name, address) plus generic patterns (phone, email, date of birth, Québec health-card number, postal code, street address). The care team can see "what the AI sees" with masked tokens highlighted. |
| Pseudonymisation misses something | **Second check on the server** (`shared/identifiers.js`): if an identifier is still present, the request is **refused (HTTP 422)**, nothing is sent to the model, and the identifier is not echoed back. |
| API key exposure | The endpoint key stays server-side (`AI_API_KEY`, set in `app/.env` locally or in the hosting project's environment variables); the browser only calls `/api/timeline`. The key is never logged, never returned by `/api/health`, never committed: `.env` is git-ignored and only `.env.example` (no values) is in the repository. |
| Logs | The server logs status code and latency only, never the notes. |
| Caching | The service worker never caches `/api/` or third-party requests (map tiles). |
| The person's own story | Stored **only on the device**, encrypted with AES-256-GCM (key derived from the password with PBKDF2, 310,000 iterations). No account server. "Erase everything" deletes it immediately. |
| Sending the file to a legal service | **Simulated** in this beta; requires explicit consent, a beta acknowledgement and a second confirmation. |
| Tracking | No analytics, no advertising cookies. OpenStreetMap tiles are the only external call in the person's space. |
| Discretion on a shared phone | Installing the PWA is **optional**; the prompt says the "Boussole" icon will be visible on the home screen. No notifications. The "Lock" button closes the space at any time. |

## 4. Uncertain results

Uncertainty is shown, never hidden:

- **Live vs. pre-recorded AI.** A banner states either *"Live AI answer · <provider label> · model · latency"* (only after a real call succeeded and passed the guardrails). While the answer streams in, only lines that already passed the guardrails are shown, without banner or Validate buttons; if the call then fails, they are discarded and the labelled pre-recorded answer replaces them or *"PRE-RECORDED AI answer (reason)"*. If the endpoint is unreachable, misconfigured, too slow, refuses the key or returns malformed output, the app falls back to a pre-recorded answer for the fictional case and **says why**. The fallback itself passes the same guardrails (`timelineFixture.test.ts`).
- **"Don't know" is a real answer.** In the care-team intake, "Ne sait pas" is a third state (it was previously merged into "yes"). The rule engine includes the related step **out of caution** and marks it *"To confirm: included out of caution"*. The person's form has the same "Je ne sais pas" option.
- **Rules not clinically validated.** The rule engine is labelled `règles-prototype v0.2 (non validées cliniquement)` on the care-team banner, the checklist, the summary, the JSON export and the person's views ("time windows are indicative").
- **Sources that disagree.** The forensic kit window is shown as "5 to 7 days depending on sources" (MSSS 2010 guide vs. 2026 Montréal sources), never as a single certain number.
- **Resources not confirmed by an official source** carry an **"À confirmer"** badge with the reason, on the card and on the map (see §6).
- **Not medical advice.** The home screen says so and points to Info-aide, 811 and 911.

## 5. Risky decisions stay with people

| Decision | Who decides | How the app protects it |
|---|---|---|
| Examination, each sample, kit storage | The person, with the care team | Per-item consent, each logged; samples cannot be ticked without sample consent |
| Transmission to police | The person only | Separate consent, off by default; the export says "not authorised: the file stays at the designated centre" |
| Filing a complaint | The person, any time | The app says there is no deadline and that the kit can be done without deciding |
| Sending the file to Rebâtir | The person | Explicit consent + beta acknowledgement + second confirmation (simulated) |
| What goes into the clinical record | The care team | Only validated AI lines are exported |
| Emergencies | — | Info-aide is one tap away on the home and "Where to go" screens; 911 is in the first care step, the offline banner and the offline page |

## 6. Information still to confirm

From `app/src/lib/research-resources.md` (checked 2026-10-04). **No phone number or address was changed without an official source**; a test (`resources.test.ts`) freezes the verified numbers.

| Resource | What is uncertain | What the app shows |
|---|---|---|
| CAVAC de Montréal | Phone confirmed (SPVM, 2026). Address and hours come from a secondary source; the official site could not be reached. | Phone; address with "À confirmer"; hours "to confirm"; "Call before you go". |
| CALACS Trêve pour Elles | The organisation publishes two numbers (514 251-0323 in the header, 514 565-0522 on its contact page). | Main line 514 251-0323, plus an "À confirmer" note quoting both. |
| Montreal Children's Hospital (MUHC) | Designated-centre status is confirmed (CIUSSS). Phone numbers found only on an old MUHC page and on 211. | No phone shown; "À confirmer" note; redirect to Info-aide. |
| Montreal General Hospital (CVASM evenings) | Number from the CIUSSS reference sheet (May 2026), not cross-checked on the MUHC site. | Number with "À confirmer". |
| Several organisations (CVASM office, Collectif Consenti, Juripop, DPCP line) | Hours not published. | "Hours not specified: call" (previously an unsourced "business days"). |
| MCVI | Hours from a secondary source only. | "Hours to confirm". |
| Forensic kit window and storage time | Sources differ (5 vs. 7 days; 14 days vs. 6 months storage). | "5 to 7 days depending on sources"; storage shown as "kept while you decide", no duration. |

## 7. Known limits and residual risks

- Pattern-based pseudonymisation is not named-entity recognition: an unusual name or place in free text can slip through the client and the server check. Production needs NER plus the institution's own lists, and a review step.
- The citation check proves a quote exists, not that the model's *description* of it is faithful. That is why every line needs human validation.
- The forbidden-content list is a French keyword list: it can over-remove (safe) or miss a paraphrase (the human review is the backstop).
- The open-source model has not been evaluated on real clinical notes. The benchmark measures speed, not clinical quality.
- Rule time windows are prototype values pending clinical validation against the MSSS protocol.
- Traffic between the Boussole server and the AI endpoint uses HTTPS (`https://developer.amd.com.cn/radeon/api/v1`). It is a trial endpoint without SLA whose terms forbid sensitive personal or health data: acceptable for this fictional demo only. Production would need a contractual, Canadian-hosted endpoint (Law 25).
- No accessibility audit yet, no co-design with survivors or care teams yet.

## 8. Before any real-world use

Clinical validation of the rules; privacy impact assessment (Québec Law 25); Canadian hosting; independent security audit; co-design and testing with survivors, CALACS and designated-centre teams; evaluation of the model on representative, consented data; end-to-end encrypted transmission with signed receipts.
