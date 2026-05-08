const { BASE_URL } = require("../../config/constants/common")

exports.createImages = async (widgetDetails) => {
    let mediaDetails = widgetDetails?.widgetImages.map(media => ({
        title: media?.title,
        description: media?.description,
        button: media?.button,
        thumbnail: BASE_URL + media?.media?.path,
        redirection: media?.redirection,
    }));

    return {
        title: widgetDetails?.title,
        titleImage: widgetDetails?.titleImage && `${BASE_URL}${widgetDetails?.titleImage?.path}`,
        description: widgetDetails?.description,
        button: { text: widgetDetails?.buttonText, link: widgetDetails?.buttonLink },
        medias: mediaDetails,
        visibility: widgetDetails?.visibility,
        view: {
            viewType: widgetDetails?.view,
            viewCount: widgetDetails?.view == 'grid' ? widgetDetails?.gridsPerCount : widgetDetails?.slidesPerCount,
        },
        spacing: widgetDetails?.spacing,
        sliderbuttons: widgetDetails?.sliderbuttons || false,
        pagination: widgetDetails?.pagination || false,
        slides: widgetDetails?.widgetType == 'slider-spotlight' ? widgetDetails?.widgetSlides : null,
        type: widgetDetails?.widgetType
    }
}