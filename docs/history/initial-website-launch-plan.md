# Website Launch Plan

> **Archived planning record.** This document describes the site's initial
> design process and is not a current source of truth for data, architecture,
> contribution policy, or deployment. References to Section 1-4 files describe
> private development materials that are intentionally absent from the public
> repository. Use the root `README.md`, `docs/architecture.md`, `data/README.md`,
> and `site/DEPLOYMENT.md` for current guidance.

## Purpose

Create a public-facing website that helps faculty and students understand AI-related water and energy use at a glance, with enough nuance to avoid misleading comparisons and enough structure to support regular updates as new data arrives.

This site should:

- Present the strongest, most useful material from the active Section 1-4 source files
- Help non-experts compare AI use with other digital activities
- Make caveats and uncertainty visible
- Link out to Jon Ippolito's What Uses More calculator as a practical follow-up tool
- Stay easy to update without redesigning the site every time a number changes

## Primary Audiences

- Faculty who want a credible link to share with students
- Students who want a fast explanation without reading a full report
- Staff or presenters who may reuse the site in workshops or class discussions

## Launch Positioning

This should be an explainer and reference site, not a blog, slide archive, or live dashboard.

The site should answer four questions quickly:

1. What parts of AI use water and energy?
2. How much are we talking about relative to other digital activities?
3. Where do the biggest impacts actually come from?
4. Which claims are solid, estimated, or contested?

## Recommended Stack

### Core stack

- `Astro` for the site framework
- Static assets deployed as a Cloudflare Worker through `Workers Builds`
- Content stored in Git as structured Markdown, JSON, and CSV

### Why this stack

- Fast, low-maintenance, and inexpensive
- Fits a content-heavy site better than a JavaScript-heavy app
- Works well with Markdown source material already in this folder
- Makes it straightforward to separate content from presentation
- Leaves room to add a CMS later if editing expands beyond one or two maintainers

### CMS recommendation

Start without a CMS.

If non-technical editing becomes necessary later, add `Sanity` as a structured content layer. Do not start with a browser CMS unless there is a real editing need now.

## Launch Sitemap

### 1. Home

**Goal**: Give visitors the core takeaway in under one minute.

**Sections**

- Hero with plain-language framing:
  - AI uses water and electricity mostly through data centers
  - A single text prompt is usually small
  - Aggregate demand can become large very quickly
- Four quick comparison cards:
  - Basic AI prompt
  - Image generation
  - Streaming video
  - Daily-use scenario
- "Start here" pathway cards linking to:
  - Compare daily use
  - How data centers work
  - What a prompt costs
  - Long-term debates
- Short methodology strip:
  - `Verified`
  - `Estimated`
  - `Inferred`
  - `Contested`
- Featured resource card linking to Jon Ippolito's calculator
- Sitewide last-updated date

### 2. Start Here

**Goal**: Provide the best single-page orientation for faculty and students.

**Sections**

- 5-7 headline takeaways in plain language
- A compact "what to tell students" section
- A short "what not to say" section
  - Example: not every prompt is equal
  - Example: do not compare partial AI figures to full supply-chain figures without saying so
- Link to sources and methods
- Link to classroom/resource tools

### 3. Compare Daily Use

**Goal**: Make Section 3 the main public entry point.

**Sections**

- Intro explaining that impact depends on activity mix, not just whether someone uses AI
- Scenario cards:
  - Gen Z non-AI user
  - Medium AI user
  - Heavy AI user / vibe coder
  - Faculty Zoom host
- Sort or toggle by:
  - Server energy
  - Total energy
  - Direct water
  - Total water
- Per-activity breakdown table for each scenario
- Caveat panel noting which scenario inputs are estimated
- Callout to use Jon Ippolito's calculator for personal comparison

### 4. What a Prompt Costs

**Goal**: Turn Section 2 into a clean explainer on per-activity costs.

**Sections**

- Training vs. inference
- Comparison charts:
  - Text vs. image vs. video
  - Small vs. medium vs. reasoning-heavy prompt classes where supported
- "False comparisons" explainer
- "Apples-to-apples" comparisons with cloud-native activities
  - Search
  - Streaming
  - Social video
  - Coding agents
- Caveat panel describing scope limits
  - Training excluded in many inference figures
  - Device energy may or may not be included
  - Water direct vs. indirect

### 5. How Data Centers Work

**Goal**: Turn Section 1 into a usable infrastructure explainer.

**Sections**

