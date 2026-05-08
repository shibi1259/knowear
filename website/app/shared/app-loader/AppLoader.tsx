import { ThemeContext } from '@/providers/theme/ThemeContext';
import React from 'react'

//TODO: set loader primary color
const AppLoader = ({width="100",height="100"}) => {
  const primary = 'var(--primary)'
  return (
    <div className='mx-auto table'>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width={width} height={height} style={{shapeRendering: 'auto', display: 'block', background: 'transparent'}} xmlnsXlink="http://www.w3.org/1999/xlink"><g><circle strokeDasharray="75.39822368615503 27.132741228718345" r="16" strokeWidth="4" stroke={primary} fill="none" cy="50" cx="50">
        <animateTransform keyTimes="0;1" values="0 50 50;360 50 50" dur="1.25s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform>
      </circle><g></g></g></svg>
    </div>
  )
}

export default AppLoader