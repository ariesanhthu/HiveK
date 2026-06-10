# MVP UX and Agentic Architecture for a Human-Looking Campaign SaaS

## Product thesis

The product should **not** be an “AI post generator” that asks the marketer to upload a full strategy deck and then dumps out 30 generic posts. For a campaign SaaS in this category, especially if Threads is the lead channel, the winning job is narrower and more valuable: help a brand move from a **small, high-signal brief** to a **platform-fit campaign direction**, then to **one very strong post**, then to **on-demand expansion** only after a human approves the voice and angle. That sequence matches both how creative briefs are normally used in marketing and how human-AI co-creative systems perform best when users retain strong control during early ideation and refinement. citeturn51search0turn44academia1turn44academia3

Threads in particular makes this framing even more important. The platform is increasingly meaningful for brands, but the strongest current use case is still **conversation, familiarity, and brand voice**, not blunt hard-sell performance. The Advertising Vietnam analysis you shared argues that Threads works best when brands sound less like a press release and more like a person with a recognizable point of view; it also places Threads primarily in awareness and consideration rather than immediate conversion. Reuters also reported that Meta opened Threads ads more broadly only after the platform had scaled into the hundreds of millions of monthly users, underscoring that the ad surface is real but still comparatively young. citeturn10view0turn11view1turn11view3turn39news4turn39news2

That leads to the central product decision: **the MVP should be strategy-first, post-first, and reply-aware**. In other words, the user should first get a campaign direction and voice hypothesis, then a single excellent test post, then a planned comment/reply structure, and only then the rest of the campaign queue. That is much closer to how Threads actually behaves, where post-publication participation matters heavily, and where scheduled posting has been tested while replies were explicitly kept real-time to preserve live conversation. citeturn11view2turn11view1turn36news0

Your uploaded marketing-psychology skill is directionally aligned with this architecture as well: it defines persuasion work as **behavior-first**, tied to the journey stage, blocker, and a limited number of ethical, high-leverage levers rather than indiscriminate “bias stuffing.” That is a strong fit for an AI campaign planner: the system should map each asset to a target behavior and funnel stage, then constrain itself to a few relevant persuasion angles instead of producing over-engineered, obviously “AI” copy. fileciteturn0file0

## What the MVP should ask from the user

A good intake should feel closer to a **smart creative brief wizard** than a document dump. Standard creative-brief practice usually centers on objective, audience, key message, desired behavior, tone, mandatory elements, deliverables, timing, budget, and approvals. Funnel thinking then turns those inputs into stage-specific actions such as awareness, consideration, and conversion. That means your SaaS does **not** need to demand every asset up front; it needs just enough to infer the rest and ask for more only when ambiguity becomes operationally important. citeturn51search0turn35search2turn0file0

The minimum intake I would ship for an MVP is this synthesized structure:

| Input type | What the user gives | Why it matters |
|---|---|---|
| Required | Campaign objective | Tells the system whether to optimize for awareness, consideration, lead generation, or direct response |
| Required | Product or offer description | Gives the model the economic substance of the campaign |
| Required | Target audience and geography | Prevents generic copy and anchors language, examples, and objections |
| Required | One CTA destination | Link, DM target, WhatsApp, booking page, lead form, or store visit |
| Required | Brand guardrails | Mandatory facts, words to avoid, claims that cannot be made, required disclaimers |
| Required | Brand voice preference | Either choose from options or provide a few examples of “sounds like us / does not sound like us” |
| Optional | Product images | Supports visual references and image-caption alignment |
| Optional | Founder / spokesperson image | Only needed if the campaign will be face-led |
| Optional | Previous winning posts | Best signal for authentic voice adaptation |
| Optional | Competitor or inspiration links | Useful for contrast but not required |
| Optional | Budget and campaign dates | Needed for calendar, media pressure, and volume planning |

This is intentionally lean. The system should then automatically infer: probable funnel stage, content pillars, likely objections, platform suitability, candidate tones, and a first-pass publishing rhythm. That aligns with user-control research in co-creative systems, which repeatedly finds that people value systems that help them clarify the problem early, preserve ownership, and avoid forcing them into a giant one-shot prompt. citeturn7academia9turn44academia1turn44academia2

For a travel company, this lean input model is especially important because AI tends to be most useful in the **exploratory phase** of travel shopping, where users move between search and chat while comparing ideas and attractions rather than simply executing a final booking. A 2026 study of an embedded travel AI assistant on Ctrip found that chat commonly interleaves with search and is disproportionately used for exploratory, hard-to-keyword tasks. So your campaign intake should ask not just “what are you selling?” but “are you trying to trigger discovery, shortlist evaluation, or booking urgency?” citeturn47academia7

