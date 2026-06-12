'use client';

import React, { forwardRef, useMemo, useRef, useEffect, useCallback } from 'react';
import './VariableProximity.css';

interface VariableProximityProps {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: 'linear' | 'exponential' | 'gaussian';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  [key: string]: any;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 100,
    falloff = 'gaussian',
    className = '',
    onClick,
    style,
    disabled = false,
    ...restProps
  } = props;

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const letterPositions = useRef<Map<number, { x: number; y: number }>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);
  const isInitializedRef = useRef(false);

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr: string) =>
      new Map(
        settingsStr
          .split(',')
          .map(s => s.trim())
          .map(s => {
            const [name, value] = s.split(' ');
            return [name.replace(/['"]/g, ''), parseFloat(value)];
          })
      );

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  const updatePositions = useCallback(() => {
    if (!containerRef?.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef) return;
      const rect = letterRef.getBoundingClientRect();
      letterPositions.current.set(index, {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      });
    });
    isInitializedRef.current = true;
  }, [containerRef]);

  useEffect(() => {
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [updatePositions]);

  useEffect(() => {
    if (disabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!containerRef?.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
      };
    };

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => 
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const calculateFalloff = (distance: number) => {
      const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
      switch (falloff) {
        case 'exponential':
          return norm ** 2;
        case 'linear':
          return norm;
        case 'gaussian':
        default:
          return Math.exp(-((distance / (radius / 2.5)) ** 2) / 2);
      }
    };

    const animate = () => {
      if (!isInitializedRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Smooth interpolation of mouse position (lerp)
      const smoothing = 0.08;
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * smoothing;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * smoothing;

      // Only update DOM at 30fps to prevent jitter
      const now = Date.now();
      if (now - lastUpdateRef.current > 33) {
        lastUpdateRef.current = now;
        
        const { x, y } = currentMouseRef.current;

        letterRefs.current.forEach((letterRef, index) => {
          if (!letterRef) return;
          
          const pos = letterPositions.current.get(index);
          if (!pos) return;

          const distance = calculateDistance(x, y, pos.x, pos.y);

          if (distance >= radius) {
            if (letterRef.style.fontVariationSettings !== fromFontVariationSettings) {
              letterRef.style.fontVariationSettings = fromFontVariationSettings;
            }
            return;
          }

          const falloffValue = calculateFalloff(distance);
          const newSettings = parsedSettings
            .map(({ axis, fromValue, toValue }) => {
              const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
              return `'${axis}' ${interpolatedValue}`;
            })
            .join(', ');

          if (letterRef.style.fontVariationSettings !== newSettings) {
            letterRef.style.fontVariationSettings = newSettings;
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [containerRef, radius, falloff, disabled, parsedSettings, fromFontVariationSettings]);

  const words = label.split(' ');
  let globalLetterIndex = 0;

  return (
    <span
      ref={ref}
      className={`${className} variable-proximity ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      style={{ display: 'inline', ...style }}
      {...restProps}
    >
      {words.map((word: string, wordIndex: number) => (
        <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split("").map((letter: string) => {
            const currentLetterIndex = globalLetterIndex++;
            return (
              <span
                key={currentLetterIndex}
                ref={el => {
                  letterRefs.current[currentLetterIndex] = el;
                }}
                style={{
                  display: 'inline-block',
                  fontVariationSettings: fromFontVariationSettings,
                  willChange: 'font-variation-settings'
                }}
                aria-hidden="true"
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && <span style={{ display: 'inline-block' }}>&nbsp;</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
});

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;
