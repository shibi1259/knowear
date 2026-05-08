const { BASE_URL } = require('../../../config/constants/common')
const { months } = require('../../../util/months')
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/blog.service')
const db = require('../../db')

exports.blogs = async (req, res) => {
    try {
        const { body } = req
        const aggregate = [
            { '$group': { '_id': null, 'categories': { '$addToSet': '$category' } } }
        ]
        let query = { isActive: true, isDelete: false }
        if (body?.category) query['category'] = body.category
        const aggregated = await service.aggregate(aggregate)
        const response = await service.search(query, {}, body.page, body.limit)
        helper.deliverResponse(res, 200, { blogs: response, categories: aggregated[0]?.categories }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message,
        })
    } catch (error) {
        console.log("Error caught in blogs web API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.relatedBlogs = async (req, res) => {
    try {
        const { body } = req
        const aggregate = [
            { '$group': { '_id': null, 'categories': { '$addToSet': '$category' } } }
        ]
        let query = { isActive: true, isDelete: false }
        if (body?.category) query['category'] = body.category
        const aggregated = await service.aggregate(aggregate)
        const response = await service.search(query, {}, 1, 3)
        helper.deliverResponse(res, 200, { blogs: response, categories: aggregated[0]?.categories }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message,
        })
    } catch (error) {
        console.log("Error caught in blogs web API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.blogDetails = async (req, res) => {
    try {
        const { blog } = req.params
        const response = await service.findOne({ slug: blog })
     
        let blogDetails = {
            title: response.title,
            description: response.description,
            category: response.category,
            thumbnail: BASE_URL + response.thumbnail?.path,
            cover: BASE_URL + response.cover?.path,
            overview:response?.overview,
            seoTitle: response.seoTitle,
            seoDescription: response.seoDescription,
            seoKeywords: response.seoKeywords,
            canonicalUrl: response.canonicalUrl,
            ogImage: response.ogImage,
            twitterCard: response.twitterCard,
            createdAt: `${months[new Date(response.createdAt).getMonth()]} ${new Date(response.createdAt).getDate()} ${new Date(response.createdAt).getFullYear()}`,
        }
        // Fetch related blogs
        const relatedBlogs = await db.Blog.find({
            category: response.category,
            slug: { $ne: blog }, // Exclude the current blog
        }).limit(3)
        .populate('thumbnail', 'path')
        .populate('cover', 'path');

        let relatedBlogDetails=[] ;
        for (let blog of relatedBlogs) {
            relatedBlogDetails.push({
                title: blog.title,
                thumbnail: BASE_URL + blog?.thumbnail?.path,
                cover: BASE_URL + blog?.cover?.path,
                slug: blog.slug,
                category: blog.category,
                overivew: blog.overview,
                description: blog?.description,
                createdAt: `${months[new Date(blog.createdAt).getMonth()]} ${new Date(blog.createdAt).getDate()} ${new Date(blog.createdAt).getFullYear()}`,
            })
        }
        const finalResponse = {
            ...blogDetails,
            relatedBlogs: relatedBlogDetails,
        };
        

        helper.deliverResponse(res, 200, finalResponse, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message,
        })
    } catch (error) {
        console.log("Error caught in blog details web API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}