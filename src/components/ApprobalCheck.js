import ApprovalCheck from './ApprovalCheck.js';

import React from 'react';

export default function ApprovalCheck({ size = 36 }) {
  return (
    <div style={{ width: size, height: size, display: 'inline-block' }}>
      <style>{`
        .acp-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .acp-svg { width: 100%; height: 100%; }
        .acp-ring {
          fill: none;
          stroke: #0d6efd;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 164;
          stroke-dashoffset: 164;
          animation: acp-ring 1s ease-in-out forwards;
          transform-origin: 50% 50%;
        }
        .acp-check {
          fill: none;
          stroke: #0d6efd;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 36;
          stroke-dashoffset: 36;
          animation: acp-draw 0.5s ease-out 0.6s forwards;
        }
        .acp-bg {
          fill: rgba(13,110,253,0.08);
          opacity: 0;
          animation: acp-bgfade 0.3s ease-in 0.4s forwards;
        }

        @keyframes acp-ring {
          0%   { stroke-dashoffset: 164; transform: rotate(0deg); }
          60%  { stroke-dashoffset: 82;  transform: rotate(200deg); }
          100% { stroke-dashoffset: 0;   transform: rotate(360deg); }
        }
        @keyframes acp-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes acp-bgfade {
          to { opacity: 1; }
        }
      `}</style>
      <div className="acp-wrap" aria-label="Aprobado">
        <svg viewBox="0 0 52 52" className="acp-svg">
          <circle className="acp-bg" cx="26" cy="26" r="25" />
          <circle className="acp-ring" cx="26" cy="26" r="26" />
          <path className="acp-check" d="M16 27 L23 34 L37 18" />
        </svg>
      </div>
    </div>
  );
}
