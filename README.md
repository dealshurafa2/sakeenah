# Sakeenah · سكينة

An AI voice companion for vulnerable Hajj pilgrims — prototype · Universities Challenge 2026 (StartSmart · Bab Rizq Jameel)

Sakeenah guides an elderly pilgrim through his rituals by voice, reminds him of each medication by name at its
time, notices when he drifts from his group and walks him back gently, and listens for signs of medical distress
in what he says — never raising an alert until she has asked **"Do you need help?"** and he has confirmed.

**Bilingual: English and Arabic**, switchable at any moment from the EN / ع toggle in the header. The whole
interface, the speech recognition, Sakeenah's own voice, and her thinking all follow that choice.

---

## Running it

```bash
npm install
cp .env.example .env      # then put your Gemini key inside .env
npm run selftest          # verifies both voices + both languages of the brain
npm start
```

Then open in **Chrome**:

| Screen | URL |
|---|---|
| 1 · Campaign Dashboard (roster) | http://localhost:3000/roster |
| 2 · Voice Companion | http://localhost:3000/agent |
| 3 · Live Alerts | http://localhost:3000/alerts |

> Open screens 2 and 3 side by side during the demo so the judges see the alert land in real time.

### `.env`

```
GEMINI_API_KEY=your_key_here
PORT=3000
SAKEENAH_VOICE_EN=en-US-AvaMultilingualNeural
SAKEENAH_VOICE_AR=ar-SA-ZariyahNeural
DRIFT_AFTER_SECONDS=150      # simulation: seconds before the pilgrim starts drifting
DEMO_MED_AFTER_SECONDS=120   # simulation: a demo dose fires this long into a session (0 disables)
FALLBACK_BRAIN=0             # 1 = local fallback if Gemini goes down on demo night
```

### Voices

Sakeenah speaks through **edge-tts** — Microsoft Edge's neural voices. Free, no signup, no key.

| Language | Voice |
|---|---|
| English | `en-US-AvaMultilingualNeural` |
| Arabic | `ar-SA-ZariyahNeural` |

```bash
npm run voices   # samples six English voices into voice-samples/ so you can compare
```

Pick one, put it in `.env` as `SAKEENAH_VOICE_EN`, restart.

### Where the delay comes from

Every reply is `speech recognition → Gemini → text-to-speech → playback`. The server logs the split:

```
[TIMING] brain 2180ms + voice 900ms = 3080ms
```

If `brain` is slow, run `npm run bench` and pin a faster model in `.env`. Repeated lines are cached
and return instantly.

---

## The path that must work

1. Open `/agent`, press **Start session**, allow the microphone.
2. Sakeenah greets Hajj Mohammad **in her own voice** and begins the first step of Tawaf.
3. Say **"I'm ready"** → she guides you into the next step.
4. Say a distress phrase: **"I'm so tired… I can't breathe."**
5. She calms you, then asks aloud: **"Do you need help?"** — and nothing else happens until you answer.
6. Say **"Yes, please help me."**
7. A red alert card appears instantly on `/alerts` with Hajj Mohammad's registered details from `/roster`
   (name, age, diabetes and hypertension, medications, earpiece SK-1042, emergency contact), followed by a
   live log simulating the notification of his emergency contact and campaign leader.

**Backup text box** under the microphone: if the room is too loud, type the same phrases and the full path runs.

### She is a real companion, not a script

Ask her anything and she answers properly — she has the pilgrim's full medication schedule, the current time in
Makkah, his live distance from his group, and where he is in the ritual:

- *"Is it time for my medicine?"* → names the medicine, the dose, and whether it is due, overdue, or how long until the next one
- *"How many circuits are left?"* · *"What do I say here?"* · *"What if I'm too tired to finish?"*
- *"How far am I from my group?"* · *"Which way do I walk?"*
- Ordinary reassurance, thanks, or "who are you?"

---

## Recording a demo of every feature

Real medication times and real GPS keep running untouched. The **Demo triggers** panel under the
microphone fires the *same* events the system raises on its own, so you can record everything without
waiting until 20:00 or walking 80 metres down the street.

