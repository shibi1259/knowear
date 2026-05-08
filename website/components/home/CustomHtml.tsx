'use client';
import WidgetHeader from '@/app/shared/widget-header/WidgetHeader';
import React from 'react'

type Props = {
    widgetDetails: any
}

const CustomHtml = ({ widgetDetails }: Props) => {
    console.log(widgetDetails);

    return (
        <div className='container max-w-full'>
            <WidgetHeader widgetDetails={widgetDetails} />
            <div style={widgetDetails?.styles}>
                <div dangerouslySetInnerHTML={{ __html: widgetDetails?.html }}></div>
            </div>
        </div>
    )
}

export default CustomHtml