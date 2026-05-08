const customerService = require('../../../app/services/customer.service')

async function updateUserWalletAndLoyalty(userid, customerDetails, cartDetails) {
    try {
        let newUserDataForUpdation = {};
    let currentWalletBalance = customerDetails?.walletBalance || 0;
    let currentLoyaltyPoints = customerDetails?.loyaltyPoints || 0;

    let newWalletBalance = Number(currentWalletBalance) - Number(cartDetails.walletDiscount.amount);
    let newLoyaltyPoints = Number(currentLoyaltyPoints) - Number(cartDetails.loyaltyDiscount.amount);

    newWalletBalance < 0 ? newWalletBalance = 0 : null;
    newLoyaltyPoints < 0 ? newLoyaltyPoints = 0 : null;

    newUserDataForUpdation.walletBalance = newWalletBalance;
    newUserDataForUpdation.loyaltyPoints = newLoyaltyPoints;

    await customerService.updateCustomer(userid, newUserDataForUpdation);
    console.log("updated user wallet and loyalty");
    return true
    } catch (error) {

        console.log("error caught in order place  utility : ",error);
        return false;
    }

}

module.exports = { updateUserWalletAndLoyalty }