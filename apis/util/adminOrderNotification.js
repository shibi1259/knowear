const service = require("../app/services/mailer.service")
const templates = require("./templates")
const { sendMail } = require("./sendMail")

exports.adminPlaceOrderNotification = async (orderDetails) => {
    const mailers = await service.findOne({ refid: '1' })
    const emails = mailers?.orderTransactions
    const subject = `New Order ${orderDetails?.orderNo}`
    const template = templates.adminPlaceOrderNotification(orderDetails)
    const content = `New Order ${orderDetails?.orderNo}`
    let mailerResponse = []
    emails?.map(async (email) => {
        const response = await sendMail(email, subject, content, template)
        mailerResponse.push(response)
    })

    return mailerResponse
}