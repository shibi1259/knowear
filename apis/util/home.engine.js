const service = require("../app/services/home.widget.service")
const blog = require("./workers/blog.worker")

exports.homeWidgets = async () => {
    const widgets = await service.find({}, {}, { index: 1 })
    let items = []
    for (let widget of widgets) {
        switch (widget.widgetType) {
            case 'blogs':
                const blogDetails = await blog.createBlogs(widget)
                items.push(blogDetails)
                break
            case 'html':
                items.push({
                    title: widget?.title,
                    description: widget?.description,
                    button: { text: widget?.buttonText, link: widget?.buttonLink },
                    html: widget?.html,
                })
                break
            case 'brands':
                break
            case 'categories':
                break
        }
    }

    console.log(items);
}