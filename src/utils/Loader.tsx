import React from 'react'

const Loader = () => {
  return (
    <div className='loaders-wrapper'>
      <div className="loader">
        <div className="slider" style={{"--i": 0}as React.CSSProperties} >
        </div>
        <div className="slider" style={{"--i": 1}as React.CSSProperties}>
        </div>
        <div className="slider" style={{"--i": 2}as React.CSSProperties}>
        </div>
        <div className="slider" style={{"--i": 3}as React.CSSProperties}>
        </div>
        <div className="slider" style={{"--i": 4}as React.CSSProperties}>
        </div>
      </div>
    </div>
  )
}

export default Loader
