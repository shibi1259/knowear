const service = require("../app/services/loyalty.transaction.service")
const userService = require("../app/services/customer.service")
const timeZone = 'Asia/Kolkata';

async function getTransactions() {
    const transactions = await service.find({ status: 'pending' })
    return transactions
}

async function expiredTransactions() {
    const transactions = await service.find({
        $and: [
            { status: { $ne: 'expired' } },
            { expiry: { $lte: new Date(new Date().setHours(0, 0, 0, 0)).toUTCString() } }
        ]
    })
    return transactions
}

exports.referral = async () => {
    try {
        const transactions = await getTransactions()
        for (const transaction of transactions) {
            const created = new Date(new Date(new Date(transaction?.createdAt).setHours(0, 0, 0, 0)).toLocaleString('en-US', { timeZone }))
            const expiry = new Date(new Date(new Date(transaction?.expiry).setHours(0, 0, 0, 0)).toLocaleString('en-US', { timeZone }))
            const current = new Date(new Date(new Date().setHours(0, 0, 0, 0)).toLocaleString('en-US', { timeZone }))

            console.log(current);
            console.log(created);
            console.log(expiry);

            let loyaltyPoints = Number(transaction?.user?.loyaltyPoints) + Number(transaction?.points)
            const userDetails = await userService.update({ _id: transaction?.user?._id }, { $set: { loyaltyPoints: loyaltyPoints } })
            if (userDetails instanceof Error) {

            } else {
                const transactionDetails = await service.update({ _id: transaction?._id }, { status: 'completed' })
                if (transactionDetails instanceof Error) {

                } else {

                }
            }
        }
    } catch (error) {

    }
}

exports.expiry = async () => {
    try {
        const transactions = await expiredTransactions()
        for (const transaction of transactions) {

        }
    } catch (error) {

    }
}