const { body, validationResult } = require("express-validator")
const helper = require('../../../../util/responseHelper')
const service = require("../../../services/home.widget.service")
const messages = require('../../../../config/constants').messages
const slug = require('../../../../util/slug')
const db = require('../../../db')
const categoryService = require("../../../services/category.service")
const brandService = require("../../../services/brand.service")
const blogService = require("../../../services/blog.service")
const catalogService = require("../../../services/catalog.service")
const collectionService = require("../../../services/collection.service")
const productService = require("../../../services/product.service")
const activity = require("../../../../util/activity.creator")

//Engines
const blog = require("../../../../util/workers/blog.worker")
const product = require("../../../../util/workers/product.worker")
const image = require("../../../../util/workers/image.worker")
const { BASE_URL } = require("../../../../config/constants/common")
//Engines

function createReference() {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

exports.add = async (req, res) => {
    try {
        const { body } = req
        const widgets = await service.find({})

        body.refid = createReference()
        body.index = widgets.length + 1
        const widgetReference = async () => {
            const reference = createReference()
            const existingWidgetDetails = await service.findOne({ refid: reference })
            if (existingWidgetDetails) {
                widgetReference()
            } else {
                body.refid = reference
            }
        }

        await widgetReference()
        const widgetResponse = await service.create(body)
        if (widgetResponse instanceof Error) {
            helper.deliverResponse(res, 422, widgetResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, widgetResponse, {
                "error_code": messages.WIDGET_ADDED.error_code,
                "error_message": messages.WIDGET_ADDED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in create home widget api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.duplicate = async (req, res) => {
    try {
        const { body } = req
        const widgetDetails = await service.findOne({ refid: body.widget }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
        const widgetReference = async () => {
            const reference = createReference()
            const existingWidgetDetails = await service.findOne({ refid: reference })
            if (existingWidgetDetails) {
                widgetReference()
            } else {
                body.refid = reference
            }
        }
        await widgetReference()
        const widgetResponse = await service.create({ ...widgetDetails?._doc, ...body })
        if (widgetResponse instanceof Error) {
            helper.deliverResponse(res, 422, widgetResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, widgetResponse, {
                "error_code": messages.WIDGET_DUPLICATED.error_code,
                "error_message": messages.WIDGET_DUPLICATED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in duplicate home widget api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.widgetDetails = async (req, res) => {
    try {
        const { widget } = req.params
        if (widget) {
            const widgetDetails = await service.findOne({ refid: widget })
            helper.deliverResponse(res, 200, widgetDetails, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            })
        } else {
            const widgetDetails = await service.find({}, { styles: 1, widgetName: 1, title: 1, refid: 1, visibility: 1, widgetType: 1 }, { index: 1 })
            helper.deliverResponse(res, 200, widgetDetails, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            })
        }
    } catch (error) {
        console.log("Error caught in get widget details api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.draftWidgetDetails = async (req, res) => {
    try {
        const widgetDetails = await service.draftsWidgets({}, { styles: 1, widgetName: 1, title: 1, refid: 1, visibility: 1, widgetType: 1 }, { index: 1 })
        helper.deliverResponse(res, 200, widgetDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in get widget details api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { widget } = req.params
        const widgetDetails = await service.delete({ refid: widget })
        helper.deliverResponse(res, 200, widgetDetails, {
            "error_code": messages.WIDGET_DELETED.error_code,
            "error_message": messages.WIDGET_DELETED.error_message
        })
    } catch (error) {
        console.log("Error caught in delete widget api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res) => {
    try {
        const { body } = req
        body?.styles?.backgroundImage?.length == 0 ? delete body.styles.backgroundImage : null
        const widgetResponse = await service.update({ refid: body?.refid }, body)
        if (widgetResponse instanceof Error) {
            helper.deliverResponse(res, 422, widgetResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.WIDGET_UPDATED.error_code,
                "error_message": messages.WIDGET_UPDATED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in create widget api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.reorderWidgets = async (req, res) => {
    try {
        const { body } = req
        const { history } = req?.query
        const draftWigets = await service.draftsWidgets({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (draftWigets instanceof Error) {
            helper.deliverResponse(res, 422, draftWigets, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            if (history == 0) {
                await service.deleteMany({})
                const response = await service.save(draftWigets)
                if (response instanceof Error) {
                    helper.deliverResponse(res, 422, response, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    await updateWidgetIndex(body.widgets, res)
                }
            } else {
                await updateWidgetIndex(body.widgets, res)
            }
        }
    } catch (error) {
        console.log("Error caught in reorder widgets api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

const updateWidgetIndex = async (widgets, res) => {
    for (let widget of widgets) {
        await service.update({ refid: widget.refid }, { index: widget.index })
    }
    helper.deliverResponse(res, 200, {}, {
        "error_code": messages.DRAFT_SAVED.error_code,
        "error_message": messages.DRAFT_SAVED.error_message
    });
}

exports.getRedirections = async (req, res) => {
    try {
        const { widget } = req.params
        const { keyword } = req.query
        let query = {}
        let response = []
        switch (widget) {
            case 'category':
                keyword ? query['name'] = { $regex: keyword, $options: 'i' } : null
                const category = await categoryService.getCategoryBySearch(query, 1, 100, { name: 1, slug: 1, createdAt: 1 })
                response = category.data
                break
            case 'brands':
                keyword ? query['name'] = { $regex: keyword, $options: 'i' } : null
                const brands = await brandService.getBrandBySearch(query, 1, 100, { name: 1, slug: 1, createdAt: 1 })
                response = brands.data
                break
            case 'products':
                keyword ? query['name'] = { $regex: keyword, $options: 'i' } : null
                const products = await productService.getProductBySearch(query, 1, 100, { thumbnail: 1, name: 1, slug: 1, createdAt: 1 }, { createdAt: -1 })
                response = products.data
                break
            case 'catalog':
                keyword ? query['title'] = { $regex: keyword, $options: 'i' } : null
                const catalog = await catalogService.search(query, { title: 1, slug: 1, createdAt: 1 }, 1, 100)
                response = catalog.data
                break
            case 'blogs':
                keyword ? query['title'] = { $regex: keyword, $options: 'i' } : null
                const blogs = await blogService.search(query, { title: 1, slug: 1, createdAt: 1 }, 1, 100)
                response = blogs.data
                break
        }
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in get widget redirections api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.previewWidgets = async (req, res) => {
    try {
        const { page } = req.query
        const userid = res?.locals?.user?.userid || null;
        const deviceToken = res?.locals?.user?.deviceToken || null;
        const widgetDetails = await service.search({ visibility: { $in: ['web', 'mobile', 'all'] } }, {}, { index: 1 }, page)
        let items = []

        for (let widget of widgetDetails?.widgets) {
            try {
                switch (widget.widgetType) {
                    case 'image-slider':
                        const imageDetails = await image.createImages(widget)
                        items.push({
                            ...imageDetails,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case 'products':
                        const productDetails = await product.createProducts(widget, userid, widget?.products?.length == 0 ? 'collections' : 'products', deviceToken)
                        items.push({
                            ...productDetails,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case 'video':
                        items.push({
                            title: widget?.title,
                            description: widget?.description,
                            button: { text: widget?.buttonText, link: widget?.buttonLink },
                            video: widget?.video,
                            type: widget.widgetType,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case 'html':
                        items.push({
                            title: widget?.title,
                            description: widget?.description,
                            button: { text: widget?.buttonText, link: widget?.buttonLink },
                            html: widget?.html,
                            style: widget?.htmlStyles,
                            type: widget.widgetType,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case "video-banner":
                        items.push({
                            title: widget?.title,
                            caption: widget?.caption,
                            videoCover: `${BASE_URL}${widget?.videoCover}`,
                            description: widget?.description,
                            button: { text: widget?.buttonText, link: widget?.buttonLink },
                            video: widget?.video,
                            type: widget.widgetType,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case "banner-counter":
                        items.push({
                            title: widget?.title,
                            caption: widget?.caption,
                            videoCover: `${BASE_URL}${widget?.videoCover}`,
                            video: widget?.video,
                            description: widget?.description,
                            button: { text: widget?.buttonText, link: widget?.buttonLink },
                            type: widget.widgetType,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case "hero-banner":
                        items.push({
                            title: widget?.title,
                            description: widget?.description,
                            button: { text: widget?.buttonText, link: widget?.buttonLink },
                            video: widget?.video,
                            videoCover: `${BASE_URL}${widget?.videoCover}`,
                            type: widget.widgetType,
                            styles: getWidgetStyles(widget?.styles)
                        })
                        break
                    case "counter-banner":
                        items.push({
                            title: widget?.title,
                            description: widget?.description,
                            button: { text: widget?.buttonText, link: widget?.buttonLink },
                            counteraArray: widget?.counterArray,
                        })
                        break
                }
            } catch (widgetError) {
                console.log("Error processing widget :: " + widgetError)
            }
        }

        helper.deliverResponse(res, 200, {
            ...widgetDetails,
            widgets: items,
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in preview widgets api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.historyWidgets = async (req, res) => {
    try {
        const { page } = req.query
        const { userid, deviceToken } = res?.locals?.user
        const widgetDetails = await service.searchHistory({ visibility: { $in: ['web', 'mobile', 'all'] } }, {}, { index: 1 }, page)
        let items = []
        for (let widget of widgetDetails?.widgets) {
            switch (widget.widgetType) {
                case 'image-slider':
                    const imageDetails = await image.createImages(widget)
                    items.push({
                        ...imageDetails,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'products':
                    const productDetails = await product.createProducts(widget, userid, widget?.products?.length == 0 ? 'collections' : 'products', deviceToken)
                    items.push({
                        ...productDetails,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'video':
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'html':
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        html: widget?.html,
                        style: widget?.htmlStyles,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "video-banner":
                    items.push({
                        title: widget?.title,
                        caption: widget?.caption,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "banner-counter":
                    items.push({
                        title: widget?.title,
                        caption: widget?.caption,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        video: widget?.video,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "hero-banner":
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "counter-banner":
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        counteraArray: widget?.counterArray,
                    })
                    break
            }
        }
        helper.deliverResponse(res, 200, {
            ...widgetDetails,
            widgets: items,
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in history widgets api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.draftWidgets = async (req, res) => {
    try {
        const { page } = req.query
        const { userid, deviceToken } = res?.locals?.user
        const widgetDetails = await service.searchDrafts({ visibility: { $in: ['web', 'mobile', 'all'] } }, {}, { index: 1 }, page)
        let items = []
        for (let widget of widgetDetails?.widgets) {
            switch (widget.widgetType) {
                case 'image-slider':
                    const imageDetails = await image.createImages(widget)
                    items.push({
                        ...imageDetails,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'products':
                    const productDetails = await product.createProducts(widget, userid, widget?.products?.length == 0 ? 'collections' : 'products', deviceToken)
                    items.push({
                        ...productDetails,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'video':
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'html':
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        html: widget?.html,
                        style: widget?.htmlStyles,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "video-banner":
                    items.push({
                        title: widget?.title,
                        caption: widget?.caption,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "banner-counter":
                    items.push({
                        title: widget?.title,
                        caption: widget?.caption,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        video: widget?.video,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "hero-banner":
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "counter-banner":
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        counteraArray: widget?.counterArray,
                    })
                    break
            }
        }
        helper.deliverResponse(res, 200, {
            ...widgetDetails,
            widgets: items
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in draft widgets api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.publishedWidgets = async (req, res) => {
    try {
        const { page } = req.query
        const { userid, deviceToken } = res?.locals?.user
        const widgetDetails = await service.searchPublished({ visibility: { $in: ['web', 'mobile', 'all'] } }, {}, { index: 1 }, page)
        let items = []

        for (let widget of widgetDetails?.widgets) {
            switch (widget.widgetType) {
                case 'image-slider':
                    const imageDetails = await image.createImages(widget)
                    items.push({
                        ...imageDetails,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'products':
                    const productDetails = await product.createProducts(widget, userid, widget?.products?.length == 0 ? 'collections' : 'products', deviceToken)
                    items.push({
                        ...productDetails,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'video':
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case 'html':
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        html: widget?.html,
                        style: widget?.htmlStyles,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "video-banner":
                    items.push({
                        title: widget?.title,
                        caption: widget?.caption,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "banner-counter":
                    items.push({
                        title: widget?.title,
                        caption: widget?.caption,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        video: widget?.video,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        type: widget.widgetType,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "hero-banner":
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        video: widget?.video,
                        videoCover: `${BASE_URL}${widget?.videoCover}`,
                        type: widget.widgetType,
                        buttonVisibility: widget?.buttonVisibility,
                        styles: getWidgetStyles(widget?.styles)
                    })
                    break
                case "counter-banner":
                    items.push({
                        title: widget?.title,
                        description: widget?.description,
                        button: { text: widget?.buttonText, link: widget?.buttonLink },
                        counteraArray: widget?.counterArray,
                    })
                    break
            }
        }

        helper.deliverResponse(res, 200, {
            ...widgetDetails,
            widgets: items
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in published widgets api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.saveHomeWidgetsDraft = async (req, res) => {
    try {
        const { email } = res?.locals?.user
        const previewWidgets = await service.previewWidgets({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        const deleteDrafts = await service.deleteFromDraft({})
        if (deleteDrafts instanceof Error) {
            helper.deliverResponse(res, 422, deleteDrafts, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            const response = await service.saveToDraft(previewWidgets)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Home widgets draft saved`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.DRAFT_SAVED.error_code,
                    "error_message": messages.DRAFT_SAVED.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in save home widgets draft api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.publishHomeWidgets = async (req, res) => {
    try {
        const { email } = res?.locals?.user
        const draftsWidgets = await service.draftsWidgets({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        const historyWidgets = await service.publishedWidgets({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        const deletePublished = await service.deleteFromPublish({})
        if (deletePublished instanceof Error) {
            helper.deliverResponse(res, 422, deletePublished, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            const response = await service.saveToPublished(draftsWidgets)
            await service.deleteFromHistory({})
            await service.saveToHistory(historyWidgets)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Home widgets published`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.WIDGETS_PUBLISHED.error_code,
                    "error_message": messages.WIDGETS_PUBLISHED.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in save home widgets published api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

const getWidgetStyles = (styles) => {
    return {
        marginRight: `${styles?.marginRight / 16}rem`,
        marginLeft: `${styles?.marginLeft / 16}rem`,
        marginTop: `${styles?.marginTop / 16}rem`,
        marginBottom: `${styles?.marginBottom / 16}rem`,
        paddingRight: `${styles?.paddingRight / 16}rem`,
        paddingLeft: `${styles?.paddingLeft / 16}rem`,
        paddingTop: `${styles?.paddingTop / 16}rem`,
        paddingBottom: `${styles?.paddingBottom / 16}rem`,
        backgroundColor: styles?.backgroundColor,
        backgroundImage: styles?.backgroundImage ? BASE_URL + styles?.backgroundImage?.path : null,
        borderRadius: `${styles?.borderRadius / 16}rem`,
        borderWidth: `${styles?.borderWidth / 16}rem`,
        borderColor: styles?.borderColor,
        borderStyle: styles?.borderWidth ? 'solid' : null,
    }
}