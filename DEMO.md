# Sakeenah — everything you need to do

Two things run tomorrow: the **pilgrim app** on your iPhone, and the **campaign board** on the
projector. This is the whole list, in order.

---

# PART 1 · Tonight (do not leave any of this for the morning)

## 1. Install and check

```bash
cd sakeenah
npm install
```

Make sure `.env` exists with your key in it. If it doesn't:

```bash
copy .env.example .env      # Windows
cp .env.example .env        # Mac
```

Then open `.env` and put your key after `GEMINI_API_KEY=`. Nothing else needs changing —
the auto-timers are already off and the fallback brain is already on.

## 2. Vendor the fonts — needs internet, takes 20 seconds

```bash
npm run fonts
```

The venue wifi can then never break your typography.

## 3. Check the key has quota — **this is the one that matters**

```bash
npm run selftest
```

You want to see *Ready for the demo ✓*.

**If it reports a 429**, your key is out of daily quota and **it will not reset before
tomorrow**. Get a fresh key from a different Google account tonight and put it in `.env`.
Do not go to sleep on a 429.

> Even if Gemini dies completely tomorrow, every button in the demo still works — the
> triggers, the three questions and the confirmation don't call Gemini at all. Only free
> conversation does.

## 4. Install cloudflared — the phone will not work without it

The iPhone microphone needs an `https://` address. Your laptop only serves `http://`.

```bash
winget install --id Cloudflare.cloudflared     # Windows
brew install cloudflared                        # Mac
```

## 5. Do a full dry run, on the actual phone

```bash
npm start           # leave this window open
npm run tunnel      # second window — prints an https:// link
```

On the iPhone open that link **in Safari**, with `/app` on the end.

> **Safari, not Chrome.** Chrome on iPhone cannot use speech recognition at all — every
> browser on iOS is Safari underneath and only Safari exposes the microphone API. If you
> open it in Chrome the app will tell you, but you'll have wasted the moment.

Plug your earphones in, then walk the whole path once. If anything surprises you, better
tonight than on stage.

## 6. Make the video

Follow **VIDEO.md**. Generate the man in Google Flow, screen-record the real board, and run
`npm run vo` for Sakeenah's own voice. Free Flow resets daily, so start it tonight rather
than hoping for credits in the morning.

---

# PART 2 · Tomorrow, before you present

```bash
npm start
npm run tunnel
```

Two browser windows:

| What | Where | Who sees it |
|---|---|---|
| **Campaign board** | laptop, `http://localhost:3000/web`, full screen (`F11`) | the projector |
| **Pilgrim app** | iPhone Safari, the tunnel link + `/app` | the judge's hands |

Earphones into the iPhone. Volume up. On the phone: **Scan → allow the microphone → pick a
device → Continue to his day → Start session.**

Do this before anyone is watching, so the microphone permission and the audio unlock are
already done.

---

# PART 3 · The demo itself

## Letting a judge hold it (3 minutes)

1. **Hand them the phone on the Voice tab.** The board is already on the projector behind you.
2. Let them tap **"Is it time for my medicine?"** — she answers from his real schedule against
   the real Makkah clock, instantly.
3. Let them **speak to her freely.** This is the part that impresses: she answers real
   questions. It takes a couple of seconds because it's a real model thinking.
4. **The hinge.** Press **Fall detected**, or have them say *"I'm so tired, I can't breathe."*
   She checks on him and asks **"Do you need help?"** — then stops.
5. **Point at the projector. Nothing has moved.** Say it out loud: *nothing has been sent, and
   nothing will be, until he answers. He decides.* Let the silence sit.
6. Let them press **"Yes, please help me."** The red card lands on the projector with his
   conditions, his medications, his earpiece and his son's number, and the log unfolds.
7. On the board: **Acknowledge · send a supervisor**, then **Close the incident**. It moves to
   Archive with its duration.
8. Press **ع** in either header. Everything mirrors — interface, her voice, her recognition,
   her thinking.

## The other buttons, if you have time

On the Voice tab: **Medication reminder**, **Drifted from group**, **Rejoined group**,
**Fall detected**. All instant. On the board: **Raise a test alert** puts a card up without
needing the phone at all — useful if you're presenting alone.

---

# PART 4 · If something goes wrong

| What you see | What to do |
|---|---|
| Microphone does nothing on the phone | You're not in Safari, or not on the `https://` tunnel link. Both are required. |
| Safari never asked for the microphone | Settings → Safari → Microphone → Ask. Then reload. |
| She replies but says nothing aloud | A banner appears with **Replay**. Press it. iOS blocks audio until you've touched the page. |
| Recognition stops after each sentence | That's iOS, and it's expected. Tap the circle again for each sentence. |
| `brain: fallback` in the status panel | Gemini is out of quota. Every button still works; only free conversation is degraded. Don't mention it. |
| Nothing reaches the board | Check the phone's Live status panel says *server: connected*. If not, the tunnel window closed — restart `npm run tunnel` (the link changes). |
| The tunnel link stops working | Free tunnels are disposable. Restart it and reopen the new link. Keep the window open all day. |
| Total collapse | Open `/app` and `/web` on the laptop itself, side by side, at `localhost`. No tunnel, no phone, everything works. **This is your parachute — test it tonight too.** |

---

# PART 5 · Say these out loud

Two honest limits. Say them before a judge finds them:

- **The fall sensor is simulated.** The earpiece hardware isn't built. Ordinary earbuds carry
  her voice and his; fall and heart sensing need the Sakeenah earpiece.
- **The SMS is shown as a log line, not sent.**

Everything between detection and alert is real: the speech recognition, the understanding, the
medication schedule against the real clock, the distance from the group, and the rule that she
never raises an alert until she has asked and he has said yes.

That rule is your product. Lead with it.

---

## Every command, in one place

```bash
npm install         # once
npm run fonts       # once, tonight, needs internet
npm run selftest    # checks voice + Gemini quota
npm start           # the server
npm run tunnel      # https link for the phone
npm run vo          # Sakeenah's voice as mp3s, for the video
npm run bench       # if replies feel slow, find the fastest model
```

| Address | What |
|---|---|
| `/app` | the pilgrim's phone app |
| `/web` | the campaign board |
| `/roster`, `/alerts` | both redirect to `/web` |
