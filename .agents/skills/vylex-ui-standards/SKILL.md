---
name: vylex-ui-standards
description: >-
  Enforces clean, realistic, professional UI/UX, typography, and copywriting standards
  for Vylex Store. Use this skill whenever creating new pages, editing components,
  styling layouts, or adding copy to ensure AI anti-patterns (floating pills, emojis,
  nested cards, fluff copy, glassmorphism, excessive animations) are never introduced.
---

# Vylex Store UI & Brand Design Standards

This skill defines the strict visual, architectural, and copywriting standards for `vylex-store`. All agents modifying or creating pages must adhere to these principles.

---

## 1. Strictly Banned AI Anti-Patterns 🚫

Never introduce the following clichés into this codebase:

| Banned Pattern | What to AVOID | What to DO INSTEAD |
| :--- | :--- | :--- |
| **Floating Pill Badges** | Orange floating pill badges with emojis (e.g. `✨ South Africa's Trusted Online Store`, `Direct SA Stock`, `Our Brand Story`) | Use clean `PageHeader` with simple breadcrumbs, crisp `<h1>`, and an optional muted 1-line subtitle. |
| **Fluff & Cliché Copy** | "Elevate your lifestyle", "Transform your tech journey", "Unleash the ultimate power", "Experience the magic" | Write honest, functional, direct copy: "Safety-certified power banks and GaN chargers dispatched nationwide from Johannesburg." |
| **Nested Card Hell** | Cards inside cards inside cards (e.g. `section-card` > `grid-card` > `item-card` > `detail-card`) | Use open editorial layouts with generous whitespace (`margin-bottom: 36px`), clean headings, and direct text flows. |
| **Fake Reviews & Badges** | Hardcoded star badges (`★ 4.9 (48)`) or corner `Express Delivery` pills on every card | Clean, unadorned product cards with 1:1 image, category, title, real Rand pricing, and quick-add button. |
| **Visual Clutter** | Glassmorphism blur layers, glowing radial dot grids, rainbow gradients, pulsing lights | Clean, high-contrast surfaces (`#FFFFFF`, `#F8FAFC`, `#051B38`), subtle slate borders (`#E2E8F0`), and purposeful typography. |
| **Clipped Mobile Tables** | Fixed-width tables that overflow or cut off text on mobile screens | Always wrap data tables in `.table-responsive-container` (`overflow-x: auto; -webkit-overflow-scrolling: touch;`). |

---

## 2. Design System Tokens & Color Usage

- **Primary Brand Navy**: `#051B38` (Used for headers, dark hero accents, main headings, primary text).
- **Accent Warm Orange**: `#FBA919` / Hover: `#E2930E` (Used **strictly** for primary CTA buttons and important action highlights — never as floating label pills on every section).
- **Backgrounds**: Light `#F8FAFC` / Surface `#FFFFFF` / Dark `#030F20`.
- **Borders**: `#E2E8F0` (subtle, clean, 1px).
- **Muted Text**: `#64748B` (clean secondary info and labels).
- **Success / WhatsApp Green**: `#10B981` / `#16A34A` / `#22C55E`.

---

## 3. Layout & Responsiveness Rules

1. **Containers & Spacing**:
   - Max-width: `1200px` (`.container`).
   - Mobile padding: `16px`.
   - Desktop padding: `24px`.
   - Never add double nested container paddings on mobile.
2. **Editorial & Content Pages** (About, Shipping, Refund, Terms, Contact):
   - Use `.editorial-container` and `.editorial-layout`.
   - Main content must use open paragraphs (`line-height: 1.7`) with max-width readability.
   - Clean sidebar (`.editorial-sidebar-clean`) for key facts and direct CTAs.
3. **Product Grids**:
   - Mobile (`< 768px`): 2 columns (`repeat(2, 1fr)`) with `12px-14px` gap.
   - Tablet (`768px - 1024px`): 3 columns (`repeat(3, 1fr)`).
   - Desktop (`> 1024px`): 4 columns (`repeat(4, 1fr)`).
4. **Hero Sections**:
   - Must fit cleanly in laptop/desktop viewports without awkward vertical stretching.
   - Balanced 2-column layout (Text + CTA on left, well-proportioned product showcase on right).

---

## 4. Checklist for Any New Page or Component

Before completing any changes, verify:
- [ ] Are there any floating orange pill badges or sparkle emojis? *(Remove them)*
- [ ] Is there card nesting deeper than 1 level? *(Flatten into open layout)*
- [ ] Does any table clip or truncate text on mobile? *(Wrap in `.table-responsive-container`)*
- [ ] Is the copy realistic, concise, and focused on South African retail realities?
- [ ] Does `npm run build` pass with 0 errors?
