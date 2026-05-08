const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const faqService = require('../../services/faq.service')
const aboutService = require('../../services/about.service')
const helpService = require('../../services/help.center.service')
const socialService = require("../../services/social.service")
const { BASE_URL } = require('../../../config/constants/common')
const contentService = require("../../services/content.service")
const footerService = require("../../services/footer.service")

exports.faq = async (req, res, next) => {
    try {
        const response = await faqService.find({ isDelete: false, isActive: true }, { question: 1, answer: 1, subject: 1, _id: 0, seoSection: 1 });
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch {
        console.log("Error caught in faq details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.about = async (req, res, next) => {
    try {
        const response = await aboutService.getAboutDetails({ refid: 'about-us' });
        helper.deliverResponse(res, 200, {
            html: response?.html,
            styles: response?.styles,
            title: response?.title,
            description: response?.description,
            thumbnail: response?.thumbnail ? BASE_URL + response?.thumbnail?.path : null,
            shortTitle: response?.shortTitle,
            shortDescription: response?.shortDescription,
            legacyItems: response?.legacyItems,
            features: response?.features?.length > 0 ? response?.features?.map((feature) => {
                return {
                    title: feature.title,
                    description: feature.description,
                    thumbnail: feature.thumbnail ? BASE_URL + feature.thumbnail?.path : null
                }
            }) : [],
            storyTitle: response?.storyTitle,
            storyDescription: response?.storyDescription,
            storyThumbnails: response?.storyThumbnails?.length > 0 ? response?.storyThumbnails?.map((story) => {
                return BASE_URL + story?.path
            }) : [],
            seoSection: response?.seoSection
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in about details API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.help = async (req, res, next) => {
    try {
        let result = await helpService.findOne();
        let response = {
            description: result?.description,
            countryCode: result?.countryCode,
            mobile: result?.phone,
            email: result?.email,
        }
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.footer = async (req, res, next) => {
    try {
        const links = await socialService.getSocialDetails({ refid: '1' })
        helper.deliverResponse(res, 200, {
            links: links,
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in footer details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.pageContents = async (req, res) => {
    try {
        const response = await contentService.findOne({})
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getFooter = async (req, res) => {
    try {
        const footerDetails = await footerService.findOne({ isActive: true, isDelete: false })
        helper.deliverResponse(res, 200, footerDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught in get footer API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
