# Sakeenah · سكينة — Storyboard

The screens and the journey, before any design.
Read alongside `creative-brief.md`.

---

## The three screens

### Screen 1 · Campaign Dashboard — `/roster`
What the campaign leader sees: every pilgrim registered under his campaign, with name, age,
medical conditions, medications and their times, earpiece ID, group, and emergency contact.

**States to design:** default · a pilgrim in active alert · empty campaign.

### Screen 2 · Voice Companion — `/agent` *(the hero screen)*
What the pilgrim hears, rendered so everyone else can see it. One large microphone control,
the live conversation, and session status: ritual step, distance from group, next medication,
distress monitoring.

**States to design — this is the real work:**

1. Idle, before a session
2. Listening — the mic breathing
3. Thinking
4. Sakeenah speaking
5. Medication reminder arriving unprompted
6. Drift from group detected — gentle guidance
7. **Distress detected, awaiting his answer** ← the hero state
8. Emergency confirmed
9. Arabic / RTL version of at least three of the above

### Screen 3 · Live Alerts — `/alerts`
Normally — and importantly — **empty**: "all pilgrims are well." Then one red card carrying his
registered data, the words Sakeenah actually said to him, and the notification log unfolding
line by line.

**States to design:** empty · one active alert · alert with the log complete · past incidents archive.

### Screen 4 · The earpiece *(future)*
Minimal over-ear wearable. Ivory-white, the colour of ihram. One slim gold ring. One large
tactile button. Open-ear so he still hears the Imam and the crowd. Behind-the-ear hook so it
cannot fall out in a crowd of two million. No screen, no branding.
*Each of those four choices answers a real objection — show them as annotated callouts.*

---

## The user journey — twelve frames

Each frame has a **narrative** side and a **screen** side.

**01 · THE SCALE**
Aerial, the Mataf at night, a white river of people.
*"1,707,301 pilgrims. One in four is over sixty."*
No screen — let it breathe.

**02 · THE MAN**
Hajj Mohammad's hands on a worn prayer bead.
*"He is 67. Diabetes, high blood pressure. His first Hajj, and he wants to do it himself."*

**03 · THE GAP**
A supervisor counting heads, pilgrims streaming past faster than he can count.
*"Six supervisors for three hundred pilgrims. They count heads. They cannot count heartbeats."*

**04 · REGISTRATION**
Campaign office, a tablet on a desk.
*"Before he travels, his campaign registers him — his conditions, his medicines, his son's number."*
→ **Screen 1**, his row highlighted, earpiece SK-1042 assigned.

**05 · THE COMPANION WAKES**
The earpiece in his ear, dawn light.
Sakeenah: *"Peace be upon you, Hajj Mohammad. I'll be with you through your Tawaf, step by step."*
→ **Screen 2**, session starting, mic settling into listening.

**06 · GUIDANCE**
Walking the Mataf, Kaaba on his left.
Sakeenah: *"Keep the Kaaba on your left. This is your first circuit. Pray in your own words."*
→ **Screen 2**, step 2 of 7, transcript building.

**07 · HE ASKS**
He pauses, touches his ear.
Mohammad: *"Is it time for my medicine?"*
Sakeenah: *"Not yet. Your Metformin is at eight this evening, about four hours from now."*
→ **Screen 2**. *This frame matters more than it looks — it proves she reasons rather than recites.*

**08 · SHE REMEMBERS**
Late afternoon, the crowd thicker.
Sakeenah, unprompted: *"Hajj Mohammad, it's time for your Metformin, 500 mg. Take it with a
little water, there's no rush."*
→ **Screen 2** medication state · **Screen 3** gold event row appearing.

**09 · HE DRIFTS**
The crowd carries him; his group's banner recedes.
Sakeenah: *"Everything's fine, don't worry. Your group is just a little way north-east of you.
Walk slowly that way — I'm with you."*
→ **Screen 2**, distance climbing past the threshold. She never says "lost".

**10 · THE HINGE** ← *the most important frame*
He stops. A hand to his chest. Heat shimmer.
Mohammad, breathless: *"I'm so tired… I can't breathe."*
Sakeenah: *"Take it easy, Hajj. Breathe slowly, I'm right here with you. **Do you need help?**"*
→ **Screen 2**, amber banner — *awaiting confirmation*.
**Nothing has been sent. Nothing will be, until he answers.**
*Hold this frame longer than feels comfortable. The pause is the product.*

**11 · HE ANSWERS**
Close on him, quiet.
Mohammad: *"Yes. Please help me."*
→ **Screen 3** — the red card lands: his name, 67, diabetes and hypertension, Metformin and
Aspirin, SK-1042, Group A, Ahmad Al-Zoubi +962 79 555 0142. Then the log, line by line:
emergency contact notified · campaign leader notified · location and earpiece ID sent to the
nearest supervisor · medical conditions attached.

**12 · HELP ARRIVES**
A supervisor moving through the crowd toward him. Not a stretcher. A person arriving in time.
*"Four minutes. Not because someone happened to notice — because he was asked, and he said yes."*
→ **Screen 3**, incident closing.

**CODA · WHERE WE'RE GOING**
Split frame. Left: today — a phone and wired earbuds, labelled *"Prototype, built and working"*.
Right: the earpiece, labelled *"Next"*.

---

## What is real, and what is not

A designed panel, not a disclaimer. It is a credibility asset.

| | Real today | Simulated |
|---|---|---|
| Speech recognition | ✅ | |
| Understanding & distress detection | ✅ Gemini | |
| Sakeenah's voice, English & Arabic | ✅ neural TTS | |
| **Asking before alerting** | ✅ | |
| Medication scheduling by name and time | ✅ | |
| Drift detection — distance, threshold, bearing | ✅ | |
| Pilgrim coordinates | ✅ real GPS mode | demo mode for indoor stages |
| SMS to emergency contact | | shown as a live log |
| Fall sensor | | hardware not built |
| The earpiece itself | | ordinary headphones today |

---

## Priority

If time runs short, build in this order:

1. Frame 10 — the hinge
2. Screen 2's awaiting-confirmation state
3. Screen 3's alert card
4. The brand board

Those four carry the pitch.
