'use client';
import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

type Props = {}

const AvailableCoupons = (props: Props) => {
    const [open, setOpen] = useState(false)

    return (
        <div>
            <div>
                <Sheet>
                    <SheetTrigger>Apply Coupon</SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle className='text-2xl'>Available Coupons</SheetTitle>
                        </SheetHeader>
                        <div>

                        </div>
                        <div>
                            
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}

export default AvailableCoupons