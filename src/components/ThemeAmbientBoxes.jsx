import React from 'react';

/**
 * Reusable Theme Ambient Background Elements
 * Renders the two decorative geometric ambient circles from the design system:
 * - Box 1: 420x420 circle with 60px accent border (rgba(255,122,89,0.14)) at right: -140, top: -180
 * - Box 2: 180x180 circle with soft background (rgba(255,255,255,0.04)) at right: 160, bottom: -110
 */
export default function ThemeAmbientBoxes({ style = {}, isFixed = true }) {
  const pos = isFixed ? 'fixed' : 'absolute';
  return (
    <div
      aria-hidden="true"
      style={{
        position: pos,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          right: -140,
          top: -130,
          border: '60px solid rgba(255, 122, 89, 0.14)',
          pointerEvents: 'none',
          ...style.box1
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          left: -140,
          top: 180,
          border: '60px solid rgba(255, 122, 89, 0.14)',
          pointerEvents: 'none',
          ...style.box1
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          left: 420,
          bottom: -140,
          border: '60px solid rgba(255, 122, 89, 0.14)',
          pointerEvents: 'none',
          ...style.box1
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          right: -10,
          bottom: 110,
          backgroundColor: 'rgba(3, 227, 167, 0.04)',
          pointerEvents: 'none',
          ...style.box2
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          right: 1200,
          bottom: 200,
          backgroundColor: 'rgba(3, 227, 167, 0.04)',
          pointerEvents: 'none',
          ...style.box2
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          left: -1100,
          bottom: 110,
          backgroundColor: 'rgba(227, 3, 3, 0.04)',
          pointerEvents: 'none',
          ...style.box2
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          left: -160,
          bottom: 110,
          backgroundColor: 'rgba(227, 3, 3, 0.04)',
          pointerEvents: 'none',
          ...style.box2
        }}
      />
    </div>
  );
}
