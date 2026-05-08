const service = require("../../app/services/order.service")

exports.tagChecker = async (customer) => {
    try {
        const orders = await service.getOrderCounts({ customerId: customer })
        let tag = null
        orders > 0 ? tag = 'repeated' : tag = null
        return tag
    } catch (error) {
        return error
    }
}