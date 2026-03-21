```markdown
# Design System Strategy: The Curated Minimalist

## 1. Overview & Creative North Star: "The Digital Atelier"
This design system is built on the philosophy of **The Digital Atelier**. We are moving away from the cluttered, "row-after-row" template look of traditional e-commerce. Instead, we treat the interface as a high-end physical gallery. 

The goal is **Intentional Spacing over Information Density**. By leveraging generous whitespace and a sophisticated "No-Line" architecture, we create a sense of calm and exclusivity. We break the rigid grid through purposeful asymmetry—allowing high-resolution imagery to bleed off-edge or overlap with floating editorial type—ensuring the brand feels premium, bespoke, and human-centric.

---

## 2. Color Theory & Tonal Depth

Our palette relies on a sophisticated "High-Contrast Dark on Soft Light" approach. We use `primary` (#001819) not just as an accent, but as a weight to ground the airy surfaces.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders (`#000` or `#CCC`) to section off content. 
*   **How to define boundaries:** Shift the background color. Use a `surface_container_low` (#f3f3f3) section to sit against a `surface` (#f9f9f9) background.
*   **The Signature Transition:** Use the `primary_container` (#0f2d2e) for high-impact callouts to create a deep, immersive "well" of color that draws the eye without a physical stroke.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
*   **Base Layer:** `surface` (#f9f9f9) for the overall page.
*   **Mid-Level Content:** `surface_container` (#eeeeee) for secondary sections (e.g., "Recommended for You").
*   **Elevated Components:** Use `surface_container_lowest` (#ffffff) for product cards to make them "pop" naturally against the slightly darker background.

### The "Glass & Gradient" Rule
To avoid a flat, "Bootstrap" feel:
*   **Glassmorphism:** For navigation bars or floating "Quick View" modals, use `surface` with 80% opacity and a 20px backdrop-blur. 
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#001819) to `primary_container` (#0f2d2e) on Hero CTAs to give them a three-dimensional, velvet-like depth.

---

## 3. Typography: Editorial Authority

We use a dual-sans serif pairing to balance modern utility with editorial flair.

*   **Display & Headlines (Manrope):** These are your "hook." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero banners. The goal is an authoritative, bold presence that feels like a fashion magazine.
*   **Body & Labels (Inter):** High-readability utility. Use `body-md` (0.875rem) for product descriptions and `label-md` (0.75rem) in all-caps with increased letter-spacing (+0.05em) for category tags.
*   **Hierarchy Tip:** Never use `on_surface` (#1a1c1c) for everything. Use `on_surface_variant` (#414848) for secondary body text to create a softer visual "gray" that reduces eye strain and increases the premium feel.

---

## 4. Elevation & Depth: Tonal Layering

Shadows are a last resort. Depth should be felt, not seen.

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on top of a `surface_container_low` (#f3f3f3) background. This creates a clean, "natural lift" via contrast rather than artificial shadows.
*   **Ambient Shadows:** If a floating element (like a Cart Drawer) requires a shadow, use a `24px` blur with 4% opacity of the `on_surface` color. It should look like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., Input Fields), use `outline_variant` at **20% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Component Strategy

### Elegant Banners
Use the `20` (7rem) or `24` (8.5rem) spacing tokens for top/bottom padding. Text should be left-aligned or intentionally offset to allow the product photography to breathe. Use `surface_tint` as a subtle overlay if text sits on images.

### Detailed Product Cards
*   **Structure:** No borders. No dividers.
*   **Spacing:** Use `spacing.4` (1.4rem) for internal padding.
*   **Interaction:** On hover, shift the background from `surface_container_lowest` to `surface_bright` and apply an Ambient Shadow.
*   **Corner Radius:** Use `md` (0.375rem) for a modern, sharp-yet-approachable look.

### Buttons & CTAs
*   **Primary:** `primary` (#001819) background with `on_primary` (#ffffff) text. Use `full` roundedness (pill-shape) for a boutique feel.
*   **Secondary:** `surface_container_high` background with `on_surface` text. No border.
*   **Tertiary:** Text-only with a `primary` underline that appears only on hover.

### Form Inputs
*   **Style:** Minimalist underline or `surface_container_low` fill.
*   **State:** When active, the label should transform using `label-sm` and the background should shift to `surface_container_lowest`. Use `error` (#ba1a1a) only for critical validation.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use `spacing.16` (5.5rem) between major sections to let the design breathe.
*   **Do** use asymmetrical layouts (e.g., a large image on the left, a small product detail floating on the right).
*   **Do** use `primary_fixed_dim` for subtle "Sale" or "New" badges.

### Don’t:
*   **Don't** use lines/dividers to separate list items. Use `spacing.3` (1rem) of vertical whitespace instead.
*   **Don't** use pure black (#000) for text. Always use `on_surface` (#1a1c1c).
*   **Don't** cram multiple products into a single row on mobile. Allow products to be large and tactile.
*   **Don't** use high-contrast drop shadows. If you can clearly see where the shadow ends, it’s too dark.```