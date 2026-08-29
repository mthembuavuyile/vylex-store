<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Vylex Store UI & Brand Design Rules (MANDATORY)

When creating or modifying pages, components, or styles in `vylex-store`:

1. **NO AI Anti-Patterns**:
   - **NEVER** add floating pill badges with emojis (e.g. `✨ South Africa's Trusted Online Store`, `Direct SA Stock`, `Our Brand Story`).
   - **NEVER** write AI fluff/cliché marketing copy (e.g. "Elevate your lifestyle", "Transform your tech", "Unleash power"). Use honest, functional South African retail copy.
   - **NEVER** create nested card hell (never wrap cards inside cards inside cards). Use open editorial layouts with generous whitespace (`line-height: 1.7`).
   - **NEVER** add unnecessary glassmorphism, radial glow grids, rainbow gradients, or pulsing dots.
   - **NEVER** add fake hardcoded star reviews or corner badges to product cards.

2. **Mobile & Table Responsiveness**:
   - Every data table MUST be wrapped in `.table-responsive-container` (`overflow-x: auto; -webkit-overflow-scrolling: touch;`) so text never clips on mobile screens.
   - Mobile product grid must remain a clean 2-column layout.
   - Containers must maintain `16px` padding on mobile, `24px` on desktop with max-width `1200px`.

3. **Refer to Workspace Skill**:
   - Refer to [.agents/skills/vylex-ui-standards/SKILL.md](file:///c:/Users/mthem/Dev/vylex-store/.agents/skills/vylex-ui-standards/SKILL.md) for full design system tokens, typography, and component specifications.

