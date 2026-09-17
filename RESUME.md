# Where we are — resume notes

**Goal:** wire the Claude Design phone-app prototype into the real Sakeenah backend.

## Decisions taken
- Scope: **phone app, fully wired** — the four tabs replace the pilgrim screen.
- Runtime: **strip Claude Design's React runtime**; plain HTML + vanilla JS, zero build.
  Verified safe: the export has 0 `class=` attributes and 0 CSS variables — all 132
  styles are inline, so nothing visual depends on `support.js` or the bundled
  *Industry* design system.
- Positioning: **phone + any earbuds now, Sakeenah earpiece later.**

## Done
- `public/app.html` — phone shell, explainer column, iPhone bezel, live-status panel
- `public/css/phone.css` — the six `@keyframes` verbatim, bezel, hover/focus states
- `public/js/app.js` (~810 lines) — full port of the design, wired to the real server:
  - real mic permission + real device list on the Pair tab (`getUserMedia` + `enumerateDevices`)
  - real speech recognition (`en-US` / `ar-SA`), real `/api/chat`, real edge-tts playback
  - real Makkah clock, real medication schedule computed from `data/pilgrims.json`
  - real GPS/drift over the `location` socket; real alert + `alert-log` feed
  - the consent sheet fires on `ask_confirm_distress` and sends a real confirmation
- `server.js` — added `GET /app` (now the default route) and
  `POST /api/session/lang` (switches language without spending a Gemini call)
- `public/favicon.svg` — the Sakeenah mark

## Fixed during the port
- status bar was `content-box`, so its 52px height rendered as 66px and clipped the
  brand in the header → `box-sizing: border-box`, header top padding 52 → 58
- the Voice banner repeated the mic hint verbatim → separate `notStartedLine`

## Still to do
1. Screenshot the port beside the Claude Design export and fix any drift
2. Vendor Inter + IBM Plex Sans Arabic locally (`npm run fonts`) — blocked in the
   sandbox, must run on a machine with network
3. Restyle `roster.html` and `alerts.html` in the same language (staff screens)
4. `git rm voices11.js` — leftover ElevenLabs file
5. Re-test the full path: start session → ask → distress → confirm → alert
6. Gemini 429: fail fast to fallback instead of honouring `Retry-After` (62s replies)

## Run it
```
npm install
npm start          # then open http://localhost:3000/app
```
