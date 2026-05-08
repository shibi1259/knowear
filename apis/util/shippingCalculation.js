const service = require("../app/services/shipping.service")

exports.calculation = async (charges, total) => {
    try {
        let amount = 0
        let shippingCharge = 0
        const shippingDetails = await service.findOne({ refid: '1' })

        if (shippingDetails?.amount) {
            let threshold = shippingDetails?.amount;
            if (total >= threshold) { shippingDetails.cost = "free" }
        }

        switch (shippingDetails?.cost) {
            case 'total':
                for (let charge of charges) shippingCharge += charge
                break
            case 'highest':
                charges?.length > 0 ? shippingCharge = Math.max(...charges) : shippingCharge = 0;
                break
            case 'lowest':
                charges?.length > 0 ? shippingCharge = Math.min(...charges) : shippingCharge = 0;
                break
            case 'free':
                shippingCharge = 0
                break
            case 'minimum':
                if (total < Number(shippingDetails?.amount)) {
                    shippingCharge = Number(shippingDetails?.charge)
                } else {
                    shippingCharge = 0
                }
                break
            default:
                shippingCharge = 0
                break
        }

        amount = shippingCharge + total
        if (isNaN(amount) || amount < 0) { amount = total }
        if (isNaN(shippingCharge) || shippingCharge < 0) { shippingCharge = 0 }

        return { amount, shippingCharge }
    } catch (error) {
        return error
    }
}