const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/blog.controller");

module.exports = () => {
    router.post("/blogs", controller.blogs);
    router.get('/blogs/:blog', controller.blogDetails);
    router.post('/related-blogs', controller.relatedBlogs);

    return router;
};
 