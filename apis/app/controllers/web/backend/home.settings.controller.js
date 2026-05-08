const service = require("../../../services/home.settings.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

const b_service = require("../../../services/brand.service")
const p_service = require("../../../services/product.service")
const c_service = require("../../../services/category.service")
const col_service = require("../../../services/collection.service")
const banner_service = require("../../../services/banner.service")
const layout_service = require("../../../services/home.section.service")
const home_service = require("../../../services/home.settings.service")

exports.add = async (req, res) => {
   try {
      const { body } = req;
      const code = Math.floor(10 + Math.random() * 90);
      let obj = {}
      let data = {}
      for (const key of Object.keys(body)) {
         data[key] = {
            value: body[key] - 1
         }
      }
      obj.slug = code
      obj.positions = data
      console.log(body);
      const HomeSettings = await service.createHomeSettingsSettings(obj)
      helper.deliverResponse(res, 200, HomeSettings, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getHomeSettings = async (req, res) => {
   try {
      const Home = await service.getSettings({ isDelete: false })
      const page = 1
      const limit = 10
      let result = {}
      let data = []
      const positions = await home_service.getSettings({ isDelete: false, isActive: true })
      const index_array = JSON.parse(positions[0]['positions'])
      const to = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      const from = new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
      const category = await c_service.categoryForDashboard({ isActive: true, isDelete: false, isArchive: false, isFeatured: true }, page, limit)
      const brand = await b_service.brandForDashboard({ isActive: true, isDelete: false, isArchive: false, isFeatured: true }, page, limit)
      const collection = await col_service.collectionForDashboard({ isActive: true, isDelete: false, isArchive: false }, page, limit)
      const banner = await banner_service.bannerForDashboard({ isActive: true, isDelete: false, validTo: { $gte: to }, validFrom: { $lte: from } }, page, limit)
      const slider_layouts = await layout_service.sliderLayoutForDashboard("carausel", { isActive: true, isDelete: false, type: "Slider", validTo: { $gte: to }, validFrom: { $lte: from } }, page, limit)
      const list_layout = await layout_service.sliderLayoutForDashboard("list", { isActive: true, isDelete: false, type: "List", validTo: { $gte: to }, validFrom: { $lte: from } }, page, limit)
      const collectionProducts = await col_service.featuredCollection({ isActive: true, isArchive: false, isDelete: false, isFeatured: true })
      for (let key of Object.keys(index_array)) {
         switch (key) {
            case 'deals-grid':
               data.splice(index_array['deals-grid']['value'], 0, collection) //Deals
               break
            case 'category':
               data.splice(index_array['category']['value'], 0, category) //Category
               break
            case 'brand':
               data.splice(index_array['brand']['value'], 0, brand) //Brand
               break
            case 'banner':
               for (let i = 0; i < banner.length; i++) {
                  const index = index_array['banner']['value'] + i
                  data.splice(index, 0, banner[i])
               }
               break
            case 'carausel':
               for (let i = 0; i < slider_layouts.length; i++) {
                  const index = index_array['carausel']['value'] + i
                  data.splice(index, 0, slider_layouts[i])
               }
               break
            case 'product':
               for (let i = 0; i < collectionProducts.length; i++) {
                  if (collectionProducts[i]['type'] == "product") {
                     data.splice(index_array['product']['value'], 0, collectionProducts[i])
                  }
               }
               break
            case 'product-grid':
               for (let i = 0; i < collectionProducts.length; i++) {
                  if (collectionProducts[i]['type'] == "product-grid") {
                     data.splice(index_array['product-grid']['value'], 0, collectionProducts[i])
                  }
               }
               break
         }
      }
      helper.deliverResponse(res, 200, data, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      })
   } catch (error) {
      console.log(error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getHomeSettingsBySlug = async (req, res) => {
   try {
      const { id } = req.query
      const Home = await service.getSettings({ slug: id, isActive: true, isDelete: false })

      helper.deliverResponse(res, 200, Home, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      })
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getHomeSettingsCount = async (req, res) => {
   try {
      const Home = await service.getSettingsCount({ isActive: true, isDelete: false })
      helper.deliverResponse(res, 200, Home)
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.update = async (req, res) => {
   try {
      const { body } = req
      const slugResp = await service.getSettings({ isActive: true, isDelete: false })
      const slug = slugResp[0]['refid']
      body['positions'] = JSON.stringify(body['positions'])
      const Home = await service.updateHomeSettings(slug, body)
      helper.deliverResponse(res, 200, Home, {
         "error_code": messages.DASHBOARD_UPDATE.error_code,
         "error_message": messages.DASHBOARD_UPDATE.error_message
      })
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}