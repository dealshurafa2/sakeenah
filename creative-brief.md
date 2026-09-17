# Sakeenah · سكينة — Creative Brief

**Product:** Sakeenah — an AI voice companion for vulnerable Hajj pilgrims
**Team:** Danya Alshurafa · Sedra Masalha
**Context:** Universities Challenge 2026 · StartSmart · Bab Rizq Jameel
**Repo:** github.com/dealshurafa2/sakeenah

---

## The problem

How might we help an elderly pilgrim and his campaign detect a medical emergency or a
separation *the moment it happens* — when following two million people individually is
impossible — before it becomes a crisis?

Elderly pilgrims are exposed to heat exhaustion and sudden confusion during the rituals,
and it isn't noticed quickly enough in the crowd. The current safety net is human
observation and manual headcounts.

**Evidence**

| | |
|---|---|
| 1,707,301 | pilgrims performed Hajj 2026 |
| ~26% | are over 60 — roughly 450,000 people |
| 41,782 | emergency department cases in one Hajj season |
| 1,301 | deaths in 2024, most with pre-existing conditions, at 51.8°C |
| 2,764 | heat-illness cases on a single day, 16 June 2024 |

## The user

**Hajj Mohammad Al-Zoubi**, 67, from Jordan. Type 2 diabetes and high blood pressure.
First Hajj, travelling with a tour campaign.

- **His day:** wakes early with his group, walks long distances between the camp and the
  holy sites, relies on companions and the campaign supervisor for directions and timings.
- **What he's trying to do:** complete every rite safely, with the least strain on his body,
  without falling ill or losing his group.
- **What blocks him:** distance, crowd density, and the impossibility of anyone noticing
  quickly if he suddenly deteriorates.
- **How he copes today:** a family member or supervisor stays near him, and he carries an ID
  card with his medical data — but nothing alerts anyone automatically if his condition turns.
- **Medications:** Metformin 500 mg at 07:00 and 20:00 · Aspirin 81 mg at 12:30
- **Earpiece:** SK-1042 · Group A · Emergency contact: Ahmad Al-Zoubi (son) +962 79 555 0142

## The buyer

**Mr. Sultan Al-Otaibi**, 45, owns a campaign serving ~300 pilgrims a season, mostly elderly.
He is legally and reputationally responsible for every one of them, and today he learns about
a problem only when a human reports it — usually late.

## The value

- **Pilgrim:** a voice guide needing no reading, tapping or tech skill. Help comes to him.
- **Campaign & family:** real-time peace of mind. Alerts only when they matter.
- **Ministry / برنامج خدمة ضيوف الرحمن:** scalable duty of care for the highest-risk pilgrims,
  with no added staff.

## Business model

B2G and B2B. Sold to the Ministry of Hajj and Umrah, distributed through licensed campaigns,
which supply the earpiece to their pilgrims as part of their service package.

## The differentiator

Existing tools track **where** a pilgrim is. Nothing tracks **how he is**.
Sakeenah listens to how he speaks, and acts before he asks for help.

## The single design principle

**Consent before alarm.** Sakeenah never escalates on her own. She detects, she asks
*"Do you need help?"*, and she waits for his answer. This is the soul of the product,
not a feature. A 67-year-old man gets to decide whether he needs rescuing.

## Visual language

| Role | Hex |
|---|---|
| Sand base | `#F2E8D7` |
| Sand deep | `#E9DCC5` · `#DED0B4` |
| Surface | `#FDF8EF` · `#F5ECDB` |
| Deep green — structure, Sakeenah's voice | `#1F4A36` · `#143527` · `#2C6349` |
| Brown — the pilgrim's voice | `#6B4A2E` · `#4A3220` · `#A98A60` |
| Gold — accents only, never a background | `#B8862B` · `#DCB054` |
| Ink / muted text | `#2C2318` · `#6D5C47` · `#8E7C63` |
| Alert red — **emergencies only** | `#9E2F1C` on `#FBE8E1` |
| Amber — awaiting confirmation | `#8A5A10` on `#FAEDCF` |
| Confirm green — resolved | `#2C7A51` |

**Type:** Inter (English) · IBM Plex Sans Arabic (Arabic, full RTL mirror)
**Motion:** slow and settled. The mic pulses at 1.7s, roughly a resting breath.
**Tone:** calm, warm, unhurried. Never clinical, never dramatic. "Take it easy, Hajj" —
never "ALERT: DISTRESS DETECTED".

## Out of scope

Login and accounts · app store packaging · a full admin panel · languages beyond English and
Arabic · real SMS integration · earpiece hardware and medical sensors.
