import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import BorderGlow from './BorderGlow';

const MountGlow = ({ domNode }) => {
  const domRef = useRef({ current: domNode });
  const isMint = domNode.classList.contains('duo-btn-primary') || domNode.classList.contains('duo-btn-accent');
  const glowColor = "217 91 60";
  const colors = ['#3b82f6', '#ffffff', '#93c5fd'];
  
  return (
    <BorderGlow
      targetRef={domRef}
      edgeSensitivity={0}
      glowColor={glowColor}
      backgroundColor="transparent"
      borderRadius="inherit"
      glowRadius={25}
      glowIntensity={2.5}
      coneSpread={30}
      animated={false}
      colors={colors}
      fillOpacity={0}
    />
  );
};

export function initBorderGlow() {
  const selectors = ['.glow-target', '.btn-glow'];
  const buttons = document.querySelectorAll(selectors.join(', '));
  
  buttons.forEach(btn => {
    if (btn.querySelector('.border-glow-layer')) return;

    // Ensure the target has a positioning context for the absolute layer
    const style = window.getComputedStyle(btn);
    if (style.position === 'static') {
      btn.style.position = 'relative';
    }
    // Ensure overflow visible so glow can bleed out
    if (style.overflow === 'hidden') {
      btn.style.overflow = 'visible';
    }

    const layerRoot = document.createElement('div');
    // We want the root itself to have no layout impact
    layerRoot.style.display = 'contents';
    btn.appendChild(layerRoot);
    
    const root = createRoot(layerRoot);
    root.render(<MountGlow domNode={btn} />);
  });
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBorderGlow);
} else {
  initBorderGlow();
}
