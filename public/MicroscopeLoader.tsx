// MicroscopeLoader.tsx
import React from 'react';
import '../src/App.css'; // if App.css is in src/

import microscopeImg from '../src/assets/microscope_loader.png';

const MicroscopeLoader = () => {
  return (
    <div className="microscope-loader-wrapper">
      <img src={microscopeImg} alt="Loading..." className="microscope-loader" />
      {/* <p className="loading-text">🔄 Please Wait...</p> */}
      <p className="loading-text">
        <span className="rotating-emoji">⌛</span> Just a Moment...
      </p>

    </div>
  );
};

export default MicroscopeLoader;
