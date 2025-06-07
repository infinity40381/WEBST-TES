import React from 'react';

const Gamepad: React.FC = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="12" y1="12" x2="12" y2="12" />
      <line x1="14" y1="7.5" x2="14" y2="7.5" />
      <line x1="16" y1="10" x2="16" y2="10" />
      <line x1="14" y1="12.5" x2="14" y2="12.5" />
      <line x1="6" y1="12" x2="6" y2="12" />
      <line x1="6" y1="10" x2="8" y2="10" />
    </svg>
  );
};

export default Gamepad;