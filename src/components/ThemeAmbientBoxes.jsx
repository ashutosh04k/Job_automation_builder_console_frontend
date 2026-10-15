import React from 'react';

/**
 * Reusable Theme Ambient Background Elements
 * Renders the two decorative geometric ambient circles from the design system:
 * - Box 1: 420x420 circle with 60px accent border (rgba(255,122,89,0.14)) at right: -140, top: -180
 * - Box 2: 180x180 circle with soft background (rgba(255,255,255,0.04)) at right: 160, bottom: -110
 */
export default function ThemeAmbientBoxes({ style = {} }) {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          right: -140,
          top: -180,
          border: '60px solid rgba(255, 122, 89, 0.14)',
          pointerEvents: 'none',
          zIndex: 0,
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
          right: 160,
          bottom: -110,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          pointerEvents: 'none',
          zIndex: 0,
          ...style.box2
        }}
      />
    </>
  );
}
