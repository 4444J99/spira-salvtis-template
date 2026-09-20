# Content Extraction Manifest

Generated: 2026-04-03
Source: drive-download-20260401T143646Z-3-001 (127 files)
Extracted: docs/archive/extracted/

## Statistics

- Total source files: 127 (+ 2 screenshots, not extracted)
- .txt/.md files extracted: 120
- .docx files converted (pre-existing): 5 (1a-master-spiral-backend-breakdown.md, 1b-spiral-dump-questionnaire.md, health-hormones-and-healing.md, mindset-rhythms-and-rituals.md, gateway-learn-more-about-erw.md)
- Root documents (1a, 1b, 2a, 2b): 4 (not in spiral/ subdirs)
- **Total extracted files: 125**

### By Readiness

| Rating | Count |
|--------|-------|
| Ready | 33 |
| Partial | 46 |
| Raw | 34 |
| Empty | 5 |
| N/A (utility/duplicate) | 2 |

### By Category

| Category | Source Folder | Files | Ready | Partial | Raw | Empty/N/A |
|----------|-------------|-------|-------|---------|-----|-----------|
| health | health/ | 30 (+1 .docx) | 11 | 12 | 7 | 1 |
| mindset | mindset/ | 38 (+1 .docx) | 8 | 14 | 16 | 1 |
| business | business/ | 15 | 2 | 7 | 4 | 2 |
| gateway | gateway/ | 15 (+1 .docx) | 4 | 5 | 4 | 0 |
| time-astro | time-astro-human-design/ | 9 | 3 | 4 | 1 | 1 |
| concepts | concepts-to-add-in/ | 13 | 5 | 4 | 2 | 2 |

## Build Alignment Audit

