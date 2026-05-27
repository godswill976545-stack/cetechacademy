'use client';

import React, { useEffect, useRef } from 'react';

export default function SectionReveal({ children, className = '', stagger = 0 }: { children: React.ReactNode, className?: string, stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`section-reveal ${className}`}
      style={stagger ? { transitionDelay: `${stagger * 100}ms` } : {}}
    >
      {children}
    </div>
  );
}
