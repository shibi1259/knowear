const settingsService = require("../../services/general.settings.service");
const cron = require("node-cron");
const customerService = require("../../services/customer.service");
const referralService = require("../../services/referral.service");

async function addReferralBonus(customerDetails,cartTotal=0) {
    try {
        const referralSettings = await referralService.findOne({ slug: 'referral' })
        let referredUser = customerDetails?.referralSource?.user;
        let codeUsed = customerDetails?.referralSource?.code;
        
        // Validating referral code used
        if(codeUsed !== referredUser?.referralCode){
            console.log("referral code not matched");
            return;
        }
        //validating minimum purchase
        if(cartTotal < Number(referralSettings?.minimumPurchase) ) {
            console.log("didn't reached minimum purchase, try next time");
            return;
        }
        let currentWalletBalance = Number(referredUser?.walletBalance) || 0; 
        let referralBonus = Number(referralSettings?.referralBonus) || 0;
        let newWalletBalance = currentWalletBalance + referralBonus;
        await customerService.findByIdAndUpdate(referredUser?._id ,{walletBalance:newWalletBalance});
        
        //send notification if needed...

        
    } catch (error) {
        console.log("Error in addReferralBonus utility function:", error);
    }
}

module.exports = {
    addReferralBonus
};
