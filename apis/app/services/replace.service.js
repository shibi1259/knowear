const db = require('../db')
const { months } = require('../../util/months');

exports.create = async (data) => {
   try {
      let response = new db.Replace(data)
      await response.save()
      return response;
   } catch (error) {
      throw (error)
   }
}

exports.find = async (query, projection = {}) => {
   try {
      let response = db.Replace.find(query, projection)
      return response;
   } catch (error) {
      throw (error)
   }
}

exports.count = async (query) => {
   try {
      let response = db.Replace.find(query).countDocuments()
      return response;
   } catch (error) {
      throw (error)
   }
}

exports.findOne = async (query, projection = {}) => {
   try {
      let response = db.Replace.findOne(query, projection).populate('order').populate('product').populate('customer')
      return response;
   } catch (error) {
      throw (error)
   }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
   try {
      let response = await db.Replace.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate('order').populate('product').populate('customer')
      let count = await db.Replace.find(query).countDocuments()
      let returns = []
      for (let item of response) {
         returns.push({
            customer: item.customer?.name,
            order: item.order.orderNo,
            product: item.product.name,
            quantity: item.quantity,
            status: item.status,
            refid: item.refid,
            reference: item.reference,
            createdAt: `${months[new Date(item.createdAt).getMonth()]} ${new Date(item.createdAt).getDate()} ${new Date(item.createdAt).getFullYear()}`,
         })
      }
      let result = {
         data: returns,
         totalResults: count,
         page: page,
         limit: limit,
         totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
         isLastPage: (limit * page) > count ? true : false,
      }
      return result;
   } catch (error) {
      throw (error)
   }
}

exports.update = async (query, data) => {
   try {
      let response = await db.Replace.updateOne(query, { $set: data }, {
         new: true,
         upsert: false,
         useFindAndModify: false
      }).exec();
      return response
   } catch (error) {
      throw (error)
   }
}