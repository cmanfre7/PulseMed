## Changelog

### 0.1.2 — 2025-12-19

- **Visual design overhaul**
  - Replaced dark/neon color scheme with professional healthcare palette (medical blue + slate).
  - Updated all accent colors from neon emerald/cyan to professional blue tones.
  - Removed glow effects and neon shadows for cleaner, clinical aesthetic.
  - Changed backgrounds from pure black to softer slate-900.
- **Content and messaging refinements**
  - Emphasized "built by physicians" (not just "in collaboration with") throughout.
  - Added "no autonomous decision making" explicitly to main description.
  - Updated hero badge to "A physician-controlled medical AI platform, deployed in live clinical settings."
  - Replaced redundant factoid cards with framing box: "Designed to withstand clinical, legal, and operational review."
  - Tightened pillar descriptions for better scannability.
- **User experience improvements**
  - Swapped CTA button order: "Explore the architecture" now primary, "Schedule a demo" secondary.
  - Added "Read more" expandable functionality to conversation panel AI response.
  - Updated conversation example to respiratory assessment scenario with more detailed, empathetic response.
- **Metrics section updates**
  - Reframed metrics to emphasize restraint: "0 Autonomous clinical decisions made. Zero."
  - Updated language to focus on what the system doesn't do rather than achievements.
  - Added risk committee framing: "Designed to pass risk committee review, not marketing decks."

### 0.1.1 — 2025-12-19

- **Tone and messaging refinement**
  - Replaced startup-oriented language with clinical, operational copy throughout the landing page.
  - Updated hero headline from "The AI infrastructure physicians actually trust" to "An AI system constrained by physician-owned sources and auditable outputs."
  - Revised hero subhead to emphasize physician-defined boundaries and explicit separation from autonomous clinical decision-making.
  - Updated architecture section header to "Architecture designed to keep clinical teams in control."
  - Replaced "Progressive learning, physician gatekept" with "Physician-reviewed iteration — no autonomous behavior changes" to clarify medico-legal boundaries.
  - Refined "Humanistic interaction layer" to "Emotionally appropriate, clinically restrained communication" with emphasis on supporting—not replacing—clinical judgment.
  - Updated CTA section and navigation buttons to use clinical terminology ("Schedule a clinical demo", "Contact clinical operations").
  - Adjusted credibility section to emphasize clinical collaboration and strict boundaries around decision-making and data handling.

### 0.1.0 — 2025-12-19

- **Project structure**
  - Established `web/` for the PulseMed marketing + product UI and `platform/` for backend and infrastructure.
  - Kept a single canonical `Markdowns/` directory at the project root for business and technical docs.
- **Web frontend scaffold**
  - Generated a Next.js 16 App Router project with TypeScript and Tailwind CSS in `web/`.
  - Configured base metadata and global theming to align with PulseMed branding.
- **Landing page experience**
  - Implemented a dark, premium hero section with PulseMed branding, CTAs, and a glassmorphism “live conversation” panel.
  - Added an architecture section highlighting the three core pillars: physician-curated knowledge, progressive learning, and humanistic interaction.
  - Added a credibility/metrics section with illustrative visuals that communicate impact without exposing proprietary implementation details.
  - Added a high-impact early-access call-to-action band tailored for practices and clinical buyers.


