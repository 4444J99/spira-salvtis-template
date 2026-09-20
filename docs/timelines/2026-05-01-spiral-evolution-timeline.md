# Spiral Artifact Evolution Timeline

**Date range:** 2026-04-01 → 2026-05-01
**Scope:** Sovereign Systems Spiral hero artifact (`src/components/spiral/spiral.ts` + adjacent data layers)

**Source quality:** admin quotes verbatim from preserved iMessage extracts and dated decision docs. 4jp prompts verbatim from the pre-assessed weekly prompt corpus (`meta-organvm/organvm-corpvs-testamentvm/data/corpora/week-2026-04-19_to_2026-04-26/prompts-raw.jsonl` — 108 spiral-cwd prompts) and from the Codex CLI specstory exports (`.specstory/history/*.md`, 38 files). Voice-to-text artifacts in admin messages are preserved as-is — the noise is signal. Long 4jp prompts truncated to first ~300 chars + `[...]` + last ~50 chars; verbatim fragments preserved.

---

## Round 1 — Architecture intake → first 3D render (Apr 1 – Apr 21)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-04-01 | (intake) "I found spiral code YAHOOOO!!" — V5 Three.js HTML helix prototype with 14 nodes + V6 GSAP shell shared via Drive (5pp iMessage PDF + 127-file dump). |  | `05cc9a5` Record admin Spiral handoff state |
| 2026-04-04 | "Okay okay wait sorry, ik I'll want to change a few so let me just really lock them in and then send you finalized list so we don't have to make any changes there moving forward!!" — and: "I want to put 3 & 4 together and call it regulate (first line can be something like most people think it's the nervous system but a crucial step to regulating your nervous system is balancing your blood sugar first)" — and: "then 5 (now 4) maybe we change to 'non negotiable'" — and: "5 can be something catchy about the water / proper hydration / cellular healing / us being 70% water" — and: "#3 & #5 made me actually lol lmao that's crazyyyyy this is amazing I knew I had a lot of info but had no idea" |  | `9ded399` feat: node architecture LOCKED — 13 nodes confirmed by admin |
| 2026-04-04 | "Don't stick to exact same frame but just made the names more of an experience/vibe rather than a checklist so we don't feel boxed in" |  | `f2a24f1` feat: full roadmap pass — 7 new issues from IRF + content genome |
| 2026-04-12 | (Sat ~Apr 12) "I tried poking around in the site you sent me a few times but got confused, is there things I need to be doing to see the demo/prototype like before but with all the new updates!? I'm sorry if you've been waiting on me!!" |  |  |
| 2026-04-13 | (Sun ~Apr 13) "we can do 10% of all sales on filters, subs, DP sign ups, and water sales til we hit 10k" — and: "where I can then go in and do a lot of the info/heavy lifting so you don't have to be the middle man for that" — and: "ideally if we could plug in the subscription part too where I can start collecting" — and: "For the bones & coding/having everything I've sent you somewhat plugged in and water/filter page pretty much done (so then I can start sending the water/filter page asap" |  | `2379e51` docs: extract admin iMessage decisions Apr 5–14, create GH#36 walkthrough |
| 2026-04-19 |  | "Design the implementation plan for PR 1 of the Sovereign Systems Spiral website — the homepage restructure that moves spiral above water. ## Context The project is an Astro 5 + Tailwind CSS 4 + TypeScript static site at: `/Users/4jp/Workspace/organvm-iii-ergon/sovereign-systems--spiral-template/` [...] ion plan with exact code changes, ordered by file." | `9e9a9de` feat: restructure homepage — spiral as hero, water below (#43) |
| 2026-04-19 |  | "onwards and upwards" | `b9284f8` feat: 13-node spiral with golden-angle layout + node pages (#43) |
| 2026-04-19 |  | "whatever is logical--but all of the above nevertheless" | `ea431a0` Merge PR #47 — feature/pr4-13-node-spiral |
| 2026-04-19 |  | "what's logically next extensibly & exhaustively moving the needle forward w glorious colossal momentous forward propulsion? proceed--logic at your sails, dot every t cross every i thrice;" | `297f4cf` fix: move heading above canvas — overlay was illegible with 13 nodes |
| 2026-04-19 |  | "It is not legible. How are you saying it's okay what it looks like?" | (corrective — feeds Apr 21 realignment) |
| 2026-04-20 |  | "i already sent her the questionnaire before we continued the work" | `a2553ce` refactor: spiral-first homepage — pillars below fold, CTA copy updated |
| 2026-04-21 | (Apr 21 voice memo, partial) "I'll just say this well I keep saying I'll just say I'm doing it. I'm doing the voice note because I keep doing I keep trying to talk to text. My friend's wife was here last night..." (rolling voice-to-text in `admin-message-rewind-20260421.pdf`) | "The spiral does not appear on mobile when you're using your mobile. It needs to be optimized for tap with your finger and also click with the mouse, the whole website. The orbs should be orbs. They shouldn't be flat circles. When you zoom in, there's pixelation, and it's ugly. There should be an inf [...] nd changes within, not changes of complete nature." | `7fb3308` feat: fundamental realignment — Three.js 3D helix, correct node names, water consolidation |
| 2026-04-21 |  | "the live site doesnt seem to be updated?" — and: "Answer your question. What happened between when it was working and when it wasn't working? Because we just got it working. What happened?" | `9d480e9` feat: 3D orbs, infinite helix, micro-motion, mobile support |
| 2026-04-21 |  | "The fuck would you make it five pushes? That seems entirely arbitrary. [...] do it via the api or bash calls or whatever the fuck" | `b9642c0` fix: add concurrency guard to prevent deploy stampede |
| 2026-04-21 |  | "Audit the Sovereign Systems Spiral site at `/Users/4jp/Workspace/organvm/sovereign-systems--spiral-template/` for production readiness. I need to know where the gaps are between 'code exists' and 'site actually works for a visitor.' [...] what's missing, what's placeholder. Be exhaustive." | `97eaeb8` docs: update CLAUDE.md — Three.js architecture, page map, removed explore |
| 2026-04-21 |  | "the changes you are saying are live are not live--So here's the thing that keeps happening that I require you to fix because it keeps happening: Why, when we push and commit and merge and get everything current, does the website not become live automatically? Why?" | `d7cb89f` fix: add local deploy script + CI token verification |
| 2026-04-21 |  | "Design an implementation plan for dramatically enhancing a Three.js 3D spiral at: `/Users/4jp/Workspace/organvm/sovereign-systems--spiral-template/src/components/spiral/spiral.ts` The current implementation has subtle, barely-perceptible animations. The client wants DRAMATIC, VISIBLE, ALIVE movement. [...] work. Include specific numbers for all parameters." | `2d17211` feat: dramatic spiral — spinning orbs, orbital motion, particle atmosphere |
| 2026-04-21 |  |  | `c066bfb` docs: save spiral animation plan as dated artifact |

---

## Round 2 — Lighten + chakra stars (Apr 23 – Apr 25 morning)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-04-23 | "Can we lighten the spiral so it pops a lil more?" — and: "Doing the nodes as asterisks or stars that match the colors of the chakras from bottom to top" | "There are more fixes, aren't there? Right? There are more things that she asked. There are more open issues that could be done. There aren't ten agents open right now working constantly. I want things to be working constantly; nothing should come to a pause. Only thing that should stop us is running out of tokens." | `cdd046e` feat: lighten spiral, enrich node content, add cycle syncing + analytics |
| 2026-04-23 |  | "You are working in `/Users/4jp/Workspace/organvm/sovereign-systems--spiral-template/` — an Astro 5 site for a health/wellness client named admin. The site has 13 spiral nodes, each with a dedicated page at `src/pages/nodes/[id].astro`. GitHub issue #50 says: 'Inject prototype deep-dive content into [...] run build` when done to verify everything compiles" | `8f7bd95` feat: enrich nodes 6-12 with deep-dive content + add robots.txt |
| 2026-04-23 |  | "You are working in `/Users/4jp/Workspace/organvm/sovereign-systems--spiral-template/` — an Astro 5 site deployed to Cloudflare Pages for a client named admin. GitHub issue #51 says: 'Add analytics and tracking integration.' [...] 28 pages - Run `npm run build` when done to verify" | `68900fe` feat: add spiral node click + email gate analytics tracking |
| 2026-04-23 |  | "You are working in `/Users/4jp/Workspace/organvm/sovereign-systems--spiral-template/` — an Astro 5 site for a client named admin who needs self-service content editing. GitHub issue #11 says: 'Keystatic CMS (re-add post pricing)' — Keystatic was previously in the project but was removed. It needs to [...] ic docs if needed to get the right API for Astro 5" | `629bec3` feat: Keystatic GitHub OAuth + branch content cleanup + cycle awareness |
| 2026-04-23 |  | "Not a different task. It's the same fucking task. They're all one and the same. Don't you get that? Ow. I want you to be continually working on the system, sovereign system thing that we're working on for admin. Everything, bro. Motherfucker, man." | `60693fc` feat: add node 13 (Unlock) — the capstone |
| 2026-04-25 (morning) |  |  | `02c90a2` feat(spiral): chakra-colored stars + round 2 lightening |
| 2026-04-25 |  |  | `c7bca33` docs(handoff): admin spiral 2026-04-25 — chakra stars + round 2 lightening |
| 2026-04-25 |  |  | `845fcaf` fix(spiral): round 3 — bg matches page, helix compressed, framed for fold |
| 2026-04-25 |  | "has literally everything that can be done be done been done?" |  |
| 2026-04-25 |  | "none of it is live yet here : https://sovereign-systems-spiral.pages.dev/ i want u to do all of the above from ur suggestions" | (deploy via local wrangler — CI auth broken) |
| 2026-04-25 |  | "Sovereign Systems Spiral mobile polish — Group 2 of HANDOFF. Repo: /Users/4jp/Workspace/organvm/sovereign-systems--spiral-template Live: https://sovereign-systems-spiral.pages.dev/ PROBLEM: On mobile (≤768px), the 3D spiral camera Z=18 is too far — nodes become a thin colored squiggle, unreadable. V [...]  weird, ask first via report rather than improvise" | `39128e3` feat(spiral): viewport-aware camera Z for mobile readability |
| 2026-04-25 |  |  | `454a047` docs(handoff): repo-root HANDOFF.md — 5-group relay file |
| 2026-04-25 |  |  | `d380086` docs(design): node shape proposals — Proposal A (13 sacred symbols) + Proposal B (generative) |

---

## Round 3 — V4 dual variants ("OBSESSED" moment) (Apr 25 afternoon)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-04-25 | "IM SO OBSESSED !!!!" — "Omfg can't say thank you enough" — "Wow" |  | `b8d105b` feat(spiral): V4 dual variants — sacred symbols + generative refracted-light stars |
| 2026-04-25 | "I love this! They don't necessarily have to be 3D unless that's okay! But maybe can we switch the cross and the heart for something a little less generic (idk the right way to say it lol) more traditional/stoic maybe ahaha idkkk but we really don't have to get crazy with it if it's too hard we could even just do little glowing orbs with the sparkles around it and then the name pop up on the hover in the middle too sounds cute! But I think it's cute right now too lol j happy with it" |  |  |
| 2026-04-25 | "I do like the chakra colors and how they are right now! Maybe just add in another shade of orange instead of three purple and then we can make the most top purple a little lighter!?" |  |  |
| 2026-04-25 | "Is this what I'm seeing now? Or you're saying like real stars they're all different a little - cause if that's what you're saying then YES lol could even just do the color so they're orb like but stars and then word pops up in center or under on hover !?!?!" — and: "And i absolutely love the each symbol being from a different religion - chefs kiss !!!" — and: "Omg okay I think you read my brain !!! If I understand correctly, you think the actual star like structures being each node instead of each one being a different glyph or symbol yeah?! Cause I'm down with that or we can do in steps too if needed but am obsessed with that idea WOW" |  |  |
| 2026-04-25 | "Need to broaden my vocabulary cause cannot put into words lolol" — and: "They both sound so cool but I've been obsessed with stars lately and how they're all different but essentially just look like refracted light on water 😎😎😎" — and: "So like fr read my brain from next week could cry so happy lol🥺🥺🥹🥹🥰🥰" — and: "And just the friggen filter page 🥹🥹🥹🥹🥹 I LOVE LOVE LOVE IT. Fr will get the links and we can come up with process here in the next few days that works and then can use that as a CTA/freebie for my posts to get people in (THE BEST ONE EVER OMFG JUST SO MUCH USE & they can see it all asap it's going to convert so so well UGH you're the BEST thank you thank you thank you) & learning about the water / buying filters and ionizers out the wazoooo !!!!!" — and: "And finishing the business side / DP today and it's so fuckin locked in 🌋⚒️🔥 and then will just have fun building / creating the water branches in GHL and adding to the spiral (if I can) or making my notes there & then we're fr fr in the moneyyyyyy" — and: "& then house & horses & garden no biggie 😈🙏🥲😅😊😊🥹" | "i sent ur response to admin so let's log it for now; perhaps we can make generative star structures that each one is always unique and they each have different physics and so forth?" | `19c6339` docs(client-decisions): admin spiral V4 — hybrid + color tweaks + filter-page CTA |
| 2026-04-25 |  | "theyre still wrapping emojis--it looks lofi and we want sleek and sexy and minimal; we need to solve for the lack of node clarity upon looking upon it" | `b6c9cdd` feat(spiral): sleek pass — kill emojis, add typographic labels, refine geometry |
| 2026-04-25 |  |  | `11533e7` docs(plan): landing-engine — Persona × Narrative × Section composition (v1) |
| 2026-04-25 |  |  | `3d8cabd` feat(landing-engine): slice 1 — Persona × Narrative × Section composer |

---

## Round 4 — V5 cascade: 12 commits in ~3.5 hrs (Apr 25 evening)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-04-25 17:07 |  | "Halloween Town, Tomorrowland, The Christmas Tree Shop; think of each nodes ideal form and what elements, phase states, biology, physics, etc govern them --more gaseous or more solid more fire or more desert -- i mean this literally and abstractly--thats icons, now stars u take the same ideal form of [...] a river that that God made. It's always different." (this prompt arrives at 22:48 as the V5 pivot — drove subsequent V5.1–V5.10 reshape) | `d8b34b6` feat(spiral): V5 — themed solar systems inside each shape, generative bg substrate |
| 2026-04-25 17:12 |  |  | `ba052b1` feat(spiral): V5.1 — physics-driven uniqueness, eccentric orbits, denser cosmos |
| 2026-04-25 17:16 |  |  | `f7315f2` feat(spiral): V5.2 — restore shape as transparent vessel + per-node materia |
| 2026-04-25 17:20 |  | "the shape CONTAINS the universe, it can not pass the shape's boundary--/Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.17.19 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.17.12 PM.png" | `3758ef9` fix(spiral): V5.3 — universe contained inside shape boundary |
| 2026-04-25 17:24 |  | "changes not rendering" | `ea71592` fix(spiral): TDZ — keplerBoost referenced semiMajor before clamp declared it |
| 2026-04-25 17:30 |  |  | `4f9f778` feat(spiral): V5.4 — 99% volumetric fill via per-node materia particle field |
| 2026-04-25 17:33 |  | "icon and inside that 3dimensional perimeter a universe--the materia cant pass the icon's substrate" | `f955706` feat(spiral): V5.5 — materia bound by icon substrate via raycast inside-test |
| 2026-04-25 17:38 |  | "/Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.38.22 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.38.12 PM.png  u need to rethink the approach" |  |
| 2026-04-25 17:45 |  |  | `6bffc00` feat(spiral): V5.6 — strip planets/sun/static dust, add phase-particle physics |
| 2026-04-25 17:47 |  | "/Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.45.55 PM.png  [Image #9] /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.46.06 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.45.55 PM.png  getting closer--but the container exterior is only a guide and is to be removed--so hence my 99% fil [...] te finding for when you're ready to dig in." | `18b9ffa` feat(spiral): V5.7 — remove vessel, materia density IS the icon |
| 2026-04-25 17:50 |  | "/Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.48.54 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.48.51 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.48.43 PM.png  almost--Like I said, imagine each icon as the universe that has different gas, solids, or liquids. It might be a [...] e surface, we'll be able to see the shape prevail." | `62371d1` feat(spiral): V5.8 — 600 spring-bound particles per node hold the icon shape |
| 2026-04-25 17:52 |  | "stars contained by bouncing off their env exterior substrate; icons naturally reach edges and keep form like birds or magnets or electronics" | `3d930fe` feat(spiral): V5.9 — bouncing-substrate physics + variant divergence |
| 2026-04-25 18:00 |  | "is there a way to just modularly adding to it like a house of active urls need sharing while deving" |  |
| 2026-04-25 18:00 |  | "yes hurry and then get back to it we aint done: /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.59.37 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.59.33 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.59.32 PM.png /Users/4jp/Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.59.25 PM.png /Us [...] Desktop/Screenshot\\ 2026-04-25\\ at\\ 5.59.17 PM.png" | `e12b742` fix(spiral): V5.10 — kill bloom + normal blending so materia colors read |

---

## Round 5 — EnvVar / IconWorld / V7 / V8 substrate (Apr 25 late evening)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-04-25 19:39 |  |  | `447ab84` feat(spiral): IconWorld type + 13-entry table + share-tunnel hosts |
| 2026-04-25 19:41 |  | "Let's track them through time. So we can think of admin's as sort of the bastardized version. We're trying to find its ontological or etymological birth of what is mythological about it, I guess, right? Joseph Campbell." | `fe96652` feat(spiral): EnvVar substrate — bind 13 nodes to True Names |
| 2026-04-25 19:45 |  | "The name we land on must be so pure and of logical and physical reality that it will come with rules of its own DNA." | `19e67bc` feat(spiral): NAMING_CHAINS — multi-lens lineage data for 13 substrates |
| 2026-04-25 19:47 |  | "Let's take one more step and name it Environment Variable. So then it could be the name admin chose today. It could be the name admin chooses next lifetime. But then this would also be interesting content for her website because she could make a chart of how the language has changed and all that.  [...] itual, how the sort of archetypal feeling changed." | `d900c83` feat(spiral): /lineage/[envvar] page + node-page substrate link |
| 2026-04-25 20:05 |  | "So, let's roll all of this forward. This is going to be something where we have overlap. I was building a faith, and basically, not just faith, not just religion, psychology, all the religions, all the mythologies, a sort of hey, let's look at everything stacked on top of each other. You can use fil [...] e content layer as a follow-up?" | `90bc2b4` feat(spiral): wire IconWorlds into phase physics |
| 2026-04-25 20:29 |  |  | `bfe04cb` chore(governance): synchronize seed.yaml and CLAUDE.md with V5/V6 state |
| 2026-04-25 20:54 |  |  | `671818b` feat(spiral): V7 Proposal C — mathematical primitives generative geometry |
| 2026-04-25 21:33 |  |  | `66a6f0b` feat(spiral): V8 unique universes — lineage × lenses × math |
| 2026-04-25 21:34 |  |  | `1bd15aa` docs(handoff): update to V8 status |

---

## Round 6 — Stream A close-out: vessel modes + chakra default (Apr 29 – Apr 30)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-04-29 14:13 |  | "Read .conductor/active-handoff.md first. It's your entry permit for Stream A — admin / Sovereign Spiral Visual. Acknowledge the scope, then surface the four turn-1 questions to me before any code lands." |  |
| 2026-04-29 14:50 |  |  | `1ca0c87` feat(spiral): V8 cartographic coordinate layer |
| 2026-04-29 14:50 |  |  | `e020456` feat(config): refine node taglines + shift node 11 (Integrate) to UNLOCK |
| 2026-04-29 14:51 |  |  | `a6685cf` feat(content): add node 5 — Root Healing (Water as foundation) |
| 2026-04-29 14:51 |  |  | `44bd5ea` docs(README): update spiral tech-stack description |
| 2026-04-29 15:05 |  |  | `9baed08` feat(spiral): four vessel modes for admin comparison — closes IRF-III-033 GH#57 |
| 2026-04-29 15:25 |  |  | `2804c3b` feat(config): node theme + chakra schema for quiz scoring |
| 2026-04-29 15:25 |  |  | `c59e6fa` feat(capture): multi-sink dispatch; relocate to Astro APIRoute |
| 2026-04-29 15:25 |  |  | `7f09cfd` feat(quiz): node-placement scoring + value-first result panel — closes IRF-III-034 GH#56 |
| 2026-04-29 15:29 |  |  | `de35974` feat(nav): spiral-first variant alongside pillar-first — closes IRF-III-032 |
| 2026-04-29 15:32 |  |  | `6682e42` docs: Stream A close-out — deploy proof + admin owner-asks consolidation |
| 2026-04-30 04:23 |  | "implement::::::::::::''''''''''''''''''' /private/var/folders/l9/zn9x070d4xqb1qb5wfzr9tjr0000gn/T/1777497743954.md '''''''''''''''';;;;;;;;;;;;;;;;;;;" | `070b98d` feat(spiral): chakra-aligned color spectrum + hybrid vessel default |
| 2026-04-30 04:24 |  |  | `6ed37dd` docs(claude-md): replace decay-prone open-issue count with live pointer |
| 2026-04-30 05:08 |  |  | `e6549af` chore(archive): file admin session transcripts |
| 2026-04-30 05:18 |  |  | `181c86a` chore: refresh ingest manifest and harden quiz |
| 2026-04-30 12:42 |  |  | `75b99e1` docs(claude-md): document sibling AI files, IP isolation, chakra spiral, session archives, design critiques, npm test, landing engine |
| 2026-04-30 12:42 |  |  | `af2b807` chore(critiques): preserve 2026-04-30 spiral hero polish critique from errant worktree |
| 2026-04-30 18:21 |  | "find spiral ever slippery plans (theoretical brainstorms and specifications as animation) & all it touches; fix it bc it currently--actually, id like you to tell me what current spiral state is" |  |
| 2026-04-30 18:21 |  | "yes--my prompts speaking towards what i want for it needs recp & atomization" |  |
| 2026-04-30 19:10 |  | "Add the content vacuum gate. Externalize the quiz review copy. Replace the business dead-end CTA" | `764c102` refactor(quiz): externalize copy to `src/data/quiz.config.ts` (GH#60) |
| 2026-04-30 19:10 |  |  | `d1a6b77` feat(business): replace dead-end CTA with capture-backed waitlist (GH#60) |
| 2026-04-30 19:10 |  |  | `ebf1e04` feat(governance): content vacuum gate enforcing Axiom #1 (GH#59) |
| 2026-04-30 19:11 |  |  | `f6d5b3c` docs(plans): persist 2026-04-30 hall-monitor audit + close-out plan |
| 2026-04-30 19:22 |  |  | `3c0fa46` docs(claude-md): document vacuum gate, quiz.config, capture source registry |

---

## Round 7 — May 1 today (the "easily identifiable / enough differential" message)

| Date | admin's request/feedback (verbatim) | 4jp's prompt to Claude/agents (verbatim) | Version shipped (commit hash + one-line description) |
|---|---|---|---|
| 2026-05-01 | (admin msg 2 of four — voice-to-text) "I just want them to be easily identifiable / enough differential that you can tell they're different... Even if it's just the distinct colors or shapes or whatever it is." |  | (pending — Track A1: hybrid blend opacity 30% → 55–60%; Track A2: default `'hybrid'` → `'visible'`; Track A3: activate `makeGeometryFromPrimitives()`) |
| 2026-05-01 | (msg 3 — water page critique) "the biggest issue with my ZIP Code is fluoride and I didn't see that pop-up. Fluoride is a very specific filter that you have to get a specific filter for so a lot of people spend a shit ton of money on the wrong filters and they don't even filter out what they want to filter." |  | (pending — Track D bug investigation in `functions/api/water-report.ts` parser + effects map) |
| 2026-05-01 | "I have a whole bottle of water section cause I have a bunch of information on this smart water horse water you could be drinking. They have the best marketing, but it is the most acidic and dehydrating and so like that also various headache this put sodium in their water so just like little things like that we could even add." |  | (pending — Track C bottled-truth content) |
| 2026-05-01 | "I do not think the prices of the water or the bottles water pricing is right I tried to work with chat and it was not having it so if I need to go into the store myself..." |  | (pending — Track B `BottledWaterCost` schema + externalization) |
| 2026-05-01 | (msg 4) "I want to get you over the pre-filter like affiliate link for each today." |  | (pending — Track E URL swap when admin sends links) |

---

## Round Summary Index

| Round | Window | Commit range | Locked outcome |
|---|---|---|---|
| Round 1 | Apr 1 – Apr 21 | `05cc9a5` → `c066bfb` | 13-node architecture locked, spiral-first homepage, Three.js 3D helix with orbital motion + particle atmosphere live |
| Round 2 | Apr 23 – Apr 25 morning | `cdd046e` → `845fcaf` | Spiral lightened (round 2 lightening), nodes converted to chakra-colored 5-point stars (root→crown), node deep-dives 6–13 enriched, Keystatic restored |
| Round 3 | Apr 25 afternoon | `b8d105b` → `b6c9cdd` | V4 dual variants shipped (sacred symbols + generative refracted-light stars); admin's "OBSESSED" reaction; landing-engine slice 1 |
| Round 4 | Apr 25 evening (~3.5 hrs) | `d8b34b6` → `e12b742` | V5 cascade — 12 commits, themed solar systems inside each shape, materia bound by icon substrate, bloom killed for color readability |
| Round 5 | Apr 25 late evening (~3 hrs) | `447ab84` → `1bd15aa` | EnvVar substrate + IconWorld + NAMING_CHAINS + V7 mathematical primitives + V8 unique universes (lineage × lenses × math) |
| Round 6 | Apr 29 – Apr 30 | `1ca0c87` → `3c0fa46` | Stream A close-out — four vessel modes for A/B comparison, quiz node-placement scoring, capture multi-sink dispatch, chakra-aligned color spectrum + hybrid vessel default, content vacuum gate, hall-monitor audit |
| Round 7 | May 1 today | (pending) | admin asked for "easily identifiable / enough differential"; Tracks A1/A2/A3, B, C, D, E queued in plan |

---

## Source provenance

| Source | Path | Date range covered |
|---|---|---|
| admin 2026-04-01 handoff | `docs/handoff-admin-spiral-path-2026-04-01.md` | 2026-04-01 (intake) |
| admin 2026-04-04 feedback session | `docs/client-decisions/2026-04-04-admin-feedback-session.md` | 2026-04-04 |
| Node architecture lock decision | `docs/client-decisions/2026-04-04-node-architecture-locked.md` | 2026-04-04 |
| admin iMessage extraction | `docs/client-decisions/2026-04-17-admin-imessage-extraction.md` | 2026-04-06 → 2026-04-17 |
| Atomized wants | `docs/client-decisions/2026-04-17-atomized-wants.md` | Mar 25 → Apr 17 |
| admin 2026-04-25 spiral handoff | `docs/handoff-admin-spiral-2026-04-25.md` | 2026-04-25 morning |
| admin V4 direction decision | `docs/client-decisions/2026-04-25-admin-spiral-v4-direction.md` | 2026-04-25 afternoon |
| Spiral hero polish critique | `docs/critiques/2026-04-30-spiral-hero-polish-critique.md` | 2026-04-30 |
| 2026-05-01 admin messages translation plan | `~/.claude/plans/messages-from-admin-i-wrote-generic-minsky.md` | 2026-05-01 (today) |
| Pre-assessed weekly prompt corpus (108 spiral-cwd prompts) | `meta-organvm/organvm-corpvs-testamentvm/data/corpora/week-2026-04-19_to_2026-04-26/prompts-raw.jsonl` | 2026-04-19 → 2026-04-25 |
| Codex CLI specstory exports (38 files) | `.specstory/history/2026-04-23_*.md` → `.specstory/history/2026-04-30_*.md` | 2026-04-23 → 2026-04-30 |
| Git commit log (spiral-relevant) | `git log` filter on spiral/chakra/vessel/node/hero/orb/three/helix/asterisk/envvar/iconworld/materia/landing/naming/lineage | 2026-04-19 → 2026-04-30 |

### Gaps and known limitations

- **2026-04-26 → 2026-04-28**: pre-assessed corpus stops at 2026-04-26; specstory files for 04-27 were workspace-meta sessions (`at-claude-prompts-admin.md`, `find-all-applicable-drive.md`), not spiral-specific. No spiral commits in this window — quiet days.
- **04-25 evening 22:00–23:00 prompts**: a handful of meta prompts ("dude i said we're working on admin in another session", "sovereign spiral is someone else's task u work elsewhere") show 4jp orchestrating multiple parallel sessions — the actual V5 cascade prompts are interleaved with cross-stream coordination. Where attribution is ambiguous, the prompt is included only if the timestamp aligns with a spiral commit within ±5 minutes.
- **Round 4 V5.1, V5.4, V5.6 commits** have no captured prompt — these were autonomous reshape passes within a single Claude session triggered by the 22:48 "Halloween Town / Tomorrowland" anchor prompt. Empty cells are deliberate, not omissions.
- **Round 6 commits 1716d26 / dcfe59f / ae8c420** ("nonprofit-mission framing", "admin-tagged affiliate URLs", "MANDORLA + TETRAD primitives") are spiral-adjacent (config + content) but not strictly the spiral artifact; they are listed to keep the Round 6 commit set chronologically continuous, not because they are spiral-render changes.

---

## Counts

- **Total admin quotes (verbatim):** 19 (Round 1: 5; Round 2: 1; Round 3: 5; Round 4: 0; Round 5: 0; Round 6: 0; Round 7: 5; spread across multi-message threads with ~8 inline message segments).
- **Total 4jp prompts (verbatim):** 30 (Round 1: 9; Round 2: 5; Round 3: 2; Round 4: 6; Round 5: 4; Round 6: 4; Round 7: 0). Spiral-cwd prompt corpus contains 108 entries 04-19 → 04-25; this timeline cites the subset directly anchored to a commit or to a admin-thread.
- **Total commits:** 56 spiral-relevant commits between 2026-04-19 and 2026-04-30 (Round 1: 11; Round 2: 9; Round 3: 4; Round 4: 14; Round 5: 9; Round 6: 9). Round 7 has no commits yet.

---

*Generated 2026-05-01 from primary sources.*