## UX UI and frontend flow

The frontend should use **progressive disclosure**. The first screen must feel almost deceptively simple: objective, audience, offer, CTA, and optional assets. Advanced controls such as tone sliders, platform toggles, risk rules, and custom prompting should stay hidden until the system has proposed a first strategy. That design pattern reduces cognitive load and fits both classic interface design and modern co-creative AI research, which shows that users need early problem framing support more than an overload of controls at the start. citeturn28search2turn7academia9turn44academia1

The interaction flow I would recommend is:

**Campaign setup.**  
The user enters the lean brief, uploads optional product assets, and chooses the initial platform focus. If the product supports multiple platforms later, the MVP should still ask for a **primary channel** so the system does not generate mush. For your use case, I would make Threads the default “conversation lead” channel and treat Facebook, Instagram, TikTok, or X as optional inspiration or later extensions. That matches Threads’ role as a voice-building surface rather than a generic copy target. citeturn11view1turn11view3turn39news4

**Strategy board.**  
Instead of jumping straight to copy, the system should present a compact strategic synthesis: audience angle, funnel stage, content pillars, recommended tone directions, message hierarchy, proposed cadence, and “what not to do.” This is where the product operationalizes your uploaded behavior-first psychology skill: each strategic direction should explicitly state the target behavior, likely blocker, and top psychological levers with ethical guardrails. fileciteturn0file0

**Voice studio.**  
The system should show three to five **voice cards**, not one giant text answer. For example: “observational and witty,” “emotionally reflective,” “practical and insider,” “premium but conversational.” Each card should come with a couple of micro examples. The user selects one, modifies it, or blends two. Research on authenticity in AI co-writing suggests that writers care a lot about preserving their own voice and want personalization to support their growth rather than erase authorship. citeturn44academia2

**First post lab.**  
This is the most important screen in the MVP. The system should first generate only **openings and hooks**, not full posts. Let the user choose one. Then the product expands that opening into a full post with optional first-comment and reply suggestions. This is a better fit than generating complete campaigns all at once because human-AI prewriting works best when ideation, illumination, and implementation happen iteratively rather than in one giant burst. citeturn44academia3

**Reply and comment pack.**  
For Threads, the product should treat replies as a first-class deliverable. Advertising Vietnam emphasizes that post-publication participation is a major part of good Threads operation, and external reporting on social commerce behavior shows that younger audiences increasingly use comment sections as a shopping and research touchpoint. Vogue reported that 55% of Gen Z users look at comments when researching a product or brand on social media, and Advertising Vietnam makes a parallel point for Threads by stressing that the “after-post” interaction can matter as much as the original post. citeturn11view2turn40news2turn47news0

**Generate the rest only on demand.**  
After the first post is approved, the user should see a campaign canvas with placeholders such as “Awareness opener,” “Proof post,” “Objection handler,” “Offer post,” and “Community reply set.” Nothing else should be generated until the user clicks into a slot. This keeps cost lower, improves trust, and prevents the classic “AI spam wall” experience. It also aligns with research showing that systems with higher user control tend to improve trust, satisfaction, and ownership. citeturn44academia1

## Agent structure and data sources

The core system should be **multi-agent, but not theatrically multi-agent**. Most SaaS products overcomplicate the label. For your MVP, the right architecture is a small number of specialized agents with clearly separated responsibilities:

- **Intake agent** to clean the brief, detect missing essentials, and normalize campaign metadata.  
- **Audience and funnel agent** to infer whether the immediate objective is awareness, consideration, or conversion.  
- **Signal agent** to gather trend and platform-fit references from legally accessible sources.  
- **Strategy agent** to produce message pillars, tone options, and posting hypotheses.  
- **Style retrieval agent** to fetch the nearest brand examples, platform-native exemplars, and vertical-specific patterns.  
- **Draft agent** to write the selected post or reply.  
- **Validator agent** to score brand fit, factual consistency, tone drift, and risk.  
- **Learning agent** to log edits, approvals, rejections, and outcomes for future adaptation.

The **signal layer** is where product realism matters. A commercial SaaS should **not** promise unrestricted machine learning over Threads, Facebook, Instagram, TikTok, and X content, because the data environment is materially constrained. Meta shut down CrowdTangle and moved to the Meta Content Library, which reporting said was limited to academic and nonprofit researchers rather than normal commercial teams. TikTok’s Creative Center remains useful for trends and top ads, but AP reported that it removed specific hashtag search and narrowed some functionality; separate academic work has also documented missing or incomplete data in TikTok research access. X is even more restrictive for your use case: a 2025 policy update reportedly barred developers from using X posts to train or fine-tune AI foundation models, and researchers have described X’s post-2023 API environment as cost-prohibitive. citeturn27news0turn23news1turn20view0turn22news3turn22academia0turn19academia3turn26news0turn26academia11