Existing `src/content/` assets:
- **branches/**: archetype-alpha.md, archetype-beta.md, archetype-gamma.md, archetype-delta.md, archetype-epsilon.md, archetype-zeta.md (6 files, all gateway/health focused)
- **pillars/**: foundation.md, system.md, structure.md, vision.md (4 files)

Build State key:
- `EXISTS` — content is in src/content/ and covers this topic
- `PARTIAL` — some content exists but doesn't cover this source material
- `MISSING` — no corresponding content in src/content/
- `N/A` — empty/utility file, no build target

---

### health/ (30 extracted + 1 .docx conversion)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 1 | ChatGPT-30 Day Acupressure Routine.txt | health/30-day-acupressure-routine.md | 2, 9, 10, 13 | Partial | MISSING | No acupressure content in branches or pillars |
| 2 | ChatGPT-Aerosols and cleaning products.txt | health/aerosols-and-cleaning-products.md | 6, 8 | Ready | MISSING | Chemical exposure not in any branch |
| 3 | ChatGPT-Alzheimer's 373% Increase Explained.txt | health/alzheimers-373-increase-explained.md | 8, 6 | Ready | MISSING | Alzheimer's stats not in any branch |
| 4 | ChatGPT-Birth control resources guide.txt | health/birth-control-resources-guide.md | 5, 7, 6 | Partial | PARTIAL | archetype-delta.md covers reproductive health but not BC resources |
| 5 | ChatGPT-Body Trust and Shifts.txt | health/body-trust-and-shifts.md | 3, 4, 10, 5 | Raw | MISSING | Menstrual cycle shifts not in branches |
| 6 | ChatGPT-Bubble Butt Fitness Guide.txt | health/bubble-butt-fitness-guide.md | 5, 6, 13 | Partial | PARTIAL | archetype-alpha.md covers fitness but not cycle-synced training |
| 7 | ChatGPT-Chlorine absorption time.txt | health/chlorine-absorption-time.md | 6, 8 | Ready | MISSING | Chlorine science not in any branch |
| 8 | ChatGPT-Cortisol stress carousel.txt | health/cortisol-stress-carousel.md | 2, 1, 8 | Ready | PARTIAL | foundation.md references nervous system but lacks cortisol specifics |
| 9 | ChatGPT-Cymascope and healing frequencies.txt | health/cymascope-and-healing-frequencies.md | 9, 12, 13 | Partial | MISSING | Sound healing not in any branch |
| 10 | ChatGPT-Endometriosis causes and practices.txt | health/endometriosis-causes-and-practices.md | 5, 9, 7 | Partial | PARTIAL | archetype-beta.md covers inflammatory conditions but not endometriosis specifically |
| 11 | ChatGPT-Fascia and emotions explained.txt | health/fascia-and-emotions-explained.md | 13, 2, 9 | Partial | MISSING | Fascia-emotion link not in branches |
| 12 | ChatGPT-Feel Good First script.txt | health/feel-good-first-script.md | 1, 11 | Ready | PARTIAL | foundation.md has restoration framing but not this specific script |
| 13 | ChatGPT-Gut Rebuilding Diet Plan.txt | health/gut-rebuilding-diet-plan.md | 7, 5, 6 | Partial | PARTIAL | archetype-epsilon.md covers gut health but not this diet plan |
| 14 | ChatGPT-hEDS symptoms and diagnosis.txt | health/heds-symptoms-and-diagnosis.md | 9, 13, 3 | Ready | PARTIAL | archetype-beta.md mentions connective tissue but not hEDS |
| 15 | ChatGPT-Hemorrhoids and Daily Discomfort.txt | health/hemorrhoids-and-daily-discomfort.md | 6, 1, 8 | Ready | MISSING | Prevalence stats not in any branch |
| 16 | ChatGPT-Heroine's Healing Journey.txt | health/heroines-healing-journey.md | 14, 10, 4, 11 | Partial | MISSING | Heroine's journey framework not built |
| 17 | ChatGPT-Hormone Cycle Guide.txt | health/hormone-cycle-guide.md | 5, 6, 7 | Partial | PARTIAL | archetype-epsilon.md and archetype-delta.md overlap but don't cover ebook outline |
| 18 | ChatGPT-Hormones ! eating ! cycles.txt | health/hormones-eating-cycles.md | — | Empty | N/A | Empty export, no build target |
| 19 | ChatGPT-Gateway and blood sugar.txt | health/gateway-and-blood-sugar.md | 6, 1, 2 | Partial | PARTIAL | foundation.md mentions gateway but lacks Root-Cause Pyramid |
| 20 | ChatGPT-Gateway and Inflammation Video.txt | health/gateway-and-inflammation-video.md | 6, 8 | Ready | MISSING | Video script not in content |
| 21 | ChatGPT-Inflammation Self-Check Questions.txt | health/inflammation-self-check-questions.md | 3, 6 | Ready | MISSING | Self-assessment tool not built |
| 22 | ChatGPT-Medical research gender gap.txt | health/medical-research-gender-gap.md | 4, 8, 10 | Ready | MISSING | Gender gap research not in branches |
| 23 | ChatGPT-Milk source in the US.txt | health/milk-source-in-the-us.md | 6, 8 | Ready | MISSING | Food sourcing not in any branch |
| 24 | ChatGPT-Neurodivergence and archetype-beta links.txt | health/neurodivergence-and-archetype-beta-links.md | 9, 7 | Raw | PARTIAL | archetype-beta.md covers archetype-beta but not neurodivergence link |
| 25 | ChatGPT-Parasite cleanse diet tips.txt | health/parasite-cleanse-diet-tips.md | 7, 6 | Ready | MISSING | Parasite cleanse not in branches |
| 26 | ChatGPT-Period related rest plans.txt | health/period-related-rest-plans.md | 5, 4 | Ready | MISSING | Period rest communication not built |
| 27 | ChatGPT-Sonoluminescence phenomenon explained.txt | health/sonoluminescence-phenomenon-explained.md | 12, 9 | Partial | MISSING | Physics content not in branches |
| 28 | ChatGPT-Sulphur benefits and history.txt | health/sulphur-benefits-and-history.md | 9, 6, 13 | Partial | MISSING | Sulphur/glutathione not in branches |
| 29 | Gemini-Cellular Reprogramming Through Voice.md | health/cellular-reprogramming-through-voice.md | 12, 2, 13, 9 | Partial | MISSING | Voice-to-cells protocol not built |
| 30 | Gemini-FDA's Just a Little Bit Carcinogens.md | health/fda-just-a-little-bit-carcinogens.md | 6, 8 | Ready | MISSING | FDA carcinogen content not in branches |
| 31 | Hormones & Healing.docx | (pre-existing) health-hormones-and-healing.md | 5, 6, 7, 4 | Ready | PARTIAL | archetype-epsilon.md and archetype-delta.md overlap but ebook is standalone product |

### mindset/ (38 extracted + 1 .docx conversion)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 32 | ChatGPT-Affirmation Track for Abundance.txt | mindset/affirmation-track-for-abundance.md | 1, 2, 10, 12 | Ready | MISSING | Affirmation scripts not in pillars |
| 33 | ChatGPT-Alchemy and Spiritual Symbolism.txt | mindset/alchemy-and-spiritual-symbolism.md | 12, 14 | Raw | MISSING | Alchemy/spiritual symbolism not built |
| 34 | ChatGPT-Anger Processing Guide.txt | mindset/anger-processing-guide.md | 2, 3, 9 | Partial | MISSING | Anger processing not in system.md |
| 35 | ChatGPT-Ask Integrate Reflect Method.txt | mindset/ask-integrate-reflect-method.md | 3, 5, 11 | Partial | MISSING | AIR Method not in pillars |
| 36 | ChatGPT-Attracting Wealth with Mindset.txt | mindset/attracting-wealth-with-mindset.md | 12, 10 | Raw | MISSING | Wealth attraction not in vision.md |
| 37 | ChatGPT-Balancing Masculine and Feminine.txt | mindset/balancing-masculine-and-feminine.md | 5, 2, 3 | Raw | MISSING | Yin/yang not in system.md |
| 38 | ChatGPT-Blindspots Gaps and Cons.txt | mindset/blindspots-gaps-and-cons.md | 3, 4, 10 | Partial | MISSING | Shadow work not in system.md |
| 39 | ChatGPT-Ego Integration and Overcoming.txt | mindset/ego-integration-and-overcoming.md | 9, 4, 14 | Partial | MISSING | Ego framework not in pillars |
| 40 | ChatGPT-Emotional misattunement explanation.txt | mindset/emotional-misattunement-explanation.md | 2, 3, 10 | Raw | MISSING | Emotional boundaries not in system.md |
| 41 | ChatGPT-Entrepreneurship Development Recommendations.txt | mindset/entrepreneurship-development-recommendations.md | 11 | Raw | MISSING | Career strategy not in vision.md |
| 42 | ChatGPT-Ether Concepts Explained.txt | mindset/ether-concepts-explained.md | 12 | Raw | MISSING | Fifth element not in pillars |
| 43 | ChatGPT-Fear of Being Seen.txt | mindset/fear-of-being-seen.md | 10, 2, 9, 13 | Partial | PARTIAL | structure.md covers self-expression but not visibility wounds |
| 44 | ChatGPT-Frozen Feelings and Support.txt | mindset/frozen-feelings-and-support.md | 2, 9, 1 | Ready | MISSING | Emotional freeze/somatic content not in pillars |
| 45 | ChatGPT-Happiness as a state.txt | mindset/happiness-as-a-state.md | 1, 8, 13 | Partial | MISSING | 4 pillars of well-being not built |
| 46 | ChatGPT-Healing Growth Blueprint 1.0.txt | mindset/healing-growth-blueprint-1-0.md | ALL | Partial | PARTIAL | Meta-architecture partially reflected in site structure |
| 47 | ChatGPT-System Child Healing.txt | mindset/system-child-healing.md | 9, 2, 10 | Ready | MISSING | System child content not in system.md or structure.md |
| 48 | ChatGPT-Insecurity and Self-Respect.txt | mindset/insecurity-and-self-respect.md | 3, 10, 4 | Raw | PARTIAL | structure.md covers self-worth but not this specific angle |
| 49 | ChatGPT-Manifestation Mastery Secrets.txt | mindset/manifestation-mastery-secrets.md | 12, 2, 1 | Partial | MISSING | Manifestation protocol not in pillars |
| 50 | ChatGPT-Masculine Feminine Balance Tracker.txt | mindset/masculine-feminine-balance-tracker.md | 5, 3, 11 | Ready | MISSING | Yang/yin tracker not built as tool |
| 51 | ChatGPT-Masculine vs Feminine Balance.txt | mindset/masculine-vs-feminine-balance.md | 5, 1, 13 | Ready | MISSING | Yin check-in not in pillars |
| 52 | ChatGPT-Meal Planning and Budgeting Help.txt | mindset/meal-planning-and-budgeting-help.md | 6, 7 | Ready | MISSING | Budget meal plans not in branches |
| 53 | ChatGPT-Money block removal guide.txt | mindset/money-block-removal-guide.md | 10, 9, 12 | Partial | MISSING | Money blocks not in vision.md |
| 54 | ChatGPT-Neuro-signatures and Pruning Explained.txt | mindset/neuro-signatures-and-pruning-explained.md | 2, 8 | Partial | MISSING | Neural pruning not in system.md |
| 55 | ChatGPT-Overexplaining and Conciseness Tips.txt | mindset/overexplaining-and-conciseness-tips.md | 4, 13, 10 | Ready | MISSING | Communication patterns not in structure.md |
| 56 | ChatGPT-Overwhelm to Clarity.txt | mindset/overwhelm-to-clarity.md | 3, 11, 5 | Partial | MISSING | Brain dump method not in pillars |
| 57 | ChatGPT-Rendering Explained.txt | mindset/rendering-explained.md | 12 | Raw | MISSING | Consciousness rendering not built |
| 58 | ChatGPT-Romanticized Reality of Change.txt | mindset/romanticized-reality-of-change.md | 14, 4 | Raw | MISSING | Metamorphosis metaphor not built |
| 59 | ChatGPT-Self-awareness and love.txt | mindset/self-awareness-and-love.md | 10, 3 | Raw | MISSING | Self-love prerequisite not in structure.md |
| 60 | ChatGPT-Self-soothing in Adulthood.txt | mindset/self-soothing-in-adulthood.md | 9, 2 | Partial | MISSING | Attachment styles not in system.md |
| 61 | ChatGPT-Send PDF to Kindle.txt | mindset/send-pdf-to-kindle.md | — | N/A | N/A | Technical utility, no build target |
| 62 | ChatGPT-Shift Your Mindset.txt | mindset/shift-your-mindset.md | 1, 4 | Ready | MISSING | Mindset IG caption not in pillars |
| 63 | ChatGPT-Success and small habits.txt | mindset/success-and-small-habits.md | 8, 11 | Raw | MISSING | Compound Effect quotes not built |
| 64 | ChatGPT-TM and Kundalini Energy.txt | mindset/tm-and-kundalini-energy.md | 12, 2, 13 | Partial | MISSING | TM/Kundalini not in pillars |
| 65 | ChatGPT-Vibration Frequency Exploration.txt | mindset/vibration-frequency-exploration.md | 12 | Raw | MISSING | Cymatics/Schumann not built |
| 66 | ChatGPT-Vision board creation guide.txt | mindset/vision-board-creation-guide.md | 12, 11 | Raw | MISSING | Vision board not in pillars |
| 67 | ChatGPT-Visionary Life Breakdown.txt | mindset/visionary-life-breakdown.md | 12, 11, 14 | Ready | MISSING | Visualization script not built |
| 68 | ChatGPT-Yin energy explained.txt | mindset/yin-energy-explained.md | 5, 13 | Ready | MISSING | Yin energy IG content not in pillars |
| 69 | IMPORTANT COMPONET!ChatGPT-System child book concept (1).txt | mindset/system-child-book-concept.md | 1, 2, 5, 9, 10, 13, 14 | Partial | MISSING | Full book concept not built — standalone product candidate |
| 70 | Rhythms & Rituals.docx | (pre-existing) mindset-rhythms-and-rituals.md | 5, 1, 2, 6, 11 | Ready | MISSING | Feminine flow daily rhythm not in pillars |

### business/ (15 extracted)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 71 | ChatGPT-100 sales strategy.txt | business/100-sales-strategy.md | 11 | Partial | MISSING | Enagic sales playbook not in vision.md |
| 72 | ChatGPT-20!80 rule focus.txt | business/20-80-rule-focus.md | 1, 5, 11 | Partial | MISSING | 80/20 prioritization not in vision.md |
| 73 | ChatGPT-Astrology Social Media Strategy !!!!!.txt | business/astrology-social-media-strategy.md | 3, 5, 11 | Partial | MISSING | Chart-based social strategy not built |
| 74 | ChatGPT-Credit Report Review Guide.txt | business/credit-report-review-guide.md | 6, 10 | Raw | MISSING | Credit repair not in vision.md |
| 75 | ChatGPT-Dream retreat vision.txt | business/dream-retreat-vision.md | 12, 14 | Raw | MISSING | Retreat vision not built |
| 76 | ChatGPT-Vision Freedom Blueprint.txt | business/vision-freedom-blueprint.md | 4, 6, 10 | Ready | PARTIAL | vision.md exists but doesn't include the 12-step path |
| 77 | ChatGPT-Idea Implementation Strategies.txt | business/idea-implementation-strategies.md | 5, 8, 11 | Ready | MISSING | MVV/sprint framework not in vision.md |
| 78 | ChatGPT-Income Projections and Strategies.txt | business/income-projections-and-strategies.md | 6, 11 | Partial | MISSING | Projections not in vision.md |
| 79 | ChatGPT-Instagram grid visualization.txt | business/instagram-grid-visualization.md | — | Empty | N/A | Empty export, no build target |
| 80 | ChatGPT-Job Transition Advice.txt | business/job-transition-advice.md | 1, 2, 3 | Partial | MISSING | Job transition not in vision.md |
| 81 | ChatGPT-Novel Funnel Strategies.txt | business/novel-funnel-strategies.md | 11, 13 | Partial | MISSING | Funnel positioning not built |
| 82 | ChatGPT-Plastic Gateway Label Design.txt | business/plastic-gateway-label-design.md | 7 | Raw | MISSING | Label design request, no content target |
| 83 | ChatGPT-Sales momentum plan.txt | business/sales-momentum-plan.md | 11 | Partial | MISSING | 3-phase sales plan not in vision.md |
| 84 | ChatGPT-Wagyu Post Conversion Tips.txt | business/wagyu-post-conversion-tips.md | 11, 13 | Ready | MISSING | FB caption templates not built |
| 85 | ChatGPT-Website Launch and App Timeline.txt | business/website-launch-and-app-timeline.md | — | Empty | N/A | Empty export, no build target |

### gateway/ (15 extracted + 1 .docx conversion)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 86 | ChatGPT-2.5 pH Acidic Gateway.txt | gateway/2-5-ph-acidic-gateway.md | 7, 9 | Ready | MISSING | Hypochlorous acid content not in branches |
| 87 | ChatGPT-Dissolved hydrogen concentration.txt | gateway/dissolved-hydrogen-concentration.md | 7 | Raw | MISSING | K8 H2 levels not in branches |
| 88 | ChatGPT-Eczema Skin Gateway Protocol.txt | gateway/eczema-skin-gateway-protocol.md | 6, 9 | Ready | PARTIAL | archetype-beta.md covers skin conditions but not gateway protocol |
| 89 | ChatGPT-Ionized gateway benefits.txt | gateway/ionized-gateway-benefits.md | 7, 9 | Partial | PARTIAL | Branches discuss ERW but lack PubMed detail |
| 90 | ChatGPT-Kangen Gateway and Ear Aches.txt | gateway/kangen-gateway-and-ear-aches.md | 9 | Partial | MISSING | Ear protocol not in branches |
| 91 | ChatGPT-Kangen Gateway Content Ideas.txt | gateway/kangen-gateway-content-ideas.md | 11, 13 | Ready | MISSING | Reel scripts not in content |
| 92 | ChatGPT-Molecular Hydrogen for Athletes.txt | gateway/molecular-hydrogen-for-athletes.md | 11 | Raw | PARTIAL | archetype-alpha.md covers H2 for athletes at a high level |
| 93 | ChatGPT-Gateway hub design.txt | gateway/gateway-hub-design.md | 11, 12 | Partial | PARTIAL | Gateway pages exist but architecture differs from this design |
| 94 | ChatGPT-Gateway Hub Framework Breakdown.txt | gateway/gateway-hub-framework-breakdown.md | 11, 12 | Raw | PARTIAL | Landing flow partially implemented |
| 95 | ChatGPT-Gateway Memory and Energy.txt | gateway/gateway-memory-and-energy.md | 12 | Partial | MISSING | Structured gateway / EZ gateway not in branches |
| 96 | ChatGPT-Gateway Retention in ERW.txt | gateway/gateway-retention-in-erw.md | 7 | Raw | MISSING | Dead-end research, no build target |
| 97 | ChatGPT-Gateway Sales Strategy Plan.txt | gateway/gateway-sales-strategy-plan.md | 11 | Partial | MISSING | Sales system not in content |
| 98 | ChatGPT-Well Gateway Costs.txt | gateway/well-gateway-costs.md | 6 | Raw | MISSING | Well economics not in branches |
| 99 | Gemini-Hydrogen Gateway Science, Health, and Business.md | gateway/hydrogen-gateway-science-health-and-business.md | 7, 9, 11 | Partial | PARTIAL | Branches cover H2 science but not this webinar detail |
| 100 | Gemini-Gateway Crystals, Love, and Pseudoscience.md | gateway/gateway-crystals-love-and-pseudoscience.md | 12 | Ready | MISSING | Emoto critique not in branches |
| 101 | Learn More About ERW.docx | (pre-existing) gateway-learn-more-about-erw.md | 7, 9, 13 | Ready | MISSING | ERW resource page not built as standalone |

### time-astro/ (9 extracted)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 102 | ChatGPT-13 Month Calendar Query.txt | time-astro/13-month-calendar-query.md | 5, 12 | Partial | MISSING | Lunar calendar not in any content |
| 103 | ChatGPT-Astrology and business strategy.txt | time-astro/astrology-and-business-strategy.md | 3, 5, 11 | Ready | MISSING | Chart transit timing not built |
| 104 | ChatGPT-Astrology Hormone Moon Planner.txt | time-astro/astrology-hormone-moon-planner.md | 5, 6, 12 | Partial | MISSING | Planner concept not built |
| 105 | ChatGPT-Cycle and moon comparison.txt | time-astro/cycle-and-moon-comparison.md | 5, 6, 13 | Ready | MISSING | Moon/cycle mapping not in content |
| 106 | ChatGPT-Frequency symbol origins.txt | time-astro/frequency-symbol-origins.md | 12 | Partial | MISSING | Frequency sigil fact-check not built |
| 107 | ChatGPT-Moon Day Male Struggles (1).txt | time-astro/moon-day-male-struggles.md | 5 | Ready | MISSING | Monday/moon content not built |
| 108 | ChatGPT-Spoon bending technique.txt | time-astro/spoon-bending-technique.md | 12 | Raw | MISSING | Fringe content, likely no build target |
| 109 | ChatGPT-Time, astrology & human design.txt | time-astro/time-astrology-and-human-design.md | — | Empty | N/A | Empty export, no build target |
| 110 | ChatGPT-Vedic astrology energy analysis.txt | time-astro/vedic-astrology-energy-analysis.md | 2, 3 | Partial | MISSING | Vedic astrology not in content |

### concepts/ (13 extracted)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 111 | ChatGPT-Book Concept Breakdown.txt | concepts/book-concept-breakdown.md | 4, 8, 10, 12 | Ready | MISSING | Compound Effect / Radical Forgiveness distillation not built |
| 112 | ChatGPT-Breakdown of Veblen's ideas.txt | concepts/breakdown-of-veblens-ideas.md | 4, 12 | Partial | MISSING | Veblen / leisure class not in content |
| 113 | ChatGPT-Creature selves resources.txt | concepts/creature-selves-resources.md | 13, 14 | Partial | MISSING | Somatic embodiment concept not built |
| 114 | ChatGPT-Divine Feminine Flow.txt | concepts/divine-feminine-flow.md | 1, 5, 13 | Ready | MISSING | Poetic daily rhythm not in pillars |
| 115 | ChatGPT-Dopamine vs Oxytocin Dynamics.txt | concepts/dopamine-vs-oxytocin-dynamics.md | 5, 2 | Ready | MISSING | Neurochemistry framework not in system.md |
| 116 | ChatGPT-Dopamine vs Oxytocin Energy.txt | concepts/dopamine-vs-oxytocin-energy.md | 3, 5 | Ready | MISSING | Yin/yang checklist not built as tool |
| 117 | ChatGPT-Energy Waves and Oscillations.txt | concepts/energy-waves-and-oscillations.md | 12 | Partial | MISSING | Physics/astrology-as-imprint not built |
| 118 | ChatGPT-Gallup Poll usage today.txt | concepts/gallup-poll-usage-today.md | 4 | Raw | MISSING | Gallup validity not in content |
| 119 | ChatGPT-Hunched Back and Past Lives.txt | concepts/hunched-back-and-past-lives.md | 9, 13 | Partial | MISSING | Spiritual spinal interpretation not built |
| 120 | ChatGPT-Idea Implementation Strategies.txt | concepts/idea-implementation-strategies-duplicate.md | 5, 8, 11 | N/A | N/A | DUPLICATE of business/idea-implementation-strategies.md |
| 121 | ChatGPT-Research.txt | concepts/research.md | — | Empty | N/A | Empty export, no build target |
| 122 | ChatGPT-Sound Frequency Analysis.txt | concepts/sound-frequency-analysis.md | 2, 12 | Partial | MISSING | Audio frequency analysis not built |
| 123 | ChatGPT-Vision board creation guide.txt | concepts/vision-board-creation-guide.md | 10, 12 | Raw | MISSING | Vision board brain dump not built |

### Root .docx conversions (pre-existing, not in subdirectories)

| # | Source File | Extracted As | Nodes | Readiness | Build State | Gap |
|---|-----------|-------------|-------|-----------|-------------|-----|
| 124 | 1a. Master spiral backend breakdown.docx | 1a-master-spiral-backend-breakdown.md | ALL | Ready | PARTIAL | Architecture doc; site structure reflects it partially |
| 125 | 1b. Spiral dump for build & completed questionaire.docx | 1b-spiral-dump-questionnaire.md | ALL | Ready | PARTIAL | Build spec; partially implemented |

---

## Build Gap Summary

| Build State | Count | % |
|-------------|-------|---|
| EXISTS | 0 | 0% |
| PARTIAL | 22 | 17.6% |
| MISSING | 93 | 74.4% |
| N/A | 10 | 8.0% |
| **Total** | **125** | **100%** |

**Key finding:** Zero source files have full `EXISTS` coverage in `src/content/`. 22 files have partial overlap (primarily with the 6 gateway branches and 4 pillar pages). 93 files represent content that has not yet been built into the site. The existing site structure covers the architectural framing (pillars, branches) but almost none of the specific source content from admin's research dump has been incorporated.

### Highest-priority gaps (Ready content with no build equivalent)

1. **health/feel-good-first-script.md** — Core brand concept, Node 1
2. **health/cortisol-stress-carousel.md** — Ready IG content, Node 2/1/8
3. **mindset/frozen-feelings-and-support.md** — Somatic tool, Node 2/9/1
4. **mindset/system-child-healing.md** — Structure Sovereignty, Node 9/2/10
5. **mindset/masculine-feminine-balance-tracker.md** — Ready tool, Node 5/3/11
6. **business/vision-freedom-blueprint.md** — 12-step path for Node 13
7. **concepts/book-concept-breakdown.md** — Framework for Nodes 4/8/10/12
8. **concepts/dopamine-vs-oxytocin-energy.md** — Ready assessment tool, Node 3/5
9. **gateway/kangen-gateway-content-ideas.md** — 10 reel scripts + 5 posts
10. **mindset/system-child-book-concept.md** — Standalone product, 7 nodes
