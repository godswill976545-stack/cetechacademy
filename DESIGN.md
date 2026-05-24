# DESIGN.md

## Color Strategy: Committed (Deep Space Aurora)
- **Base**: Deep Space Blue (`#020617` / `brand-950`) - Primary background for all surfaces.
- **Accent**: Electric Blue (`#007bff`) - Primary action color, high-contrast buttons.
- **Secondary Accent**: Cyan (`#00d2ff`) - Highlights, active states, and glow effects.
- **Neutrals**: Slate 200-500 for body text, Slate 800 for borders and subtle panels.

## Typography
- **Headings**: Space Grotesk (Bold, -0.02em tracking, White/Slate 50)
- **Body**: Inter (300-600 weight, Slate 400)
- **Scale**: Geometric scale with ≥1.25 ratio.

## Components
- **Glass Panels**: `rgba(15, 23, 42, 0.6)` with 24px blur, `border: 1px solid rgba(255, 255, 255, 0.1)`.
- **Buttons (duo-btn)**: 
    - Primary: Electric Blue (`#007bff`) background, White text, high contrast.
    - Secondary: White/Slate 50 background, Electric Blue text.
- **Interactive Cards**: Deep dark backgrounds, subtle borders, hover states with Y-translation and cyan glow.
- **Aurora Background**: Fixed inset-0, opacity 70, animated gradients + ambient orbs for depth.

## Motion
- **Entrance**: `slide-up` with cubic-bezier(0.16, 1, 0.3, 1).
- **Ambient**: `pulse-glow` and `float` for background elements.
- **Ease**: Exponential curves (ease-out-expo).

## Layout
- **Spacing**: 80px (py-20) to 128px (py-32) for sections.
- **Grid**: 12-column system, max-width 7xl (1280px).

## Accessibility (WCAG 2.1 AA)
- **Contrast**: All interactive elements maintain a contrast ratio of ≥4.5:1 against their backgrounds.
- **Aria Labels**: Dynamic elements use `aria-live` and `aria-label`.
- **Keyboard Navigation**: Enhanced focus-visible states with high-visibility rings.
- **Form Feedback**: Error and success states use color, icons, and text.
