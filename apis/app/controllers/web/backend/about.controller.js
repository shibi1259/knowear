const { body, validationResult } = require("express-validator")
const service = require("../../../services/about.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const activity = require("../../../../util/activity.creator")

// exports.manageAbout = async (req, res) => {
//   try {
//     const { body, files } = req;
//     const email = res?.locals?.user?.email || 'admin';
//     console.log("body", body);

//     // Create the properly structured data object according to the schema
//     const structuredData = {
//       refid: 'about-us',
//       // Section 1
//       section1: {
//         heading: body.section1Heading,
//         paragraph: body.section1Paragraph,
//         banner1: body.section1Banner1,
//         banner2: body.section1Banner2,
//         mobileBanner1: body.mobileBanner1, // Updated field name to match the body
//         button1: {
//           label: body.section1ButtonLabel,
//           link: body.section1ButtonLink
//         },
//         button2: {
//           label: body.section1Button2Label,
//           link: body.section1Button2Link
//         }
//       },
//       // Section 2
//       section2: {
//         heading: body.section2Heading,
//         paragraph: body.section2Paragraph,
//         banner: body.section2Banner,
//         mobileBanner2: body.mobileBanner2, // Updated field name to match the body
//         bannerHeading: body.section2BannerHeading,
//         bannerDescription: body.section2BannerDescription,
//         button: {
//           label: body.section2ButtonLabel,
//           link: body.section2ButtonLink
//         }
//       },
//       // Section 3
//       section3: {
//         heading: body.section3Heading,
//         paragraph: body.section3Paragraph,
//         mobileBanner3: body.mobileBanner3 // Updated field name to match the body
//       },
//       // Counter Section
//       counters: [
//         {
//           label: body.count1Description,
//           value: body.count1Value
//         },
//         {
//           label: body.count2Description,
//           value: body.count2Value
//         },
//         {
//           label: body.count3Description,
//           value: body.count3Value
//         }
//       ],
//       updatedAt: new Date()
//     };

//     // Handle file uploads for main banners
//     if (files?.section1Banner?.length > 0) {
//       structuredData.section1.banner1 = files.section1Banner[0].path.replace(/\\/g, '/');
//     }
    
//     if (files?.section1Banner2?.length > 0) {
//       structuredData.section1.banner2 = files.section1Banner2[0].path.replace(/\\/g, '/');
//     }
    
//     // Fixed: Updated field names to match the form field names for mobile banners
//     if (files?.mobileBanner1?.length > 0) {
//       structuredData.section1.mobileBanner1 = files.mobileBanner1[0].path.replace(/\\/g, '/');
//     }
    
//     if (files?.section2Banner?.length > 0) {
//       structuredData.section2.banner = files.section2Banner[0].path.replace(/\\/g, '/');
//     }
    
//     // Fixed: Updated field name for section2 mobile banner
//     if (files?.mobileBanner2?.length > 0) {
//       structuredData.section2.mobileBanner2 = files.mobileBanner2[0].path.replace(/\\/g, '/');
//     }
    
//     if (files?.section3Banner?.length > 0) {
//       structuredData.section3.banner = files.section3Banner[0].path.replace(/\\/g, '/');
//     }
    
//     // Fixed: Updated field name for section3 mobile banner
//     if (files?.mobileBanner3?.length > 0) {
//       structuredData.section3.mobileBanner3 = files.mobileBanner3[0].path.replace(/\\/g, '/');
//     }

//     // Process any sections that might have been passed as JSON strings
//     ['section1', 'section2', 'section3'].forEach((key) => {
//       if (typeof body[key] === 'string') {
//         try {
//           const parsedSection = JSON.parse(body[key]);
//           structuredData[key] = {...structuredData[key], ...parsedSection};
//         } catch (e) {
//           console.warn(`Could not parse ${key} as JSON.`);
//         }
//       } else if (typeof body[key] === 'object' && body[key] !== null) {
//         // If it's already an object, merge it with our structured data
//         structuredData[key] = {...structuredData[key], ...body[key]};
//       }
//     });

//     // Handle counters if passed as array
//     if (Array.isArray(body.counters)) {
//       structuredData.counters = body.counters;
//     } else if (typeof body.counters === 'string') {
//       try {
//         structuredData.counters = JSON.parse(body.counters);
//       } catch (e) {
//         console.warn('Could not parse counters as JSON.');
//       }
//     }

//     const aboutDetails = await service.getAboutDetails({ refid: 'about-us' });
    
//     if (aboutDetails) {
//       const response = await service.updateAbout({ refid: 'about-us' }, structuredData);
//       if (response instanceof Error) {
//         helper.deliverResponse(res, 422, response, {
//           "error_code": messages.serverError.error_code,
//           "error_message": messages.serverError.error_message
//         });
//       } else {
//         activity.logActivity(email, 'About us CMS updated successfully');
//         helper.deliverResponse(res, 200, {}, {
//           "error_code": messages.ABOUT_UPDATED.error_code,
//           "error_message": messages.ABOUT_UPDATED.error_message
//         });
//       }
//     } else {
//       // Set createdAt for new records
//       structuredData.createdAt = new Date();
      
//       const response = await service.createAbout(structuredData);
//       if (response instanceof Error) {
//         helper.deliverResponse(res, 422, response, {
//           "error_code": messages.serverError.error_code,
//           "error_message": messages.serverError.error_message
//         });
//       } else {
//         activity.logActivity(email, 'About us CMS added successfully');
//         helper.deliverResponse(res, 200, {}, {
//           "error_code": messages.ABOUT_ADDED.error_code,
//           "error_message": messages.ABOUT_ADDED.error_message
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Error in manageAbout API:", error);
//     helper.deliverResponse(res, 422, {}, {
//       "error_code": messages.serverError.error_code,
//       "error_message": messages.serverError.error_message
//     });
//   }
// };
exports.manageAbout = async (req, res) => {
  try {
    const { body } = req;
    const email = res?.locals?.user?.email || 'admin';
    console.log("body", body);

    // Construct the structured data according to schema
    const structuredData = {
      refid: 'about-us',

      // Section 1
      section1: {
        heading: body.section1?.heading,
        paragraph: body.section1?.paragraph,
        banner1: body.section1?.banner1,
        banner2: body.section1?.banner2,
        mobileBanner1: body.section1?.mobileBanner1,
        button1: {
          label: body.section1?.button1?.label,
          link: body.section1?.button1?.link
        },
        button2: {
          label: body.section1?.button2?.label,
          link: body.section1?.button2?.link
        }
      },

      // Section 2
      section2: {
        heading: body.section2?.heading,
        paragraph: body.section2?.paragraph,
        banner: body.section2?.banner,
        mobileBanner2: body.section2?.mobileBanner2,
        bannerHeading: body.section2?.bannerHeading,
        bannerDescription: body.section2?.bannerDescription,
        button: {
          label: body.section2?.button?.label,
          link: body.section2?.button?.link
        }
      },

      // Section 3
      section3: {
        heading: body.section3?.heading,
        paragraph: body.section3?.paragraph,
        mobileBanner3: body.section3?.mobileBanner3
      },

      // Counters
      counters: Array.isArray(body.counters)
        ? body.counters
        : typeof body.counters === 'string'
          ? JSON.parse(body.counters)
          : [],

      seoSection: {
        title: body.seoSection?.title,
        description: body.seoSection?.description,
        keywords: body.seoSection?.keywords,
        image: body.seoSection?.image,
        canonical: body.seoSection?.canonical,
        xCard: body.seoSection?.xCard
      },

      updatedAt: new Date()
    };

    // Check if data exists in DB
    const aboutDetails = await service.getAboutDetails({ refid: 'about-us' });

    if (aboutDetails) {
      // Update
      const response = await service.updateAbout({ refid: 'about-us' }, structuredData);
      if (response instanceof Error) {
        helper.deliverResponse(res, 422, response, {
          "error_code": messages.serverError.error_code,
          "error_message": messages.serverError.error_message
        });
      } else {
        activity.logActivity(email, 'About us CMS updated successfully');
        helper.deliverResponse(res, 200, {}, {
          "error_code": messages.ABOUT_UPDATED.error_code,
          "error_message": messages.ABOUT_UPDATED.error_message
        });
      }
    } else {
      // Create
      structuredData.createdAt = new Date();
      const response = await service.createAbout(structuredData);
      if (response instanceof Error) {
        helper.deliverResponse(res, 422, response, {
          "error_code": messages.serverError.error_code,
          "error_message": messages.serverError.error_message
        });
      } else {
        activity.logActivity(email, 'About us CMS added successfully');
        helper.deliverResponse(res, 200, {}, {
          "error_code": messages.ABOUT_ADDED.error_code,
          "error_message": messages.ABOUT_ADDED.error_message
        });
      }
    }

  } catch (error) {
    console.error("Error in manageAbout API:", error);
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
};

exports.getAboutDetails = async (req, res) => {
    try {
        const response = await service.getAboutDetails({ refid: 'about-us' })
        console.log(response,"response")
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in get about details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
