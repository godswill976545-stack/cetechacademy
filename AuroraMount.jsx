import React from 'react';
import { createRoot } from 'react-dom/client';
import Aurora from './Aurora';

const container = document.getElementById('aurora-bg');

if (container) {
  const root = createRoot(container);
  root.render(
    <Aurora
      colorStops={['#f8fafc', '#3b82f6', '#ffffff']}
      blend={0.6}
      amplitude={1.0}
      speed={0.5}
    />
  );
}
