import React from 'react'

const Cross3 = ({ ...props }) => {
    return (
        <svg { ...props } width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 17L17 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17 17L1 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export default Cross3
