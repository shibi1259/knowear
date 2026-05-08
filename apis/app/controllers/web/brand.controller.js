const { BASE_URL } = require('../../../config/constants/common')
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/brand.service')

exports.getBrands = async (req, res, next) => {
   try {
      const query = [
         {
            '$match': {
               'isActive': true,
               'isArchive': false
            }
         },
         {
            '$lookup': {
               'from': 'medias',
               'localField': 'thumbnail',
               'foreignField': '_id',
               'as': 'thumbnailMedia'
            }
         },
         {
            '$project': {
               'name': 1,
               '_id': 0,
               'slug': 1,
               'brandid': 1,
               'thumbnail': {
                  '$concat': [BASE_URL, { '$arrayElemAt': ['$thumbnailMedia.path', 0] }]
               }
            }
         }
      ];

      const brands = await service.aggregate(query)
      helper.deliverResponse(res, 200, brands, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      })
   } catch (error) {
      console.log("Error caught in get brands API :: " + error)
      helper.deliverResponse(res, 422, error, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}