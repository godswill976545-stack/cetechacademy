import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import VariableProximity from './VariableProximity';

const HeadlineApp = () => {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <VariableProximity
        label="Master the Digital Craft. Build the Future."
        className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-gradient"
        fromFontVariationSettings="'wght' 400"
        toFontVariationSettings="'wght' 700"
        containerRef={containerRef}
        radius={window.innerWidth < 768 ? 100 : 150}
        falloff="gaussian"
      />
    </div>
  );
};

const container = document.getElementById('headline-container');

if (container) {
  // Clear the static h1 before rendering the interactive version
  // to avoid hydration mismatch if needed, or just replace it.
  container.innerHTML = '';
  const root = createRoot(container);
  root.render(<HeadlineApp />);
}