- What a data center is and what AI is using within it
- WUE and PUE explained in plain language
- Direct vs. indirect water use
- Cooling tradeoffs:
  - Air cooling
  - Evaporative cooling
  - Closed-loop systems
- Charts:
  - Current demand baseline
  - Projected growth through 2030
  - AI share of data center electricity demand
- Geographic / system-level note:
  - local water stress and grid context matter

### 6. Benefits and Risks

**Goal**: Present Section 4 as a balanced debate page rather than an advocacy page.

**Sections**

- Overview: small individual use vs. large system demand
- Benefits block:
  - grid investment
  - nuclear PPAs
  - science / drug discovery
- Risks block:
  - emissions accounting complexity
  - water stress and siting
  - electricity prices and grid reliability
  - rebound effects / Jevons paradox
- "What is well-supported vs. still uncertain" box

### 7. Sources and Method

**Goal**: Show credibility and update discipline.

**Sections**

- Source tiers explanation
- How values were selected
- What counts as verified vs. inferred vs. estimated
- Key methodological notes:
  - server-side vs. total system energy
  - direct vs. indirect water
  - training vs. inference
- Linkable citations for every public claim
- Last verification date for each major claim block

### 8. Resources

**Goal**: Give faculty practical next steps.

**Sections**

- Jon Ippolito's [What Uses More](https://what-uses-more.com/)
- Short annotation for why it is useful
- Other tools or readings later if needed
- Optional future section:
  - classroom discussion prompts
  - assignment ideas

### 9. Updates

**Goal**: Record content changes over time.

**Sections**

- Reverse-chronological update log
- Entries such as:
  - new verified source added
  - estimate replaced by peer-reviewed figure
  - scenario assumptions revised
  - chart updated with latest baseline

This is not a news feed. It is a maintenance log.

## Navigation Model

Top nav:

- Start Here
- Compare Daily Use
- What a Prompt Costs
- How Data Centers Work
- Benefits and Risks
- Sources & Method
- Resources

Footer:

- About this project
- Updates
- Source tiers
- Contact / feedback

## Page Templates

Use a small set of repeatable templates:

### 1. Landing page template

Used for:

- Home
- Start Here

### 2. Explainer page template

Used for:

- What a Prompt Costs
- How Data Centers Work
- Benefits and Risks

Includes:

- section intro
- key takeaways
- visual blocks
- caveat callouts
- source-backed fact cards

### 3. Scenario index template

Used for:

- Compare Daily Use

Includes:

- scenario summary cards
- comparison visualization
- methodology note

### 4. Scenario detail template

Used for:

- each scenario as its own subpage if needed later

### 5. Source/method template

Used for:

- Sources and Method
- individual source notes later if desired

### 6. Update entry template

Used for:

- Updates log entries

## Launch Content Model

The content model should separate claims, pages, charts, and resources so updates do not require editing page copy everywhere.

### Collection: `pages`

Use for top-level page content and static explanatory text.

**Fields**

- `title`
- `slug`
- `summary`
- `seo_title`
- `seo_description`
- `status`
- `order`
- `last_reviewed`

### Collection: `facts`

Use for every public-facing numeric or claim-based statement.

**Fields**

- `id`
- `section`
- `topic`
- `claim`
- `short_label`
- `value`
- `unit`
- `display_value`
- `comparison_context`
- `status`
  - `verified`
  - `inferred`
  - `estimated`
  - `contested`
- `scope_note`
- `method_note`
- `source_tier`
- `source_title`
- `source_org`
- `source_url`
- `source_date`
- `last_verified`
- `notes`
- `tags`

**Examples**

- data centers consumed `415 TWh` in `2024`
- projected data center demand `945 TWh` by `2030`
- a basic text prompt `~0.3 Wh`
- image generation `0.477 Wh`

### Collection: `scenarios`

Use for each daily-life profile from Section 3.

**Fields**

- `id`
- `title`
- `slug`
- `audience_label`
- `summary`
- `server_energy_wh`
- `total_energy_wh`
- `direct_water_ml`
- `total_water_ml`
- `confidence`
- `last_reviewed`
- `hero_stat`
- `comparison_note`
- `activities`

Each `activities` item should contain:

- `label`
- `duration_or_volume`
- `server_energy_wh`
- `total_energy_wh`
- `direct_water_ml`
- `total_water_ml`
- `source_ids`
- `estimated`
- `note`

### Collection: `charts`

Use for reusable chart definitions and data bindings.

**Fields**

- `id`
- `title`
- `slug`
- `chart_type`
- `summary`
- `data_file`
- `x_field`
- `y_field`
- `series_field`
- `unit`
- `source_ids`
- `note`
- `last_reviewed`

