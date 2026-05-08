const productService = require("../../../services/product.service")
const settingsService = require("../../../services/general.settings.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const iconv = require('iconv-lite');
const fs = require('fs');
const xmlBuilder = require('xmlbuilder');
const { body, validationResult } = require("express-validator");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const service = require("../../../services/feed.service");
const { BASE_URL } = require("../../../../config/constants/common");

exports.validate = (method) => {
    switch (method) {
        case 'manage': {
            return [
                body('isGoogleFeed', `Google feed is required`).exists(),
                body('isFacebookFeed', `Facebook feed is required`).exists(),
                body('googleFeedUrl', `Google URL is required`).exists(),
                body('facebookFeedUrl', `Facebook URL is required`).exists(),
            ]
        }
    }
}

exports.manageFeed = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        let { body } = req;
        const feedDetails = await service.findOne({ refid: '1', isDelete: false })
        if (feedDetails) {
            let response = await service.update({ refid: feedDetails?.refid }, body)
            if (response) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.UPDATE_FEED.error_code,
                    "error_message": messages.UPDATE_FEED.error_message
                });
            }
        } else {
            body.refid = await service.count({}) + 1
            let response = await service.create(body);
            if (response) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.ADD_FEED.error_code,
                    "error_message": messages.ADD_FEED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage feed API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.feedDetails = async (req, res) => {
    try {
        const feedDetails = await service.findOne({ refid: '1', isDelete: false }, { _id: 0, createdAt: 0, updatedtAt: 0, __v: 0 })
        helper.deliverResponse(res, 200, feedDetails, {
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

exports.exportFeed = async (req, res) => {
    try {
        const settings = await settingsService.findOne({ refid: '1', isDelete: false })
        const query = [{
            '$graphLookup': {
                'from': 'medias',
                'startWith': '$thumbnail',
                'connectFromField': 'thumbnail',
                'connectToField': '_id',
                'as': 'productThumbnail'
            }
        }, {
            '$project': {
                'thumImg': {
                    '$arrayElemAt': ["$productThumbnail", 0]
                },
                'sku': "$sku",
                "name": "$name",
                "slug": "$slug",
                "price": "$price",
                "details": "$details"
            }
        }, {
            '$project': {
                'id': '$_id',
                '_id': 0,
                'sku': '$sku',
                'title': { $replaceOne: { input: "$name", find: '/[&<>]/g', replacement: "" } },
                'image': { '$concat': [`${BASE_URL}`, '$thumImg.path'] },
                'link': { '$concat': [`${settings?.domain}/product-detail/`, '$slug'] },
                'price': { '$concat': [`${settings?.currency} `, { $toString: '$price.selling' }] },
                'description': '$details.description'
            }
        }]

        const products = await productService.aggregate(query)
        let downloadFile = ''
        const { type, format } = req?.query
        switch (type) {
            case 'google':
                res.type('application/xml');
                let googleResponse = await generateGoogleProductFeed(products, settings?.domain);
                downloadFile = process.cwd() + `/${googleResponse}`;
                break
            case 'facebook':
                switch (format) {
                    case 'csv':
                        let productItems = []
                        for (let product of products) {
                            productItems.push({
                                name: product.title,
                                mrp: product?.price,
                                selling: product?.price?.selling,
                                link: product?.link,
                                description: product?.description,
                                thumbnail: product?.image,
                                id: product?.id
                            })
                        }

                        const csvWriter = createCsvWriter({
                            path: 'facebookfeed.csv',
                            header: [
                                { id: 'name', title: 'Name' },
                                { id: 'mrp', title: 'MRP' },
                                { id: 'selling', title: 'Selling' },
                                { id: 'link', title: 'Link' },
                                { id: 'description', title: 'Description' },
                                { id: 'thumbnail', title: 'Thumbnail' },
                                { id: 'id', title: 'ID' },
                            ],
                        });

                        try {
                            await csvWriter.writeRecords(productItems);
                            downloadFile = process.cwd() + '/facebookfeed.csv';
                        } catch (error) {
                            helper.deliverResponse(res, 500, error, {
                                "error_code": messages.serverError.error_code,
                                "error_message": messages.serverError.error_message
                            });
                            return;
                        }
                        break
                    case 'xml':
                        res.type('application/xml');
                        let facebookXmlResponse = await generateFacebookProductFeed(products, settings?.domain);
                        downloadFile = process.cwd() + `/${facebookXmlResponse}`;
                        break
                }
                break
        }

        res.download(downloadFile, (err) => {
            if (err) {
                helper.deliverResponse(res, 500, {}, {
                    "error_code": messages.FILE_ERROR.error_code,
                    "error_message": messages.FILE_ERROR.error_message
                });
                return
            } else {
                fs.unlink(downloadFile, (err) => {
                    if (err) {
                        helper.deliverResponse(res, 500, {}, {
                            "error_code": messages.FILE_ERROR.error_code,
                            "error_message": messages.FILE_ERROR.error_message
                        });
                        return
                    }
                });
            }
        });
    } catch (error) {
        console.log('Error caught while generating google feed :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

const generateGoogleProductFeed = async (products, domain) => {
    try {
        const root = xmlBuilder.create('rss', { version: '1.0', encoding: 'UTF-8' });
        root.att('xmlns:g', 'http://example.com/google-product-namespace');
        const channel = root.ele('channel')
            .ele('title', 'Fresh Fruit Mart LLC').up()
            .ele('link', domain).up()
            .ele('description', 'Daily feed containing the required and recommended attributes for a variety of different products').up();
        products.forEach((product, index) => {
            channel.ele('item')
                .ele('g:id', iconv.encode(index + 1, 'utf8').toString()).up()
                .ele('g:title', iconv.encode(product.title, 'utf8').toString()).up()
                .ele('g:sku', iconv.encode(product.sku, 'utf8').toString()).up()
                .ele('g:description', iconv.encode(product.description, 'utf8').toString()).up()
                .ele('g:link', iconv.encode(product.link, 'utf8').toString()).up()
                .ele('g:image_link', iconv.encode(product.image, 'utf8').toString()).up()
                .ele('g:price', iconv.encode(product.price, 'utf8').toString()).up()
        });
        const xml = root.end({ pretty: true });
        let filename = `${Date.now()}_google_product_feed.xml`
        fs.writeFileSync(filename, xml);
        return filename
    } catch (error) {
        return error
    }
}

const generateFacebookProductFeed = async (products, domain) => {
    try {
        const root = xmlBuilder.create('feed', { version: '1.0', encoding: 'UTF-8' });
        root.att('xmlns:g', 'http://example.com/google-product-namespace')
        root.ele('title', 'Fresh Fruit Mart LLC').up()
            .ele('link').att('rel', 'self').att('href', domain).up()
        products.forEach((product, index) => {
            root.ele('entry')
                .ele('g:id', iconv.encode(index + 1, 'utf8').toString()).up()
                .ele('g:title', iconv.encode(product.title, 'utf8').toString()).up()
                .ele('g:sku', iconv.encode(product.sku, 'utf8').toString()).up()
                .ele('g:description', iconv.encode(product.description, 'utf8').toString()).up()
                .ele('g:link', iconv.encode(product.link, 'utf8').toString()).up()
                .ele('g:image_link', iconv.encode(product.image, 'utf8').toString()).up()
                .ele('g:price', iconv.encode(product.price, 'utf8').toString()).up()
        });
        const xml = root.end({ pretty: true });
        let filename = `${Date.now()}_facebook_product_feed.xml`
        fs.writeFileSync(filename, xml);
        return filename
    } catch (error) {
        return error
    }
}