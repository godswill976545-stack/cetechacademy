import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import BorderGlow from './BorderGlow';

const DOMWrapper = ({ domNode }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && domNode) {
      ref.current.appendChild(domNode);
    }
  }, [domNode]);
  return <div ref={ref} style={{ display: 'contents' }} />;
};

const MountGlow = ({ domNode }) => {
  const style = window.getComputedStyle(domNode);
  const borderRadius = parseInt(style.borderRadius) || 28;
  
  const isMint = domNode.classList.contains('duo-btn-primary') || domNode.classList.contains('duo-btn-accent');
  const glowColor = isMint ? "217 91 60" : "217 91 60";
  const colors = isMint ? ['#3b82f6', '#ffffff', '#93c5fd'] : ['#3b82f6', '#ffffff', '#93c5fd'];
  
  return (
    <BorderGlow
      edgeSensitivity={0}
      glowColor={glowColor}
      backgroundColor="transparent"
      borderRadius={borderRadius}
      glowRadius={25}
      glowIntensity={2.5}
      coneSpread={30}
      animated={false}
      colors={colors}
      fillOpacity={0}
      className="inline-flex pointer-events-none" // Prevent blocking clicks
    >
      <div className="pointer-events-auto">
        <DOMWrapper domNode={domNode} />
      </div>
    </BorderGlow>
  );
};

export function initBorderGlow() {
  // Target only specific elements for the high-end glow effect
  // Avoid wrapping all buttons by default to ensure maximum stability
  const selectors = [
    '.glow-target',
    '.btn-glow'
  ];
  
  const buttons = document.querySelectorAll(selectors.join(', '));
  
  buttons.forEach(btn => {
    // Skip if already processed or if it's inside another glow
    if (btn.closest('.border-glow-card')) return;

    const wrapper = document.createElement('div');
    // Maintain display flow
    const isFullWidth = btn.classList.contains('w-full') || btn.classList.contains('btn-block');
    wrapper.style.display = isFullWidth ? 'block' : 'inline-block';
    if (isFullWidth) wrapper.style.width = '100%';
    
    btn.parentNode.insertBefore(wrapper, btn);
    
    const root = createRoot(wrapper);
    root.render(<MountGlow domNode={btn} />);
  });
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBorderGlow);
} else {
  initBorderGlow();
}
