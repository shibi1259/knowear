const cartService = require('../../app/services/cart.service')
const settingsService = require("../../app/services/general.settings.service")
const template = require('./cart.template')
const send = require('../../util/sendMail')
const mailerService = require('../../app/services/mailer.service')

exports.engine = async () => {
    const start = new Date(new Date().setHours(0, 0, 0, 0))
    const end = new Date(new Date().setHours(23, 59, 59, 59))
    let query = {
        isPurchased: false,
        '$and': [{ 'date.added': { $gte: start } }, { 'date.added': { $lte: end } }]
    }
    const settings = await settingsService.findOne({ })
    const cartResponse = await cartService.getCarts(query)

    let cartDetails = []
    for (let cart of cartResponse) {
        cartDetails.push({
            name: cart?.customer?.id?.name ? cart?.customer?.id?.name : 'Guest',
            total: settings?.currency + ' ' + cart?.total,
            url: "",
        })
    }

    let carts = {
        details: cartDetails,
        date: new Date().toDateString()
    }

    const mailers = await mailerService.findOne({ refid: '1' })
    const html = template.cart(carts, settings)
    const subject = settings?.name + ' daily abandoned cart report for ' + new Date().toDateString()
    const content = settings?.name + ' aily abandoned cart report for ' + new Date().toDateString()
    if (mailers?.abandonedCarts.length > 0) {
        for (let email of mailers?.abandonedCarts) await send.sendMail(email, subject, content, html)
    }
}