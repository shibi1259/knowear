const { BASE_URL } = require('../../config/constants/common');
const { months } = require('../../util/months');
const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.Blog(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query) => {
    try {
        let response = db.Blog.find(query).sort({ createdAt: -1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.aggregate = async (query) => {
    try {
        let response = db.Blog.aggregate(query)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, page = 1, limit = 40) => {
    try {
        let blogs = await db.Blog.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
            .populate('thumbnail', 'path')
            .populate('cover', 'path');
        let count = await db.Blog.find(query).countDocuments()
        let blogDetails = []
        for (let blog of blogs) {
            blogDetails.push({
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
        let result = {
            data: blogDetails,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) >= count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.Blog.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query) => {
    try {
        let response = db.Blog.findOne(query)
            .populate('thumbnail', 'path')
            .populate('cover', 'path');
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Blog.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}