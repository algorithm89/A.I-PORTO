---
title: Build a Face Recognition System in Python
track: Biometric System
level: Beginner
partTitle: Part 6 — Biometric Form Login (Coming Soon)
order: 6
---

# Part 6 — Biometric Form Login

> 🚧 **Coming soon.** This part is being built and tested before it's published — the prose will land once the working code is in place.

![Sneak peek — the biometric form login screen the face recognizer will sit behind](formloginbio.png)

## What this part will cover

Parts 1–5 built a face recognizer that runs on your laptop. Part 6 takes that exact same `predict()` call and the **Unknown threshold** from Part 5 and wires it into a real web login — backed by a MySQL `users` table — so the question stops being *"who is this?"* and starts being *"are we letting them in?"*

The plan:

- **Capture during registration.** A new user signs up with the form above. While they create the account, the webcam quietly enrolls them — the same 30-sample, 200×200 grayscale crops from Part 3, stored under a folder keyed to their user ID rather than a free-text name.
- **Train on enrollment, not on login.** Adding a user retrains the LBPH model once and saves it next to `labels.json`. Login itself stays fast because — as we learned in Part 5 — recognition just `read()`s the model file.
- **Login as a recognition + threshold decision.** Submitting the form with a face triggers the same predict-and-compare logic from Part 5. If `distance <= CONFIDENCE_THRESHOLD`, we look up the matched user ID in MySQL and issue a session. If not, the login is rejected exactly like a wrong password — *not* explained away as "Unknown" to the attacker.
- **The security questions you actually have to answer.** Where does the model file live? What happens when a user updates their face? How do you stop someone from holding up a photo? (Spoiler: liveness detection is a Part 7 problem.) Why a higher threshold here than in Part 5's demo.

## What you'll already have

If you finished Part 5, you have every Python piece you need: a working camera pipeline, an enrollment script, a trained model, and the recognition loop with the Unknown gate. Part 6 is almost entirely **plumbing** — connecting those pieces to a registration form, a database, and a session.

## Status

The form is mocked, the schema is sketched, and the integration is in progress. When the code is committed and the login actually works end-to-end against this site's MySQL instance, this page will fill in with the full walkthrough — registration flow, schema, threshold tuning under real-world lighting, and the trade-offs that come with letting a webcam stand in for a password.

Check back, or keep an eye on the Tutorials page — Part 6 will publish here as soon as it's real.
