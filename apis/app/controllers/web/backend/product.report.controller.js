const helper = require("../../../../util/responseHelper");
const messages = require("../../../../config/constants").messages;
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const service = require("../../../services/product.service");
const orderService = require("../../../services/order.service");
const db = require("../../web/../../db/index");
const moment = require("moment");
const { sendMail } = require("../../../../util/sendMail");
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// exports.productReport = async (req, res) => {
//   try {
    
//       const productDetails = await service.find({ isDelete: false }, { __v: 0, _id: 0 })
//       // const settings = await settingsService.findOne({ refid: "1" })
//       // let websiteUrl = settings?.domain.endsWith('/') ? settings?.domain : `${settings?.domain}/`
//       let products = []

//       let headers = [
//         { id: 'name', title: 'Name' },
//         { id: 'sku', title: 'SKU' },
//         { id: 'mrp', title: 'MRP' },
//         { id: 'offerPrice', title: 'Offer Price' },
//         { id: 'sellingPrice', title: 'Selling Price' },
//         { id: 'description', title: 'Description' },
//         { id: 'category', title: 'Category' },
//         { id: 'relatedProducts', title: 'Related Products' },
//         { id: 'attributes', title: 'Attributes' },
//         { id: 'files', title: 'Files' },
//         { id: 'hoverImage', title: 'Hover Image' }
//                 ]

//       for (let product of productDetails) {
//         products.push({
//           name: product?.name,
//               sku: product?.sku,
//               mrp: product?.price?.mrp,
//               offerPrice: product?.price?.offer,
//               sellingPrice: product?.price?.selling,
//               description: product?.details?.description,
//               category: product?.category?.map(cat => cat.name).join(','),
//               relatedProducts: product?.relatedProducts?.map(rel => rel.name).join(','),
//               attributes: product?.attributes?.map(attr => `${attr.title}: ${attr.value}`).join('; '),
//               files: product?.files?.length? product?.files?.map(file => `${process.env.AWS_S3BUCKET_BASE_URL}${file}`).join(','):'',
//               hoverImage: product?.hoverThumbnail?`${process.env.AWS_S3BUCKET_BASE_URL}${product?.hoverThumbnail}`:''
//       })
//       }

//       const csvFilePath = `${Date.now()}_product_report.csv`;
//       const csvWriter = createCsvWriter({ path: csvFilePath, header: headers });

//       await csvWriter.writeRecords(products)
//       const fileStream = fs.createReadStream(csvFilePath);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${csvFilePath}`,
//       Body: fileStream,
//       ContentType: "text/csv",
//     };

//     const data = await s3.upload(uploadParams).promise();
//     const fileUrl = data.Location;

//     const subject = "product Report CSV Export Download Link";
//     const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
   

//       try {
//           let data = res?.locals?.user?.email
//           const cleanEmail = data.trim().replace(/\.+$/, '');
        
