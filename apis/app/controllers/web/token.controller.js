const { body, validationResult } = require("express-validator")
const service = require("../../services/token.service")
const userService = require("../../services/customer.service")
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const jwt = require("jsonwebtoken")
const constant = require("../../../config/constants");
const key = constant.common.KEYS
const guestService = require("../../services/guest.service")

exports.validate = (method) => {
    switch (method) {
        case 'add': {
            return [
                body('token', 'Token is required').exists(),
            ]
        }
    }
}

exports.addToken = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                error_code: messages.VALIDATION_ERROR.error_code,
                error_message: messages.VALIDATION_ERROR.error_message,
            });
            return;
        }

        const userAgent = req?.useragent
        const { body } = req;
        const { authorization, devicetoken } = req.headers
        let userid = null
        let deviceToken = null

        if (authorization) {
            let token = authorization.split('Bearer ')[1];
            jwt.verify(token, key.JWTSECRET, (err, decoded) => {
                if (err) userid = null
                userid = decoded?.userid
            })
        } else {
            deviceToken = devicetoken
        }

        if (userid) {
            const userDetails = await userService.getCustomer({ userid: userid, isActive: true, isDelete: false })
            let tokens = [...userDetails?.deviceTokens]
            if (!tokens.includes(body?.token)) tokens.push(body?.token)
            await userService.update({ userid: userid, isActive: true, isDelete: false }, { $set: { deviceTokens: tokens } })
        } else {
            const guestDetails = await guestService.getGuestDetails({ deviceToken: deviceToken, isDelete: false, isActive: true })
            if (guestDetails) {
                const tokens = [...guestDetails?.tokens]
                if (!tokens.includes(body?.token)) tokens.push(body?.token)
                await service.update({ refid: guestDetails?.refid }, { tokens: tokens })
            } else {
                let payload = {
                    refid: await guestService.count({}) + 1,
                    name: `Guest #${await guestService.count({}) + 1}`,
                    deviceToken: deviceToken,
                    tokens: [body?.token],
                    deviceDetails: {
                        os: userAgent?.os,
                        platform: userAgent?.platform,
                        type: userAgent?.isDesktop ? 'Desktop' : userAgent?.isMobile ? 'Mobile' : 'Tablet'
                    }
                }

                await guestService.createGuest(payload)
            }
        }

        helper.deliverResponse(res, 200, {}, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        console.log('Error caught in add token API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}