That means the MVP should use a **hybrid evidence model**:

- user-provided brand examples and uploads,
- user-approved URLs from public posts,
- platform-native public trend surfaces where accessible,
- public top-ad and trend references from tools like TikTok Creative Center,
- first-party analytics exports from the brand,
- manually curated “winning examples” saved into a reusable internal library.

This is the right compromise between effectiveness, legality, and cost. It also creates a much stronger foundation for brand adaptation than blind scraping because the system learns from **approved examples**, not random high-engagement noise. citeturn20view0turn22news3turn26news0turn19academia3

The **style retrieval agent** is the most important technical differentiator if the goal is to sound like viral Vietnamese social media rather than generic English-trained AI copy. Research on Vietnamese NLP has shown that general-language models are insufficient for many Vietnamese social media tasks; ViSoBERT was built specifically because social-language performance differs from general Vietnamese NLP. Separately, domain-adaptive text style transfer research shows that source-domain patterns do not transfer cleanly under domain shift. In practical product terms, that means your system should never rely on a general LLM alone for “Vietnamese viral tone.” It needs a retrieval layer that brings in **Vietnamese social exemplars**, **brand-owned examples**, **platform-specific patterns**, and **vertical-specific language** before generation. citeturn43academia0turn43academia2

The system should also classify the **content type before writing**. Virality research suggests that affect works differently in social versus news-like contexts: one study found that negative sentiment supports retweeting in news contexts, while positive sentiment is more supportive in non-news sharing; other work found that negative messages can spread faster while positive ones can reach broader audiences. That means one universal hook formula is a mistake. The agent should first decide whether the asset is a lived observation, a hot take, a proof point, a community question, or a news reaction, and only then choose the emotional profile and opening style. citeturn30academia2turn41academia2

## How to avoid the AI feel

The product should treat “sounds too AI” as an explicit failure mode, not a vague complaint. In this category, the main cause is not that the model is too strong; it is that the system has **no taste memory** and **no platform cadence model**. Writers in co-writing studies consistently describe authenticity as a process issue, not just an output issue, and they respond more positively when the AI is personalized and leaves room for authorship. Systems with higher user control also improve ownership and trust. citeturn44academia2turn44academia1

I would operationalize “less AI” in the product through five concrete mechanisms.

First, the system should retrieve **brand-approved exemplars** before every generation. These should be tagged by platform, audience, funnel stage, and emotional posture. A travel brand, for example, might have separate exemplar groups for “aspirational escape,” “practical reassurance,” “family proof,” and “last-seat urgency.” That is how domain adaptation becomes product behavior rather than just model theory. citeturn43academia0turn43academia2

Second, the system should generate **diverse openings from different rhetorical families**, not ten paraphrases of the same hook. On Threads, Advertising Vietnam’s analysis strongly suggests that what performs is not polished corporate symmetry but timely observations, clear voice, recognizable attitude, and openings that invite response. So the opening families should be things like observation, confession, tension, question, micro-story, contradiction, or practical reveal. citeturn11view1turn11view2turn11view0

Third, the product should make the **reply layer part of the content design**. For your Threads example, this is exactly the right idea: the main post can be short, topical, and conversational; the first comment can expand the angle; the second can carry the more direct offer; and the CTA can sit in the reply stack for users who are already curious. That structure is more platform-native than cramming all selling points into the top post. It is also consistent with the reality that comment spaces increasingly influence shopping behavior. citeturn11view2turn40news2turn47news0

Fourth, the validator should score for **brand-fit and human-likeness**, not just grammar. A draft can be grammatically perfect and still fail because it feels mass-produced. A human-in-the-loop validator architecture is supported by current agentic research: recent studies of HITL generation systems show strong value from pairing a generator with an independent validator and reserving final judgment for humans in nuanced dimensions. citeturn46academia0turn46academia1

Fifth, the product should never optimize purely for engagement. That is how systems drift into controversy bait, pseudo-edgy language, or synthetic “relatable” tone. Research on reward hacking in LLM systems shows that when external feedback loops become the dominant optimization target, systems can learn shortcuts that improve the metric while degrading the real objective. On Threads, that risk is particularly relevant because the platform rewards conversation, but its culture is also sensitive to obvious selling and forced tone. citeturn46search7turn11view3

## Cost, governance, and learning loop