Set both auto-timers off in `.env` so nothing fires on its own mid-take:

```
DRIFT_AFTER_SECONDS=0
DEMO_MED_AFTER_SECONDS=0
```

A running order that shows every feature in about three minutes:

1. **Start session** — she greets Hajj Mohammad by name, in her own voice.
2. Say *"I'm ready"* → she guides you into the first step of Tawaf.
3. Ask *"Is it time for my medicine?"* → she answers from his real schedule and the real clock.
4. Press **Medication reminder** → she names Metformin and the dose, unprompted. A gold row appears on screen 3.
5. Press **Drifted from group** → she guides him back, calm, never says "lost". Screen 3 logs the distance.
6. Press **Rejoined group** → she reassures him and picks the ritual back up.
7. Press **Fall detected** → she checks on him immediately and asks if he needs help.
8. Say *"Yes, please help me"* → the red alert lands on screen 3 with his registered data and the notification log.
9. Switch to **ع** to show the whole thing in Arabic.

Two honest notes for the voiceover: the **fall sensor is simulated** — the earpiece hardware isn't built —
and the SMS is shown as a log line rather than sent. Everything between detection and alert is real.

---

## Location tracking: real GPS *and* a demo simulation

Open **Location tracking** under the microphone. Two sources, one identical detection engine:

**Demo simulation** (default) — drives the persona along a scripted path so the drift can be shown indoors,
on stage, with no walking. It starts drifting on its own about two and a half minutes into a session, or
immediately if you press *Trigger drift now*.

**Real GPS (this device)** — the browser's Geolocation API reports this device's actual position. Press
**Set group point here** to anchor the group where you're standing, then walk away: the same haversine
distance, the same threshold, the same bearing-back calculation, the same alert. Indoors accuracy is often
20–50 m, so set **Alert distance** above that (40 m is a good starting point); outdoors you can drop it lower.

The detection logic was always real — only the coordinate source changes.

---

## The stack

| Part | Technology | Cost |
|---|---|---|
| Intelligence | Google Gemini `gemini-2.5-flash`, structured JSON output, bilingual prompts | Free · no card |
| Speech in | Web Speech API built into Chrome (`en-US` / `ar-SA`) | Free |
| Sakeenah's voice | edge-tts — Microsoft Edge neural voices, via `msedge-tts` | Free · no signup |
| Location | Browser Geolocation API + haversine drift detection | Free |
| Screen sync | Node.js + Express + Socket.io | Local |
| Pilgrim data | `data/pilgrims.json` | No database |

The Gemini key stays on the server. Every call goes through `/api/chat`; the browser never sees it.

---

## What is real and what is simulated

| Part | Real | Simulated |
|---|---|---|
| Speech recognition | ✅ | |
| Understanding and distress detection | ✅ Gemini | |
| Sakeenah's speech | ✅ real neural voices | |
| Confirmation before any alert | ✅ | |
| Medication scheduling | ✅ compares Makkah time to each dose, names the medicine | |
| Drift detection: distance, threshold, bearing back | ✅ | |
| Pilgrim coordinates | ✅ real GPS mode | ✅ demo mode, for showing it indoors |
| SMS to the emergency contact | | ✅ shown as a live log on screen 3 |
| The earpiece and its medical sensors | | ✅ ordinary headphones |

---

## Layout

```
server.js              server · routes · Socket.io · raising alerts
lib/gemini.js          Sakeenah's brain (bilingual prompts, structured output)
lib/tts.js             neural speech in English and Arabic via edge-tts
lib/session.js         session state · medication scheduling · GPS + drift detection
lib/rituals.js         the seven circuits of Tawaf, in both languages
lib/fallback-brain.js  local fallback (off by default)
data/pilgrims.json     the campaign's pilgrims, in both languages
public/js/i18n.js      the language layer
public/                the three screens
```

## Not built tonight (outside the scope card)

Login and accounts · app store packaging · a full admin panel · languages beyond English and Arabic ·
real SMS or telecom integration · earpiece hardware or medical sensors.
