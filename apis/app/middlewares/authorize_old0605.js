const helper = require("../../util/responseHelper");
const jwt = require('jsonwebtoken');
const constant = require("../../config/constants");
const key = constant.common.KEYS
const { messages } = constant
const customerService = require("../services/customer.service");
const guestService = require("../services/guest.service");

exports.verifyToken = (req, res, next) => {
    let header = req.headers.authorization;

    if (header == undefined) {
        return helper.deliverResponse(res, 404, {}, messages.TOKEN_REQUIRED);
    }
    
    let token = header.split('Bearer ')[1];
    jwt.verify(token, key.JWTSECRET, (err, decoded) => {
        if (err) {
            return helper.deliverResponse(res, 401, err, messages.INVALID_TOKEN);
        } else {
            res.locals.user = decoded;
            global.requestedUser = decoded;
            next();
        }
    })
}

exports.verifyGuest = async (req, res, next) => {
    const header = req.headers.authorization;
    const userAgent = req.useragent
    if (!header) {
        let guestPayload = {
            name: `Guest #${await guestService.count() + 1}`,
            refid: await guestService.count() + 1,
            deviceToken: req.headers.devicetoken,
            deviceDetails: {
                os: userAgent?.os,
                platform: userAgent?.platform,
                type: userAgent?.isDesktop ? 'Desktop' : userAgent?.isMobile ? 'Mobile' : 'Tablet'
            }
        }

        const guestDetails = await guestService.getGuestDetails({ deviceToken: req.headers.devicetoken, isDelete: false })
        if (!guestDetails) {
            let guest = await guestService.createGuest(guestPayload)
            res.locals.guestDetails = guest?.refid;
            global.requestedUser = guest?.refid;
        }
    }
    next();
}

exports.verifyUser = (req, res, next) => {
    if (req.body.guest) { next(); return }
    let header = req.headers.authorization;
    if (header == undefined) {
        helper.deliverResponse(res, 404, {}, {
            "error_code": messages.TOKEN_REQUIRED.error_code,
            "error_message": messages.TOKEN_REQUIRED.error_message
        });
        return;
    }
    let token = header.split('Bearer ')[1];
    jwt.verify(token, key.JWTSECRET, (err, decoded) => {
        if (err) {
            helper.deliverResponse(res, 401, err, {
                "error_code": messages.INVALID_TOKEN.error_code,
                "error_message": messages.INVALID_TOKEN.error_message
            });
            return
        } else {
            if (decoded?.userid) {
                res.locals.user = decoded;
                global.requestedUser = decoded;
                next();
            } else {
                helper.deliverResponse(res, 401, {}, {
                    "error_code": messages.NO_USER_FOUND.error_code,
                    "error_message": messages.NO_USER_FOUND.error_message
                });
            }
        }
    })
}

exports.verifyUserCondtionally = (req, res, next) => {
    let header = req.headers.authorization;
    if (req.headers.authorization) {
        let token = header.split('Bearer ')[1];
        jwt.verify(token, key.JWTSECRET, (err, decoded) => {
            if (err) {
                helper.deliverResponse(res, 401, err, {
                    "error_code": messages.INVALID_TOKEN.error_code,
                    "error_message": messages.INVALID_TOKEN.error_message
                });
                return
            } else {
                if (decoded?.userid) {
                    res.locals.user = decoded;
                    global.requestedUser = decoded;
                    next();
                } else {
                    console.log("Error from verify user conditionally middleware")
                    helper.deliverResponse(res, 401, {}, {
                        "error_code": messages.NO_USER_FOUND.error_code,
                        "error_message": messages.NO_USER_FOUND.error_message
                    });
                }
            }
        })
    } else {
        next()
    }
}

exports.verifyCartAuth = async (req, res, next) => {
    let { authorization, devicetoken } = req.headers;
    if (authorization) {
        let token = authorization.split('Bearer ')[1];
        if (token != 'null' || token != null) {
            jwt.verify(token, key.JWTSECRET, async (err, decoded) => {
                if (err) {
                    helper.deliverResponse(res, 401, err, {
                        "error_code": messages.INVALID_TOKEN.error_code,
                        "error_message": messages.INVALID_TOKEN.error_message
                    });
                    return
                } else {
                    if (decoded?.userid) {
                        const customerDetails = await customerService.getCustomerDetails({ userid: decoded.userid, isActive: true, isDelete: false })
                        if (customerDetails) {
                            res.locals.user = { ...decoded, customerId: customerDetails?._id };
                            global.requestedUser = decoded;
                            next();
                        } else {
                            helper.deliverResponse(res, 401, {}, {
                                "error_code": messages.NO_USER_FOUND.error_code,
                                "error_message": messages.NO_USER_FOUND.error_message
                            });
                            return
                        }
                    } else {
                        helper.deliverResponse(res, 401, {}, {
                            "error_code": messages.NO_USER_FOUND.error_code,
                            "error_message": messages.NO_USER_FOUND.error_message
                        });
                        return
                    }
                }
            })
        } else {
            const guestDetails = await guestService.getGuestDetails({ deviceToken: req.headers.devicetoken, isDelete: false })
            const userAgent = req.useragent
            let guestPayload = {
                name: `Guest #${await guestService.count() + 1}`,
                deviceToken: req.headers.devicetoken,
                deviceDetails: {
                    os: userAgent?.os,
                    platform: userAgent?.platform,
                    type: userAgent?.isDesktop ? 'Desktop' : userAgent?.isMobile ? 'Mobile' : 'Tablet'
                }
            }
            let guest = null
            guestDetails ? null : guest = await guestService.createGuest(guestPayload)
            res.locals.user = { deviceToken: devicetoken, guestId: guest ? guest._id : guestDetails?._id };
            global.requestedUser = { deviceToken: devicetoken };
            next();
        }
    } else {
        res.locals.user = { deviceToken: devicetoken };
        global.requestedUser = { deviceToken: devicetoken };
        next();
    }
}

exports.verifyGuestForLogin = async (req, res, next) => {
    let devicetoken = req?.headers?.devicetoken;
    const firebaseToken = req?.headers?.firebasetoken;

    if (devicetoken || firebaseToken) {
        res.locals.user = { deviceToken: devicetoken, firebaseToken:firebaseToken };
        global.requestedUser = { deviceToken: devicetoken, firebaseToken: firebaseToken };
        next();
    } else {
        next()
    }
}