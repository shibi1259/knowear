const service = require("../../../services/notification.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const orderService = require("../../../services/order.service")
const admin = require("firebase-admin")
const templates = require("../../../../util/templates")
const mailer = require("../../../../util/sendMail")
const customerService = require('../../../services/customer.service')
const cartService = require("../../../services/cart.service")
const activity = require("../../../../util/activity.creator")
const { sendNotifications } = require("../../../../util/notificationTrigger")

exports.create = async (req, res) => {
    try {
        const { body } = req
        const response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(res.locals.user.email, `Notification created - ${body.title}`)
            if (body.type === 'instant') await sendNotifications(response?._id) // Send instant notifications
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.NOTIFICATION_CREATED.error_code,
                "error_message": messages.NOTIFICATION_CREATED.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.find = async (req, res) => {
    try {
        let query = { isDelete: false }
        switch (req?.query?.type) {
            case 'instant':
                query.type = 'instant'
                break
            case 'scheduled':
                query.type = 'scheduled'
                break
        }

        switch (req?.query?.channel) {
            case 'email':
                query.channel = 'email'
                break
            case 'sms':
                query.channel = 'sms'
                break
            case 'push':
                query.channel = 'push'
                break
            case 'app':
                query.channel = 'app'
                break
        }

        switch (req?.query?.status) {
            case 'pending':
                query.status = 'pending'
                break
            case 'sent':
                query.status = 'sent'
                break
            case 'rejected':
                query.status = 'rejected'
                break
        }

        const response = await service.find(query)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.search = async (req, res, next) => {
    try {
        const { body } = req
        let data = { isDelete: false }
        if (body?.keyword) data['$or'] = [
            { title: { $regex: body?.keyword, $options: 'i' } },
            { content: { $regex: body?.keyword, $options: 'i' } }
        ]
        if (body?.isActive) data.isActive = body?.isActive
        if (body?.type) data.type = body?.type
        if (body?.channel) data.channel = body?.channel
        if (body?.status) data.status = body?.status
        const response = await service.search(data, body?.page, body?.limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        const { notificationId } = req?.params
        const response = await service.findOne({ _id: notificationId })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res, next) => {
    try {
        const { body } = req
        const notificationDetails = await service.findOne({ _id: body?._id })
        const response = await service.update({ _id: body?._id }, body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(res.locals.user.email, `Notification updated - ${body?.title}`)
            if (body.type === 'instant' && notificationDetails?.status == 'pending') await sendNotifications(response?._id) // Send instant notifications
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.NOTIFICATION_UPDATED.error_code,
                "error_message": messages.NOTIFICATION_UPDATED.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res, next) => {
    try {
        const { notificationId } = req.params
        const response = await service.update({ _id: notificationId }, { isDelete: true })
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(res.locals.user.email, `Notification deleted - ${response?.title}`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.NOTIFICATION_DELETED.error_code,
                "error_message": messages.NOTIFICATION_DELETED.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getLatestNotifications = async (req, res, next) => {
    try {
        const { body } = req
        const orders = await orderService.getLatestOrdersByPage({ orderStatus: { $ne: "PENDING" } }, 5, body['page'])
        helper.deliverResponse(res, 200, orders, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.moduleNotifications = async (req, res, next) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        let customerDetails = null
        switch (body?.type) {
            case 'cart':
                const cartDetails = await cartService.getCart({ _id: body?._id })
                customerDetails = await customerService.getCustomerDetails({ _id: cartDetails?.customer?._id, isDelete: false, isActive: true })
                break
            case 'wishlist':
                customerDetails = await customerService.getCustomerDetails({ userid: body?.userid, isDelete: false, isActive: true })
                break
        }

        if (customerDetails) {
            let response = null
            switch (body?.channel) {
                case 'email':
                    let subject = body?.subject
                    const emailTemplate = body?.type == 'cart' ? templates.abandonnedCart() : templates.abandonnedWishlist()
                    await mailer.sendMail(customerDetails?.email, subject, '', emailTemplate)
                    break
                case 'sms':
                    break
                case 'push':
                    if (!customerDetails?.deviceTokens?.length) {
                        return helper.deliverResponse(res, 200, {}, {
                            error_code: 1,
                            error_message: "No valid device tokens found"
                        });
                    }

                    let pushMessage = {
                        tokens: customerDetails?.deviceTokens,
                        notification: { title: body?.title, body: body.message },
                        webpush: { fcm_options: { link: '/cart' } }
                    }
                    customerDetails?.deviceTokens.length > 0 ? admin.messaging().sendEachForMulticast(pushMessage).then(async (response) => { }) : null
                    break
            }

            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Notification sent to ${customerDetails?.name} (${body.type})`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.NOTIFICATION_SENT.error_code,
                    "error_message": messages.NOTIFICATION_SENT.error_message
                });
            }
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.NOTIFICATION_UNSENT.error_code,
                "error_message": messages.NOTIFICATION_UNSENT.error_message
            })
        }
    } catch (error) {
        console.log("Error caught in module notifications api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}