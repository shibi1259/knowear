const { body, validationResult } = require("express-validator")
const service = require("../../../services/newsletter.subscribers.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const settingsService = require("../../../services/general.settings.service")
const templates = require("../../../../util/templates")
const mailer = require("../../../../util/sendMail")
const mailerService = require("../../../services/mailer.service");
const { BASE_URL } = require("../../../../config/constants/common");

exports.validate = (method) => {
    switch (method) {
        case 'subscribe': {
            return [
                body("email", `Email is required`).exists(),
            ]
        }
        case 'verification': {
            return [
                body("token", `Token is required`).exists(),
            ]
        }
    }
}

exports.subscribe = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        let { body } = req
        const subscriberDetails = await service.findOne({ email: body.email })
        if (subscriberDetails) {
            if (subscriberDetails?.isUnsubscribed == true) {
                const response = await service.update({ email: body.email }, { isUnsubscribed: false })
                if (response instanceof Error) {
                    helper.deliverResponse(res, 422, {}, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    await subscription('subscribe', { email: body?.email })
                    helper.deliverResponse(res, 200, {}, {
                        "error_code": messages.SUBSCRIBED_SUCCESSFULLY.error_code,
                        "error_message": messages.SUBSCRIBED_SUCCESSFULLY.error_message
                    });
                }
            } else {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.ALREADY_SUBSCRIBED.error_code,
                    "error_message": messages.ALREADY_SUBSCRIBED.error_message
                });
            }
        } else {
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                await subscription('subscribe', { email: body?.email })
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.SUBSCRIBED_SUCCESSFULLY.error_code,
                    "error_message": messages.SUBSCRIBED_SUCCESSFULLY.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in subscribe newsletter API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.unsubscribe = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        let { body } = req
        const subscriberDetails = await service.findOne({ email: body.email, isUnsubscribed: false })
        if (subscriberDetails) {
            const response = await service.update({ email: body?.email }, { isUnsubscribed: true })
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                await subscription('unsubscribe', { email: body?.email })
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.UNSUBSCRIBED_SUCCESSFULLY.error_code,
                    "error_message": messages.UNSUBSCRIBED_SUCCESSFULLY.error_message
                });
            }
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.NOT_SUBSCRIBED.error_code,
                "error_message": messages.NOT_SUBSCRIBED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in unsubscribe newsletter API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.verifySubscription = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req
        const email = Buffer.from(body.token, 'base64').toString('utf-8');
        const subscriberDetails = await service.findOne({ email: email, isVerified: false, isUnsubscribed: false })
        if (subscriberDetails) {
            const response = await service.update({ email: email }, { isVerified: true })
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                await subscription('verify', { email: email })
                await subscriptionAlert({ email: email })
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.VERIFIED_SUCCESSFULLY.error_code,
                    "error_message": messages.VERIFIED_SUCCESSFULLY.error_message
                });
            }
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.CANNOT_PROCESS_REQUEST.error_code,
                "error_message": messages.CANNOT_PROCESS_REQUEST.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in verify subscription API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getSubscribers = async (req, res) => {
    try {
        const { page, keyword, limit } = req.query
        let query = { isUnsubscribed: false }
        console.log(query)
        keyword ? query['email'] = { $regex: keyword, $options: 'i' } : null
        const response = await service.search(query, {}, { createdAt: -1 }, page, limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in get subscribers API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.exportSubscribers = async (req, res) => {
    try {
        const subscribers = await service.find({ isUnsubscribed: false })
        const csvWriter = createCsvWriter({
            path: 'newslettersubscribers.csv',
            header: [
                { id: 'email', title: 'Email' },
                { id: 'isVerified', title: 'Verified' },
                { id: 'isUnsubscribed', title: 'Unsubscribed' },
            ],
        });

        csvWriter.writeRecords(subscribers).then(() => {
            res.download('newslettersubscribers.csv', 'newslettersubscribers.csv', (err) => {
                if (err) {
                    console.error("Error caught in export newsletter subscribers (1) :: " + err);
                    helper.deliverResponse(res, 500, {}, {
                        "error_code": messages.INTERNAL_serverError.error_code,
                        "error_message": messages.INTERNAL_serverError.error_message
                    });
                } else {
                    fs.unlinkSync('newslettersubscribers.csv');
                }
            });
        }).catch((error) => {
            console.error("Error caught in export newsletter subscribers (2) :: " + error);
            helper.deliverResponse(res, 500, {}, {
                "error_code": messages.INTERNAL_serverError.error_code,
                "error_message": messages.INTERNAL_serverError.error_message
            });
        });
    } catch (error) {
        console.log("Error caught in export subscribers API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

const subscription = async (type, details) => {
    try {
        const settings = await settingsService.findOne({ })
        const encoded = Buffer.from(details?.email).toString('base64')
        let content = ''
        let subject = ''
        switch (type) {
            case 'subscribe':
                subject = 'Newsletter subscription verification!'
                content = templates.newsletterVerification({ logo: BASE_URL + settings?.logo?.path, store: settings?.name, link: settings?.domain + '/verify-subscription/' + encoded })
                break
            case 'verify':
                subject = 'Newsletter subscribed successfully🥳'
                content = templates.newsletterSubscribed({ store: settings?.name })
                break
            case 'unsubscribe':
                subject = 'Newsletter unsubscribed successfully🙁'
                content = templates.newsletterUnsubscribed({ logo: BASE_URL + settings?.logo?.path, store: settings?.name })
                break
        }
        const mailResponse = await mailer.sendMail(details?.email, subject, '', content)
        return mailResponse
    } catch (error) {
        console.log("Error caught in subscription email confirmation :: " + error)
        return error
    }
}

const subscriptionAlert = async (details) => {
    try {
        const mailers = await mailerService.findOne({ refid: "1" })
        const settings = await settingsService.findOne({ })
        let content = await templates.newsletterSubscriptionAlert({ email: details?.email, store: settings?.name })
        let subject = 'New newsletter subscription alert 📬'
        if (mailers?.newsletters.length > 0)
            for (let email of mailers?.newsletters) {
                await mailer.sendMail(email, subject, '', content)
            }
    } catch (error) {
        console.log("Error caught in subscription email confirmation :: " + error)
        return error
    }
}