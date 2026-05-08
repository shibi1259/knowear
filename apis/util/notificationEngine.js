const service = require("../app/services/notification.service");
const mailcontent = require("../util/mailContents");
const email = require("../util/sendMail");
const customerService = require("../app/services/customer.service")
const admin = require("firebase-admin")
const productService = require("../app/services/product.service")
const subscriptionService = require("../app/services/notify.subscriber.service")
const tokenService = require("../app/services/token.service")

exports.fetchNotification = async () => {
  try {
    let query = { type: "scheduled", status: "Pending", isDelete: false, isActive: true, 'scheduled.date': { $lte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString() }, }
    const notifications = await service.getNotifications(query);

    if (notifications.length > 0) {
      console.log(`--- ${new Date().toLocaleString()}, ${notifications.length} notifications fetched. Initiating notifications to users ---`);

      for (let notification of notifications) {
        let customers = []
        let count = 0

        switch (notification?.channel) {
          case 'push':
            for (let customer of notification?.customers) {
              let customerDetails = await customerService.getCustomer({ _id: customer?.id, isDelete: false })

              let pushMessage = {
                tokens: customerDetails?.deviceTokens,
                notification: {
                  title: notification?.title,
                  body: notification?.content,
                  image: notification?.image
                },
                webpush: { fcm_options: { link: notification?.redirect } }
              }

              await admin.messaging().sendEachForMulticast(pushMessage).then((response) => {
                if (response?.successCount == customerDetails?.deviceTokens?.length) {
                  customers.push({ id: customer?.id, status: 'Sent' })
                  count += 1
                }
              }).catch((error) => {
                console.log(error);
              })
            }
            break
        }

        if (count == notification?.total) {
          await service.updateNotification({ refid: body?.refid, isDelete: false }, { customers: customers, status: 'Sent' })
        }
      }
    }
  } catch (error) {
    console.log("Error caught while in notification engine :: " + error);
  }
};


exports.stockSubscriptions = async (details) => {
  try {
    const subscriptions = await subscriptionService.find({ product: details?.product, isDelete: false, isActive: true })
    if (subscriptions.length > 0) {
      for (let subscription of subscriptions) {
        let customerDetails = null
        let deviceToken = null
        let tokens = []
        subscription?.customer ?
          customerDetails = await customerService.getCustomer({ _id: subscription?.customer }) :
          deviceToken = await tokenService.findOne({ deviceToken: subscription?.deviceToken })
        customerDetails ? tokens = customerDetails?.deviceTokens : tokens = deviceToken?.tokens
        let payload = {
          tokens: tokens,
          notification: { title: 'Back in Stock!', body: subscription?.product?.name + ' is back in stock.' },
          webpush: { fcm_options: { link: details?.redirection } }
        }
        await admin.messaging().sendEachForMulticast(payload).then((response) => { }).catch((error) => { })
      }
    }
  } catch (error) {
    return error
  }
}
