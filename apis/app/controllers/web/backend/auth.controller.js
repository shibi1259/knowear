const { body, validationResult } = require("express-validator");
const helper = require('../../../../util/responseHelper')
const authService = require('../../../services/auth.service')
const jwt = require('jsonwebtoken');
const constant = require('../../../../config/constants')
const { messages, common } = constant
const key = constant.common.KEYS
const jwtToken = require('../../../../util/token')
const bcrypt = require('bcrypt');
const slug = require('../../../../util/slug')
const db = require('../../../db')
const { parse } = require("csv-parse");
const adminService = require("../../../services/auth.service")
const roleService = require("../../../services/role.service")
const categoryService = require("../../../services/category.service")
const brandService = require("../../../services/brand.service")
const collectionService = require("../../../services/collection.service")
const productService = require("../../../services/product.service")
const fs = require("fs")
const crypto = require('crypto');
const mailer = require("../../../../util/sendMail")
const templates = require("../../../../util/templates")

exports.validate = (method) => {
    switch (method) {
        case 'login': {
            return [
                body('email', `email is required`).exists(),
                body('password', `Password is required`).exists(),
            ]
        }
        case 'register': {
            return [
                body('firstname', `First Name is required`).exists(),
                body('username', `Username is required`).exists(),
                body('password', `Password is required`).exists(),
                body('email', `Email is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('firstname', `First Name is required`).exists(),
            ]
        }
        case 'reset-password': {
            return [
                body('oldPassword', `Old password is required`).exists(),
                body('password', `New password is required`).exists(),
            ]
        }
        case 'search': {
            return [
                body('page', `Page is required`).exists(),
                body('limit', `Limit is required`).exists(),
            ]
        }
        case 'update-email': {
            return [
                body('email', `Email is required`).exists(),
                body('refid', `Admin Id is required`).exists(),
            ]
        }
        case 'update-mobile': {
            return [
                body('countryCode', `Country code is required`).exists(),
                body('mobile', `Mobile is required`).exists(),
                body('refid', `Admin Id is required`).exists(),
            ]
        }
    }
}

exports.adminLogin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }
        const { email, password } = req.body
        const user = await authService.getLoginAdminByUsername({ email: email, isActive: true, isDelete: false })
        if (user[0]) {
            const status = await bcrypt.compare(password, user[0].password);
            if (status) {
                await authService.updateAdminLoginStatus(email);
                const payload = authService.generatePayload(user[0])
                const token = jwt.sign(payload, key.JWTSECRET, {
                    expiresIn: key.JWT_EXPIRE
                });
                return helper.deliverResponse(res, 200, { ...payload, token: token, newUser: false })
            } else {
                helper.deliverResponse(res, 200, { newUser: true }, {
                    "error_code": messages.INVALID_USER.error_code,
                    "error_message": messages.INVALID_USER.error_message
                });
                return
            }
        } else {
            helper.deliverResponse(res, 200, { newUser: true }, {
                "error_code": messages.NO_USER_FOUND.error_code,
                "error_message": messages.NO_USER_FOUND.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const body = req.body
        const saltRounds = constant.common.SALT_ROUNDS;
        const admin = await authService.getAdminByUsername({ isActive: true, isDelete: false, username: body.username })

        if (admin) {
            const status = await bcrypt.compare(body.password, admin.password);
            if (status) {
                await authService.updateAdminLoginStatus(body.username);
                const payload = authService.generatePayload(admin);
                const token = jwtToken.createToken(payload);
                helper.deliverResponse(res, 200, { ...payload, token: token, newUser: false })
                return
            } else {
                helper.deliverResponse(res, 200, { newUser: true }, {
                    "error_code": messages.ALREADY_REGISTERED.error_code,
                    "error_message": messages.ALREADY_REGISTERED.error_message
                });
                return
            }
        } else {
            if (body.password) body.password = bcrypt.hashSync(body.password, saltRounds)
            body.slug = await slug.createSlug(db.Admin, body.username, { slug: await slug.generateSlug(body.username) });
            body.refid = await authService.getAdminCount({}) + 1
            const newAdmin = await authService.createAdmin(body)

            if (newAdmin) {
                await authService.updateAdminLoginStatus(body.username);
                const payload = authService.generatePayload(newAdmin);
                const token = jwt.sign(payload, key.JWTSECRET, {
                    expiresIn: key.JWT_EXPIRE
                });

                helper.deliverResponse(res, 200, { ...payload, token: token, newUser: true })
                return
            } else {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.FAILED_TO_CREATE_USER.error_code,
                    "error_message": messages.FAILED_TO_CREATE_USER.error_message
                });
                return
            }
        }
    } catch (error) {
        console.log(error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.logout = async (req, res) => {
    try {
        const token = req?.headers?.authorization
        const { email } = res?.locals?.user
        const adminDetails = await authService.adminDetails({ email: email })
        let accessTokens = adminDetails?.accessTokens ? adminDetails?.accessTokens : []
        accessTokens = accessTokens.filter(item => item != token)
        const admin = await authService.updateAdminByQuery({ email: email }, { accessTokens: accessTokens });
        if (admin) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            })
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAdminUsers = async (req, res, next) => {
    try {
        const admin = await authService.getAdminUsers({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, admin)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.searchAdminUsers = async (req, res, next) => {
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
        let data = { isDelete: false }
        if (body?.keyword) data['$or'] = [
            { firstname: { $regex: body?.keyword, $options: 'i' } },
            { lastname: { $regex: body?.keyword, $options: 'i' } },
            { email: { $regex: body?.keyword, $options: 'i' } },
            { mobile: { $regex: body?.keyword, $options: 'i' } }
        ]

        if (body?.isActive) data['isActive'] = body?.isActive

        const response = await adminService.searchAdminUsers(data, body?.page, body?.limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log(error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAdminUser = async (req, res, next) => {
    try {
        const { slug } = req.query
        const admin = await authService.adminDetails({ slug: slug }, { password: 0, createdAt: 0, updatedAt: 0, _id: 0, __v: 0, isDelete: 0, accessToken: 0, deviceTokens: 0 })
        helper.deliverResponse(res, 200, admin, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAdminDetails = async (req, res, next) => {
    try {
        const email = res?.locals?.user?.email
        const admin = await authService.adminDetails({ email: email, isActive: true, isDelete: false })
        helper.deliverResponse(res, 200, admin, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAdminByEmail = async (req, res, next) => {
    try {
        const { body } = req
        const admin = await authService.findAdminByEmail(body)
        helper.deliverResponse(res, 200, admin, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.addAdminUser = async (req, res, next) => {
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
        const saltRounds = constant.common.SALT_ROUNDS;
        body.refid = await authService.getAdminCount({}) + 1
        body.password = bcrypt.hashSync(body.password, saltRounds);
        body.slug = await slug.createSlug(db.Admin, body.username, { slug: await slug.generateSlug(body.username) });
        const adminDetails = await authService.createAdmin(body)
        if (adminDetails instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            })
        } else {
            helper.deliverResponse(res, 200, adminDetails, {
                "error_code": messages.ADD_ADMIN.error_code,
                "error_message": messages.ADD_ADMIN.error_message
            })
        }
    } catch (error) {
        console.log('Error caught in add admin user API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateAdminUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { email } = res?.locals?.user
        const { body } = req
        const admin = await authService.updateAdminByQuery({ email: email, isDelete: false }, body)
        if (admin instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            })
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            })
        }
    } catch (_error) {
        console.log('Error caught in update admin :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.resetAdminPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { email } = res?.locals?.user
        let { body } = req
        const saltRounds = constant.common.SALT_ROUNDS;
        const adminDetails = await authService.adminDetails({ email: email, isDelete: false })
        if (adminDetails) {
            bcrypt.compare(body?.password, adminDetails?.password, async (err, result) => {
                switch (result) {
                    case true:
                        body.password = bcrypt.hashSync(body.password, saltRounds);
                        const admin = await authService.updateAdminByQuery({ email: email, isDelete: false }, body)
                        if (admin) {
                            helper.deliverResponse(res, 200, {}, {
                                "error_code": messages.PASSWORD_CHANGE_SUCCESS.error_code,
                                "error_message": messages.PASSWORD_CHANGE_SUCCESS.error_message
                            })
                        }
                        break
                    case false:
                        helper.deliverResponse(res, 200, {}, {
                            "error_code": messages.INCORRECT_PASSWORD.error_code,
                            "error_message": messages.INCORRECT_PASSWORD.error_message
                        })
                        break
                }
            })
        }
    } catch (_error) {
        console.log('Error caught in update admin :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.bulkImport = async (req, res, next) => {
    try {
        const adminEmail = res?.locals?.user?.email
        const admin = await getAdminDetails(adminEmail)
        const rootDir = process.cwd();
        const file = rootDir + "/" + req?.file?.path

        fs.createReadStream(file).pipe(parse({ delimiter: ',', from_line: 2 }))
            .on("data", async (data) => {
                const count = await authService.customersCount({})
                let userSlug = await slug.createSlug(db.Customer, data[0], { slug: await slug.generateSlug(data[0]) }); await slug.createSlug(db.Brand, data[0], { slug: await slug.generateSlug(data[0]) });
                let payload = {
                    name: data[0],
                    email: data[1],
                    countryCode: data[2],
                    mobile: data[3],
                    slug: userSlug,
                    userid: count + 1,
                    gender: data[4]
                }
            })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}


exports.bulkExport = async (req, res, next) => {
    try {

    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.authorizeAdmin = async (req, res, next) => {
    try {
        const { email } = res?.locals?.user
        const { type } = req?.query
        let isAccessDenied = false
        let tags = []
        const adminDetails = await adminService.adminDetails({ email: email })
        const storeAdmin = adminDetails?.isPlatformOwner || false
        if (storeAdmin) {
            isAccessDenied = false
        } else {
            if (adminDetails?.role) {
                const roleDetails = await roleService.getRoleDetails({ _id: adminDetails?.role })
                const permissions = roleDetails?.permissions
                for (let permission of permissions) {
                    tags.push(permission?.tag)
                }
                tags.includes(type) ? isAccessDenied = false : isAccessDenied = true
            }
        }
        helper.deliverResponse(res, 200, { isAccessDenied: false }, {
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

exports.subscribeAdmin = async (req, res, next) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await adminService.adminDetails({ email: email })
        let deviceTokens = adminDetails?.deviceTokens ? adminDetails?.deviceTokens : []
        if (!deviceTokens.includes(body?.token)) deviceTokens.push(body?.token)
        const admin = await adminService.updateAdminByQuery({ _id: adminDetails?._id }, { deviceTokens: deviceTokens })
        if (admin) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.search = async (req, res, next) => {
    try {
        const { body } = req
        const { type } = req.query
        let query = { isDelete: false, isActive: true }
        let response = {}

        switch (type) {
            case 'product':
                query['name'] = { $regex: body?.keyword, $options: 'i' }
                response = await productService.getProductBySearch(query, body?.page, body?.limit)
                break
            case 'brand':
                query['name'] = { $regex: body?.keyword, $options: 'i' }
                response = await brandService.getBrandBySearch(query, body?.page, body?.limit)
                break
            case 'collection':
                query['name'] = { $regex: body?.keyword, $options: 'i' }
                response = await collectionService.search(query, body?.page, body?.limit)
                break
            case 'category':
                query['name'] = { $regex: body?.keyword, $options: 'i' }
                response = await categoryService.search(query, body?.page, body?.limit)
                break
        }

        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in general search :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { body } = req
        const { email } = body
        const adminDetails = await authService.adminDetails({ email: email, isDelete: false })
        if (adminDetails) {
            const token = crypto.randomBytes(20).toString('hex');
            await authService.updateAdminByQuery({ email: email }, { verificationToken: { password: token } });
            setTimeout(async () => {
                const admin = await authService.adminDetails({ email: email, isDelete: false });
                if (admin?.verificationToken?.password === token) {
                    await authService.updateAdminByQuery({ email: email }, { verificationToken: { password: '' } });
                }
            }, 300000);

            const template = await templates.resetPassword({ link: 'http://localhost:4200/auth/forgot-password/' + token })
            const resetPasswordEmail = await mailer.sendMail(email, 'Forgot your password?', 'Reset password', template)
            if (resetPasswordEmail instanceof Error) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.RESET_PASSWORD_EMAIL_SENT_FAILED.error_code,
                    "error_message": messages.RESET_PASSWORD_EMAIL_SENT_FAILED.error_message
                });
            } else {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.RESET_PASSWORD_EMAIL_SENT.error_code,
                    "error_message": messages.RESET_PASSWORD_EMAIL_SENT.error_message
                });
            }
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.NO_ACCOUNT_FOUND.error_code,
                "error_message": messages.NO_ACCOUNT_FOUND.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in forgot password API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.resetToken = async (req, res) => {
    try {
        const { body } = req
        const adminDetails = await authService.adminDetails({ 'verificationToken.password': body.token })
        if (adminDetails) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.PAGE_LINK_EXPIRED.error_code,
                "error_message": messages.PAGE_LINK_EXPIRED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in reset token verification API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { body } = req
        const saltRounds = constant.common.SALT_ROUNDS;
        const password = bcrypt.hashSync(body.password, saltRounds);
        const adminDetails = await authService.adminDetails({ 'verificationToken.password': body.token })
        if (adminDetails) {
            const response = await authService.updateAdminByQuery({ email: adminDetails?.email }, { password: password, verificationToken: { password: '' } })
            if (response instanceof Error) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.PASSWORD_CHANGE_SUCCESS.error_code,
                    "error_message": messages.PASSWORD_CHANGE_SUCCESS.error_message
                });
            }
        } else {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.PAGE_LINK_EXPIRED.error_code,
                "error_message": messages.PAGE_LINK_EXPIRED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in reset password API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.duplicateEmail = async (req, res) => {
    try {
        const { body } = req
        const adminDetails = await authService.adminDetails({ email: body.email, isDelete: false })
        if (adminDetails) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.DUPLICATE_EMAIL.error_code,
                "error_message": messages.DUPLICATE_EMAIL.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in duplicate email API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.deleteAdmin = async (req, res) => {
    try {
        const { body } = req
        const adminDetails = await authService.updateAdminByQuery({ email: body.email }, { isDelete: true })
        if (adminDetails) {
            helper.deliverResponse(res, 200, adminDetails, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.DELETE_ADMIN.error_code,
                "error_message": messages.DELETE_ADMIN.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in duplicate email API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateAdminEmail = async (req, res) => {
    try {
        const { body } = req
        const duplicateEmail = await authService.adminDetails({ refid: { $ne: body.refid }, email: body.email }) ? true : false
        if (duplicateEmail) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.DUPLICATE_EMAIL.error_code,
                "error_message": messages.DUPLICATE_EMAIL.error_message
            });
        } else {
            const adminDetails = await authService.updateAdminByQuery({ refid: body.refid }, { email: body.email })
            if (adminDetails instanceof Error) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.EMAIL_UPDATED.error_code,
                    "error_message": messages.EMAIL_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in update admin email API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateAdminMobile = async (req, res) => {
    try {
        const { body } = req
        const duplicateMobile = await authService.adminDetails({
            refid: { $ne: body.refid },
            countryCode: body.countryCode,
            mobile: body.mobile
        }) ? true : false
        if (duplicateMobile) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.DUPLICATE_MOBILE.error_code,
                "error_message": messages.DUPLICATE_MOBILE.error_message
            });
        } else {
            const adminDetails = await authService.updateAdminByQuery({ refid: body.refid }, {
                countryCode: body.countryCode,
                mobile: body.mobile
            })
            if (adminDetails instanceof Error) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.MOBILE_UPDATED.error_code,
                    "error_message": messages.MOBILE_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in update admin email API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { body } = req
        const saltRounds = constant.common.SALT_ROUNDS;
        body.password = bcrypt.hashSync(body.password, saltRounds);
        const adminDetails = await authService.updateAdminByQuery({ email: body.email }, { password: body.password })
        if (adminDetails instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.PASSWORD_CHANGE_SUCCESS.error_code,
                "error_message": messages.PASSWORD_CHANGE_SUCCESS.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in change password API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateAdminDetails = async (req, res) => {
    try {
        let { body } = req
        const adminDetails = await authService.adminDetails({ refid: body.refid })
        if (adminDetails.username != body.username) body.slug = await slug.createSlug(db.Admin, body.username, { slug: await slug.generateSlug(body.username) })
        const adminResponse = await authService.updateAdminByQuery({ refid: body.refid }, body)
        if (adminResponse instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.UPDATE_ADMIN.error_code,
                "error_message": messages.UPDATE_ADMIN.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in update admin API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

