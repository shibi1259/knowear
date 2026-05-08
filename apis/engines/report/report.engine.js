const orderService = require('../../app/services/order.service')
const settingsService = require("../../app/services/general.settings.service")
const template = require('./report.template')
const send = require('../../util/sendMail')
const mailerService = require('../../app/services/mailer.service')

exports.engine = async () => {
    const start = new Date(new Date().setHours(0, 0, 0, 0))
    const end = new Date(new Date().setHours(23, 59, 59, 59))
    const query = {
        '$and': [{ orderDate: { $gte: start } }, { orderDate: { $lte: end } }],
        orderStatus: { $in: ['DELIVERED', 'COLLECTED'] }
    }
    const settings = await settingsService.findOne({ })
    const orders = await orderService.getOrders(query)
    const placedOrders = await orderService.getOrders({ orderStatus: 'PLACED', '$and': [{ orderDate: { $gte: start } }, { orderDate: { $lte: end } }] })
    const pendingOrders = await orderService.getOrders({ orderStatus: 'PENDING', '$and': [{ orderDate: { $gte: start } }, { orderDate: { $lte: end } }] })
    let total = 0
    let collectedOrders = 0
    let deliveredOrders = 0
    for (let order of orders) {
        total += Number(order.total)
        order?.orderStatus == 'DELIVERED' ? deliveredOrders++ : order?.orderStatus == 'COLLECTED' ? collectedOrders++ : null
    }

    let orderDetails = {
        placed: placedOrders.length,
        pending: pendingOrders.length,
        total: total.toFixed(2),
        collected: collectedOrders,
        delivered: deliveredOrders,
        date: new Date().toDateString()
    }

    const mailers = await mailerService.findOne({ refid: '1' })
    const html = template.dailyReport(orderDetails, settings)
    const subject = settings?.name + ' daily order report for ' + new Date().toDateString()
    const content = settings?.name + ' aily order report for ' + new Date().toDateString()

    if (mailers?.dailyReports.length > 0) {
        for (let email of mailers?.dailyReports) await send.sendMail(email, subject, content, html)
    }
}