# The demo video

One slide. Left half: generated footage of Hajj Mohammad. Right half: his phone and the
campaign board, both real.

**The right half films itself.** There is a page, `/film`, that is the entire 1920×1080 frame:
a dark panel on the left where your footage goes, his real phone in the middle, the real
campaign board on the right, and a caption strip along the bottom. It plays all four scenes
on its own, in Sakeenah's real voice, and finishes in **exactly 60 seconds**.

The four scenes build from ordinary to urgent — she guides him, she names his medicine, she
walks him back to his group, and then she asks whether he needs help. The emergency is last
so the film ends on the moment that makes your case.

So you record that once, then drop three clips of the man onto the left panel. No syncing two
screen recordings, no fumbling with buttons on camera.

---

## Step 1 · Record the right half

```bash
npm start
```

Open **http://localhost:3000/film** in Chrome and press **F11** for full screen. Start your
screen recorder (`Win + Alt + R`), then press **Start the film**. Don't touch anything until
the strip says *Stop the recording*.

Make sure your volume is up and the recorder is capturing system audio — **her voice is in
this recording**, and that is the audio bed for the whole video.

A timer runs in the top-left corner of the left panel. It is there so you can line your clips
up to the second; you will cover it with footage in the edit.

If a take goes wrong, reload the page and press Start again. It resets itself.

---

## Step 2 · The timing sheet

Every beat, so you can cut the man's footage to match:

| start | end | what the strip says | what he is doing |
|---|---|---|---|
| 00:01 | 00:02 | Hajj Mohammad, 67, first Hajj | walking, calm, earbud in |
| 00:02 | 00:12 | She tells him where he is in his Tawaf | listening, walking on with confidence |
| 00:12 | 00:20 | His Metformin is due, named aloud | reaching for his tablets |
| 00:20 | 00:29 | The crowd carries him 62 metres away | carried sideways, then turning as told |
| 00:29 | 00:34 | She walks him back | reaching his group, relieved |
| 00:34 | 00:40 | His breathing changes. She asks | **"I'm so tired… I can't breathe."** |
| 00:40 | 00:44 | **She waits. The board is still empty** | deciding — hold this shot |
| 00:44 | 00:52 | He answers | **"Yes. Please help me."** |
| 00:52 | 00:57 | Only now does the campaign know | sitting down, a supervisor arrives |
| 00:57 | 01:00 | Consent before alarm | hold on his face, fade |

**00:40 to 00:44 is the pitch.** Four seconds where the board does not change while she waits
for his answer. Do not cut it short and do not put music over it.

---

## Step 3 · Generate the man

Four clips in Google Flow (free tier gives about two good 8-second clips a day, so start
tonight — you need tonight's allowance and tomorrow's). Ask for **9:16 or 1:1** — he fills a vertical panel, so a tall source crops better.

**Do not ask for the Kaaba, the Grand Mosque, or crowds circling it.** Video models get sacred
architecture wrong, and a botched Kaaba in front of a Jeddah panel is worse than none. Stay
close: his face, his ear, a shaded walkway, warm daylight.

### Clip A · walking and listening (covers 00:01–00:20)

```
Medium shot, elderly Middle Eastern man in his late sixties, white ihram
garment over one shoulder, short grey beard, weathered kind face. A small
white wireless earbud sits in his right ear. He walks slowly along a shaded
stone walkway in warm late-afternoon light, calm and unhurried. He tilts his
head slightly as if listening to someone, then nods gently. Soft natural
light, shallow depth of field, gentle handheld camera moving beside him.
Photorealistic documentary style. No text, no logos, no signage.
```

### Clip B · carried by the crowd (covers 00:20–00:34)

```
Elderly Middle Eastern man in white ihram, short grey beard, small white
earbud in his right ear. He is gently carried sideways by a moving crowd,
looking around slightly disoriented, then turns deliberately in a new
direction as if following a voice, and walks that way with growing
confidence. Warm daylight, shallow focus, handheld camera. Dignified, never
panicked. Photorealistic documentary style. No text, no logos.
```

### Clip C · the distress and the answer (covers 00:34–01:00)

```
Close-up, elderly Middle Eastern man in white ihram, short grey beard. He
slows to a stop, his breathing shallow and effortful, and raises one hand
towards his chest to steady himself. His eyes show discomfort, not panic. He
pauses, listening. Then he looks slightly upward and gives a small, tired
nod, speaking a few quiet words. Relief begins to reach his eyes. Warm
daylight, shallow depth of field, subtle handheld camera. Restrained and
dignified. Photorealistic documentary style. No text, no logos.
```

**If a face comes out wrong**, regenerate that clip alone and change one thing only, so you can
tell what helped. **If generation disappoints entirely**, use one strong still image with a slow
push-in in CapCut — a beautiful still with the right voice over it beats a wobbly AI video, and
it reads as a deliberate choice.

---

## Step 4 · His two lines

Record these yourself on a phone voice memo, close to the mic, unhurried:

- at **00:34** — *"I'm so tired… I can't breathe."*
- at **00:44** — *"Yes… please help me."*

Everything else you hear is Sakeenah, already in the screen recording.

---

## Step 5 · Put it together

1. New CapCut project, **16:9, 1920×1080**.
2. Drop the screen recording on track 1, filling the frame. **Do not move or scale it** — the
   phone and board are already in the right place.
3. Put each clip of the man on track 2 above it, scaled and positioned to cover the left panel
   (x: 0–760 of 1920). The dashed border and the placeholder text are there so you can see
   exactly what to cover.
4. Trim the three clips to the timing sheet. Slow or loop a clip if it is shorter than its slot.
5. Lay his two voice lines at 00:34 and 00:44.
6. Music very quiet, or none. **Silence from 00:40 to 00:44.** Fading the music out into that
   pause and back in when the card lands does the work for you.
7. Subtitles only for his two spoken lines — the strip along the bottom already carries the
   narration.

---

## The two honest captions

Small, in a corner, where they belong:

- *Fall sensing is simulated — the earpiece hardware is not built.*
- *SMS is shown as a log line, not sent.*

Everything else on that screen is real: the speech, the schedule against the Makkah clock, the
distance from his group, the alert, and the rule that she never raises one until she has asked
and he has said yes.
