import React from 'react';
import { createRoot } from 'react-dom/client';
import Antigravity from './Antigravity';

const container = document.getElementById('antigravity-container');

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (container) {
  if (!isWebGLAvailable()) {
    container.innerHTML = '<div style="width:100%; height:100%; background: linear-gradient(to bottom, #f8fafc, #e2e8f0); opacity: 0.5;"></div>';
  } else {
    const isMobile = window.innerWidth < 768;
    const root = createRoot(container);
    root.render(
      <div style={{ width: '100%', height: '100%', minHeight: isMobile ? '400px' : '600px', position: 'relative' }}>
        <Antigravity
          count={isMobile ? 100 : 300}
          magnetRadius={isMobile ? 4 : 6}
          ringRadius={isMobile ? 5 : 7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={isMobile ? 1.0 : 1.5}
          lerpSpeed={0.05}
          color="#3b82f6" // Updated to match brand blue
          autoAnimate={true}
          particleVariance={1}
        />
      </div>
    );
  }
}