//           await sendMail(cleanEmail, subject, '', content)
//       } catch (error) {
//           console.log('Error caught in report report API :: ' + error)
//       }
//   } catch (error) {
//       console.log('Error caught in product report API :: ' + error)
//       helper.deliverResponse(res, 422, {}, {
//           "error_code": messages.serverError.error_code,
//           "error_message": messages.serverError.error_message
//       });
//   }
// }
exports.productReport = async (req, res) => {
  try {
    // Get product details
    const productDetails = await service.find({ isDelete: false }, { __v: 0, _id: 0 });

    // Prepare products array for CSV
    let products = [];
    const headers = [
      { id: 'name', title: 'Name' },
      { id: 'sku', title: 'SKU' },
      { id: 'mrp', title: 'MRP' },
      { id: 'offerPrice', title: 'Offer Price' },
      { id: 'sellingPrice', title: 'Selling Price' },
      { id: 'description', title: 'Description' },
      { id: 'category', title: 'Category' },
      { id: 'relatedProducts', title: 'Related Products' },
      { id: 'attributes', title: 'Attributes' },
      { id: 'files', title: 'Files' },
      { id: 'hoverImage', title: 'Hover Image' }
    ];

    // Format product data
    for (let product of productDetails) {
      products.push({
        name: product?.name,
        sku: product?.sku,
        mrp: product?.price?.mrp,
        offerPrice: product?.price?.offer,
        sellingPrice: product?.price?.selling,
        description: product?.details?.description,
        category: product?.category?.map(cat => cat.name).join(','),
        relatedProducts: product?.relatedProducts?.map(rel => rel.name).join(','),
        attributes: product?.attributes?.map(attr => `${attr.title}: ${attr.value}`).join('; '),
        files: product?.files?.length ? product?.files?.map(file => `${process.env.AWS_S3BUCKET_BASE_URL}${file}`).join(',') : '',
        hoverImage: product?.hoverThumbnail ? `${process.env.AWS_S3BUCKET_BASE_URL}${product?.hoverThumbnail}` : ''
      });
    }

    // Create CSV file
    const csvFilePath = `${Date.now()}_product_report.csv`;
    const csvWriter = createCsvWriter({ path: csvFilePath, header: headers });
    await csvWriter.writeRecords(products);

    // Upload to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Send email
    const subject = "Product Report CSV Export Download Link";
    const content = `<p>Dear User,</p>
                     <p>Your Product Report is ready. You can download it from the link below:</p>
                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    console.log("fileUrl", fileUrl);

    // Clean email and send
    if (res?.locals?.user?.email) {
      const cleanEmail = res.locals.user.email.trim().replace(/\.+$/, '');
      try {
        await sendMail(cleanEmail, subject, '', content);
      } catch (error) {
        console.error("Error sending email:", error);
        // Continue execution even if email fails
      }
    }

    // Clean up local CSV file
    fs.unlink(csvFilePath, (err) => {
      if (err) console.error("Error deleting temporary CSV file:", err);
    });

    // Send success response
    // return res.status(200).json({
    //   data: products,
    //   message: "Product report generated successfully",
    //   error_code: 0
    // });
    return res.status(200).json({
      data: products,
      downloadLink: fileUrl,
      message: "Product report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.log(
      "Error caught while generating customer analytics report :: " + error
    );
    res.status(500).json({
      error_code: 1,
      message: "Error generating Customer analytics report",
      error: error.message,
    });
  }
};
// exports.productOrderReport = async (req, res, next) => {
//   try {
//     let products = [];
//     let headers = [
//       { id: "name", title: "Name" },
//       { id: "sku", title: "SKU" },
//       { id: "mrp", title: "MRP" },
//       { id: "sellingPrice", title: "Selling Price" },
//       { id: "orderNo", title: "Order No" },
//       { id: "orderDate", title: "Order Date" },
//       { id: "orderTime", title: "Order Time" },
//       { id: "customerName", title: "Customer Name" },
//       { id: "customerEmail", title: "Customer Email" },
//       { id: "customerCountryCode", title: "Customer Country Code" },
//       { id: "customerMobile", title: "Customer Mobile" },
//       { id: "quantity", title: "Quantity" },
//       { id: "pricePerUnit", title: "Price Per Unit" },
//       { id: "subtotal", title: "Sub Total" },
//       { id: "discountTotal", title: "Discount Total" },
//       { id: "total", title: "Total" },
//     ];

//     const orderDetails = await orderService.getOrdersByAggregate([
//       { $unwind: "$products" },
//       {
//         $group: {
//           _id: "$products.productId",
//           orders: {
//             $push: {
//               order: "$orderNo",
//               price: "$products.pricePerUnit",
//               quantity: "$products.quantity",
//             },
//           },
//         },
//       },
//       { $addFields: { totalOrders: { $size: "$orders" } } },
//       { $sort: { totalOrders: -1 } },
//     ]);

//         for (let order of orderDetails) {
//             const productDetails = await service.getProductDetails({ _id: order ?._id, isDelete: false })
           
            
//             for (let orderItem of order ?.orders) {
//                 let orderDetails = await orderService.getOrderDetails({ orderNo: orderItem ?.order })
//                 products.push({
//                     name: productDetails?.productDetails?.name?.text,
//                     sku: productDetails?.productDetails?.sku,
//                     mrp: productDetails?.productDetails?.actualPrice?.text,
//                     sellingPrice: productDetails?.productDetails?.price?.text,
//                     orderNo: orderDetails?.orderNo,
//                     orderDate: new Date(orderDetails?.createdAt).toLocaleDateString(),
//                     orderTime: new Date(orderDetails?.createdAt).toLocaleTimeString(),
//                     customerName: orderDetails?.customerId?.name,
//                     customerEmail: orderDetails?.customerId?.email,
//                     customerCountryCode: orderDetails?.customerId?.countryCode,
//                     customerMobile: orderDetails?.customerId?.mobile,
//                     quantity: orderItem?.quantity,
//                     pricePerUnit: orderItem?.price,              
//                     subTotal: orderDetails?.total,
//                     discountTotal: orderDetails?.discount,
//                     total: orderDetails?.wholeTotal,
//                 })
//             }
//         }
//         const filePath = `${Date.now()}_product_order_report.csv`;
//     const csvWriter = createCsvWriter({ path: filePath, header: headers });
//     csvWriter.writeRecords(products);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${filePath}`,
//       Body: fs.createReadStream(filePath),
//       ContentType: "text/csv",
//     };
//     const s3Response = await s3.upload(uploadParams).promise();
//     const fileUrl = s3Response.Location;
//     const subject = "Product Orders and Returns Report CSV download link";
//     const content = `<p>Dear User,</p>
//                     <p>Your Product Report is ready. You can download it from the link below:</p>
//                      <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;
//                      console.log("fileUrl",fileUrl);
                     
//     try {
//       await sendMail(res.locals.user.email, subject, "", content);
//     } catch (error) {
//       console.log("Error sending email:", error);
//     }
//     } catch (error) {
//         console.log('Error caught in product order report API :: ' + error)
//         helper.deliverResponse(res, 422, {}, {
//             "error_code": messages.serverError.error_code,
//             "error_message": messages.serverError.error_message
//         });
//       }
//     }
//     const filePath = `${Date.now()}_product_order_report.csv`;
//     const csvWriter = createCsvWriter({ path: filePath, header: headers });
//     csvWriter.writeRecords(products);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${filePath}`,
//       Body: fs.createReadStream(filePath),
//       ContentType: "text/csv",
//     };
//     const s3Response = await s3.upload(uploadParams).promise();
//     const fileUrl = s3Response.Location;
//     const subject = "Product Orders and Returns Report CSV download link";
//     const content = `<p>Dear User,</p>
//                     <p>Your Product Report is ready. You can download it from the link below:</p>
//                      <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;
//                      console.log("fileUrl",fileUrl);
                     
//     try {
//       await sendMail(res.locals.user.email, subject, "", content);
//     } catch (error) {
//       console.log("Error sending email:", error);
//     }
//   } catch (error) {
//     console.log("Error caught in product order report API :: " + error);
//     helper.deliverResponse(
//       res,
//       422,
//       {},
//       {
//         error_code: messages.SERVER_ERROR.error_code,
//         error_message: messages.SERVER_ERROR.error_message,
//       }
//     );
//   }
// };

// exports.getProductData = async (req, res, next) => {
//     try {
//       // Parse startDate and endDate from request query, or set defaults if not provided
//       const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date("2024-01-01");
//       const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
//       const daysInRange = moment(endDate).diff(moment(startDate), 'days') + 1;

//       const result = await db.Order.aggregate([
//         { $unwind: "$products" },
//         {
//           $lookup: {
//             from: "products",
//             localField: "products.productId",
//             foreignField: "_id",
//             as: "productDetails"
//           }
//         },
//         { $unwind: "$productDetails" },
//         {
//           $group: {
//             _id: "$productDetails._id",
//             name: { $first: "$productDetails.name" },
//             totalRevenue: { $sum: { $toDouble: { $ifNull: ["$products.total", 0] } } },
//             totalQuantity: { $sum: { $toDouble: "$products.quantity" } },
//             averagePrice: { $avg: { $toDouble: "$products.pricePerUnit" } }
//           }
//         },
//         {
//           $addFields: {
//             averageInventorySoldPerDay: {
//               $cond: { if: { $gt: [daysInRange, 0] }, then: { $divide: ["$totalQuantity", daysInRange] }, else: 0 }
//             },
//             grade: {
//               $switch: {
//                   branches: [
//                       { case: { $gte: ["$totalRevenue", { $multiply: ["$totalRevenue", 0.8] }] }, then: "A" },
//                       { case: { $and: [
//                           { $gte: ["$totalRevenue", { $multiply: ["$totalRevenue", 0.65] }] },
//                           { $lt: ["$totalRevenue", { $multiply: ["$totalRevenue", 0.8] }] }
//                       ]}, then: "B" },
//                       { case: { $and: [
//                           { $gte: ["$totalRevenue", { $multiply: ["$totalRevenue", 0.5] }] },
//                           { $lt: ["$totalRevenue", { $multiply: ["$totalRevenue", 0.65] }] }
//                       ]}, then: "C" }
//                   ],
//                   default: "D"
//               }
//           }

//           }
//         },
//         { $sort: { totalRevenue: -1 } }
//       ]);

//       // Define CSV file path and content
//       const csvFilePath = `${Date.now()}_productDataReport.csv`;
//       const csvWriter = createCsvWriter({
//         path: csvFilePath,
//         header: [
//           { id: 'name', title: 'Product Name' },
//           { id: 'totalRevenue', title: 'Total Revenue' },
//           { id: 'totalQuantity', title: 'Total Quantity Sold' },
//           { id: 'averagePrice', title: 'Average Price per Unit' },
//           { id: 'averageInventorySoldPerDay', title: 'Average Inventory Sold Per Day' },
//           { id: 'grade', title: 'Grade' }
//         ]
//       });

//       await csvWriter.writeRecords(result);

//       // Set up file upload parameters to S3
//       const fileStream = fs.createReadStream(csvFilePath);
//       const uploadParams = {
//         Bucket: process.env.AWS_S3BUCKET_NAME,
//         Key: `reports/${csvFilePath}`,
//         Body: fileStream,
//         ContentType: 'text/csv',
//       };

//       const data = await s3.upload(uploadParams).promise();
//       const fileUrl = data.Location;

//       // Prepare the email content
//       const subject = 'Product Data Report CSV export download link';
//       const content = `<a href="${fileUrl}" target="_blank">Download Product Data Report</a>`;

//       // Send the email
//       try {
//         await sendMail(res.locals.user.email, subject, '', content);
//       } catch (error) {
//         console.error('Error caught while sending email:', error.message);
//       }

//       // Return the response
//       return res.status(200).json({
//         success: true,
//         data: result,
//         message: 'Product data report generated and uploaded successfully'
//       });

//     } catch (error) {
//       console.error("Error in getProductData:", error.message);
//       res.status(500).json({
//         success: false,
//         message: "Error generating product data report",
//         error: error.message
//       });
//     }
//   };
exports.productOrderReport = async (req, res, next) => {
  try {
    // Define headers
    const headers = [
      { id: "name", title: "Name" },
      { id: "sku", title: "SKU" },
      { id: "mrp", title: "MRP" },
      { id: "sellingPrice", title: "Selling Price" },
      { id: "orderNo", title: "Order No" },
      { id: "orderDate", title: "Order Date" },
      { id: "orderTime", title: "Order Time" },
      { id: "customerName", title: "Customer Name" },
      { id: "customerEmail", title: "Customer Email" },
      { id: "customerCountryCode", title: "Customer Country Code" },
      { id: "customerMobile", title: "Customer Mobile" },
      { id: "quantity", title: "Quantity" },
      { id: "pricePerUnit", title: "Price Per Unit" },
      { id: "subtotal", title: "Sub Total" },
      { id: "discountTotal", title: "Discount Total" },
      { id: "total", title: "Total" }
    ];

    // Get aggregated order details
    const orderDetails = await orderService.getOrdersByAggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          orders: {
            $push: {
              order: "$orderNo",
              price: "$products.pricePerUnit",
              quantity: "$products.quantity"
            }
          }
        }
      },
      { $addFields: { totalOrders: { $size: "$orders" } } },
      { $sort: { totalOrders: -1 } }
    ]);

    // Process orders and collect product details
    const products = [];
    for (const order of orderDetails) {
      if (!order?._id) continue;

      const productDetails = await service.getProductDetails({
        _id: order._id,
        isDelete: false
      });

      if (!productDetails) continue;

      for (const orderItem of order.orders) {
        if (!orderItem?.order) continue;

        const orderDetails = await orderService.getOrderDetails({
          orderNo: orderItem.order
        });

        if (!orderDetails) continue;

        products.push({
          name: productDetails?.productDetails?.name?.text || '',
          sku: productDetails?.productDetails?.sku || '',
          mrp: productDetails?.productDetails?.actualPrice?.text || '',
          sellingPrice: productDetails?.productDetails?.price?.text || '',
          orderNo: orderDetails.orderNo || '',
          orderDate: orderDetails.createdAt ? 
            new Date(orderDetails.createdAt).toLocaleDateString() : '',
          orderTime: orderDetails.createdAt ? 
            new Date(orderDetails.createdAt).toLocaleTimeString() : '',
          customerName: orderDetails?.customerId?.name || '',
          customerEmail: orderDetails?.customerId?.email || '',
          customerCountryCode: orderDetails?.customerId?.countryCode || '',
          customerMobile: orderDetails?.customerId?.mobile || '',
          quantity: orderItem.quantity || 0,
          pricePerUnit: orderItem.price || 0,
          subtotal: orderDetails.total || 0,
          discountTotal: orderDetails.discount || 0,
          total: orderDetails.wholeTotal || 0
        });
      }
    }

    // Generate CSV and upload to S3
    const csvFilePath = `product_order_report_${Date.now()}.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: headers
    });
    await csvWriter.writeRecords(products);

    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fs.createReadStream(csvFilePath),
      ContentType: 'text/csv'
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Send email
    const subject = "Product Orders Report CSV Download Link";
    const content = `
      <p>Dear User,</p>
      <p>Your Product Orders Report is ready. You can download it from the link below:</p>
      <p><a href="${fileUrl}" target="_blank">Download Report</a></p>
    `;

    if (res?.locals?.user?.email) {
      try {
        await sendMail(res.locals.user.email, subject, '', content);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    // Clean up local CSV file
    fs.unlink(csvFilePath, (err) => {
      if (err) console.error("Error deleting temporary CSV file:", err);
    });

    return res.status(200).json({
      message: "Product orders report generated successfully",
      error_code: 0
    });

  } catch (error) {
    console.error('Error generating product order report:', error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message
    });
  }
};
exports.getProductData = async (req, res, next) => {
  try {
    // Parse startDate and endDate from request query, or set defaults if not provided
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date("2024-01-01");
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();
    const daysInRange = moment(endDate).diff(moment(startDate), "days") + 1;

    // Step 1: Calculate the overall total revenue
    const overallTotalRevenueResult = await db.Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          overallTotalRevenue: {
            $sum: { $toDouble: { $ifNull: ["$products.total", 0] } },
          },
        },
      },
    ]);

    const overallTotalRevenue =
      overallTotalRevenueResult[0]?.overallTotalRevenue || 0;
    // console.log(overallTotalRevenue)
    // Step 2: Use overallTotalRevenue in the main aggregation pipeline
    const result = await db.Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails._id",
          name: { $first: "$productDetails.name" },
          totalRevenue: {
            $sum: { $toDouble: { $ifNull: ["$products.total", 0] } },
          },
          totalQuantity: { $sum: { $toDouble: "$products.quantity" } },
          averagePrice: { $avg: { $toDouble: "$products.pricePerUnit" } },
        },
      },
      {
        $addFields: {
          averageInventorySoldPerDay: {
            $cond: {
              if: { $gt: [daysInRange, 0] },
              then: { $divide: ["$totalQuantity", daysInRange] },
              else: 0,
            },
          },
          grade: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: [
                      "$totalRevenue",
                      { $multiply: [overallTotalRevenue, 0.8] },
                    ],
                  },
                  then: "A",
                },
                {
                  case: {
                    $and: [
                      {
                        $gte: [
                          "$totalRevenue",
                          { $multiply: [overallTotalRevenue, 0.65] },
                        ],
                      },
                      {
                        $lt: [
                          "$totalRevenue",
                          { $multiply: [overallTotalRevenue, 0.8] },
                        ],
                      },
                    ],
                  },
                  then: "B",
                },
                {
                  case: {
                    $and: [
                      {
                        $gte: [
                          "$totalRevenue",
                          { $multiply: [overallTotalRevenue, 0.5] },
                        ],
                      },
                      {
                        $lt: [
                          "$totalRevenue",
                          { $multiply: [overallTotalRevenue, 0.65] },
                        ],
                      },
                    ],
                  },
                  then: "C",
                },
              ],
              default: "D",
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Define CSV file path and content
    const csvFilePath = `${Date.now()}_productDataReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "name", title: "Product Name" },
        { id: "totalRevenue", title: "Total Revenue" },
        { id: "totalQuantity", title: "Total Quantity Sold" },
        { id: "averagePrice", title: "Average Price per Unit" },
        {
          id: "averageInventorySoldPerDay",
          title: "Average Inventory Sold Per Day",
        },
        { id: "grade", title: "Grade" },
      ],
    });

    await csvWriter.writeRecords(result);

    // Set up file upload parameters to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const data = await s3.upload(uploadParams).promise();
    const fileUrl = data.Location;

    // Prepare the email content
    const subject = "Product Data Report CSV export download link";
    const content = `<a href="${fileUrl}" target="_blank">Download Product Data Report</a>`;
console.log("fileUrl",fileUrl);

    // Send the email
    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.error("Error caught while sending email:", error.message);
    }

    // Return the response
    return res.status(200).json({
      success: true,
      data: result,
      message: "Product data report generated and uploaded successfully",
    });
  } catch (error) {
    console.error("Error in getProductData:", error.message);
    res.status(500).json({
      success: false,
      message: "Error generating product data report",
      error: error.message,
    });
  }
};
