const service = require("../../../services/customer.service")
const productService = require("../../../services/product.service")
const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const db = require('../../../db')
const slug = require("../../../../util/slug");
const slugify = require('slugify')
const mailer = require("../../../../util/sendMail")
const addressService = require("../../../services/address.service")
const { BASE_URL } = require("../../../../config/constants/common")
const notificationService = require("../../../services/notify.subscriber.service")
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const orderService = require("../../../services/order.service");
const guestCustomerService = require("../../../services/guest.customer.service");
const adminService = require("../../../services/auth.service");
const activity = require("../../../../util/activity.creator");
const perfHooks = require("perf_hooks");
const fileImportService = require("../../../services/file.import.service");
const csv = require('csv-parser');
const { Mutex } = require('async-mutex');
const mutex = new Mutex();
const AWS = require('aws-sdk');
const { uid } = require("uid/secure");
const { sendMail } = require("../../../../util/sendMail");


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}
let count = 1;

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('name', `Name is required`).exists(),
                body('email', `Email is required`).exists(),
                body('mobile', `Mobile is required`).exists()
            ]
        }
        case 'update': {
            return [
                body('name', `Name is required`).exists(),
                body('email', `Email is required`).exists(),
                body('mobile', `Mobile is required`).exists()
            ]
        }
    }
}

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return helper.deliverResponse(res, 422, errors, messages.VALIDATION_ERROR)
        }

        const { body } = req
        body.userid = uid()
        body.slug = await slug.createSlug(db.Customer, body.name, { slug: await slug.generateSlug(body.name) });

        const isCustomerExists = await service.getCustomerDetails({
            $or: [
                { email: body.email },
                { mobile: body.mobile },
            ], isDelete: false
        })

        if (isCustomerExists) {
            return helper.deliverResponse(res, 422, {}, messages.CUSTOMER_DETAILS_EXISTS);
        } else {
            let response = await service.create({ ...body, registerMethod: 'Admin' });
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, messages.serverError);
            } else {
                helper.deliverResponse(res, 200, response, messages.successResponse)
            }
        }
    } catch (error) {
        console.log("Error caught in create customer api :: " + error)
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

function generateReferralCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
}

async function isReferralCodeExists(referralCode) {
    const referralDetails = await service.getCustomer({ referralCode: referralCode, isDelete: false })
    return referralDetails ? true : false;
}

