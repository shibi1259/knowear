const service = require("../app/services/notification.service");
const userService = require("../app/services/customer.service");
const { sendMail } = require("./sendMail");
const templates = require("./templates");
const admin = require("firebase-admin")
const settingsService = require("../app/services/general.settings.service");
const { BASE_URL } = require("../config/constants/common");

exports.sendNotifications = async (notificationId) => {
    const notificationDetails = await service.findOne({ _id: notificationId });
    const isStoreLevel = notificationDetails?.isStoreLevel || false;
    let customers = [];

    switch (isStoreLevel) {
        case true:
            customers = await userService.getCustomers({ isActive: true, isDelete: false });
            break;
        case false:
            customers = notificationDetails?.customers;
            break;
    }

    for (let customerDetails of customers) {
        switch (notificationDetails?.channel) {
            case 'sms':
                const smsResponse = await smsTrigger(notificationDetails, customerDetails);
                await updateResponse(smsResponse, notificationId)
                break;
            case 'email':
                const emailResponse = await emailTrigger(notificationDetails, customerDetails);
                console.log(emailResponse)
                await updateResponse(emailResponse, notificationId)
                break;
            case 'push':
                const pushResponse = await pushTrigger(notificationDetails, customerDetails);
                await updateResponse(pushResponse, notificationId)
                break;
        }
    }
}

const updateResponse = async (response, notificationId) => {
    if (response instanceof Error) {
        await service.update({ _id: notificationId }, { status: 'failed' });
    } else {
        await service.update({ _id: notificationId }, { status: 'sent' });
    }
}

const smsTrigger = async (notificationDetails, customerDetails) => {

}

const emailTrigger = async (notificationDetails, customerDetails) => {
    const settings = await settingsService.findOne({ });
    const subject = `Notification :: ${notificationDetails?.title}`;
    const body = notificationDetails?.content;
    const branding = `${BASE_URL}${settings?.logo}`;
    const html = templates.dashboardNotification({ branding, body, subject });
    const mailResponse = await sendMail(customerDetails?.email, subject, '', html);
    return mailResponse;
}

exports.pushTrigger = async (notificationDetails, customerDetails) => {
    await admin.messaging().sendEachForMulticast({
        tokens: customerDetails?.deviceTokens,
        notification: {
            title: notificationDetails?.title,
            body: notificationDetails?.content,
            image: notificationDetails?.thumbnail ? `${BASE_URL}${notificationDetails?.thumbnail?.path}` : ``
            
        },
        webpush: { fcm_options: { link: notificationDetails?.redirect } }
    }).then((response) => {
        return response
    }).catch((error) => {
        return error
    })
}