A cost-efficient MVP does **not** need a giant frontier model on every step. The right architecture is a **tiered model stack**. Small or mid-sized models should handle classification, tagging, retrieval scoring, cliché detection, and rule-based validation; the large model should be saved for strategy synthesis and final draft creation. This is supported by current evidence: one 2026 enterprise-search paper showed that a distilled small relevance model could deliver much higher throughput and far lower cost than its large-model teacher, while prompt-caching research found 45% to 80% API cost reductions in long-horizon agentic tasks when caching is designed correctly. Reuters also reported the continued push toward smaller, cheaper models for enterprise content-creation use cases. citeturn45academia0turn45academia1turn45news4turn45academia3

From a system-design perspective, the cheapest high-value stack for the MVP is:

- relational database for campaigns, assets, approvals, and performance,
- object storage for images and documents,
- vector store for brand examples, viral references, and rejected-pattern memory,
- queue/orchestrator for asynchronous agent steps inside the request,
- analytics store for post outcomes and edit histories,
- prompt cache and semantic cache for duplicate or near-duplicate operations.

The learning loop should capture **edits, not just outcomes**. The most useful signals are not merely likes and clicks, but which opening the user chose, what they edited out, what they added back in, which generated ideas were rejected, which examples they pinned as “more like this,” and whether the published version outperformed the untouched AI draft. A 2025 production study on an Agent-in-the-Loop customer-support system found that embedding preference data, adoption behavior, relevance checks, and missing-knowledge signals into live workflows materially improved both retrieval and generation quality. That pattern maps very well to marketing copy systems. citeturn46academia1

Governance should be simple and visible. The system needs three review bands: **green** for low-risk drafts that users can edit freely, **amber** for output that mentions prices, claims, legal language, or sensitive topics and therefore requires approval, and **red** for anything crisis-adjacent, political, or reputationally sensitive. This banding matters because marketing teams often lose trend velocity in approval bottlenecks, yet Threads specifically rewards speed and authentic replies. Advertising Vietnam makes this operational point clearly: brands need a defined voice framework and permission boundaries so social teams can respond quickly without becoming reckless. citeturn11view1

## MVP scope, rollout, and limitations

The MVP I would actually ship is a **Threads-first campaign copilot with optional cross-platform inspiration**, not a universal social autopilot. That is the cleanest wedge because Threads rewards voice design, short-form conversational creativity, and reply-aware workflows; it also gives you a focused UX problem instead of an impossible “all channels equally” promise. Facebook and Instagram can remain conversion-supporting channels in the strategy layer, while TikTok and X can be treated as inspiration or reference inputs until data access, rights, and workflow maturity justify deeper integration. citeturn11view1turn11view3turn39news4turn26news0turn22news3

The feature scope for release should be narrow:

- lean campaign intake,
- strategy board,
- voice studio,
- first post lab,
- reply/comment pack,
- generate-more-on-click campaign canvas,
- approval workflow,
- learning dashboard based on edits and outcomes.

It should **not** include, in the first release, full autonomous multi-platform scraping, auto-publishing across every network, large-scale fine-tuning on scraped platform content, or a fully autonomous comment bot. Those capabilities are where trust, policy, and data-access problems multiply fastest. citeturn27news0turn22academia0turn26news0turn19academia3

For your travel example, the product should behave like this: the brand uploads a short campaign description, a booking link, a few tour photos, and optionally two or three examples of posts that sound right. The system then proposes a Threads strategy such as “urban burnout to weekend escape,” “insider practical guide,” or “family-safe summer planning,” explains which audience behavior each angle is trying to trigger, generates five short openers, lets the marketer pick one, expands it into a single post, and then suggests a reply stack containing itinerary, proof, price/date context, and CTA. Only after the marketer approves that unit would the rest of the campaign queue become available. That flow is much better aligned with Threads’ conversational culture and with the exploratory nature of travel discovery. citeturn11view2turn11view3turn47academia7

There are still some limitations. I did not benchmark a live corpus of Vietnamese viral Threads posts inside this report, so the “Vietnamese human-like” layer here is an architecture recommendation rather than an empirical leaderboard. Platform access conditions also change frequently; the broad constraints identified here are well-supported, but exact API entitlements, rate limits, and commercial rights can shift over time. Finally, the report focuses deliberately on an MVP around this single campaign feature, so collaboration features, omnichannel analytics warehousing, and media buying automation are intentionally left outside scope. citeturn19academia3turn22academia0turn26news0

The strongest product conclusion is straightforward: **build a campaign copilot, not a mass post generator**. If the SaaS starts with lean input, strategy-first UX, exemplar-based style retrieval, reply-aware generation, explicit human checkpoints, and a learning loop driven by edits and outcomes, it will be far more likely to produce campaign posts that feel native, timely, and profitable rather than “too AI.” citeturn44academia1turn44academia2turn11view1turn46academia1