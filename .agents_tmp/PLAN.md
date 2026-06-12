# 1. OBJECTIVE

Improve the CeTech Academy website UI by:
1. **Remove VariableProximity** - Replace glitchy mouse-tracking text with a smooth static gradient effect
2. **Fix Antigravity interaction** - Make floating task cards work without hovering over 3D particles
3. **Add Duolingo-style buttons** - Change most buttons to a friendly, rounded style while keeping Sign In/Get Started buttons unchanged

# 2. CONTEXT SUMMARY

**Files to modify:**
- `app/page.tsx` - Landing page (hero section, buttons)
- `src/components/VariableProximity.tsx` - Remove/replace
- `src/components/Antigravity.tsx` - Fix interaction
- `src/styles/globals.css` - Add new button styles

**Design direction:** 
- Keep current dark space aesthetic with electric blue/cyan accents
- Make buttons more friendly and approachable (Duolingo-inspired: rounded, soft, bouncy)
- Keep SIGN IN / GET STARTED buttons in the Navbar as they are (current 3D style)

# 3. APPROACH OVERVIEW

1. **Replace VariableProximity** with a static animated gradient text that looks premium without mouse tracking
2. **Fix Antigravity** by making it non-interactive for pointer events, so floating cards work independently
3. **Create Duolingo-style button class** (`.duo-btn-fun`) for general use - rounded corners, soft shadows, bouncy hover
4. **Update all page buttons** (except Sign In/Get Started) to use the new fun button style

# 4. IMPLEMENTATION STEPS

### Step 1: Replace VariableProximity in hero
**Goal:** Replace glitchy text effect with a smooth animated gradient
**Method:** 
- In `app/page.tsx`, replace the `<VariableProximity>` component with a styled `<h1>` using CSS gradient animation
- Remove VariableProximity import if no longer needed

### Step 2: Fix Antigravity pointer events
**Goal:** Make floating cards work without hovering over particles
**Method:**
- In `Antigravity.tsx`, add `pointer-events: none` to the Canvas
- This allows clicks/hovers on elements above the 3D scene

### Step 3: Add Duolingo-style button CSS
**Goal:** Create a friendly, rounded button style
**Method:** In `globals.css`, add `.duo-btn-fun` class:
- Border-radius: 9999px (pill shape) or 16px
- Softer shadow (no 3D depth effect)
- Scale + bounce animation on hover
- Softer colors, more approachable feel

### Step 4: Update page buttons
**Goal:** Apply new button style to appropriate buttons
**Method:**
- Update buttons on: home page (hero CTA), payment page, portal page
- Keep Navbar's Sign In/Get Started buttons unchanged
- Add the new `.duo-btn-fun` class to secondary actions

# 5. TESTING AND VALIDATION

- **Hero text**: Should display smoothly without flickering or glitching on mouse move
- **Floating cards**: Should animate and be hoverable without interacting with 3D particles
- **Buttons**: 
  - Navbar buttons (Sign In/Get Started) = unchanged 3D style
  - Other buttons = new rounded, bouncy Duolingo style
  - All buttons should have smooth hover/click animations
