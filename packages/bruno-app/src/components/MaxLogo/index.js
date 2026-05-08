import React from 'react';
import maxCatLogo from 'assets/max-cat-logo.png';

const MaxLogo = ({ width = 72, className = '' }) => {
  return (
    <img
      src={maxCatLogo}
      width={width}
      height={width}
      className={className}
      alt="Max"
      draggable={false}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
};

export default MaxLogo;
