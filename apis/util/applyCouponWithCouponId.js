const couponService = require("../app/services/coupon.service");

async function applyCouponWithCouponId(couponId) {
    try {

          let  coupon = await couponService.getCouponDetails({ _id: couponId });
        
        console.log("Coupon details:", coupon);
        console.log("Coupon data info:");
        console.log("-------------------------");
        console.log("Start date:", coupon.fromDate.toLocaleString());
        console.log("End date:", coupon.lastDate.toLocaleString());
        console.log("-------------------------");
        if (coupon?.couponType === 'partial') {
            
        }

        if (coupon.couponType === 'complete') {
            if (coupon.type === 'percent') {
                const updatedTotal = cartTotal * (1 - coupon.value / 100);
                console.log("Coupon applied successfully. Updated cart total:", updatedTotal);
                result.cartTotal=updatedTotal;
                result.couponApplied=true;
                result.message="Coupon applied successfully."
                return result;
            } else if (coupon.type === 'amount') {
                const updatedTotal = Math.max(cartTotal - coupon.value, 0);
                console.log("Coupon applied successfully. Updated cart total:", updatedTotal);
                
                result.cartTotal=updatedTotal;
                result.couponApplied=true;
                result.message="Coupon applied successfully."
                return result;
            }
        }




    } catch (error) {
        console.error('Error applying coupon:', error);
        console.log("An error occurred. Returning original cart total:", cartTotal);
        result.cartTotal=cartTotal;
        result.couponApplied=false;
        result.message="An error occurred while applying coupon"
        return result;
    }
}

module.exports = { applyCouponWithCouponId };
