import React from 'react';
import { createRoot } from 'react-dom/client';
import InteractiveButton from './src/InteractiveButton';
import InteractiveCard from './src/InteractiveCard';

const initInteractiveElements = () => {
  // We can't easily replace every static element without a full React app
  // but we can target specific high-impact ones.

  // Example: Hero CTA
  const heroCtaContainer = document.querySelector('.hero-section .duo-btn-primary')?.parentElement;
  if (heroCtaContainer) {
    // This is a bit tricky since we don't want to break existing layouts/links
    // For now, let's focus on mounting new components or wrapping where safe.
  }
};

// Target Curriculum Cards
const curriculumCards = document.querySelectorAll('#curriculum article');
curriculumCards.forEach((card, index) => {
  const container = document.createElement('div');
  card.parentNode.insertBefore(container, card);
  const root = createRoot(container);

  // Clone original content and classes
  const classes = card.className;
  const content = card.innerHTML;

  card.remove();

  root.render(
    <InteractiveCard className={classes}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </InteractiveCard>
  );
});

// Target Mentor Cards
const mentorCards = document.querySelectorAll('#mentors article');
mentorCards.forEach((card, index) => {
    const container = document.createElement('div');
    card.parentNode.insertBefore(container, card);
    const root = createRoot(container);

    const classes = card.className;
    const content = card.innerHTML;

    card.remove();

    root.render(
      <InteractiveCard className={classes} transition={{ delay: index * 0.1 }}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </InteractiveCard>
    );
});

// Target Main CTA Buttons
const primaryButtons = document.querySelectorAll('.duo-btn-primary, .duo-btn-accent');
primaryButtons.forEach((btn) => {
    // Skip if already handled or inside a react root
    if (btn.closest('#headline-container')) return;

    const container = document.createElement('span');
    btn.parentNode.insertBefore(container, btn);
    const root = createRoot(container);

    const classes = btn.className;
    const content = btn.innerHTML;
    const href = btn.getAttribute('href');
    const id = btn.id;

    btn.remove();

    if (href) {
        root.render(
            <InteractiveButton className={classes} onClick={() => window.location.href = href} id={id}>
                <div className="flex items-center" dangerouslySetInnerHTML={{ __html: content }} />
            </InteractiveButton>
        );
    } else {
        root.render(
            <InteractiveButton className={classes} id={id}>
                <div className="flex items-center" dangerouslySetInnerHTML={{ __html: content }} />
            </InteractiveButton>
        );
    }
});
