# DESIGN.md

## Color Strategy: Committed (Electric Blue Redesign)
- **Base**: White (`#ffffff`) - Primary background.
- **Accent**: Electric Blue (`#007bff`) - The primary blue from the new hexagonal logo.
- **Secondary Accent**: Cyan (`#00d2ff`) - From the logo's gradient, used for highlights and active states.
- **Neutrals**: Deep Space Blue (`#070b10`) and Slate 50-200.

## Typography
- **Headings**: Clash Display / Space Grotesk (Bold, -0.02em tracking, Deep Space Blue)
- **Body**: Inter (300-600 weight, Slate 700-900)
- **Scale**: Geometric scale with ≥1.25 ratio.

## Components
- **Glass Panels**: `rgba(255, 255, 255, 0.7)` with 24px blur and subtle blue borders (`rgba(0, 123, 255, 0.15)`).
- **Buttons**: `btn-glow` with electric blue gradients and white text.
- **Interactive Cards**: Hover states with Y-translation and blue glow reinforcement.

## Motion
- **Entrance**: `slide-up` with cubic-bezier(0.16, 1, 0.3, 1).
- **Ambient**: `pulse-glow` and `float` for background elements.
- **Ease**: Exponential curves (ease-out-expo).

## Layout
- **Spacing**: 80px (py-20) to 128px (py-32) for sections.
- **Grid**: 12-column system, max-width 7xl (1280px).

## Accessibility (WCAG 2.1 AA)
- **Contrast**: All interactive elements maintain a contrast ratio of ≥4.5:1 against their backgrounds using OKLCH color space.
- **Aria Labels**: Dynamic elements (buttons, inputs) use `aria-live` and `aria-label` to communicate state changes to screen readers.
- **Keyboard Navigation**: Enhanced focus-visible states with high-visibility rings.
- **Form Feedback**: Error and success states are communicated through color, icons, and text to ensure usability for users with color vision deficiencies.
