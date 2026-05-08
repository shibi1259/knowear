const { BASE_URL } = require("../../config/constants/common")
const { months } = require("../months")
const service = require("../../app/services/blog.service")

exports.createBlogs = async (widgetDetails, type) => {
    let blogs = []
    for (let blog of widgetDetails?.blogs) {
        const blogDetails = await service.findOne({ _id: blog?._id, isDelete: false, isActive: true })
        if (blogDetails) {
            blogs.push({
                title: blogDetails?.title,
                thumbnail: BASE_URL + blogDetails?.thumbnail?.path,
                slug: blogDetails?.slug,
                category: blogDetails?.category,
                createdAt: `${months[new Date(blogDetails?.createdAt).getMonth()]} ${new Date(blogDetails?.createdAt).getDate()} ${new Date(blogDetails?.createdAt).getFullYear()}`
            })
        }
    }

    return {
        title: widgetDetails?.title,
        description: widgetDetails?.description,
        button: { text: "Read more", link: "/blogs" },
        blogs: blogs,
        type: widgetDetails?.widgetType
    }
}