Data should live in:

- `src/data/charts/*.csv` for simple series
- `src/data/charts/*.json` for grouped or annotated data

### Collection: `resources`

Use for external tools and recommended readings.

**Fields**

- `title`
- `slug`
- `resource_type`
- `summary`
- `url`
- `audience`
- `why_it_matters`
- `cautions`
- `featured`

The Jon Ippolito calculator should be a featured resource.

### Collection: `updates`

Use for maintenance log entries.

**Fields**

- `title`
- `date`
- `summary`
- `changed_items`
- `reason`
- `impact_on_public_copy`

### Collection: `sources`

Optional at launch, recommended soon after.

Use if you want claims to reference canonical source records rather than duplicating metadata in every fact.

**Fields**

- `id`
- `title`
- `organization`
- `authors`
- `url`
- `published_date`
- `source_tier`
- `source_type`
- `notes`

## Suggested Folder Structure

```text
src/
  content/
    pages/
    facts/
    scenarios/
    charts/
    resources/
    updates/
    sources/
  data/
    charts/
  components/
    fact-card/
    scenario-card/
    chart-block/
    status-badge/
    caveat-box/
  layouts/
  pages/
```

## Fact Status System

Every public claim should carry a visible status.

### `Verified`

Use when the value is confirmed against a strong source and the wording matches the source scope.

### `Inferred`

Use when the number is derived from strong source data but not directly stated.

### `Estimated`

Use when the figure is a reasoned approximation or analogy.

### `Contested`

Use when strong disagreement exists or the methodology is unstable.

## Chart Strategy

Do not overload the site with charts. Use a few charts that do clear work.

Recommended launch charts:

1. Global data center electricity demand: `2024 baseline` to `2030 projection`
2. Prompt/task comparison: `text` vs. `image` vs. `video`
3. Scenario comparison: four user profiles
4. Direct vs. indirect water in data centers

For every chart:

- include a one-sentence takeaway
- include alt text or table fallback
- include a source/method note directly below

## Editorial Rules

### Writing style

- Plain language first
- Short paragraphs
- Explicit caveats
- Avoid sensational phrasing

### Comparison rules

- Do not compare partial AI metrics to full supply-chain consumer metrics without saying so
- Prefer cloud-to-cloud comparisons when possible
- Keep server-only and total-system figures separate
- Keep direct and indirect water separate

### Citation rules

- Every key number must resolve to a source-backed fact record
- Every page should show when it was last reviewed
- Every estimate should say what it is based on

## Accessibility Requirements

- Semantic headings and clean page structure
- High-contrast charts and labels
- Tables or text summaries for charts
- Avoid color-only meaning for status badges
- Large tap targets on mobile
- Plain-language summaries before technical detail

## Update Workflow

### Phase 1: Source review

- Review new source or revised figure
- Decide whether it changes a fact, scenario, or chart
- Assign status: `verified`, `inferred`, `estimated`, or `contested`

### Phase 2: Data update

- Update the canonical fact record
- Update chart CSV/JSON if needed
- Update scenario totals if a component assumption changed

### Phase 3: Public review

- Confirm page copy still matches the updated figure
- Add a short update-log entry
- Refresh page-level `last reviewed` fields

This is why numbers should live in content records, not inside page prose.

## Launch Scope

Launch with:

- Home
- Start Here
- Compare Daily Use
- What a Prompt Costs
- How Data Centers Work
- Benefits and Risks
- Sources and Method
- Resources
- Updates

Do not launch with:

- account system
- comments
- personalized calculator
- real-time data feeds
- faculty pedagogy hub
- downloadable lesson pack

Those can come later if there is actual demand.

## Immediate Build Sequence

1. Approve sitemap and page naming
2. Approve content collections and field names
3. Convert the strongest Section 1-4 claims into structured fact records
4. Convert Section 3 scenarios into structured scenario records
5. Pull chart-ready blocks from the workbook into CSV/JSON
6. Build the homepage and three highest-value pages first:
   - Start Here
   - Compare Daily Use
   - What a Prompt Costs
7. Add sources, method, and updates pages before public release

## Recommendation Summary

If the goal is a credible, updateable public resource, the best launch architecture is:

- an `Astro` static site
- structured content in Git
- scenario-led homepage and navigation
- visible confidence labels on claims
- a maintenance log instead of a blog
- Jon Ippolito's calculator linked as a featured external resource

That gives you a clean v1 and leaves room to add a CMS later without throwing away the site.
