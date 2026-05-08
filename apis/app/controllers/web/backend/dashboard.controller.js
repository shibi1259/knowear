const productService = require(".././../../services/product.service")
const orderService = require(".././../../services/order.service")
const customerService = require(".././../../services/customer.service")
const seoService = require("../../../services/seo.service")
const brand_service = require(".././../../services/brand.service")
const helper = require('../../../../util/responseHelper')
const { BASE_URL } = require("../../../../config/constants/common")
const messages = require('../../../../config/constants').messages
const settingsService = require("../../../services/general.settings.service")
const dashboard = require("../../../services/dashboard.service")
const helpService = require(".././../../services/help.center.service")
const mailerService = require("../../../services/mailer.service")

exports.dashboard = async (req, res, next) => {
   try {
      let dashboard = {}
      const activeProductscount = await productService.count({ isActive: true, isDelete: false })
      const outOfStockProducts = await productService.count({ stock: 0, isDelete: false, isActive: true })
      const inactiveProductsCount = await productService.count({ isActive: false, isDelete: false })
      const activeOrderscount = await orderService.getOrderCount({ isActive: true, isDelete: false })
      const pendingOrdersCount = await orderService.getOrderCounts({ isActive: true, isDelete: false, orderStatus: 'PENDING' })
      const deliveredOrdersCount = await orderService.getOrderCounts({ isActive: true, isDelete: false, orderStatus: { $in: ['COLLECTED', 'DELIVERED'] } })
      const customercount = await customerService.getCustomerCount({ isActive: true, isDelete: false })
      const brandcount = await brand_service.count({ isActive: true, isDelete: false })

      const revenueQuery = [{
         '$project': {
            'total': { '$toDouble': '$total' }
         }
      }, {
         '$group': {
            '_id': 'Orders',
            'totalRevenue': { '$sum': '$total' },
            'totalOrders': { '$sum': 1 }
         }
      }, {
         '$project': {
            'totalRevenue': 1,
            'totalOrders': 1,
            'averageSales': { '$divide': ['$totalRevenue', '$totalOrders'] }
         }
      }]

      const revenues = await orderService.getOrdersByAggregate([
         { $project: { total: { $toDouble: "$wholeTotal" }, orderStatus: 1 } },
         { $match: { orderStatus: { $in: ['COLLECTED', 'DELIVERED'] } } },
         { $group: { _id: "Total Sales", total: { $sum: "$total" } } }
      ])

      dashboard.header = {
         products: activeProductscount,
         orders: activeOrderscount,
         customers: customercount,
         revenue: revenues.length > 0 ? revenues[0]?.total.toFixed(2) : '0.00',
      }

      dashboard.otherInformations = [
         {
            title: 'Out of stock',
            value: outOfStockProducts,
            path: '/app/product',
            query: 'out-of-stock'
         }, {
            title: 'Pending orders',
            value: pendingOrdersCount,
            path: '/app/orders',
            query: 'pending'
         }, {
            title: 'Inactive products',
            value: inactiveProductsCount,
            path: '/app/product',
            query: 'inactive-products'
         }, {
            title: 'Delivered orders',
            value: deliveredOrdersCount,
            path: '/app/orders',
            query: 'delivered'
         }, {
            title: 'Total brands',
            value: brandcount,
            path: '/app/brand'
         }
      ]

      helper.deliverResponse(res, 200, dashboard, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log(error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.monthlyRevenue = async (req, res, next) => {
   try {
      const { body } = req
      const type = body?.type ? body.type : 6
      let currentDate = new Date();
      let lastFiveMonths = [];
      const monthNames = [
         "January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"
      ];

      const settings = await settingsService.findOne({ })

      for (let i = 0; i < type; i++) {
         let month = currentDate.getMonth();
         let year = currentDate.getFullYear();
         let revenue = 0
         let lastDay = new Date(year, month, 0).getDate();
         const lte = new Date(year, (month + 1), 0)
         const gte = new Date(year, month, 1)

         const query = {
            isActive: true,
            isDelete: false,
            $and: [{ createdAt: { $gte: gte } }, { createdAt: { $lte: lte } }],
            $or: [{ orderStatus: 'DELIVERED' }, { orderStatus: 'COLLECTED' }]
         }

         const orders = await orderService.getOrdersData(query)


         for (let order of orders) {
            revenue += Number(order?.wholeTotal)
         }

         lastFiveMonths.push({
            id: lastFiveMonths.length,
            name: monthNames[currentDate.getMonth()],
            from: 1 + "/" + (month + 1 + '/' + year),
            to: lastDay + "/" + (month + 1 + '/' + year),
            revenue: revenue.toFixed(2)
         });

         currentDate.setMonth(month - 1);
      }

      const today = new Date()
      const todayMin = today.setHours(0, 0, 0, 0)
      const todayMax = today.setHours(23, 59, 59, 999)
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      const yesterdayMin = yesterday.setHours(0, 0, 0, 0)
      const yesterdayMax = yesterday.setHours(23, 59, 59, 999)

      const todayOrders = await orderService.getOrderCounts({ isActive: true, isDelete: false, createdAt: { $gte: todayMin, $lte: todayMax } })
      const yesterdayOrders = await orderService.getOrderCounts({ isActive: true, isDelete: false, createdAt: { $gte: yesterdayMin, $lte: yesterdayMax } })

      const todayOrderSales = await orderService.getOrdersData({ isActive: true, isDelete: false, createdAt: { $gte: todayMin, $lte: todayMax }, orderStatus: { $in: ['COLLECTED', 'DELIVERED'] } })
      const yesterdayOrderSales = await orderService.getOrdersData({ isActive: true, isDelete: false, createdAt: { $gte: yesterdayMin, $lte: yesterdayMax }, orderStatus: { $in: ['COLLECTED', 'DELIVERED'] } })
      let todaySales = 0
      let yesterdaySales = 0
      let saleDifference = 0
      let saleUp = false

      for (let order of todayOrderSales) todaySales += Number(order?.wholeTotal)
      for (let order of yesterdayOrderSales) yesterdaySales += Number(order?.wholeTotal)

      if (todaySales >= yesterdaySales) {
         saleDifference = todaySales - yesterdaySales
         saleUp = true
      } else {
         saleDifference = yesterdaySales - todaySales
         saleUp = false
      }

      const result = {
         monthlyResults: lastFiveMonths.reverse(),
         orders: {
            today: todayOrders,
            yesterday: yesterdayOrders
         },
         sales: {
            today: settings?.currency + " " + todaySales.toFixed(2),
            yesterday: yesterdaySales.toFixed(2),
            saleDifference: settings?.currency + " " + saleDifference.toFixed(2),
            saleUp: saleUp
         }
      }

      helper.deliverResponse(res, 200, result, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caugh in monthly revenue :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

function getDateDifference(startDate, endDate) {
   const start = new Date(startDate);
   const end = new Date(endDate);

   const timeDifference = end - start;

   const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
   const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
   const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

   return {
      days,
      hours,
      minutes,
      seconds
   };
}

exports.daysRevenue = async (req, res, next) => {
   try {
      const { body } = req
      let last7Days = [];
      let totalRevenue = 0
      const settings = await settingsService.findOne({ })
      const days = getDateDifference(body?.startDate, body?.endDate)
      if (days?.days <= 10) {
         for (let i = 0; i < days?.days; i++) {
            let revenue = 0
            let day = new Date(body?.endDate);
            day.setDate(day.getDate() - i);

            const lte = new Date(day.setHours(23, 59, 59, 59))
            const gte = new Date(day.setHours(0, 0, 0, 0))

            const query = {
               isActive: true, isDelete: false, $or: [{ orderStatus: 'DELIVERED' }, { orderStatus: 'COLLECTED' }],
               $and: [{ createdAt: { $gte: gte } }, { createdAt: { $lte: lte } }]
            }

            const orders = await orderService.getOrdersData(query)
            for (let order of orders) {
               revenue += Number(order?.wholeTotal)
            }

            totalRevenue += revenue

            last7Days.push({
               id: last7Days.length,
               date: new Date(day.setHours(0, 0, 0, 0)).toDateString(),
               name: day.toLocaleDateString('default', { weekday: 'long' }),
               revenue: revenue.toFixed(2)
            });
         }

         helper.deliverResponse(res, 200, {
            totalRevenue: settings?.currency + ' ' + totalRevenue.toFixed(2),
            data: last7Days
         }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
         });
      } else {
         helper.deliverResponse(res, 200, {}, {
            "error_code": messages.LONG_DATE_RANGE.error_code,
            "error_message": messages.LONG_DATE_RANGE.error_message
         });
      }
   } catch (error) {
      console.log('Error caught in days revenue API :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

function getDatesForCurrentMonth(month) {
   const today = new Date();
   const year = today.getFullYear();
   const monthItem = today.getMonth()

   const firstDay = new Date(year, Number(month), 1);
   const lastDay = new Date(year, Number(month) + 1, 0);

   const dates = [];
   let currentDate = firstDay;

   while (currentDate <= lastDay) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
   }

   return dates;
}

exports.currentMonthRevenue = async (req, res) => {
   try {
      const { body } = req
      const settings = await settingsService.findOne({ })
      const datesForCurrentMonth = getDatesForCurrentMonth(body?.month);
      const monthNames = [
         "January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"
      ];
      let total = 0
      let revenues = []
      for (let dateItem of datesForCurrentMonth) {
         const queryDate = new Date(dateItem)
         
         const endDate = new Date(queryDate.setHours(23, 59, 59, 59))
         const startDate = new Date(queryDate.setHours(0, 0, 0, 0))
         const aggreagateQuery = [
            {
               '$match': {
                  '$and': [{ 'createdAt': { '$gte': startDate } }, { 'createdAt': { '$lte': endDate } }],
                  '$or': [{ 'orderStatus': 'DELIVERED' }, { 'orderStatus': 'COLLECTED' }]
               }
            }, {
               '$project': { 'total': { '$toDouble': '$wholeTotal' } }
            }, {
               '$group': { '_id': null, 'total': { '$sum': '$total' } }
            }
         ]
         const orderDetails = await orderService.getOrdersByAgg(aggreagateQuery)
         
         if (orderDetails.length > 0) {
            revenues.push({
               key: queryDate.getDate(),
               value: Number(orderDetails[0]?.total).toFixed(2)
            })
            total += Number(orderDetails[0]?.total)
         } else {
            revenues.push({
               key: queryDate.getDate(),
               value: Number("0").toFixed(2)
            })
         }
      }
      helper.deliverResponse(res, 200, {
         revenues: revenues,
         details: {
            month: monthNames[Number(body?.month)],
            total: settings?.currency + " " + total.toFixed(2)
         }
      }, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caught in current month revenue API :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.topSellingProducts = async (req, res, next) => {
   try {
      let products = []
      const settings = await settingsService.findOne({ })
      const getQuery = [
         {
            '$unwind': { 'path': '$products' }
         }, {
            '$project': { 'products.productId': 1, 'orderStatus': 1 }
         }, {
            '$match': { 'orderStatus': { '$ne': 'PENDING' } }
         }, {
            '$group': {
               '_id': '$products.productId',
               'orders': { '$sum': 1 }
            }
         }, {
            '$sort': { 'orders': -1 }
         }, {
            '$limit': 20
         }
      ]

      const orders = await orderService.getOrdersByAgg(getQuery)
      for (let order of orders) {
         const productDetails = await productService.getSingleProduct({ _id: order?._id })
         if (productDetails && products.length < 5) {
            products.push({
               name: productDetails?.name ? productDetails?.name : '-',
               thumbnail: productDetails?.thumbnail ? BASE_URL + productDetails?.thumbnail : null,
               price: productDetails?.price?.selling ? settings?.currency + " " + productDetails?.price?.selling : settings?.currency + " " + 0.00,
               slug: productDetails?.slug,
               count: order?.orders ? order?.orders : 0
            })
         }
      }

      helper.deliverResponse(res, 200, products, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error while getting top selling products :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.newOrders = async (req, res, next) => {
   try {
      const projection = { orderNo: 1, orderStatus: 1, refid: 1, customerId: 1, wholeTotal: 1, paymentMethod: 1, createdAt: 1, paymentStatus: 1, delivery: 1, source: 1 }
      const sort = { createdAt: -1 };
      const orders = await orderService.getLatestOrders({ orderStatus: { $in: ['PLACED'] } }, 10, projection, sort)
      helper.deliverResponse(res, 200, orders, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

function getLastSixMonths() {
   const currentDate = new Date();
   const lastSixMonths = [];
   const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   for (let i = 0; i < 6; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthName = monthNames[month];
      lastSixMonths.unshift({ year, month, name: `${monthName}` });
      currentDate.setMonth(month - 1);
   }
   return lastSixMonths;
}

exports.dashboardConfig = async (req, res, next) => {
   try {
      const results = await dashboard.findDashboard({ isDelete: false })
      helper.deliverResponse(res, 200, results, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.publishDashboard = async (req, res, next) => {
   try {
      const { body } = req
      body.refid = await dashboard.countDashboard({}) + 1
      await dashboard.addDashboard(body)
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.DASHBOARD_UPDATE.error_code,
         "error_message": messages.DASHBOARD_UPDATE.error_message
      });
   } catch (error) {
      console.log('Error caught while publishing website :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.previewDashboard = async (req, res, next) => {
   try {
      const { body } = req
      body.refid = await dashboard.countPreiewDashboard({}) + 1
      await dashboard.addPreiewDashboard(body)
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.DASHBOARD_UPDATE.error_code,
         "error_message": messages.DASHBOARD_UPDATE.error_message
      });
   } catch (error) {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.monthlyComparison = async (req, res) => {
   try {
      const { body } = req
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const starting = getDates(months.indexOf(body?.start?.month))
      const ending = getDates(months.indexOf(body?.end?.month))
      let startingList = []
      let endingList = []

      const startSummaryQuery = [
         {
            '$match': {
               '$and': [
                  { 'createdAt': { '$gt': new Date(new Date(starting.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'createdAt': { '$lte': new Date(new Date(starting.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         },
         { '$match': { 'orderStatus': { '$nin': ['FAILED', 'PENDING'] } } },
         { '$addFields': { 'sales': { '$toDecimal': '$wholeTotal' } } },
         { '$group': { '_id': null, 'wholeTotal': { '$sum': '$sales' }, 'orders': { '$sum': 1 } } },
         { '$addFields': { 'sales': { '$toString': '$wholeTotal' } } }
      ]

      const startStatusQuery = [
         {
            '$match': {
               '$and': [
                  { 'createdAt': { '$gt': new Date(new Date(starting.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'createdAt': { '$lte': new Date(new Date(starting.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         },
         { '$group': { '_id': "$orderStatus", 'count': { '$sum': 1 } } }
      ]

      const endStatusQuery = [
         {
            '$match': {
               '$and': [
                  { 'createdAt': { '$gt': new Date(new Date(ending.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'createdAt': { '$lte': new Date(new Date(ending.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         },
         { '$group': { '_id': "$orderStatus", 'count': { '$sum': 1 } } }
      ]

      const endSummaryQuery = [
         {
            '$match': {
               '$and': [
                  { 'createdAt': { '$gt': new Date(new Date(ending.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'createdAt': { '$lte': new Date(new Date(ending.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         }, { '$match': { 'orderStatus': { '$nin': ['FAILED', 'PENDING', 'CANCELLED', 'REFUNDED', 'RETURNED'] } } },
         { '$addFields': { 'sales': { '$toDecimal': '$wholeTotal' } } },
         { '$group': { '_id': null, 'wholeTotal': { '$sum': '$sales' }, 'orders': { '$sum': 1 } } },
         { '$addFields': { 'sales': { '$toString': '$wholeTotal' } } }
      ]

      const startCancelledQuery = [
         {
            '$match': {
               '$and': [
                  { 'createdAt': { '$gt': new Date(new Date(starting.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'createdAt': { '$lte': new Date(new Date(starting.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         },
         { '$match': { 'orderStatus': { '$in': ['CANCELLED', 'REFUNDED'] } } },
         { '$addFields': { 'sales': { '$toDecimal': '$wholeTotal' } } },
         { '$group': { '_id': null, 'wholeTotal': { '$sum': '$sales' }, 'orders': { '$sum': 1 } } },
         { '$addFields': { 'sales': { '$toString': '$wholeTotal' } } }
      ]

      const endCancelledQuery = [
         {
            '$match': {
               '$and': [
                  { 'createdAt': { '$gt': new Date(new Date(ending.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'createdAt': { '$lte': new Date(new Date(ending.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         }, { '$match': { 'orderStatus': { '$in': ['CANCELLED', 'REFUNDED'] } } },
         { '$addFields': { 'sales': { '$toDecimal': '$wholeTotal' } } },
         { '$group': { '_id': null, 'wholeTotal': { '$sum': '$sales' }, 'orders': { '$sum': 1 } } },
         { '$addFields': { 'sales': { '$toString': '$wholeTotal' } } }
      ]

      const startSummaryOrders = await orderService.getOrdersByAggregate(startSummaryQuery)
      const endSummaryOrders = await orderService.getOrdersByAggregate(endSummaryQuery)
      const startCancelledOrders = await orderService.getOrdersByAggregate(startCancelledQuery)
      const endCancelledOrders = await orderService.getOrdersByAggregate(endCancelledQuery)
      const startStatus = await orderService.getOrdersByAggregate(startStatusQuery)
      const endStatus = await orderService.getOrdersByAggregate(endStatusQuery)

      for (let status of startStatus) {
         startingList.push({
            title: status._id.charAt(0) + status._id.slice(1).toLowerCase(),
            value: status.count
         })
      }

      for (let status of endStatus) {
         endingList.push({
            title: status._id.charAt(0) + status._id.slice(1).toLowerCase(),
            value: status.count
         })
      }

      const startCustomerQuery = [
         { '$match': { 'isDelete': false, 'isActive': true } }, {
            '$match': {
               '$and': [
                  { 'accountCreatedDate': { '$gt': new Date(new Date(starting.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'accountCreatedDate': { '$lte': new Date(new Date(starting.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         }, { '$group': { '_id': '$source', 'count': { '$sum': 1 } } }
      ]

      const endCustomerQuery = [
         { '$match': { 'isDelete': false, 'isActive': true } }, {
            '$match': {
               '$and': [
                  { 'accountCreatedDate': { '$gt': new Date(new Date(ending.firstDay).setHours(23, 59, 59, 59)) } },
                  { 'accountCreatedDate': { '$lte': new Date(new Date(ending.lastDay).setHours(23, 59, 59, 59)) } }
               ]
            }
         }, { '$group': { '_id': '$source', 'count': { '$sum': 1 } } }
      ]

      const startCustomers = await customerService.aggregate(startCustomerQuery)
      const endCustomers = await customerService.aggregate(endCustomerQuery)

      let responseDetails = {
         summary: {
            start: {
               orders: startSummaryOrders[0] ? startSummaryOrders[0]['orders'] : 0,
               sales: startSummaryOrders[0] ? startSummaryOrders[0]['sales'] : 0,
               average: startSummaryOrders[0] ? (Number(startSummaryOrders[0]['sales']) / startSummaryOrders[0]['orders']).toFixed(2) : 0,
               isProfit: startSummaryOrders[0] ? Number(startSummaryOrders[0] ? startSummaryOrders[0]['sales'] : 0) > Number(endSummaryOrders[0] ? endSummaryOrders[0]['sales'] : 0) ? true : false : false,
               salesDifference: startSummaryOrders[0] ? Number(startSummaryOrders[0] ? startSummaryOrders[0]['sales'] : 0) - Number(endSummaryOrders[0] ? endSummaryOrders[0]['sales'] : 0) : 0
            },
            end: {
               orders: endSummaryOrders[0] ? endSummaryOrders[0]['orders'] : 0,
               sales: endSummaryOrders[0] ? endSummaryOrders[0]['sales'] : 0,
               average: endSummaryOrders[0] ? (Number(endSummaryOrders[0]['sales']) / endSummaryOrders[0]['orders']).toFixed(2) : 0,
               isProfit: endSummaryOrders[0] ? Number(startSummaryOrders[0] ? startSummaryOrders[0]['sales'] : 0) < Number(endSummaryOrders[0] ? endSummaryOrders[0]['sales'] : 0) ? true : false : false,
               salesDifference: endSummaryOrders[0] ? Number(endSummaryOrders[0] ? endSummaryOrders[0]['sales'] : 0) - Number(startSummaryOrders[0] ? startSummaryOrders[0]['sales'] : 0) : 0,
            }
         },
         cancelled: {
            start: {
               orders: startCancelledOrders[0] ? startCancelledOrders[0]['orders'] : 0,
               sales: startCancelledOrders[0] ? startCancelledOrders[0]['sales'] : 0,
               average: startCancelledOrders[0] ? (Number(startCancelledOrders[0]['sales']) / startCancelledOrders[0]['orders']).toFixed(2) : 0,
            },
            end: {
               orders: endCancelledOrders[0] ? endCancelledOrders[0]['orders'] : 0,
               sales: endCancelledOrders[0] ? endCancelledOrders[0]['sales'] : 0,
               average: endCancelledOrders[0] ? (Number(endCancelledOrders[0]['sales']) / endCancelledOrders[0]['orders']).toFixed(2) : 0,
            }
         },
         customers: {
            start: { count: startCustomers[0] ? startCustomers[0]['count'] : 0 },
            end: endCustomers[0] ? endCustomers[0]['count'] : 0
         },
         orders: {
            starting: startingList.sort((a, b) => a.title.localeCompare(b.title)),
            ending: endingList.sort((a, b) => a.title.localeCompare(b.title)),
         }
      }

      helper.deliverResponse(res, 200, responseDetails, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caught in monthly comparison API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

function getDates(monthIndex) {
   const currentDate = new Date();
   const firstDayOfMonth = new Date(currentDate.getFullYear(), monthIndex, 1);
   const lastDayOfMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 1);
   const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
   const formattedLastDay = lastDayOfMonth.toISOString().split('T')[0];
   return { firstDay: formattedFirstDay, lastDay: formattedLastDay };
}

function getFirstAndLastDateOfPastWeek() {
   const today = new Date();
   const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
   const firstDayOfPastWeek = new Date(today);
   const lastDayOfPastWeek = new Date(today);

   // Calculate the first day of the past week
   const daysToSubtract = currentDayOfWeek + 7;
   firstDayOfPastWeek.setDate(today.getDate() - daysToSubtract + 1);

   // Calculate the last day of the past week
   const daysToSubtractForLastDay = currentDayOfWeek;
   lastDayOfPastWeek.setDate(today.getDate() - daysToSubtractForLastDay);

   return {
      firstDayOfPastWeek: firstDayOfPastWeek.toISOString().split('T')[0],
      lastDayOfPastWeek: lastDayOfPastWeek.toISOString().split('T')[0]
   };
}

function getDatesBetween(start, end) {
   const dates = [];
   let currentDate = new Date(start);

   while (currentDate <= new Date(end)) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
   }

   return dates;
}

const today = new Date();
const firstDateOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

exports.salesAnalytics = async (req, res) => {
   try {
      const { body } = req
      let dates = []
      let orderCounts = []
      let statusDetails = {
         accepted: { status: 'Total accepted', orders: 0 },
         delivered: { status: 'Total delivered', orders: 0 },
         shipped: { status: 'Total shipped', orders: 0 },
         cancelled: { status: 'Total cancelled', orders: 0 },
         returned: { status: 'Total returned', orders: 0 },
      }
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      let dateDetails = { start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), end: new Date(new Date().setHours(23, 59, 59, 59)).toISOString() }
      switch (body.duration) {
         case 'lastweek':
            const { firstDayOfPastWeek, lastDayOfPastWeek } = getFirstAndLastDateOfPastWeek();
            dateDetails['start'] = new Date(new Date(firstDayOfPastWeek).setHours(0, 0, 0, 0)).toISOString()
            dateDetails['end'] = new Date(new Date(lastDayOfPastWeek).setHours(23, 59, 59, 59)).toISOString()
            const lastWeekdDates = getDatesBetween(firstDayOfPastWeek, lastDayOfPastWeek);
            dates = lastWeekdDates.map(date => date.toISOString().split('T')[0]);
            break
         case 'today':
            dateDetails['start'] = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
            dateDetails['end'] = new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
            dates = [new Date(today).toISOString().split('T')[0]];
            break
         case 'yesterday':
            let yesterday = new Date();
            yesterday.setDate(new Date().getDate() - 1);
            dateDetails['start'] = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
            dateDetails['end'] = new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
            dates = [new Date(yesterday).toISOString().split('T')[0]];
            break
         case 'current':
            const firstDateOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const formattedFirstDateOfMonth = firstDateOfMonth.toISOString().split('T')[0];
            dateDetails['start'] = new Date(new Date(formattedFirstDateOfMonth).setHours(0, 0, 0, 0)).toISOString()
            dateDetails['end'] = new Date(new Date(formattedToday).setHours(23, 59, 59, 59)).toISOString()
            const currentMonthDates = getDatesBetween(formattedFirstDateOfMonth, formattedToday);
            dates = currentMonthDates.map(date => date.toISOString().split('T')[0]);
            break
         case '30':
            const last30Days = new Date(today);
            last30Days.setDate(today.getDate() - 30);
            const formattedLast30Days = last30Days.toISOString().split('T')[0];
            dateDetails['start'] = new Date(new Date(formattedLast30Days).setHours(0, 0, 0, 0)).toISOString()
            dateDetails['end'] = new Date(new Date(formattedToday).setHours(23, 59, 59, 59)).toISOString()
            const pastDates = getDatesBetween(formattedLast30Days, formattedToday);
            dates = pastDates.map(date => date.toISOString().split('T')[0]);
            break
         case 'date-range':
            dateDetails['start'] = new Date(new Date(body['dates'][0]).setHours(0, 0, 0, 0)).toISOString()
            dateDetails['end'] = new Date(new Date(body['dates'][1]).setHours(23, 59, 59, 59)).toISOString()
            const rangeDates = getDatesBetween(body['dates'][0], body['dates'][1]);
            dates = rangeDates.map(date => date.toISOString().split('T')[0]);
            break
      }

      const statusAggregate = [
         {
            '$match': {
               '$and': [{ 'createdAt': { '$gte': new Date(dateDetails['start']) } }, { 'createdAt': { '$lte': new Date(dateDetails['end']) } }]
            }
         },
         { '$group': { '_id': '$orderStatus', 'totalOrders': { '$sum': 1 } } }
      ]

      const orderStatusDetails = await orderService.getOrdersByAggregate(statusAggregate)
      
      for (let status of orderStatusDetails) {
         switch (status._id) {
            case 'ACCEPTED':
               statusDetails['accepted']['orders'] = status.totalOrders
               break
            case 'DELIVERED':
               statusDetails['delivered']['orders'] = status.totalOrders
               break
            case 'COLLECTED':
               statusDetails['delivered']['orders'] = status.totalOrders
               break         
            case 'SHIPPED':
               statusDetails['shipped']['orders'] = status.totalOrders
               break
            case 'CANCELLED':
               statusDetails['cancelled']['orders'] = status.totalOrders
               break
         }
      }

      let total = 0
      let ordersTotal = 0
      let revenues = []
      for (let dateItem of dates) {
         const queryDate = new Date(dateItem)
         const endDate = new Date(queryDate.setHours(23, 59, 59, 59))
         const startDate = new Date(queryDate.setHours(0, 0, 0, 0))
         const aggreagateQuery = [
            {
               '$match': {
                  '$and': [{ 'createdAt': { '$gte': startDate } }, { 'createdAt': { '$lte': endDate } }],
                  '$or': [{ 'orderStatus': 'DELIVERED' }, { 'orderStatus': 'COLLECTED' }]
               }
            }, {
               '$project': { 'total': { '$toDouble': '$wholeTotal' } }
            }, {
               '$group': { '_id': null, 'total': { '$sum': '$total' } }
            }
         ]

         const statusAggreagateQuery = [
            {
               '$match': {
                  '$and': [
                     { 'createdAt': { '$gte': startDate } },
                     { 'createdAt': { '$lte': endDate } }
                  ]
               }
            }, {
               '$group': { '_id': null, 'totalOrders': { '$sum': 1 } }
            }
         ]
       
         const orderDetails = await orderService.getOrdersByAgg(aggreagateQuery)
         
         const orders = await orderService.getOrdersByAgg(statusAggreagateQuery)

         if (orders.length > 0) {
            orderCounts.push({ key: queryDate.getDate(), value: orders[0]?.totalOrders })
            ordersTotal += orders[0]?.totalOrders
         } else {
            orderCounts.push({ key: queryDate.getDate(), value: 0 })
         }

         if (orderDetails.length > 0) {
            revenues.push({ key: queryDate.getDate(), value: Number(orderDetails[0]?.total).toFixed(2) })
            total += Number(orderDetails[0]?.total)
         } else {
            revenues.push({ key: queryDate.getDate(), value: Number("0").toFixed(2) })
         }
      }
      helper.deliverResponse(res, 200, {
         orderStatusDetails: statusDetails,
         revenueDetails: {
            revenues: revenues,
            totalRevenue: total.toFixed(2)
         },
         orderDetails: {
            orders: orderCounts,
            totalOrders: ordersTotal
         }
      }, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caught in sales analytics API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.storeTips = async (req, res) => {
   try {
      let storeTips = {
         homeSeoDetails: { title: 'Home page seo details are not updated', isWarning: true },
         stores: { title: 'No stores have been added yet', isWarning: true },
         support: { title: 'Support email is not verified', isWarning: true },
         subscibers: { title: 'No subscribers for daily reports', isWarning: true },
      }
      const homeSeoDetails = await seoService.findOne({ page: 'HOME' })
      !homeSeoDetails ? null : storeTips['homeSeoDetails'] = { title: `Home page seo details are updated`, isWarning: false, }
      const helpDetails = await helpService.findOne()
      helpDetails?.isEmailVerified == true ? storeTips['support'] = { title: `Support email is verified`, isWarning: false } : null
      const mailerSubscribers = await mailerService.findOne({ refid: '1' })
      mailerSubscribers?.dailyReports.length == 0 ? null : storeTips['subscibers'] = { title: `Daily reports subscribed successfully`, isWarning: false }
      helper.deliverResponse(res, 200, storeTips, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caught in store tips API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