exports.delete = async (req, res) => {
    const { userid } = req.params
    try {
        const response = await service.update({ userid: userid }, { isDelete: true })
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            })
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.CUSTOMER_DELETED.error_code,
                "error_message": messages.CUSTOMER_DELETED.error_message
            })
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAllClient = async (req, res) => {
    try {
        const client = await service.getAllClient({})
        helper.deliverResponse(res, 200, client)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getActiveClient = async (req, res) => {
    try {
        const client = await service.getClient({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, client)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getCustomerByQuery = async (req, res) => {
    try {
        const { body } = req
        const response = await service.getCustomers({ ...body, isDelete: false })
        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}

exports.getClientBySlug = async (req, res) => {
    try {
        const { slug } = req.query
        const client = await service.getClient({ userid: slug })
        helper.deliverResponse(res, 200, client)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getClientByNumber = async (req, res) => {
    try {
        const { body } = req
        const client = await service.getClient(body)
        helper.deliverResponse(res, 200, client)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getClientCount = async (req, res) => {
    try {
        const client = await service.getClientCount()
        helper.deliverResponse(res, 200, client)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.searchCustomers = async (req, res) => {
    try {
        const { body } = req
        let query = { isDelete: false }
        if (body.keyword) query['$or'] = [
            { name: { $regex: body.keyword, $options: 'i' } },
            { email: { $regex: body.keyword, $options: 'i' } },
            { mobile: { $regex: body.keyword, $options: 'i' } }
        ]
        if (body.registerMethod) query['registerMethod'] = body.registerMethod
        if (body.isActive) query['isActive'] = body.isActive  
        const response = await service.searchCustomers(query, body.page, body.limit)
        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        console.log(`Error caught in search customer :: ${error}`);
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

exports.getCustomerAddress = async (req, res, next) => {
    try {
        const { body } = req
        const customer = await service.getCustomer({ userid: body?.userid })
        const address = await addressService.find({ customer: customer?._id, isDelete: false })
        helper.deliverResponse(res, 200, address, {
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

exports.findOneDetails = async (req, res, next) => {
    try {
        const { address } = req?.params
        const projection = { __v: 0, createdAt: 0, updatedAt: 0, _id: 0 }
        const addressDetails = await addressService.findOne({ refid: address, isDelete: false }, projection)
        helper.deliverResponse(res, 200, addressDetails, {
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

exports.addCustomerAddress = async (req, res, next) => {
    try {
        const { body } = req
        const isDefault = body.isDefault || false

        if (isDefault) {
            const defaultAddress = await addressService.findOne({ customer: body.customer, isDefault: true, isDelete: false })
            const response = await addressService.update(
                { _id: defaultAddress._id },
                { isDefault: false }
            )
            if (response instanceof Error) {
                return helper.deliverResponse(res, 422, {}, messages.serverError);
            }
        }

        const response = await addressService.add({ ...body, refid: uid() })
        if (response instanceof Error) {
            return helper.deliverResponse(res, 200, {}, messages.serverError);
        } else {
            return helper.deliverResponse(res, 200, response, messages.ADD_ADDRESS);
        }
    } catch (error) {
        console.log("Error caught in add customer address api :: " + error);
        return helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

exports.updateDefaultAddress = async (req, res, next) => {
    try {
        const { address } = req?.params
        const addressDetails = await addressService.findOne({ refid: address, isDelete: false })
        const defaultAddressDetails = await addressService.findOne({ customer: addressDetails?.customer, isDefaultShipping: true })
        const addressResponse = await addressService.update({ refid: address, isDelete: false }, { isDefaultShipping: true })
        if (defaultAddressDetails?._id != addressDetails?._id) addressService.update({ _id: defaultAddressDetails?._id }, { isDefaultShipping: false })
        if (addressResponse) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.DEFAULT_ADDRESS_UPDATED.error_code,
                "error_message": messages.DEFAULT_ADDRESS_UPDATED.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res) => {
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
        const { customerId } = req.query
        const customerDetails = await service.getCustomerDetails({ userid: customerId })
        body.name == customerDetails.name ? null :
            body.slug = await slug.createSlug(db.Customer, body.name, { slug: await slug.generateSlug(body.name) });

        let query = {
            $or: [
                { email: body.email },
                { mobile: body.mobile }
            ],
            _id: { $ne: customerDetails?._id }
        }

        const isCustomerExists = await service.getCustomerDetails(query)

        if (isCustomerExists) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.CUSTOMER_DETAILS_EXISTS.error_code,
                "error_message": messages.CUSTOMER_DETAILS_EXISTS.error_message
            });
        } else {
            let response = await service.update({ _id: customerDetails?._id }, body);
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.CUSTOMER_UPDATED.error_code,
                    "error_message": messages.CUSTOMER_UPDATED.error_message
                })
            }
        }
    } catch (error) {
        console.log("Error caught in update customer api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.downloadCustomers = async (req, res, next) => {
    try {
        const { body } = req
        let data = { isDelete: false }
        if (body?.keyword) data['$or'] = [
            { name: { $regex: body?.keyword, $options: 'i' } },
            { email: { $regex: body?.keyword, $options: 'i' } },
            { mobile: { $regex: body?.keyword, $options: 'i' } }
        ]
        if (body?.isActive) data['isActive'] = body?.isActive
        const users = await service.searchCustomers(data, body?.page, body?.limit)

        let csv = 'Name,Email,CountryCode,Mobile,Status\n'
        for (let user of users?.data) {
            let userString = `${user.name},${user.email},${user.countryCode},${user.mobile},${user.isActive ? 'Active' : 'Inactive'}\n`
            csv += userString
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
        res.send(csv);
    } catch (error) {
        console.log('Error caught while downloading customer csv :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getWishlist = async (req, res, next) => {
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
        console.log(body);
        let data = { isDelete: false, isActive: true, wishlist: { $exists: true, $not: { $size: 0 } } }
        if (body?.keyword) data['$or'] = [{ name: { $regex: body?.keyword, $options: 'i' } }, { mobile: { $regex: body?.keyword, $options: 'i' } }]
        const customers = await service.searchWishlistedCustomers(data, body?.page, body?.limit)
        helper.deliverResponse(res, 200, customers, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get wishlist :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getTopWishlisted = async (req, res, next) => {
    try {
        const products = await service.aggregate([
            {
                '$unwind': '$wishlist'
            }, {
                '$group': {
                    '_id': '$wishlist',
                    'count': { '$sum': 1 }
                }
            }, {
                '$sort': { 'count': -1 }
            }, {
                $limit: 20
            }
        ])

        let productDetails = []
        for (let _product of products) {
            const product = await productService.getSingleProduct({ _id: _product?._id })
            productDetails.push({
                name: product?.name,
                thumbnail: BASE_URL + product?.thumbnail,
                total: _product?.count,
            })
        }
        helper.deliverResponse(res, 200, productDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in top wishlisted API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.customerDetails = async (req, res) => {
    try {
        const { body } = req
        const customerDetails = await service.getCustomerDetails(body)
        helper.deliverResponse(res, 200, customerDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get customer details api :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getWishlistDetails = async (req, res, next) => {
    try {
        const { user } = req?.params
        const customerDetails = await service.getCustomer({ userid: user })
        let products = []
        for (let product of customerDetails?.wishlist) {
            let productDetails = await productService.getSingleProduct({ _id: product })
            products.push({
                name: productDetails?.name,
                sku: productDetails?.sku,
                thumbnail: BASE_URL + productDetails?.thumbnail,
            })
        }
        let response = {
            products: products,
            customerDetails: {
                name: customerDetails?.name,
                mobile: customerDetails?.countryCode + customerDetails?.mobile,
                email: customerDetails?.email,
                slug: customerDetails?.slug
            }
        }
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get wishlist :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.deleteCustomerAddress = async (req, res, next) => {
    try {
        const { address } = req?.params
        const addressDetails = await addressService.update({ refid: address }, { isDelete: true })
        if (addressDetails) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.ADDRESS_DELETED.error_code,
                "error_message": messages.ADDRESS_DELETED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught while deleting address :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateCustomerAddress = async (req, res, next) => {
    try {
        const { body } = req
        const isDefault = body?.isDefaultShipping || false
        if (isDefault) {
            const defaultAddress = await addressService.findOne({ customer: body?.customer, isDefaultShipping: true, isDelete: false })
            const response = await addressService.update({ _id: defaultAddress?._id }, { isDefaultShipping: false })
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
                return
            }
        }

        const addressDetails = await addressService.update({ refid: body?.refid }, body)
        if (addressDetails instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, addressDetails, {
                "error_code": messages.ADDRESS_UPDATED.error_code,
                "error_message": messages.ADDRESS_UPDATED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught while updating address :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getDefaultAddress = async (req, res, next) => {
    try {
        const { body } = req
        const addressDetails = await addressService.findOne({ customer: body?.customer, isDefault: true })
        helper.deliverResponse(res, 200, addressDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught while updating address :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getSubscribers = async (req, res) => {
    try {
        const { body } = req
        let query = { isDelete: false }
        let productIds = []
        let customerIds = []
        if (body?.keyword) {
            const products = await productService.getAllProduct({ name: { $regex: body?.keyword, $options: 'i' }, isDelete: false }, { _id: 1 })
            if (products.length > 0) for (let product of products) productIds.push(product?._id)
            productIds.length > 0 ? query['product'] = { $in: productIds } : null
            const customers = await service.getCustomerByQuery({
                name: {
                    $regex: body?.keyword, $options: 'i'
                }, isDelete: false
            }, { _id: 1 })
            if (customers.length > 0) for (let customer of customers) customerIds.push(customer?._id)
            customerIds.length > 0 ? query['customer'] = { $in: customerIds } : null
        }
        const subscribers = await notificationService.search(query, body?.page, body?.limit, {}, { createdAt: -1 })
        helper.deliverResponse(res, 200, subscribers, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught while searching subscribers :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.deleteSubscriber = async (req, res, next) => {
    try {
        const { subscriber } = req?.params
        if (subscriber) {
            const subscriberDetails = await notificationService.update({ refid: subscriber }, { isDelete: true })
            if (subscriberDetails) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.SUBSCRIBER_DELETED.error_code,
                    "error_message": messages.SUBSCRIBER_DELETED.error_message
                })
            }
        }
    } catch (error) {
        console.log('Error caught while searching subscribers :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.downloadSubscribers = async (req, res, next) => {
    try {
        const subscribers = await notificationService.find({ isDelete: false })
        let subscriberDetails = []

        for (let subscriber of subscribers) {
            subscriberDetails.push({
                name: subscriber?.customer?.name ? subscriber?.customer?.name : 'Visitor',
                product: subscriber?.product?.name,
                date: new Date(subscriber?.createdAt).toLocaleString()
            })
        }

        const csvWriter = createCsvWriter({
            path: 'storedada_subscribers.csv',
            header: [
                { id: 'name', title: 'Name' },
                { id: 'product', title: 'Product' },
                { id: 'date', title: 'Date' },
            ],
        });

        csvWriter.writeRecords(subscriberDetails)
            .then(() => {
                res.setHeader('Content-disposition', 'attachment; filename=sajidha_subscribers.csv');
                res.setHeader('Content-type', 'text/csv');
                res.status(200).download(process.cwd() + '/storedada_subscribers.csv', () => {
                    fs.unlink(process.cwd() + '/storedada_subscribers.csv', (err) => { })
                });
            })
            .catch((err) => {
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.log('Error caught while downloading subscribers API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getCustomerDetails = async (req, res) => {
    try {
        const { customer } = req.params
        const customerDetails = await service.getCustomerDetails({ userid: customer })
        helper.deliverResponse(res, 200, customerDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught while customer details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.customerReferralHistory = async (req, res) => {
    try {
        const { customer } = req.params
        const { page, limit, keyword } = req.query
        const customerDetails = await service.getCustomerDetails({ userid: customer })
        let query = { 'referralSource.user': customerDetails?._id }
        if (keyword) query['name'] = { $regex: keyword, $options: 'i' }
        const invitedCustomers = await service.searchCustomers(query, page, limit, {})
        helper.deliverResponse(res, 200, invitedCustomers, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught while customer details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.customerReport = async (req, res) => {
    try {
      // Get regular customer details
      const customerDetails = await service.getCustomers({ isDelete: false }, { __v: 0, _id: 0 });
      
      // Get guest customer details
      const guestCustomerDetails = await guestCustomerService.find({ isDelete: false }, { __v: 0, _id: 0 });
      
      // Prepare customers array for CSV
      let customers = [];
      
      // Define CSV headers
      const headers = [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'countryCode', title: 'Country Code' },
        { id: 'mobile', title: 'Mobile' },
        { id: 'customerType', title: 'Customer Type' },
        { id: 'status', title: 'Status' },
        { id: 'createdAt', title: 'Created At' }
      ];
      
      // Format regular customer data
      for (let customer of customerDetails) {
        customers.push({
          name: customer?.name || '',
          email: customer?.email || '',
          countryCode: customer?.countryCode || '',
          mobile: customer?.mobile || '',
          customerType: 'Regular',
          status: customer?.isActive ? 'Active' : 'Inactive',
          createdAt: customer?.createdAt ? new Date(customer.createdAt).toLocaleString() : ''
        });
      }
      
      // Format guest customer data
      for (let guest of guestCustomerDetails) {
        customers.push({
          name: `${guest?.firstname || ''} ${guest?.lastname || ''}`.trim(),
          email: guest?.email || '',
          countryCode: guest?.countryCode || '',
          mobile: guest?.mobile || '',
          customerType: 'Guest',
          status: guest?.status || '',
          createdAt: guest?.createdAt ? new Date(guest.createdAt).toLocaleString() : ''
        });
      }
      
      // Create CSV file
      const csvFilePath = `${Date.now()}_customer_report.csv`;
      const csvWriter = createCsvWriter({ path: csvFilePath, header: headers });
      await csvWriter.writeRecords(customers);
      
      // Upload to S3
      const fileStream = fs.createReadStream(csvFilePath);
      const uploadParams = {
        Bucket: process.env.AWS_S3BUCKET_NAME,
        Key: `reports/${csvFilePath}`,
        Body: fileStream,
        ContentType: "text/csv",
      };
      
      const s3Response = await s3.upload(uploadParams).promise();
      const fileUrl = s3Response.Location;
      
      // Send email
      const subject = "Customer Report CSV Export Download Link";
      const content = `
  Dear User,
                        
  Your Customer Report is ready. You can download it from the link below:
                        
  <a href="${fileUrl}" target="_blank">Download Report</a>
  `;
      
      // Clean email and send
      if (res?.locals?.user?.email) {
        const cleanEmail = res.locals.user.email.trim().replace(/\.+$/, '');
        try {
          await sendMail(cleanEmail, subject, '', content);
        } catch (error) {
          console.error("Error sending email:", error);
          // Continue execution even if email fails
        }
      }
      
      // Clean up local CSV file
      fs.unlink(csvFilePath, (err) => {
        if (err) console.error("Error deleting temporary CSV file:", err);
      });
      
      // Send success response
      return res.status(200).json({
        data: customers,
        downloadLink: fileUrl,
        message: "Customer report generated successfully",
        error_code: 0
      });
      
    } catch (error) {
      console.log("Error caught while generating customer report :: " + error);
      return res.status(500).json({
        error_code: 1,
        message: "Error generating customer report",
        error: error.message
      });
    }
  };
  


exports.customerOrderReport = async (req, res) => {
    try {
        const orders = await db.Order.find({isDelete: false}).populate('customerId').populate('products.productId');
        const customerSpending = {};
        const customerTiers = {};
        
        const defineTier = (amount) => {
            if (amount === 0) return 'No Purchase';
            if (amount < 500) return 'Bronze';
            if (amount < 2000) return 'Silver';
            if (amount < 5000) return 'Gold';
            return 'Platinum';
        };

        orders.forEach(order => {
            if (order?.customerId) {
                const customerId = order?.customerId?._id?.toString();
                const totalSpend = order?.total || 0;
                
                if (!customerSpending[customerId]) {
                    customerSpending[customerId] = 0;
                }
                
                customerSpending[customerId] += totalSpend;
            }
        });

        for (const customerId in customerSpending) {
            customerTiers[customerId] = defineTier(customerSpending[customerId]);
        }

        const customers = [];

        orders.forEach(order => {
            if (order.customerId) {
                const customer = order.customerId;
                const customerId = customer?._id?.toString();
                const formattedAddress = order?.address ? order?.address?.street + ', ' + order?.address?.city : 'N/A';
                const productList = order?.products?.map(p => p?.productId?.name).join(', ');
                
                customers.push({
                    name: customer?.name ?? 'N/A',
                    email: customer?.email ?? 'N/A',
                    countryCode: customer?.countryCode ?? '+971',
                    mobile: customer?.mobile ?? 'N/A',
                    totalSpend: customerSpending[customerId]?.toFixed(2) ?? '0.00',
                    spendingTier: customerTiers[customerId] ?? 'No Purchase',
                    addressType: order?.address?.type ?? 'N/A',
                    address: formattedAddress || 'N/A',
                    orderNo: order?.orderNo ?? 'N/A',
                    orderDate: order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
                    orderTime: order?.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A',
                    products: productList || 'N/A',
                    subTotal: (order?.priceBeforeTax ?? 0).toFixed(2),
                    discountTotal: (order?.discount ?? 0).toFixed(2),
                    taxTotal: (order?.tax ?? 0).toFixed(2),
                    additionalCharge: (order?.additionalCharge ?? 0).toFixed(2),
                    codCost: (order?.codCost ?? 0).toFixed(2),
                    shippingCost: (order?.shippingCost ?? 0).toFixed(2),
                    total: (order?.total ?? 0).toFixed(2)
                });
            }
        });

        const tierOrder = { 'Platinum': 1, 'Gold': 2, 'Silver': 3, 'Bronze': 4, 'No Purchase': 5 };
        customers.sort((a, b) => {
            const tierDiff = tierOrder[a.spendingTier] - tierOrder[b.spendingTier];
            return tierDiff === 0 ? parseFloat(b.totalSpend) - parseFloat(a.totalSpend) : tierDiff;
        });

        const csvHeaders = [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'countryCode', title: 'Country Code' },
            { id: 'mobile', title: 'Mobile' },
            { id: 'totalSpend', title: 'Total Spend' },
            { id: 'spendingTier', title: 'Spending Tier' },
            { id: 'addressType', title: 'Address Type' },
            { id: 'address', title: 'Address' },
            { id: 'orderNo', title: 'Order No' },
            { id: 'orderDate', title: 'Order Date' },
            { id: 'orderTime', title: 'Order Time' },
            { id: 'products', title: 'Products' },
            { id: 'subTotal', title: 'Sub Total' },
            { id: 'discountTotal', title: 'Discount Total' },
            { id: 'taxTotal', title: 'Tax Total' },
            { id: 'additionalCharge', title: 'Additional Charge' },
            { id: 'codCost', title: 'COD Cost' },
            { id: 'shippingCost', title: 'Shipping Cost' },
            { id: 'total', title: 'Total' }
        ];

        // Generate CSV file
        const csvFilePath = `${Date.now()}_customer_order_report.csv`;
        const csvWriter = createCsvWriter({ path: csvFilePath, header: csvHeaders });
        await csvWriter.writeRecords(customers);

        // Upload to S3
        const fileStream = fs.createReadStream(csvFilePath);
        const uploadParams = {
            Bucket: process.env.AWS_S3BUCKET_NAME,
            Key: `reports/${csvFilePath}`,
            Body: fileStream,
            ContentType: 'text/csv',
        };

        const s3Response = await s3.upload(uploadParams).promise();
        const fileUrl = s3Response.Location;

        // Send email
        const subject = 'Customer Order Report CSV Download Link';
        const content = `
Dear User,

Your Customer Order Report is ready. You can download it from the link below:

<a href="${fileUrl}" target="_blank">Download Customer Order Report</a>
`;

        try {
            if (res?.locals?.user?.email) {
                const cleanEmail = res.locals.user.email.trim().replace(/\.+$/, '');
                await sendMail(cleanEmail, subject, '', content);
            }
        } catch (error) {
            console.log('Error sending email:', error);
        }

        // Clean up local CSV file
        fs.unlink(csvFilePath, (err) => {
            if (err) console.error("Error deleting temporary CSV file:", err);
        });

        // Send success response
        return res.status(200).json({
            data: customers,
            downloadLink: fileUrl,
            message: 'Customer order report generated and uploaded successfully',
            error_code: 0
        });

    } catch (error) {
        console.error("Error generating customer order report:", error);
        return res.status(500).json({
            error_code: 1,
            message: 'Error generating customer order report',
            error: error.message
        });
    }
};

exports.importUsers = async (req, res) => {
    try {

        const rootDir = process.cwd();
        const startTime = performance.now();
        const file = rootDir + "/" + req?.file?.path
        const { email } = res?.locals?.user
        const adminDetails = await getAdminDetails(email)

        const fileDetails = await fileImportService.create({
            title: req?.file?.originalname, createdBy: adminDetails?._id,
            slug: await slug.createSlug(db.FileImport, req?.file?.originalname, { slug: await slug.generateSlug(req?.file?.originalname) }),
            status: 'awaiting', type: 'users',
        })

        if (fileDetails instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            let counter = 0;
            const processPromises = [];
            let processFailed = false;
            await new Promise((resolve, reject) => {
                fs.createReadStream(file).pipe(csv()).on('data', async (row) => {
                    if (processFailed) return;
                    counter++;
                    const processPromise = processRow(row, counter);
                    processPromises.push(processPromise);
                    try {
                        await processPromise;
                    } catch (error) {
                        processFailed = true; // Set flag to stop processing
                        reject(error);
                    }
                }).on('end', async () => {
                    await Promise.all(processPromises);
                    resolve();
                }).on('error', (error) => {
                    reject(error);
                });
            })

            if (!processFailed) {
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                const fileAfterSuccess = await fileImportService.update({ _id: fileDetails._id }, {
                    status: 'completed',
                    executionTime: executionTime,
                    dataImported: counter
                });

                if (fileAfterSuccess instanceof Error) {
                    helper.deliverResponse(res, 422, fileAfterSuccess, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    await activity.logActivity(email, 'Users (csv) uploaded');
                    helper.deliverResponse(res, 200, { total: counter }, {
                        "error_code": 0,
                        "error_message": counter + " users uploaded successfully"
                    });
                }
            } else {
                const fileAfterFailure = await fileImportService.update(
                    { _id: fileDetails._id }, {
                    status: 'failed',
                });

                if (fileAfterFailure instanceof Error) {
                    helper.deliverResponse(res, 422, fileAfterFailure, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    helper.deliverResponse(res, 200, { total: counter }, {
                        "error_code": 1,
                        "error_message": "Failed to upload the csv file"
                    });
                }
            }
        }
    } catch (error) {
        console.log('Error caught in import users API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

function processRow(row, counter) {

    return new Promise(async (resolve, reject) => {
        try {
            const release = await mutex.acquire();
            const existingUser = await db.Customer.findOne({
                $or: [
                    { email: row?.email },
                    { mobile: row?.phoneNumber }
                ]
            });

            // Prepare the payload for creating or updating the user
            let referralCodeNew;
            //Referral code generation

            const referral = async () => {
                let referralCode = generateReferralCode(8)
                const isExists = await isReferralCodeExists(referralCode)
                if (isExists == false) {
                    referralCodeNew = referralCode
                } else {
                    await referral()
                }
            }

            await referral()

            const payload = {
                name: row?.name,
                email: row?.email,
                mobile: row?.phoneNumber,
                countryCode: row?.countryCode,
                referralCode: referralCodeNew,
                isImported: true,
            };

            // If the user exists, update their details
            if (existingUser) {
                payload.userid = existingUser?.userid;
                await db.Customer.updateOne({ _id: existingUser._id }, payload);
                console.log(`user with name: ${payload.name} & userid: ${payload.userid} updated successfully`);
            } else {
                let newUserId = await db.Customer.countDocuments()
                payload.userid = (newUserId + 1).toString();
                await db.Customer.create(payload);
                console.log(`user with name: ${payload.name} & userid: ${payload.userid} added successfully`);
            }

            release();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}


async function isReferralCodeExists(referralCode) {
    const referralDetails = await service.getCustomer({ referralCode: referralCode, isDelete: false })
    return referralDetails ? true : false;
}


function generateReferralCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
}

exports.customerData = async (req, res) => {
    try {
        const overallStats = await db.Order.aggregate([
            { $match: { isDelete: false } },
            {
                $group: {
                    _id: null,
                    overallTotalAmount: { $sum: { $toDouble: "$wholeTotal" } },
                    overallOrderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    overallAverageOrderValue: {
                        $cond: {
                            if: { $gt: ["$overallOrderCount", 0] },
                            then: { $divide: ["$overallTotalAmount", "$overallOrderCount"] },
                            else: 0
                        }
                    }
                }
            }
        ]);

        const overallAverageOrderValue = overallStats[0]?.overallAverageOrderValue || 0;

        const customerData = await db.Order.aggregate([
            { $match: { isDelete: false } },
            {
                $group: {
                    _id: "$customerId",
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: { $toDouble: "$wholeTotal" } },
                    firstOrderDate: { $min: "$createdAt" },
                    lastOrderDate: { $max: "$createdAt" },
                    orderNos: { $push: "$orderNo" },
                    location: { $first: "$address.city" }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerData'
                }
            },
            {
                $unwind: {
                    path: "$customerData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    customerId: "$_id",
                    customerName: "$customerData.name",
                    customerEmail: "$customerData.email",
                    totalOrders: 1,
                    totalAmount: 1,
                    orderNos: 1,
                    location: 1,
                    latestPurchase: "$lastOrderDate",
                    averageTimeGap: {
                        $cond: {
                            if: { $gt: [{ $size: "$orderNos" }, 1] },
                            then: {
                                $divide: [
                                    { $subtract: ["$lastOrderDate", "$firstOrderDate"] },
                                    86400000
                                ]
                            },
                            else: 0
                        }
                    },
                    averageOrderValue: {
                        $cond: {
                            if: { $gt: ["$totalOrders", 0] },
                            then: { $divide: ["$totalAmount", "$totalOrders"] },
                            else: 0
                        }
                    },
                    overallAverageOrderValue: overallAverageOrderValue,
                    spendComparedToOverall: {
                        $cond: {
                            if: { $gt: ["$totalOrders", 0] },
                            then: {
                                $subtract: [
                                    { $divide: ["$totalAmount", "$totalOrders"] },
                                    overallAverageOrderValue
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $addFields: {
                    spendingTier: {
                        $switch: {
                            branches: [
                                { case: { $gte: ["$averageOrderValue", { $multiply: [overallAverageOrderValue, 2] }] }, then: "Platinum" },
                                { case: { $gte: ["$averageOrderValue", { $multiply: [overallAverageOrderValue, 1.5] }] }, then: "Gold" },
                                { case: { $gte: ["$averageOrderValue", overallAverageOrderValue] }, then: "Silver" }
                            ],
                            default: "Bronze"
                        }
                    }
                }
            },
            {
                $sort: { lastOrderDate: -1 }
            }
        ]);

        const csvData = customerData.map(result => ({
            customerID: result.customerId,
            customerName: result?.customerName || "Guest",
            customerEmail: result?.customerEmail,
            totalOrders: result.totalOrders,
            totalAmount: result.totalAmount,
            orders: result.orderNos.join(", "),
            customerLocation: result.location,
            averageTimeGap: result.averageTimeGap,
            latestPurchase: result.latestPurchase,
            spendingTier: result.spendingTier
        }));

        const csvFilePath = `${Date.now()}_customerDataReport.csv`;
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'customerID', title: 'Customer ID' },
                { id: 'customerName', title: 'Customer Name' },
                { id: 'customerEmail', title: 'Customer Email' },
                { id: 'totalOrders', title: 'Total Orders' },
                { id: 'totalAmount', title: 'Total Order Value' },
                { id: 'orders', title: 'Orders' },
                { id: 'customerLocation', title: 'Customer Location' },
                { id: 'averageTimeGap', title: 'Average Time Gap (Days)' },
                { id: 'latestPurchase', title: 'Latest Purchase Date' },
                { id: 'spendingTier', title: 'Spending Tier' }
            ]
        });

        await csvWriter.writeRecords(csvData);

        const fileStream = fs.createReadStream(csvFilePath);
        const uploadParams = {
            Bucket: process.env.AWS_S3BUCKET_NAME,
            Key: `reports/${csvFilePath}`,
            Body: fileStream,
            ContentType: 'text/csv',
        };

        const s3Response = await s3.upload(uploadParams).promise();
        const fileUrl = s3Response.Location;
        console.log("fileUrl", fileUrl);

        const subject = 'Customer Data Report CSV download link';
        const content = `<p>Dear User,</p>
                         <p>Your Customer Data Report is ready. You can download it from the link below:</p>
                         <p><a href="${fileUrl}" target="_blank">Download Customer Data Report</a></p>`;

        try {
            await mailer.sendMail(res.locals.user.email, subject, '', content);
        } catch (error) {
            console.log('Error sending email:', error);
        }

        return res.status(200).json({
            data: customerData,
            error_code: 0,
            message: 'Customer order report generated and uploaded successfully'
        });

    } catch (error) {
        console.error("Error generating customer data report:", error);
        return res.status(500).json({
            error_code: 1,
            message: 'Error generating customer data report',
            error: error.message
        });
    }
};
