# Putting Sakeenah online — a link that works on any phone

Ten minutes. Free. When you're done you have a permanent `https://` address you can open on
your phone, hand to a judge, or put on a slide — with no laptop, no tunnel, and no cable.

---

## 1 · Push the project to GitHub

In your `sakeenah` folder:

```bash
git add -A
git commit -m "Ready to deploy"
git push
```

**Check first that `.env` is not being pushed.** Run `git status` — if you see `.env` in the
list, stop and tell me. It should be ignored already, but your API key must never go into a
repository.

## 2 · Create the service on Render

1. Go to **render.com** → sign up with your **GitHub** account (fastest — it links the repo
   for you)
2. **New +** → **Web Service**
3. Pick your **sakeenah** repository
4. Render will read `render.yaml` and fill most of this in. Confirm:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** **Free**
5. **Create Web Service**

## 3 · Add your Gemini key

This is the one thing the blueprint deliberately leaves blank, because keys don't belong in
a repository.

In the service → **Environment** → **Add Environment Variable**:

```
Key:    GEMINI_API_KEY
Value:  (paste your key)
```

Save. Render redeploys automatically.

## 4 · Wait for the first build

Three to five minutes. Watch the **Logs** tab — you want to see:

```
Sakeenah · سكينة — running
Pilgrim app     تطبيق الحاج   →  http://localhost:10000/app
```

Then your address appears at the top of the page, something like:

```
https://sakeenah.onrender.com
```

## 5 · Open it on your phone

```
https://sakeenah.onrender.com/app     the pilgrim app
https://sakeenah.onrender.com/web     the campaign board
```

Use **Safari** on iPhone. It's a real `https://` address, so the microphone works — no
tunnel needed, ever again.

---

## The one thing to know about the free plan

**The service goes to sleep after about 15 minutes with no visitors.** Waking it takes
roughly 50 seconds, and that wait would be excruciating in front of a panel.

So: **open the link on your phone two or three minutes before you present.** Once it's awake
it stays awake while anyone is using it. That single habit removes the only real risk.

If you want to be certain, open it, leave the tab on your phone, and refresh it once just
before you walk up.

---

## If something goes wrong

| What you see | What it means |
|---|---|
| Build fails on `npm install` | Check the Logs tab — usually a missing file that `.gitignore` excluded. Tell me what it says. |
| Page loads but she has no voice | Nothing to do with Render — check the Logs for `[TTS]`. Her voice comes from Microsoft's servers, which Render can reach fine. |
| `brain: fallback` in the status panel | Gemini quota, not deployment. Every button still works. |
| Slow first load | The service was asleep. Normal on the free plan. |
| Microphone still blocked | You're in Chrome, not Safari. On iPhone only Safari can listen. |

---

## Keeping your laptop copy

Deploying doesn't change anything locally. `npm start` still works exactly as before, and the
tunnel is still there if you want it. This is an addition, not a replacement — which means
you now have two independent ways to show the app, and they can't both fail for the same
reason.
