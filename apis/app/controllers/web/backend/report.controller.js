const { messages } = require("../../../../config/constants");
const { deliverResponse } = require("../../../../util/responseHelper");
const {
  Cart,
  Product,
  Customer,
  Order,
  Enquiry,
  ProductEnquiry,
} = require("../../../db");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const AWS = require("aws-sdk");
const { sendMail } = require("../../../../util/sendMail");
const orderModel = require("../../../db/models/order.model");
mongoose  = require("mongoose");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.onlineStoreCartAnalysis = async (req, res) => {
  const cartItems = await Cart.find({
    isPurchased: false,
    isDelete: false,
    isActive: true,
  })
    .populate("customer", "name countryCode mobile email") // Populate specific fields of the customer
    .exec();
  deliverResponse(res, 200, {}, messages.successResponse);

  const cartReports = await Promise.all(
    cartItems.map(async (cartItem) => {
      const [customerDetails, productItems] = await Promise.all([
        Customer.findOne({ _id: cartItem.customer }),
        Product.find({ _id: { $in: cartItem.products.map((p) => p.product) } }),
      ]);

      let cartTotal = 0;
      let cartProducts = [];

      productItems.forEach((productItem) => {
        const quantity = cartItem.products.find(
          (p) => p.product.toString() === productItem._id.toString()
        ).quantity;
        cartTotal += productItem.price.selling * quantity;
        cartProducts.push(productItem.name);
      });

      let cartProductItems = cartProducts.join(", ");

      return {
        customer: customerDetails?.name || "guest",
        mobile: `${customerDetails?.countryCode || ""} ${
          customerDetails?.mobile || ""
        }`,
        email: customerDetails?.email || "",
        cartProductItems,
        cartTotal: cartTotal,
        createdAt: new Date(cartItem.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Dubai",
        }),
        updatedAt: new Date(cartItem.updatedAt).toLocaleString("en-US", {
          timeZone: "Asia/Dubai",
        }),
      };
    })
  );

  const csvFilePath = `${Date.now()}_onlineStoreCartAnalysis.csv`;
  const fileStream = fs.createReadStream(csvFilePath);
  const uploadParams = {
    Bucket: process.env.AWS_S3BUCKET_NAME, // Your S3 bucket name
    Key: `reports/${csvFilePath}`, // File path in the bucket
    Body: fileStream,
    ContentType: "text/csv",
  };

  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
      { id: "customer", title: "Customer" },
      { id: "mobile", title: "Mobile" },
      { id: "email", title: "Email" },
      { id: "cartProductItems", title: "Cart Product Items" },
      { id: "cartTotal", title: "Cart Total" },
      { id: "createdAt", title: "Created At" },
      { id: "updatedAt", title: "Updated At" },
    ],
  });

  await csvWriter.writeRecords(cartReports);

  try {
    const data = await s3.upload(uploadParams).promise();
    const fileUrl = data.Location;

    const subject = "onlineStoreCartAnalysis report CSV export download link";
    const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
    console.log("fileUrl", fileUrl);

    try {
      const emailResponse = await sendMail(
        res.locals.user.email,
        subject,
        "",
        content
      );
    } catch (error) {
      console.log(
        "Error caught in product detailed order report API :: " + error
      );
    }
  } catch (error) {
    console.log(
      "Error caught in product detailed order report API :: " + error
    );
  }
};

exports.generateLocationReport = async (req, res) => {
  try {
    // Get locationType from query (default to 'city' if not provided)
    const locationType = req.query.locationType || "city";

    // Step 1: Validate the locationType to ensure it's one of the allowed values
    if (!["country", "city", "state"].includes(locationType)) {
      return res.status(400).json({
        message:
          'Invalid location type. Please use "country", "city", or "state".',
      });
    }

    // Step 2: Create the aggregation pipeline
    const locationField = `address.${locationType}`; // Dynamically set the location field based on the locationType
    const csvFilePath = `${Date.now()}order_by_location_report.csv`;
    const result = await Order.aggregate([
      {
        $match: { isDelete: false }, // Step 1: Match orders that are not deleted
      },
      {
        $group: {
          _id: `$${locationField}`, // Group by location (country, city, or state)
          totalSessions: { $sum: 1 }, // Count the total number of orders per location
          totalAmount: { $sum: "$wholeTotal" }, // Sum the total amount
          firstOrderDate: { $min: "$createdAt" }, // First order date (for analysis)
          lastOrderDate: { $max: "$createdAt" }, // Last order date (for analysis)
        },
      },
      {
        $project: {
          location: "$_id", // Output the location
          totalSessions: 1, // Total number of sessions (orders)
          totalAmount: 1, // Total amount of orders in this location
          firstOrderDate: 1, // First order date
          lastOrderDate: 1, // Last order date
        },
      },
      {
        $sort: { totalSessions: -1 }, // Sort by the number of sessions (orders) in descending order
      },
    ]);
    console.log("result", result);

    // Step 3: Export to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath, // Output file name
      header: [
        { id: "location", title: "Location" },
        { id: "totalSessions", title: "Total Sessions" },
        { id: "totalAmount", title: "Total Amount" },
        { id: "firstOrderDate", title: "First Order Date" },
        { id: "lastOrderDate", title: "Last Order Date" },
      ],
    });

    // Write records to CSV
    await csvWriter.writeRecords(result);

    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME, // Your S3 bucket name
      Key: `reports/${csvFilePath}`, // File path in the bucket
      Body: fileStream,
      ContentType: "text/csv",
    };
    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      const subject = "Sessions by location report CSV export download link";
      const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
      console.log("fileUrl", fileUrl);

      try {
        const emailResponse = await sendMail(
          res.locals.user.email,
          subject,
          "",
          content
        );
      } catch (error) {
        console.log(
          "Error caught in product detailed order report API :: " + error
        );
      }
    } catch (error) {
      console.log(
        "Error caught in product detailed order report API :: " + error
      );
    }

    // Respond with the CSV file link or details
    res.status(200).json({
      message: "Report generated successfully!",
      fileUrl: "/path/to/location_report.csv", // Replace with actual file URL or file path
    });
  } catch (error) {
    console.log("Error caught in report generation: ", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};
exports.generateReferrerSessionReport = async (req, res) => {
  try {
      // Optional filtering parameters
      const { 
          startDate = new Date(0), 
          endDate = new Date(), 
          limit = 100 
      } = req.query;

      // Aggregation pipeline to generate referrer report
      const referrerReport = await Customer.aggregate([
          {
              $match: {
                  isDelete: false,
                  createdAt: { 
                      $gte: new Date(startDate), 
                      $lte: new Date(endDate) 
                  },
                  referer: { $exists: true, $ne: null }
              }
          },
          {
              $group: {
                  _id: "$referer",
                  totalReferrals: { $sum: 1 },
                  uniqueReferers: { $addToSet: "$referer" },
                  firstReferralDate: { $min: "$createdAt" },
                  lastReferralDate: { $max: "$createdAt" },
                  referralMethods: { $addToSet: "$registerMethod" }
              }
          },
          {
              $project: {
                  referer: "$_id",
                  totalReferrals: 1,
                  uniqueRefererCount: { $size: "$uniqueReferers" },
                  firstReferralDate: 1,
                  lastReferralDate: 1,
                  registrationMethods: "$referralMethods"
              }
          },
          {
              $sort: { totalReferrals: -1 }
          },
          {
              $limit: parseInt(limit)
          }
      ]);

      // Generate CSV file
      const csvFilePath = `referrer_report_${Date.now()}.csv`;
      const csvWriter = createCsvWriter({
          path: csvFilePath,
          header: [
              { id: 'referer', title: 'Referrer' },
              { id: 'totalReferrals', title: 'Total Referrals' },
              { id: 'uniqueRefererCount', title: 'Unique Referrers' },
              { id: 'firstReferralDate', title: 'First Referral Date' },
              { id: 'lastReferralDate', title: 'Last Referral Date' },
              { id: 'registrationMethods', title: 'Registration Methods' }
          ]
      });

      // Write records to CSV
      await csvWriter.writeRecords(referrerReport);

      // Upload to S3
      const fileStream = fs.createReadStream(csvFilePath);
      const uploadParams = {
          Bucket: process.env.AWS_S3BUCKET_NAME,
          Key: `reports/referrer/${csvFilePath}`,
          Body: fileStream,
          ContentType: 'text/csv'
      };

      // S3 Upload and Email
      try {
          const s3Upload = await s3.upload(uploadParams).promise();
          const fileUrl = s3Upload.Location;

          // Send email with download link
          await sendMail(
              res.locals.user.email, 
              'Referrer Session Report',
              '',
              `Download your referrer report: <a href="${fileUrl}">Click here</a>`
          );

          // Clean up local file
          fs.unlinkSync(csvFilePath);

          // Respond to client
          res.status(200).json({
              message: 'Referrer report generated successfully',
              fileUrl: fileUrl
          });

      } catch (uploadError) {
          console.error('S3 Upload or Email Error:', uploadError);
          res.status(500).json({ 
              message: 'Error processing report', 
              error: uploadError 
          });
      }

  } catch (error) {
      console.error('Referrer Report Generation Error:', error);
      res.status(500).json({ 
          message: 'Failed to generate referrer report', 
          error: error.message 
      });
  }
};
exports.sessionByOverTime = async (req, res) => {
  try {
    // Get locationType from query (default to 'city' if not provided)
    const locationType = req.query.locationType || "city";

    // Step 1: Validate the locationType to ensure it's one of the allowed values
    if (!["country", "city", "state"].includes(locationType)) {
      return res.status(400).json({
        message:
          'Invalid location type. Please use "country", "city", or "state".',
      });
    }

    // Step 2: Create the aggregation pipeline
    const locationField = `address.${locationType}`; // Dynamically set the location field based on the locationType
    const csvFilePath = `${Date.now()}order_by_location_report.csv`;
    const result = await Order.aggregate([
      {
        $match: { isDelete: false }, // Step 1: Match orders that are not deleted
      },
      {
        $group: {
          _id: `$${locationField}`, // Group by location (country, city, or state)
          totalSessions: { $sum: 1 }, // Count the total number of orders per location
          totalAmount: { $sum: "$wholeTotal" }, // Sum the total amount
          firstOrderDate: { $min: "$createdAt" }, // First order date (for analysis)
          lastOrderDate: { $max: "$createdAt" }, // Last order date (for analysis)
        },
      },
      {
        $project: {
          location: "$_id", // Output the location
          totalSessions: 1, // Total number of sessions (orders)
          totalAmount: 1, // Total amount of orders in this location
          firstOrderDate: 1, // First order date
          lastOrderDate: 1, // Last order date
        },
      },
      {
        $sort: { totalSessions: -1 }, // Sort by the number of sessions (orders) in descending order
      },
    ]);
    console.log("result", result);

    // Step 3: Export to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath, // Output file name
      header: [
        { id: "location", title: "Location" },
        { id: "totalSessions", title: "Total Sessions" },
        { id: "totalAmount", title: "Total Amount" },
        { id: "firstOrderDate", title: "First Order Date" },
        { id: "lastOrderDate", title: "Last Order Date" },
      ],
    });

    // Write records to CSV
    await csvWriter.writeRecords(result);

    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME, // Your S3 bucket name
      Key: `reports/${csvFilePath}`, // File path in the bucket
      Body: fileStream,
      ContentType: "text/csv",
    };
    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      const subject = "Sessions by location report CSV export download link";
      const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
      console.log("fileUrl", fileUrl);

      try {
        const emailResponse = await sendMail(
          res.locals.user.email,
          subject,
          "",
          content
        );
      } catch (error) {
        console.log(
          "Error caught in product detailed order report API :: " + error
        );
      }
    } catch (error) {
      console.log(
        "Error caught in product detailed order report API :: " + error
      );
    }

    // Respond with the CSV file link or details
    res.status(200).json({
      message: "Report generated successfully!",
      fileUrl: "/path/to/location_report.csv", // Replace with actual file URL or file path
    });
  } catch (error) {
    console.log("Error caught in report generation: ", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};

exports.generateRegisterMethodReport = async (req, res) => {
  try {
    // Step 1: Create the aggregation pipeline for registerMethod
    const csvFilePath = `${Date.now()}register_method_report.csv`;

    const result = await Customer.aggregate([
      {
        $match: { isDelete: false }, // Match active customers only
      },
      {
        $group: {
          _id: "$registerMethod", // Group by registerMethod (Google, Facebook, etc.)
          totalSessions: { $sum: 1 }, // Count the total number of customers per platform
          firstRegistrationDate: { $min: "$createdAt" }, // First registration date (for analysis)
          lastRegistrationDate: { $max: "$createdAt" }, // Last registration date (for analysis)
        },
      },
      {
        $project: {
          registerMethod: "$_id", // Output the registerMethod (platform)
          totalSessions: 1, // Total number of sessions (users)
          firstRegistrationDate: 1, // First registration date
          lastRegistrationDate: 1, // Last registration date
        },
      },
      {
        $sort: { totalSessions: -1 }, // Sort by total sessions in descending order
      },
    ]);

    // Step 2: Export the data to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath, // Define the output file path
      header: [
        { id: "registerMethod", title: "Register Method" },
        { id: "totalSessions", title: "Total Sessions" },
        { id: "firstRegistrationDate", title: "First Registration Date" },
        { id: "lastRegistrationDate", title: "Last Registration Date" },
      ],
    });

    // Write records to CSV
    await csvWriter.writeRecords(result);

    // Step 3: Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME, // S3 bucket name from environment variable
      Key: `reports/${csvFilePath}`, // File path in S3 bucket
      Body: fileStream,
      ContentType: "text/csv", // Specify that this is a CSV file
    };

    try {
      // Upload the file to S3
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location; // The URL to access the uploaded file

      // Step 4: Send an email with the download link
      const subject = "Sessions by Register Method Report - CSV Export";
      const content = `<p>Click <a href="${fileUrl}" target="_blank">here</a> to download the register method report.</p>`;

      console.log("fileUrl", fileUrl);

      // Send the email with the download link
      try {
        const emailResponse = await sendMail(
          res.locals.user.email,
          subject,
          "",
          content
        );
        console.log("Email sent successfully:", emailResponse);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    } catch (uploadError) {
      console.error("Error uploading to S3:", uploadError);
      return res
        .status(500)
        .json({ message: "Error uploading to S3", error: uploadError });
    }

    // Respond with the CSV file link or details
    res.status(200).json({
      message: "Report generated and uploaded successfully!",
      fileUrl: "/path/to/register_method_report.csv", // Replace with the actual file URL from S3
    });
  } catch (error) {
    console.log("Error caught in report generation: ", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};
exports.generateSessionOverTimeReport = async (req, res) => {
  try {
    // Step 1: Create the aggregation pipeline for session duration
    const csvFilePath = `${Date.now()}_session_overtime_report.csv`;

    const result = await Customer.aggregate([
      {
        $match: {
          loginTime: { $exists: true },
          logoutTime: { $exists: true },
        },
      },
      {
        $project: {
          _id: 1,
          loginTime: 1,
          logoutTime: 1,
          sessionDuration: { $subtract: ["$logoutTime", "$loginTime"] },
        },
      },
      {
        $group: {
          _id: "$loginTime",
          totalSessions: { $sum: 1 },
          totalSessionDuration: { $sum: "$sessionDuration" },
          averageSessionDuration: { $avg: "$sessionDuration" },
          firstLogin: { $min: "$loginTime" },
          lastLogout: { $max: "$logoutTime" },
        },
      },
      {
        $project: {
          date: "$_id",
          totalSessions: 1,
          totalSessionDuration: { $divide: ["$totalSessionDuration", 1000] }, // Convert to seconds
          averageSessionDuration: { $divide: ["$averageSessionDuration", 1000] }, // Convert to seconds
          firstLogin: 1,
          lastLogout: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // Step 2: Export the data to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "date", title: "Date" },
        { id: "totalSessions", title: "Total Sessions" },
        { id: "totalSessionDuration", title: "Total Session Duration (s)" },
        { id: "averageSessionDuration", title: "Average Session Duration (s)" },
        { id: "firstLogin", title: "First Login Time" },
        { id: "lastLogout", title: "Last Logout Time" },
      ],
    });

    await csvWriter.writeRecords(result);

    // Step 3: Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      // Step 4: Send an email with the download link
      const subject = "Session Over Time Report - CSV Export";
      const content = `<p>Click <a href="${fileUrl}" target="_blank">here</a> to download the session over time report.</p>`;
      
      try {
        await sendMail(res.locals.user.email, subject, "", content);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    } catch (uploadError) {
      console.error("Error uploading to S3:", uploadError);
      return res.status(500).json({ message: "Error uploading to S3", error: uploadError });
    }

    // Respond with success
    res.status(200).json({
      message: "Report generated and uploaded successfully!",
      fileUrl: "/path/to/session_overtime_report.csv", // Replace with actual file URL from S3
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};
exports.generateAbandonedCarts = async (req, res) => {
  try {
    // Define the path for the CSV file
    const csvFilePath = `${Date.now()}_cart_abandonment_report.csv`;

    // Step 1: Create the aggregation pipeline
    const abandonedCarts = await Cart.aggregate([
      {
        $match: {
          isPurchased: false, // Cart not purchased
          isActive: true, // Cart is still active
          isDelete: false, // Not deleted
        },
      },
      {
        $lookup: {
          from: "customers", // Lookup customer details
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true, // In case the cart is by a guest user
        },
      },
      {
        $lookup: {
          from: "products", // Lookup product details
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          cartId: "$_id", // Cart ID
          customerId: "$customer",
          customerName: {
            $ifNull: [
              { $concat: ["$customerDetails.name", " (Guest)"] },
              "Guest",
            ],
          },
          products: "$productDetails.name", // List of product names
          cartAddedDate: "$date.added",
          couponApplied: { $ifNull: ["$coupon", "None"] }, // Coupon if any
        },
      },
      { $sort: { "date.added": 1 } }, // Sort by cart added date
    ]);

    // Step 2: Define CSV structure
    const csvHeader = [
      { id: "cartId", title: "Cart ID" },
      { id: "customerId", title: "Customer ID" },
      { id: "customerName", title: "Customer Name" },
      { id: "products", title: "Products" },
      { id: "cartAddedDate", title: "Cart Added Date" },
      { id: "couponApplied", title: "Coupon Applied" },
    ];

    // Step 3: Write to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: csvHeader,
    });

    await csvWriter.writeRecords(abandonedCarts);

    // Step 4: Upload the CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME, // S3 Bucket name
      Key: `reports/${csvFilePath}`, // Path in S3
      Body: fileStream,
      ContentType: "text/csv",
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location; // Get the file URL from S3
      console.log("fileUrl", fileUrl);

      // Step 5: Send email with download link
      const subject = "Online Store Cart Abandonment Report CSV Export";
      const content = `<p>Click <a href="${fileUrl}" target="_blank">here</a> to download the report.</p>`;
      await sendMail(res.locals.user.email, subject, "", content);

      // Respond with success
      res.status(200).json({
        message: "Report generated successfully and sent via email!",
        fileUrl: fileUrl, // Provide the file URL for reference
      });
    } catch (uploadError) {
      console.error("Error uploading file to S3:", uploadError);
      res
        .status(500)
        .json({ message: "Error uploading to S3", error: uploadError });
    }
  } catch (error) {
    console.error("Error generating behavior report:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};

exports.generateConversionReport = async (req, res) => {
  try {
    // Define the CSV file path
    const csvFilePath = `${Date.now()}_conversion_report.csv`;

    // Step 1: Aggregating the necessary data
    const aggregationPipeline = [
      {
        $facet: {
          // Aggregate total active orders placed
          totalOrders: [
            {
              $match: { isActive: true }, // Include all orders where isActive is true
            },
            {
              $group: {
                _id: null, // Group by null to get the total count
                totalOrders: { $sum: 1 }, // Sum to get the total orders count
              },
            },
          ],
          // Aggregate newsletter signups (Verified)
          totalNewsletters: [
            {
              $match: { isUnsubscribed: false },
            },
            {
              $group: {
                _id: null, // Group by null to get the total count
                totalNewsletters: { $sum: 1 }, // Sum to get the total newsletters count
              },
            },
          ],
          // Aggregate contact form submissions
          totalContactForms: [
            {
              $lookup: {
                from: "contactdetails", // Reference to contact form submissions
                localField: "email",
                foreignField: "email",
                as: "formSubmissions",
              },
            },
            {
              $unwind: "$formSubmissions",
            },
            {
              $group: {
                _id: null, // Group by null to get the total count
                totalContactForms: { $sum: 1 }, // Sum to get the total contact forms count
              },
            },
          ],
        },
      },
      {
        $project: {
          // Flatten the result for easy access
          totalOrders: { $arrayElemAt: ["$totalOrders.totalOrders", 0] }, // Ensure it's a number
          totalNewsletters: {
            $arrayElemAt: ["$totalNewsletters.totalNewsletters", 0],
          }, // Ensure it's a number
          totalContactForms: {
            $arrayElemAt: ["$totalContactForms.totalContactForms", 0],
          }, // Ensure it's a number
        },
      },
      {
        $project: {
          // Ensure numeric fields for conversion calculations
          totalOrders: { $ifNull: ["$totalOrders", 0] },
          totalNewsletters: { $ifNull: ["$totalNewsletters", 0] },
          totalContactForms: { $ifNull: ["$totalContactForms", 0] },
          conversionOrderRate: {
            $cond: {
              if: { $eq: ["$totalOrders", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$totalOrders", "$totalOrders"] }, // This will now divide numbers
                  100,
                ],
              },
            },
          },
          conversionNewsletterRate: {
            $cond: {
              if: { $eq: ["$totalNewsletters", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$totalNewsletters", "$totalNewsletters"] }, // This will now divide numbers
                  100,
                ],
              },
            },
          },
          conversionContactRate: {
            $cond: {
              if: { $eq: ["$totalContactForms", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$totalContactForms", "$totalContactForms"] }, // This will now divide numbers
                  100,
                ],
              },
            },
          },
        },
      },
    ];

    const result = await Order.aggregate(aggregationPipeline);

    // Step 2: Write the aggregated data to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "date", title: "Date" },
        { id: "totalOrders", title: "Total Orders Placed" },
        { id: "totalNewsletters", title: "Total Newsletter Signups" },
        { id: "totalContactForms", title: "Total Contact Form Submissions" },
        { id: "conversionOrderRate", title: "Order Conversion Rate (%)" },
        {
          id: "conversionNewsletterRate",
          title: "Newsletter Conversion Rate (%)",
        },
        {
          id: "conversionContactRate",
          title: "Contact Form Conversion Rate (%)",
        },
      ],
    });

    await csvWriter.writeRecords(result);

    // Step 3: Upload the CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      // Step 4: Send an email with the download link
      const subject = "Online Store Conversion Report CSV Export";
      const content = `<p>Click <a href="${fileUrl}" target="_blank">here</a> to download the report.</p>`;
      await sendMail(res.locals.user.email, subject, "", content);

      // Respond with success
      res.status(200).json({
        message: "Report generated successfully and sent via email!",
        fileUrl: fileUrl,
      });
    } catch (uploadError) {
      console.error("Error uploading file to S3:", uploadError);
      res
        .status(500)
        .json({ message: "Error uploading to S3", error: uploadError });
    }
  } catch (error) {
    console.error("Error generating conversion report:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};

exports.generateCustomersByLocationReport = async (req, res) => {
  try {
    // Define the CSV file path
    const csvFilePath = `${Date.now()}_customers_by_location_report.csv`;

    // Step 1: Aggregating the customer and address data
    const aggregationPipeline = [
      {
        $lookup: {
          from: "addresses", // Join with the address collection
          localField: "_id", // Referencing the customer collection
          foreignField: "customer", // Referencing the customer in address collection
          as: "addresses",
        },
      },
      {
        $unwind: {
          path: "$addresses", // Unwind the address array
          preserveNullAndEmptyArrays: true, // Allow customers without an address
        },
      },
      {
        $match: {
          "addresses.isDelete": false, // Ensure the address is not deleted
          isDelete: false, // Ensure the customer is not deleted
        },
      },
      {
        $project: {
          name: 1, // Include customer name
          email: 1, // Include customer email
          countryCode: "$addresses.countryCode", // Address fields
          streetAddress: "$addresses.streetAddress",
          aptSuiteUnit: "$addresses.aptSuiteUnit",
          city: "$addresses.city", // Include the city field
          postalCode: "$addresses.postalCode",
          state: "$addresses.state",
          country: "$addresses.country",
        },
      },
    ];

    // Execute the aggregation
    const result = await Customer.aggregate(aggregationPipeline);

    // Debug: log the result to verify if city data is included

    // Step 2: Write the aggregated data to CSV
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "name", title: "Customer Name" },
        { id: "email", title: "Customer Email" },
        { id: "countryCode", title: "Country Code" },
        { id: "streetAddress", title: "Street Address" },
        { id: "aptSuiteUnit", title: "Apt/Suite/Unit" },
        { id: "city", title: "City" },
        { id: "postalCode", title: "Postal Code" },
        { id: "state", title: "State" },
        { id: "country", title: "Country" },
      ],
    });

    await csvWriter.writeRecords(result);

    // Step 3: Upload the CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      // Step 4: Send an email with the download link
      const subject = "Customers by Location Report CSV Export";
      const content = `<p>Click <a href="${fileUrl}" target="_blank">here</a> to download the report.</p>`;
      await sendMail(res.locals.user.email, subject, "", content);

      // Respond with success
      res.status(200).json({
        message: "Report generated successfully and sent via email!",
        fileUrl: fileUrl,
      });
    } catch (uploadError) {
      console.error("Error uploading file to S3:", uploadError);
      res
        .status(500)
        .json({ message: "Error uploading to S3", error: uploadError });
    }
  } catch (error) {
    console.error("Error generating customers by location report:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};

exports.customerSalesReport = async (req, res) => {
  try {
    // Step 1: Aggregate orders by customer

    const { startDate, endDate } = req.query;

    // Build the date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate); // Include orders from startDate
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate); // Include orders until endDate
    }

    const reportData = await Order.aggregate([
      // Match non-deleted orders
      {
        $match: {
          isDelete: false,
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },

      // Group by customerId to calculate order totals and counts
      {
        $group: {
          _id: "$customerId",
          orderCount: { $sum: 1 }, // Total orders per customer
          totalSales: { $sum: { $toDouble: "$wholeTotal" } }, // Total sales per customer
        },
      },

      // Classify customers into first-time and returning
      {
        $facet: {
          firstTimeCustomers: [
            { $match: { orderCount: 1 } }, // Customers with only one order
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$totalSales" }, // Sum of total sales
                totalOrders: { $sum: "$orderCount" }, // Total order count
                customerCount: { $sum: 1 }, // Total customer count
              },
            },
          ],
          returningCustomers: [
            { $match: { orderCount: { $gt: 1 } } }, // Customers with more than one order
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$totalSales" }, // Sum of total sales
                totalOrders: { $sum: "$orderCount" }, // Total order count
                customerCount: { $sum: 1 }, // Total customer count
              },
            },
          ],
        },
      },

      // Flatten the results for better formatting
      {
        $project: {
          firstTime: { $arrayElemAt: ["$firstTimeCustomers", 0] }, // Unwrap first-time data
          returning: { $arrayElemAt: ["$returningCustomers", 0] }, // Unwrap returning data
        },
      },
    ]);

    // Extract the data
    const data = reportData[0] || {};
    const firstTime = data.firstTime || {
      totalSales: 0,
      totalOrders: 0,
      customerCount: 0,
    };
    const returning = data.returning || {
      totalSales: 0,
      totalOrders: 0,
      customerCount: 0,
    };

    // Step 2: Format data for CSV
    const csvData = [
      {
        customerType: "First-Time Customers",
        totalSales: firstTime.totalSales,
        totalOrders: firstTime.totalOrders,
        customerCount: firstTime.customerCount,
      },
      {
        customerType: "Returning Customers",
        totalSales: returning.totalSales,
        totalOrders: returning.totalOrders,
        customerCount: returning.customerCount,
      },
    ];

    // Step 3: Generate the CSV file
    const csvFilePath = `${Date.now()}_customerSalesReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "customerType", title: "Customer Type" },
        { id: "totalSales", title: "Total Sales" },
        { id: "totalOrders", title: "Total Orders" },
        { id: "customerCount", title: "Customer Count" },
      ],
    });

    await csvWriter.writeRecords(csvData);

    // Step 4: Upload CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);

    // Step 5: Send the CSV download link via email
    const subject = "Customer Sales Report CSV download link";
    const content = `<p>Dear User,</p>
                         <p>Your Customer Sales Report is ready. You can download it from the link below:</p>
                         <p><a href="${fileUrl}" target="_blank">Download Customer Sales Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error sending email:", error);
    }

    // Step 6: Send response with generated data
    return res.status(200).json({
      data: csvData,
      error_code: 0,
      message: "Customer sales report generated and uploaded successfully",
    });
  } catch (error) {
    console.error("Error generating customer sales report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating customer sales report",
      error: error.message,
    });
  }
};

exports.oneTimeCustomersReport = async (req, res) => {
  try {
    // Extract query parameters for date filtering (optional)
    const { startDate, endDate } = req.query;

    // Build the date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    console.log("dateFilter", dateFilter);

    // Step 1: Aggregate one-time customers
    const reportData = await Order.aggregate([
      // Match non-deleted orders and apply the date filter if provided
      {
        $match: {
          isDelete: false,
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },

      // Group by customerId to calculate order counts
      {
        $group: {
          _id: "$customerId", // Group by customer ID
          orderCount: { $sum: 1 }, // Count orders for each customer
          totalSpent: { $sum: { $toDouble: "$wholeTotal" } }, // Sum of order totals
          lastOrderDate: { $max: "$createdAt" }, // Last order date for the customer
        },
      },

      // Filter to include only customers with one order
      {
        $match: {
          orderCount: 1,
        },
      },

      // Join with the customers collection to get customer details
      {
        $lookup: {
          from: "customers",
          localField: "_id", // customerId in the orders
          foreignField: "_id", // _id in the customers collection
          as: "customerData",
        },
      },

      // Unwind customer data to flatten the array
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true, // Handle cases where customer data might be missing
        },
      },

      // Project the final fields for the report
      {
        $project: {
          customerId: "$_id",
          customerName: "$customerData.name", // Customer's name
          customerEmail: "$customerData.email", // Customer's email
          totalSpent: 1, // Total spent
          lastOrderDate: 1, // Last order date
          orderCount: 1, // Total order count
        },
      },

      // Sort by last order date (most recent first)
      {
        $sort: { lastOrderDate: -1 },
      },
    ]);

    // Step 2: Format data for CSV
    const csvData = reportData.map((result) => ({
      customerId: result.customerId,
      customerName: result.customerName || "Guest",
      customerEmail: result.customerEmail,
      totalSpent: result.totalSpent,
      lastOrderDate: result.lastOrderDate,
      orderCount: result.orderCount,
    }));

    // Step 3: Generate the CSV file
    const csvFilePath = `${Date.now()}_oneTimeCustomersReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "customerId", title: "Customer ID" },
        { id: "customerName", title: "Customer Name" },
        { id: "customerEmail", title: "Customer Email" },
        { id: "totalSpent", title: "Total Spent" },
        { id: "lastOrderDate", title: "Last Order Date" },
        { id: "orderCount", title: "Order Count" },
      ],
    });

    await csvWriter.writeRecords(csvData);

    // Step 4: Upload CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);

    // Step 5: Send the CSV download link via email
    const subject = "One-Time Customers Report CSV download link";
    const content = `<p>Dear User,</p>
                       <p>Your One-Time Customers Report is ready. You can download it from the link below:</p>
                       <p><a href="${fileUrl}" target="_blank">Download One-Time Customers Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error sending email:", error);
    }

    // Step 6: Send response with generated data
    return res.status(200).json({
      data: csvData,
      error_code: 0,
      message: "One-time customers report generated and uploaded successfully",
    });
  } catch (error) {
    console.error("Error generating one-time customers report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating one-time customers report",
      error: error.message,
    });
  }
};
exports.repeatCustomersReport = async (req, res) => {
  try {
    // Extract query parameters for date filtering (optional)
    const { startDate, endDate } = req.query;

    // Build the date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    console.log("dateFilter", dateFilter);

    // Step 1: Aggregate repeat customers (more than 1 purchase)
    const reportData = await Order.aggregate([
      // Match non-deleted orders and apply the date filter if provided
      {
        $match: {
          isDelete: false,
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },

      // Group by customerId to calculate order counts
      {
        $group: {
          _id: "$customerId", // Group by customer ID
          orderCount: { $sum: 1 }, // Count orders for each customer
          totalSpent: { $sum: { $toDouble: "$wholeTotal" } }, // Sum of order totals
          lastOrderDate: { $max: "$createdAt" }, // Last order date for the customer
          firstOrderDate: { $min: "$createdAt" }, // First order date for the customer
        },
      },

      // Filter to include only customers with more than one order
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },

      // Join with the customers collection to get customer details
      {
        $lookup: {
          from: "customers",
          localField: "_id", // customerId in the orders
          foreignField: "_id", // _id in the customers collection
          as: "customerData",
        },
      },

      // Unwind customer data to flatten the array
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true, // Handle cases where customer data might be missing
        },
      },

      // Project the final fields for the report
      {
        $project: {
          customerId: "$_id",
          customerName: "$customerData.name", // Customer's name
          customerEmail: "$customerData.email", // Customer's email
          totalSpent: 1, // Total spent
          orderCount: 1, // Total order count
          firstOrderDate: 1, // First order date
          lastOrderDate: 1, // Last order date
          daysBetweenFirstAndLastOrder: {
            $divide: [
              { $subtract: ["$lastOrderDate", "$firstOrderDate"] },
              1000 * 60 * 60 * 24, // Convert milliseconds to days
            ],
          },
          averageOrderValue: {
            $divide: ["$totalSpent", "$orderCount"],
          },
        },
      },

      // Sort by order count (highest first)
      {
        $sort: { orderCount: -1 },
      },
    ]);

    // Step 2: Format data for CSV
    const csvData = reportData.map((result) => ({
      customerId: result.customerId,
      customerName: result.customerName || "Guest",
      customerEmail: result.customerEmail,
      totalSpent: result.totalSpent.toFixed(2),
      orderCount: result.orderCount,
      firstOrderDate: result.firstOrderDate,
      lastOrderDate: result.lastOrderDate,
      daysBetweenFirstAndLastOrder: Math.round(result.daysBetweenFirstAndLastOrder),
      averageOrderValue: result.averageOrderValue.toFixed(2),
    }));

    // Step 3: Generate the CSV file
    const csvFilePath = `${Date.now()}_repeatCustomersReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "customerId", title: "Customer ID" },
        { id: "customerName", title: "Customer Name" },
        { id: "customerEmail", title: "Customer Email" },
        { id: "totalSpent", title: "Total Spent" },
        { id: "orderCount", title: "Order Count" },
        { id: "firstOrderDate", title: "First Order Date" },
        { id: "lastOrderDate", title: "Last Order Date" },
        { id: "daysBetweenFirstAndLastOrder", title: "Days Between First and Last Order" },
        { id: "averageOrderValue", title: "Average Order Value" },
      ],
    });

    await csvWriter.writeRecords(csvData);

    // Step 4: Upload CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);

    // Step 5: Send the CSV download link via email
    const subject = "Repeat Customers Report CSV download link";
    const content = `<p>Dear User,</p>
                       <p>Your Repeat Customers Report is ready. You can download it from the link below:</p>
                       <p><a href="${fileUrl}" target="_blank">Download Repeat Customers Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error sending email:", error);
    }

    // Step 6: Send response with generated data
    return res.status(200).json({
      data: csvData,
      error_code: 0,
      message: "Repeat customers report generated and uploaded successfully",
    });
  } catch (error) {
    console.error("Error generating repeat customers report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating repeat customers report",
      error: error.message,
    });
  }
};
exports.fulfillmentOverTimeReport = async (req, res) => {
  try {
    // Extract query parameters for date filtering (optional)
    const { startDate, endDate } = req.query;

    // Build the date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate); // Convert startDate to Date object
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate); // Convert endDate to Date object
    }

    // Step 1: Aggregate orders with 'DELIVERED' or 'COLLECTED' status
    const ordersData = await Order.aggregate([
      // Match orders with statuses 'DELIVERED' or 'COLLECTED' and apply date filter if available
      {
        $match: {
          isDelete: false,
          orderStatus: { $in: ["DELIVERED", "COLLECTED"] }, // Only 'DELIVERED' and 'COLLECTED' orders
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}), // Apply date filter if available
        },
      },

      // Lookup to get customer data (name)
      {
        $lookup: {
          from: "customers", // Name of the customers collection
          localField: "customerId", // Field in order to join with the customers collection
          foreignField: "_id", // Field in customer to match against the order's customerId
          as: "customerData", // Output field name
        },
      },

      // Unwind the customerData to get individual customer details
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true, // In case customerData is null or missing
        },
      },

      // Step 2: Project the required fields (customer name, order number, etc.)
      {
        $project: {
          orderNo: 1, // Order number
          customerName: { $ifNull: ["$customerData.name", "Guest"] }, // Customer name or "Guest" if not available
          orderStatus: 1, // Order status
          createdAt: 1, // Order createdAt (timestamp of order creation)
        },
      },

      // Step 3: Sort orders by createdAt (or other criteria, if needed)
      {
        $sort: { createdAt: -1 }, // Sort by order creation date (latest first)
      },
    ]);

    // Step 3: Format data for CSV export or API response
    const csvData = ordersData.map((order) => ({
      orderNo: order.orderNo,
      customerName: order.customerName,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    }));

    // Step 4: Generate the CSV file
    const csvFilePath = `${Date.now()}_ordersReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "orderNo", title: "Order Number" },
        { id: "customerName", title: "Customer Name" },
        { id: "orderStatus", title: "Order Status" },
        { id: "createdAt", title: "Order Date" },
      ],
    });

    await csvWriter.writeRecords(csvData); // Write the CSV data to file

    // Step 5: Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Step 6: Send the CSV download link via email (optional)
    const subject = "Orders Report CSV download link";
    const content = `<p>Dear User,</p>
                       <p>Your Fulfillment Order Report is ready. You can download it from the link below:</p>
                       <p><a href="${fileUrl}" target="_blank">Download Orders Report</a></p>`;
    console.log("fileUrl", fileUrl);

    try {
      await sendMail(res.locals.user.email, subject, "", content); // Send email with the link
    } catch (error) {
      console.log("Error sending email:", error);
    }

    // Step 7: Send response with the generated data
    return res.status(200).json({
      data: csvData,
      error_code: 0,
      message: "Orders report generated and uploaded successfully",
    });
  } catch (error) {
    console.error("Error generating orders report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating orders report",
      error: error.message,
    });
  }
};

exports.costOfGoodsSold = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build the date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate); // Convert startDate to Date object
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate); // Convert endDate to Date object
    }

    // Aggregate orders
    const cogsReport = await Order.aggregate([
      // Match relevant orders
      {
        $match: {
          isDelete: false,
          orderStatus: { $in: ["DELIVERED", "COLLECTED"] },
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },

      // Unwind the products array to process each product separately
      { $unwind: "$products" },

      // Populate product details
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      // Unwind the populated product details
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Add fields for calculations
      {
        $addFields: {
          productName: "$productDetails.name",
          sku: "$productDetails.sku",
          mrp: "$productDetails.price.mrp",
          sellingPrice: "$productDetails.price.selling",
          offerPrice: "$productDetails.price.offer",
          quantitySold: "$products.quantity",
          totalSelling: {
            $multiply: ["$products.quantity", "$productDetails.price.selling"],
          },
          totalMRP: {
            $multiply: ["$products.quantity", "$productDetails.price.mrp"],
          },
        },
      },

      // Project the required fields
      {
        $project: {
          orderNo: 1,
          productName: 1,
          sku: 1,
          mrp: 1,
          sellingPrice: 1,
          offerPrice: 1,
          quantitySold: 1,
          totalSelling: 1,
          totalMRP: 1,
          createdAt: 1,
        },
      },

      // Sort by order creation date
      { $sort: { createdAt: -1 } },
    ]);

    // Step 2: Format data for response or CSV
    const csvData = cogsReport.map((item) => ({
      orderNo: item.orderNo,
      productName: item.productName,
      sku: item.sku,
      mrp: item.mrp.toFixed(2),
      sellingPrice: item.sellingPrice.toFixed(2),
      offerPrice: item.offerPrice.toFixed(2),
      quantitySold: item.quantitySold,
      totalSelling: item.totalSelling.toFixed(2),
      totalMRP: item.totalMRP.toFixed(2),
      orderDate: item.createdAt,
    }));

    // Step 3: Generate CSV if needed
    const csvFilePath = `${Date.now()}_cogsReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "orderNo", title: "Order Number" },
        { id: "productName", title: "Product Name" },
        { id: "sku", title: "SKU" },
        { id: "mrp", title: "MRP" },
        { id: "sellingPrice", title: "Selling Price" },
        { id: "offerPrice", title: "Offer Price" },
        { id: "quantitySold", title: "Quantity Sold" },
        { id: "totalSelling", title: "Total Selling Value" },
        { id: "totalMRP", title: "Total MRP Value" },
        { id: "orderDate", title: "Order Date" },
      ],
    });

    await csvWriter.writeRecords(csvData);
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Step 6: Send the CSV download link via email (optional)
    const subject = "Cost Of goods sold Report CSV download link";
    const content = `<p>Dear User,</p>
                       <p>Your cost Of goods Sold Report is ready. You can download it from the link below:</p>
                       <p><a href="${fileUrl}" target="_blank">Download Orders Report</a></p>`;
    console.log("fileUrl", fileUrl);
    try {
      await sendMail(res.locals.user.email, subject, "", content); // Send email with the link
    } catch (error) {
      console.log("Error sending email:", error);
    }

    // Step 4: Respond with the data or the generated CSV
    return res.status(200).json({
      data: cogsReport,
      message: "Cost of Goods Sold report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating COGS report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating COGS report",
      error: error.message,
    });
  }
};

exports.inventoryAnalysisReport = async (req, res) => {
  try {
    // Get optional date range from query parameters
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(new Date().getFullYear(), 0, 1); // Default to start of current year
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(); // Default to current date

    // Aggregation pipeline for comprehensive inventory analysis
    const inventoryAnalysis = await Product.aggregate([
      // Lookup order details
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { $unwind: '$products' },
            { $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$products.productId', '$$productId'] },
                  { $gte: ['$createdAt', startDate] },
                  { $lte: ['$createdAt', endDate] }
                ]
              }
            }},
            { $group: {
              _id: null,
              totalQuantitySold: { $sum: { $toDouble: '$products.quantity' } },
              soldDates: { $push: '$createdAt' }
            }}
          ],
          as: 'salesData'
        }
      },
      // First transform the salesData array to extract totalQuantitySold properly
      {
        $addFields: {
          // Get the first element of salesData array or use default if empty
          salesInfo: { 
            $ifNull: [
              { $arrayElemAt: ['$salesData', 0] }, 
              { totalQuantitySold: 0, soldDates: [] }
            ]
          },
          // Convert stock to double or use 0 if null
          currentStock: { $toDouble: { $ifNull: ['$stock', 0] } }
        }
      },
      // Now perform calculations with the extracted data
      {
        $addFields: {
          // Extract totalQuantitySold directly from salesInfo
          totalQuantitySold: { $ifNull: ['$salesInfo.totalQuantitySold', 0] },
          
          // Calculate starting inventory (current stock + total sold)
          startingInventory: { 
            $add: [
              '$currentStock',
              { $ifNull: ['$salesInfo.totalQuantitySold', 0] }
            ] 
          },
          
          // Ending inventory is the current stock
          endingInventory: '$currentStock'
        }
      },
      // Calculate average inventory in a separate step
      {
        $addFields: {
          // Calculate average inventory (average of starting and ending inventory)
          averageInventory: { 
            $divide: [
              { $add: ['$startingInventory', '$endingInventory'] },
              2
            ]
          },
          
          // Percent of inventory sold
          percentInventorySold: {
            $cond: [
              { $gt: ['$startingInventory', 0] },
              { $multiply: [
                { $divide: [
                  '$totalQuantitySold', 
                  '$startingInventory'
                ]},
                100
              ]},
              0
            ]
          },
          
          // Days in period
          daysInPeriod: { 
            $divide: [
              { $subtract: [endDate, startDate] }, 
              1000 * 60 * 60 * 24 
            ] 
          },
          
          // Calculate average daily sales
          averageDailySales: { 
            $cond: [
              { $gt: [{ $divide: [{ $subtract: [endDate, startDate] }, 1000 * 60 * 60 * 24] }, 0] },
              { $divide: [
                '$totalQuantitySold', 
                { $max: [{ $divide: [{ $subtract: [endDate, startDate] }, 1000 * 60 * 60 * 24] }, 1] }
              ]},
              0
            ]
          }
        }
      },
      // Project final report fields
      {
        $project: {
          productId: '$_id',
          productName: '$name',
          sku: '$sku',
          startingInventory: { $round: ['$startingInventory', 2] },
          endingInventory: { $round: ['$endingInventory', 2] },
          averageInventory: { $round: ['$averageInventory', 2] },
          totalQuantitySold: { $round: ['$totalQuantitySold', 2] },
          averageDailySales: { $round: ['$averageDailySales', 2] },
          percentInventorySold: { $round: ['$percentInventorySold', 2] },
          daysOfInventoryRemaining: {
            $cond: [
              { $gt: ['$averageDailySales', 0] },
              { $round: [
                { $divide: ['$endingInventory', '$averageDailySales'] },
                2
              ]},
              0
            ]
          },
          inventoryTurnoverRate: {
            $cond: [
              { $gt: ['$averageInventory', 0] },
              { $round: [
                { $divide: ['$totalQuantitySold', '$averageInventory'] },
                2
              ]},
              0
            ]
          }
        }
      },
      // Sort by total quantity sold in descending order
      { $sort: { totalQuantitySold: -1 } }
    ]);

    // Prepare CSV export
    const csvFilePath = `${Date.now()}_inventory_analysis_report.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'productId', title: 'Product ID' },
        { id: 'productName', title: 'Product Name' },
        { id: 'sku', title: 'SKU' },
        { id: 'startingInventory', title: 'Starting Inventory' },
        { id: 'endingInventory', title: 'Ending Inventory' },
        { id: 'averageInventory', title: 'Average Inventory' },
        { id: 'totalQuantitySold', title: 'Total Quantity Sold' },
        { id: 'averageDailySales', title: 'Average Daily Sales' },
        { id: 'percentInventorySold', title: 'Percent of Inventory Sold' },
        { id: 'daysOfInventoryRemaining', title: 'Days of Inventory Remaining' },
        { id: 'inventoryTurnoverRate', title: 'Inventory Turnover Rate' }
      ]
    });

    // Write records to CSV
    await csvWriter.writeRecords(inventoryAnalysis);

    // Upload to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: 'text/csv'
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Send email with report
    const subject = 'Inventory Analysis Report';
    const content = `
      <p>Dear User,</p>
      <p>Your Inventory Analysis Report is ready for the period from ${startDate.toDateString()} to ${endDate.toDateString()}.</p>
      <p>Download the report: <a href="${fileUrl}">Inventory Analysis Report</a></p>
    `;

    try {
      await sendMail(res.locals.user.email, subject, '', content);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Respond with analysis data and download link
    return res.status(200).json({
      data: inventoryAnalysis,
      downloadLink: fileUrl,
      message: 'Inventory Analysis report generated successfully',
      error_code: 0
    });

  } catch (error) {
    console.error('Error generating Inventory Analysis report:', error);
    return res.status(500).json({
      error_code: 1,
      message: 'Error generating Inventory Analysis report',
      error: error.message
    });
  }
};

exports.customerAnalyticsReport = async (req, res) => {
  try {
    // Define CSV headers
    const headers = [
      { id: "name", title: "Customer Name" },
      { id: "email", title: "Email" },
      { id: "mobile", title: "Mobile" },
      { id: "location", title: "Location" },
      { id: "totalOrders", title: "Total Orders" },
      { id: "averageOrderValue", title: "Average Order Value" },
      { id: "totalSpent", title: "Total Spent" },
      { id: "lastOrderDate", title: "Last Order Date" },
      { id: "lastOrderTime", title: "Last Order Time" },
      { id: "daysFromLastOrder", title: "Days Since Last Order" },
      { id: "purchaseFrequency", title: "Purchase Frequency (Orders/Month)" },
      { id: "comparedToAverage", title: "Compared to Overall Average" },
      { id: "spendTier", title: "Spend Tier" },
      { id: "customerType", title: "Customer Type" },
      { id: "firstOrderDate", title: "First Order Date" },
      { id: "daysSinceFirstOrder", title: "Days Since First Order" },
    ];

    // Get overall average order value
    const overallStats = await orderModel.aggregate([
      {
        $match: {
          isDelete: false,
          orderStatus: { $in: ["DELIVERED", "COMPLETED"] },
        },
      },
      {
        $group: {
          _id: "$customerId",
          orderCount: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $group: {
          _id: null,
          overallAverageOrderValue: { $avg: "$totalAmount" },
          totalCustomers: { $sum: 1 },
          oneTimeCustomers: {
            $sum: { $cond: [{ $eq: ["$orderCount", 1] }, 1, 0] },
          },
        },
      },
    ]);

    const overallAverage = overallStats[0]?.overallAverageOrderValue || 0;

    // Get customer details with order metrics
    const customers = await orderModel.aggregate([
      {
        $match: {
          isDelete: false,
          orderStatus: { $in: ["DELIVERED", "COMPLETED"] },
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          lastOrderDate: { $max: "$createdAt" },
          firstOrderDate: { $min: "$createdAt" },
          location: { $last: "$address" },
          orderDates: { $push: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $unwind: "$customerInfo",
      },
    ]);

    // Process and format data for CSV
    const reportData = customers.map((customer) => {
      // Calculate days between current date and customer's last order
      // Formula: (current_date - last_order_date) / (ms * sec * min * hours)
      const daysSinceLastOrder = Math.floor(
        (new Date() - new Date(customer?.lastOrderDate)) / (1000 * 60 * 60 * 24)
      );

      // Calculate days between current date and customer's first order
      // Formula: (current_date - first_order_date) / (ms * sec * min * hours)
      const daysSinceFirstOrder = Math.floor(
        (new Date() - new Date(customer?.firstOrderDate)) /
          (1000 * 60 * 60 * 24)
      );

      // Calculate average orders per month (purchase frequency)
      // Formula: total_orders / number_of_months_since_first_order
      // Math.max(1, ...) ensures we don't divide by zero if first and last order are in same month
      // The calculation (lastOrderDate - firstOrderDate) / (ms * sec * min * hours * days_in_month)
      // gives us the number of months between first and last order
      const purchaseFrequency =
        customer?.totalOrders /
        Math.max(
          1,
          Math.floor(
            (new Date(customer?.lastOrderDate) -
              new Date(customer?.firstOrderDate)) /
              (1000 * 60 * 60 * 24 * 30)
          )
        );

      // Calculate how customer's average order value compares to overall average
      // Formula: (customer_average / overall_average) * 100 to get percentage
      // toFixed(2) rounds to 2 decimal places
      const comparedToAverage = (
        (customer?.averageOrderValue / overallAverage) *
        100
      ).toFixed(2);

      // Determine customer's spend tier based on multiple metrics:
      // - Average order value
      // - Purchase frequency (orders per month)
      // - Total number of orders
      // - How recently they ordered (days since last order)
      const spendTier = calculateSpendTier({
        averageOrderValue: customer?.averageOrderValue,
        purchaseFrequency,
        totalOrders: customer.totalOrders,
        daysSinceLastOrder,
      });

      // Determine if one-time or returning customer
      const customerType =
        customer.totalOrders === 1 ? "One-Time" : "Returning";

      // Return formatted customer data for CSV
      // Format dates using toLocaleDateString() for date and toLocaleTimeString() for time
      // Format numerical values using toFixed(2) for consistent decimal places
      return {
        name: customer?.customerInfo?.name || "N/A",
        email: customer?.customerInfo?.email,
        mobile: customer?.customerInfo?.mobile,
        location: `${customer?.location?.city}, ${customer?.location?.state}, ${customer?.location?.country}`,
        totalOrders: customer?.totalOrders,
        averageOrderValue: customer?.averageOrderValue?.toFixed(2),
        totalSpent: customer?.totalSpent?.toFixed(2),
        lastOrderDate: new Date(customer?.lastOrderDate).toLocaleDateString(),
        lastOrderTime: new Date(customer?.lastOrderDate).toLocaleTimeString(),
        daysFromLastOrder: daysSinceLastOrder,
        purchaseFrequency: purchaseFrequency?.toFixed(2),
        comparedToAverage: `${comparedToAverage}%`,
        spendTier,
        customerType,
        firstOrderDate: new Date(customer?.firstOrderDate).toLocaleDateString(),
        daysSinceFirstOrder,
      };
    });

    // Generate CSV file
    const csvFilePath = `${Date.now()}_customer_analytics_report.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: headers,
    });

    await csvWriter.writeRecords(reportData);

    // Upload CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);
// Send email with the download link
const subject = "Customer Analytics Report CSV download link";
const content = `<p>Dear User,</p>
                 <p>Your Customer Analytics Report is ready. You can download it from the link below:</p>
                 <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

try {
  await sendMail(res.locals.user.email, subject, "", content);
} catch (error) {
  console.error("Error sending email:", error);
}
    // Respond with the graded data and file link
    return res.status(200).json({
      data: reportData,
      downloadLink: fileUrl,
      message: "Customer analytics report generated successfully",
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

exports.behaviorReport = async (req, res) => {
  try {
    // Get optional date range from query parameters
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(new Date().getFullYear(), 0, 1); // Default to start of current year
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(); // Default to current date

    // ---------- 1. ABANDONED CART ANALYSIS ----------
    const abandonedCartAnalysis = await Cart.aggregate([
      { $match: {
        'date.added': { $gte: startDate, $lte: endDate },
        isPurchased: false,
        isDelete: false
      }},
      { $group: {
        _id: null,
        totalAbandonedCarts: { $sum: 1 },
        totalAbandonedProducts: { $sum: { $size: "$products" } },
        averageAbandonedCartItems: { $avg: { $size: '$products' } }
      }}
    ]);

    // Get most frequently abandoned products
    const abandonedProducts = await Cart.aggregate([
      { $match: {
        'date.added': { $gte: startDate, $lte: endDate },
        isPurchased: false,
        isDelete: false
      }},
      { $unwind: '$products' },
      { $group: {
        _id: '$products.product',
        count: { $sum: 1 },
        fromSearch: { $sum: { $cond: [{ $eq: ['$products.isFromSearch', true] }, 1, 0] } },
        fromRecommended: { $sum: { $cond: [{ $eq: ['$products.isFromRecommended', true] }, 1, 0] } }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }},
      { $unwind: '$productDetails' },
      { $project: {
        _id: 1,
        count: 1,
        fromSearch: 1,
        fromRecommended: 1,
        productName: '$productDetails.name',
        price: '$productDetails.price.selling'
      }}
    ]);

    // ---------- 2. CUSTOMER SEARCH HISTORY ANALYSIS ----------
    // Get all customers who have made purchases in the date range
    const customersWithOrders = await Order.aggregate([
      { $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $group: {
        _id: '$customerId',
        orderIds: { $push: '$_id' },
        orderDates: { $push: '$createdAt' },
        customerIds: { $first: '$customerId' }
      }}
    ]);

    // Extract all customer IDs (ensure they are valid and not null/undefined)
    const customerIds = customersWithOrders
      .filter(c => c._id) // Filter out any null/undefined IDs
      .map(c => c._id);

    // Get search history for these customers
    const customersWithSearchHistory = await mongoose.model('customers').aggregate([
      { $match: {
        _id: { $in: customerIds },
        searchHistory: { $exists: true, $ne: [] }
      }},
      { $project: {
        _id: 1,
        searchHistory: 1
      }}
    ]);

    // Get all products ordered during this period
    const orderedProducts = await Order.aggregate([
      { $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        customerId: { $in: customerIds }
      }},
      { $unwind: '$products' },
      { $lookup: {
        from: 'products',
        localField: 'products.productId',
        foreignField: '_id',
        as: 'productInfo'
      }},
      { $unwind: '$productInfo' },
      { $group: {
        _id: {
          customerId: '$customerId',
          productId: '$products.productId'
        },
        productName: { $first: '$productInfo.name' },
        productDescription: { $first: '$productInfo.description' },
        productKeywords: { $first: '$productInfo.keywords' },
        productCategories: { $first: '$productInfo.categories' },
        quantity: { $sum: '$products.quantity' },
        revenue: { $sum: { $multiply: ['$products.quantity', '$products.pricePerUnit'] }},
        orderDate: { $first: '$createdAt' }
      }}
    ]);

    // Build a map of customer search history - FIX: Check for null/undefined before converting to string
    const customerSearchMap = {};
    customersWithSearchHistory.forEach(customer => {
      if (customer && customer._id) {
        // Safely convert to string, handling undefined/null cases
        const customerId = customer._id.toString();
        customerSearchMap[customerId] = customer.searchHistory || [];
      }
    });

    // Match search terms with product purchases
    const searchConversionData = [];
    
    for (const product of orderedProducts) {
      // FIX: Check if _id and customerId exist before using toString()
      if (!product || !product._id || !product._id.customerId) {
        continue; // Skip this product if it doesn't have required fields
      }
      
      const customerId = product._id.customerId.toString();
      const searchTerms = customerSearchMap[customerId] || [];
      
      // Check if any search term is contained in product name, description, keywords, etc.
      const matchedSearches = searchTerms.filter(term => {
        if (!term) return false; // Skip null/undefined search terms
        
        const searchRegex = new RegExp(term, 'i');
        return (
          (product.productName && searchRegex.test(product.productName)) || 
          (product.productDescription && searchRegex.test(product.productDescription)) ||
          (product.productKeywords && Array.isArray(product.productKeywords) && 
            product.productKeywords.some(k => k && searchRegex.test(k))) ||
          (product.productCategories && Array.isArray(product.productCategories) && 
            product.productCategories.some(c => {
              if (typeof c === 'string') return searchRegex.test(c);
              return c && c.name && searchRegex.test(c.name);
            }))
        );
      });
      
      if (matchedSearches.length > 0) {
        // FIX: Ensure productId exists
        if (!product._id.productId) continue;
        
        searchConversionData.push({
          customerId,
          productId: product._id.productId,
          productName: product.productName || 'Unknown Product',
          searchTerms: matchedSearches,
          quantity: product.quantity || 0,
          revenue: product.revenue || 0,
          orderDate: product.orderDate
        });
      }
    }

    // Analyze search terms that led to conversions
    const searchTermConversions = {};
    searchConversionData.forEach(conversion => {
      if (!conversion || !Array.isArray(conversion.searchTerms)) return;
      
      conversion.searchTerms.forEach(term => {
        if (!term) return; // Skip null/undefined terms
        
        if (!searchTermConversions[term]) {
          searchTermConversions[term] = {
            term,
            conversions: 0,
            productsSold: 0,
            revenue: 0,
            products: {}
          };
        }
        
        searchTermConversions[term].conversions++;
        searchTermConversions[term].productsSold += conversion.quantity || 0;
        searchTermConversions[term].revenue += conversion.revenue || 0;
        
        // FIX: Check if productId exists before using it as an object key
        if (conversion.productId) {
          const productIdStr = conversion.productId.toString();
          
          if (!searchTermConversions[term].products[productIdStr]) {
            searchTermConversions[term].products[productIdStr] = {
              productId: conversion.productId,
              productName: conversion.productName || 'Unknown Product',
              quantity: 0,
              revenue: 0
            };
          }
          
          searchTermConversions[term].products[productIdStr].quantity += conversion.quantity || 0;
          searchTermConversions[term].products[productIdStr].revenue += conversion.revenue || 0;
        }
      });
    });

    // Convert to array and sort by conversions
    const topSearchTerms = Object.values(searchTermConversions)
      .map(item => ({
        term: item.term,
        conversions: item.conversions,
        productsSold: item.productsSold,
        revenue: item.revenue,
        topProducts: Object.values(item.products || {})
          .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
          .slice(0, 5)
      }))
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      .slice(0, 20);

    // ---------- 3. SEARCH CONVERSION ANALYSIS ----------
    // Get total searches that led to purchases
    const searchConversions = await Order.aggregate([
      { $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $unwind: '$products' },
      { $match: { 'products.isFromSearch': true }},
      { $group: {
        _id: '$products.productId',
        productName: { $first: '$products.name' },
        totalSold: { $sum: '$products.quantity' },
        totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.pricePerUnit'] }}
      }},
      { $sort: { totalSold: -1 }},
      { $limit: 10 }
    ]);

    // ---------- 4. SEARCH CONVERSION OVER TIME ----------
    // Get products purchased through search, grouped by month
    const searchOrdersByMonth = await Order.aggregate([
      { $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $unwind: '$products' },
      { $match: { 'products.isFromSearch': true }},
      { $addFields: {
        yearMonth: {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        }
      }},
      { $group: {
        _id: '$yearMonth',
        period: { $first: '$yearMonth' },
        totalOrdersFromSearch: { $sum: 1 },
        totalProductsSold: { $sum: '$products.quantity' },
        totalSearchRevenue: { $sum: { $multiply: ['$products.quantity', '$products.pricePerUnit'] }}
      }},
      { $sort: { _id: 1 }}
    ]);

    // Get total products viewed through search (whether purchased or not)
    const productViewsFromSearch = await Cart.aggregate([
      { $match: {
        'date.added': { $gte: startDate, $lte: endDate }
      }},
      { $unwind: '$products' },
      { $match: { 'products.isFromSearch': true }},
      { $addFields: {
        yearMonth: {
          $dateToString: { format: '%Y-%m', date: '$date.added' }
        }
      }},
      { $group: {
        _id: '$yearMonth',
        period: { $first: '$yearMonth' },
        totalSearches: { $sum: 1 }
      }},
      { $sort: { _id: 1 }}
    ]);

    // ---------- 5. TOTAL CUSTOMER SEARCHES ANALYSIS ----------
    // Get the total number of unique search terms in the given time period
    const customerSearchStats = await mongoose.model('customers').aggregate([
      { $match: {
        searchHistory: { $exists: true, $ne: [] }
      }},
      { $project: {
        _id: 1,
        searchCount: { $size: "$searchHistory" }
      }},
      { $group: {
        _id: null,
        totalCustomersWithSearches: { $sum: 1 },
        totalSearchTerms: { $sum: "$searchCount" },
        avgSearchesPerCustomer: { $avg: "$searchCount" }
      }}
    ]);
    
    // Get all unique search terms
    const allSearchTerms = await mongoose.model('customers').aggregate([
      { $match: {
        searchHistory: { $exists: true, $ne: [] }
      }},
      { $unwind: "$searchHistory" },
      { $group: {
        _id: "$searchHistory",
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 }},
      { $limit: 100 }
    ]);

    // Combine monthly data
    const monthlyData = [];
    for (const month of productViewsFromSearch) {
      const matchingOrder = searchOrdersByMonth.find(order => order.period === month.period);
      monthlyData.push({
        period: month.period,
        totalSearches: month.totalSearches,
        totalOrdersFromSearch: matchingOrder ? matchingOrder.totalOrdersFromSearch : 0,
        totalProductsSold: matchingOrder ? matchingOrder.totalProductsSold : 0,
        totalSearchRevenue: matchingOrder ? matchingOrder.totalSearchRevenue : 0,
        conversionRate: matchingOrder && month.totalSearches > 0 
          ? ((matchingOrder.totalOrdersFromSearch / month.totalSearches) * 100).toFixed(2) 
          : 0
      });
    }

    // ---------- 6. RECOMMENDATION CONVERSION ANALYSIS ----------
    const recommendationConversions = await Order.aggregate([
      { $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $unwind: '$products' },
      { $match: { 'products.isFromRecommended': true }},
      { $group: {
        _id: '$products.productId',
        productName: { $first: '$products.name' },
        totalSold: { $sum: '$products.quantity' },
        totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.pricePerUnit'] }}
      }},
      { $sort: { totalSold: -1 }},
      { $limit: 10 }
    ]);

    // ---------- 7. OVERALL CONVERSION ANALYSIS ----------
    const totalCarts = await Cart.countDocuments({
      "date.added": { $gte: startDate, $lte: endDate },
      isDelete: false
    });
    
    const purchasedCarts = await Cart.countDocuments({
      "date.purchased": { $gte: startDate, $lte: endDate },
      isPurchased: true,
      isDelete: false
    });
    
    const conversionRate = totalCarts > 0 
      ? ((purchasedCarts / totalCarts) * 100).toFixed(2) 
      : 0;

    // Calculate total products sold from search and recommendations
    const searchTotal = searchConversions.reduce((sum, item) => sum + (item.totalSold || 0), 0);
    const searchRevenue = searchConversions.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    const recommendedTotal = recommendationConversions.reduce((sum, item) => sum + (item.totalSold || 0), 0);
    const recommendedRevenue = recommendationConversions.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);

    // Calculate customer search history conversion metrics
    const totalCustomerSearchConversions = searchConversionData.length;
    const totalProductsFromCustomerSearch = searchConversionData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalRevenueFromCustomerSearch = searchConversionData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    
    // Calculate overall search conversion rate - FIX: check for empty array
    const totalCustomersWithSearches = customerSearchStats.length > 0 ? customerSearchStats[0].totalCustomersWithSearches : 0;
    const totalSearchTerms = customerSearchStats.length > 0 ? customerSearchStats[0].totalSearchTerms : 0;
    const searchToOrderConversionRate = totalSearchTerms > 0 
      ? ((totalCustomerSearchConversions / totalSearchTerms) * 100).toFixed(2) 
      : 0;

    // Prepare CSV export
    const csvFilePath = `${Date.now()}_behavior_analysis_report.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'reportPeriod', title: 'Report Period' },
        { id: 'totalCarts', title: 'Total Carts' },
        { id: 'purchasedCarts', title: 'Purchased Carts' },
        { id: 'conversionRate', title: 'Cart Conversion Rate (%)' },
        { id: 'totalAbandonedCarts', title: 'Total Abandoned Carts' },
        { id: 'averageAbandonedCartItems', title: 'Average Items in Abandoned Cart' },
        { id: 'searchProductsTotal', title: 'Total Products Sold from Search' },
        { id: 'searchRevenueTotal', title: 'Total Revenue from Search ($)' },
        { id: 'recommendedProductsTotal', title: 'Total Products Sold from Recommendations' },
        { id: 'recommendedRevenueTotal', title: 'Total Revenue from Recommendations ($)' },
        { id: 'totalCustomersWithSearches', title: 'Total Customers With Searches' },
        { id: 'totalSearchTerms', title: 'Total Search Terms' },
        { id: 'totalCustomerSearchConversions', title: 'Total Search Terms Leading to Purchase' },
        { id: 'searchToOrderConversionRate', title: 'Search Term to Purchase Conversion Rate (%)' }
      ]
    });

    // Summary data
    const summaryData = {
      reportPeriod: `${startDate.toDateString()} to ${endDate.toDateString()}`,
      totalCarts,
      purchasedCarts,
      conversionRate,
      totalAbandonedCarts: abandonedCartAnalysis[0]?.totalAbandonedCarts || 0,
      averageAbandonedCartItems: abandonedCartAnalysis[0]?.averageAbandonedCartItems 
        ? abandonedCartAnalysis[0].averageAbandonedCartItems.toFixed(2) 
        : 0,
      searchProductsTotal: searchTotal,
      searchRevenueTotal: searchRevenue.toFixed(2),
      recommendedProductsTotal: recommendedTotal,
      recommendedRevenueTotal: recommendedRevenue.toFixed(2),
      totalCustomersWithSearches,
      totalSearchTerms,
      totalCustomerSearchConversions,
      searchToOrderConversionRate
    };

    // Write summary CSV
    await csvWriter.writeRecords([summaryData]);

    // Create a separate CSV for search term conversion analysis
    const searchTermCsvFilePath = `${Date.now()}_search_term_analysis.csv`;
    const searchTermCsvWriter = createCsvWriter({
      path: searchTermCsvFilePath,
      header: [
        { id: 'term', title: 'Search Term' },
        { id: 'conversions', title: 'Conversion Count' },
        { id: 'productsSold', title: 'Products Sold' },
        { id: 'revenue', title: 'Revenue ($)' },
        { id: 'topProducts', title: 'Top Products' }
      ]
    });

    // Format search term data for CSV
    const searchTermCsvData = topSearchTerms.map(item => ({
      term: item.term || 'Unknown',
      conversions: item.conversions || 0,
      productsSold: item.productsSold || 0,
      revenue: (item.revenue || 0).toFixed(2),
      topProducts: (item.topProducts || [])
        .filter(p => p && p.productName) // Filter out undefined products
        .map(p => `${p.productName} (${p.quantity || 0})`)
        .join('; ')
    }));

    // Write search term data CSV
    await searchTermCsvWriter.writeRecords(searchTermCsvData);

    // Create a separate CSV for monthly search conversion trends
    const monthlyCsvFilePath = `${Date.now()}_monthly_search_conversion.csv`;
    const monthlyCsvWriter = createCsvWriter({
      path: monthlyCsvFilePath,
      header: [
        { id: 'period', title: 'Month' },
        { id: 'totalSearches', title: 'Total Search Views' },
        { id: 'totalOrdersFromSearch', title: 'Orders from Search' },
        { id: 'totalProductsSold', title: 'Products Sold' },
        { id: 'totalSearchRevenue', title: 'Revenue from Search ($)' },
        { id: 'conversionRate', title: 'Conversion Rate (%)' }
      ]
    });

    // Write monthly data CSV
    await monthlyCsvWriter.writeRecords(monthlyData);

    // Upload summary CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: 'text/csv'
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Upload search term CSV to S3
    const searchTermFileStream = fs.createReadStream(searchTermCsvFilePath);
    const searchTermUploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${searchTermCsvFilePath}`,
      Body: searchTermFileStream,
      ContentType: 'text/csv'
    };

    const searchTermS3Response = await s3.upload(searchTermUploadParams).promise();
    const searchTermFileUrl = searchTermS3Response.Location;

    // Upload monthly CSV to S3
    const monthlyFileStream = fs.createReadStream(monthlyCsvFilePath);
    const monthlyUploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${monthlyCsvFilePath}`,
      Body: monthlyFileStream,
      ContentType: 'text/csv'
    };

    const monthlyS3Response = await s3.upload(monthlyUploadParams).promise();
    const monthlyFileUrl = monthlyS3Response.Location;

    // Send email with report links
    const subject = 'Behavior Analysis Report';
    const content = `
      <p>Dear User,</p>
      <p>Your Behavior Analysis Report is ready for the period from ${startDate.toDateString()} to ${endDate.toDateString()}.</p>
      <p>Download the summary report: <a href="${fileUrl}">Behavior Analysis Report</a></p>
      <p>Download the search term analysis report: <a href="${searchTermFileUrl}">Search Term Analysis Report</a></p>
      <p>Download the monthly search conversion report: <a href="${monthlyFileUrl}">Monthly Search Conversion Report</a></p>
    `;

    try {
      await sendMail(res.locals.user.email, subject, '', content);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Clean up local files
    try {
      fs.unlinkSync(csvFilePath);
      fs.unlinkSync(searchTermCsvFilePath);
      fs.unlinkSync(monthlyCsvFilePath);
    } catch (unlinkError) {
      console.error('Error deleting local CSV files:', unlinkError);
    }

    // Respond with analysis data and download links
    return res.status(200).json({
      abandonedCartAnalysis: {
        ...(abandonedCartAnalysis[0] || { totalAbandonedCarts: 0, totalAbandonedProducts: 0, averageAbandonedCartItems: 0 }),
        topAbandonedProducts: abandonedProducts || []
      },
      conversionRate: {
        totalCarts,
        purchasedCarts,
        conversionRate
      },
      searchConversions: {
        items: searchConversions || [],
        total: searchTotal,
        revenue: searchRevenue
      },
      recommendationConversions: {
        items: recommendationConversions || [],
        total: recommendedTotal,
        revenue: recommendedRevenue
      },
      customerSearchAnalysis: {
        totalCustomersWithSearches,
        totalSearchTerms,
        totalConversions: totalCustomerSearchConversions,
        conversionRate: searchToOrderConversionRate,
        totalProductsSold: totalProductsFromCustomerSearch,
        totalRevenue: totalRevenueFromCustomerSearch,
        topSearchTerms: topSearchTerms || []
      },
      searchToOrderConversion: {
        monthlyTrends: monthlyData || []
      },
      downloadLinks: {
        summary: fileUrl,
        searchTermAnalysis: searchTermFileUrl,
        monthlySearchConversion: monthlyFileUrl
      },
      message: 'Behavior Analysis report generated successfully',
      error_code: 0
    });

  } catch (error) {
    console.error('Error generating Behavior Analysis report:', error);
    return res.status(500).json({
      error_code: 1,
      message: 'Error generating Behavior Analysis report',
      error: error.message
    });
  }
};
const calculateSpendTier = (metrics) => {
  const {
    averageOrderValue,
    purchaseFrequency,
    totalOrders,
    daysSinceLastOrder,
  } = metrics;

  if (
    averageOrderValue > 1000 &&
    purchaseFrequency > 2 &&
    totalOrders > 5 &&
    daysSinceLastOrder < 30
  ) {
    return "VIP";
  } else if (
    averageOrderValue > 500 &&
    purchaseFrequency > 1 &&
    totalOrders > 3 &&
    daysSinceLastOrder < 60
  ) {
    return "HIGH";
  } else if (
    averageOrderValue > 200 &&
    totalOrders > 1 &&
    daysSinceLastOrder < 90
  ) {
    return "MEDIUM";
  }
  return "LOW";
};

exports.productEnquiryReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Build query filters
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) {
      query.status = status;
    }
    
    // Fetch product enquiries
    const enquiries = await ProductEnquiry.find(query)
      .populate("product", "name prodid") // Populate product details
      .lean();
    
    if (enquiries.length === 0) {
      return res.status(200).json({
        message: "No product enquiries found for the given criteria.",
        data: [],
        error_code: 0,
      });
    }
    
    // Format data for CSV and response
    const formattedData = enquiries.map((enquiry) => ({
      productName: enquiry?.product?.name || 'N/A',
      productId: enquiry?.product?.prodid || 'N/A',
      firstname: enquiry?.firstname || '',
      lastname: enquiry?.lastname || '',
      email: enquiry?.email || '',
      mobile: `${enquiry?.countryCode || ''} ${enquiry?.mobile || ''}`,
      country: enquiry?.country || '',
      street: enquiry?.street || '',
      apartment: enquiry?.apartment || '',
      city: enquiry?.city || '',
      status: enquiry?.status || '',
      createdAt: enquiry?.createdAt ? enquiry.createdAt.toISOString().split("T")[0] : '', // Format as YYYY-MM-DD
    }));
    
    // Define CSV file path and headers
    const csvFilePath = `${Date.now()}_productEnquiryReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "productName", title: "Product Name" },
        { id: "productId", title: "Product ID" },
        { id: "firstname", title: "First Name" },
        { id: "lastname", title: "Last Name" },
        { id: "email", title: "Email" },
        { id: "mobile", title: "Mobile" },
        { id: "country", title: "Country" },
        { id: "street", title: "Street" },
        { id: "apartment", title: "Apartment" },
        { id: "city", title: "City" },
        { id: "status", title: "Status" },
        { id: "createdAt", title: "Date" },
      ],
    });
    
    // Write the records to the CSV file
    await csvWriter.writeRecords(formattedData);
    
    // Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };
    
    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);
    
    // Send email with the download link
    const subject = "Product Enquiry Report CSV download link";
    const content = `<p>Dear User,</p>
                    <p>Your Product Enquiry Report is ready. You can download it from the link below:</p>
                    <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;
    
    // Clean email and send
    if (res?.locals?.user?.email) {
      const cleanEmail = res.locals.user.email.trim().replace(/\.+$/, '');
      console.log("Attempting to send product enquiry report to:", cleanEmail);
      
      try {
        await sendMail(cleanEmail, subject, "", content);
        console.log("Email sent successfully for product enquiry report to:", cleanEmail);
      } catch (error) {
        console.error("Error sending product enquiry report email:", error);
        // Continue execution even if email fails
      }
    } else {
      console.log("No user email found in res.locals.user for product enquiry report");
    }
    
    // Clean up local CSV file
    fs.unlink(csvFilePath, (err) => {
      if (err) console.error("Error deleting temporary CSV file:", err);
    });
    
    // Response with formatted data and download link
    return res.status(200).json({
      data: formattedData,
      downloadLink: fileUrl,
      message: "Product Enquiry report generated successfully",
      error_code: 0,
    });
    
  } catch (error) {
    console.error("Error generating product enquiry report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message,
    });
  }
};

exports.enquiryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filter for optional date range
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Query to fetch enquiries with optional date range
    const enquiries = await Enquiry.find(
      Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}
    )
      .select("firstname lastname email subject message createdAt")
      .lean();

    if (enquiries.length === 0) {
      return res.status(200).json({
        message: "No enquiries found for the given date range.",
        data: [],
        error_code: 0,
      });
    }

    // Format data for CSV and response
    const formattedData = enquiries.map((enquiry) => ({
      firstname: enquiry.firstname,
      lastname: enquiry.lastname || "-",
      email: enquiry.email,
      subject: enquiry.subject,
      message: enquiry.message,
      createdAt: enquiry.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    }));

    // CSV data preparation
    const csvData = formattedData.map((entry) => ({
      firstname: entry.firstname,
      lastname: entry.lastname,
      email: entry.email,
      subject: entry.subject,
      message: entry.message,
      createdAt: entry.createdAt,
    }));

    // Define CSV file path and headers
    const csvFilePath = `${Date.now()}_enquiryReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "firstname", title: "First Name" },
        { id: "lastname", title: "Last Name" },
        { id: "email", title: "Email" },
        { id: "subject", title: "Subject" },
        { id: "message", title: "Message" },
        { id: "createdAt", title: "Date" },
      ],
    });

    // Write the records to the CSV file
    await csvWriter.writeRecords(csvData);

    // Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);

    // Send email with the download link
    const subject = "Enquiry Report CSV download link";
    const content = `<p>Dear User,</p>
                     <p>Your Enquiry Report is ready. You can download it from the link below:</p>
                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    // Response with formatted data
    return res.status(200).json({
      data: formattedData,
      message: "Enquiry report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating enquiry report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message,
    });
  }
};

exports.noStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filter for optional date range
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Query for products with no stock
    const noStockProducts = await Product.find({
      stock: 0,
      isDelete: false,
      isActive: true,
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    })
      .select("name sku price createdAt")
      .lean();

    if (noStockProducts.length === 0) {
      return res.status(200).json({
        message: "No products found with zero stock.",
        data: [],
        error_code: 0,
      });
    }

    // Format data for CSV and response
    const formattedData = noStockProducts.map((product) => ({
      productName: product.name,
      sku: product.sku,
      mrp: product.price?.mrp || 0,
      selling: product.price?.selling || 0,
      createdAt: product.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    }));

    // CSV data preparation
    const csvData = formattedData.map((entry) => ({
      productName: entry.productName,
      sku: entry.sku,
      mrp: entry.mrp.toFixed(2),
      selling: entry.selling.toFixed(2),
      createdAt: entry.createdAt,
    }));

    // Define CSV file path and headers
    const csvFilePath = `${Date.now()}_noStockReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "productName", title: "Product Name" },
        { id: "sku", title: "SKU" },
        { id: "mrp", title: "MRP" },
        { id: "selling", title: "Selling Price" },
        { id: "createdAt", title: "Date Added" },
      ],
    });

    // Write the records to the CSV file
    await csvWriter.writeRecords(csvData);

    // Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Send email with the download link
    const subject = "No Stock Report CSV download link";
    const content = `<p>Dear User,</p>
                     <p>Your No Stock Report till date is ready. You can download it from the link below:</p>
                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    // Response with formatted data
    return res.status(200).json({
      data: formattedData,
      message: "No Stock report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating No Stock report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message,
    });
  }
};

exports.productLowStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filter for optional date range
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Query for products with stock less than or equal to 10
    const lowStockProducts = await Product.find({
      stock: { $lte: 10 },
      isDelete: false,
      isActive: true,
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    })
      .select("name sku stock price createdAt")
      .lean();

    if (lowStockProducts.length === 0) {
      return res.status(200).json({
        message: "No products found with stock less than or equal to 10.",
        data: [],
        error_code: 0,
      });
    }

    // Format data for CSV and response
    const formattedData = lowStockProducts.map((product) => ({
      productName: product.name,
      sku: product.sku,
      stock: product.stock,
      mrp: product.price?.mrp || 0,
      selling: product.price?.selling || 0,
      createdAt: product.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    }));

    // CSV data preparation
    const csvData = formattedData.map((entry) => ({
      productName: entry.productName,
      sku: entry.sku,
      stock: entry.stock,
      mrp: entry.mrp.toFixed(2),
      selling: entry.selling.toFixed(2),
      createdAt: entry.createdAt,
    }));

    // Define CSV file path and headers
    const csvFilePath = `${Date.now()}_lowStockReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "productName", title: "Product Name" },
        { id: "sku", title: "SKU" },
        { id: "stock", title: "Stock" },
        { id: "mrp", title: "MRP" },
        { id: "selling", title: "Selling Price" },
        { id: "createdAt", title: "Date Added" },
      ],
    });

    // Write the records to the CSV file
    await csvWriter.writeRecords(csvData);

    // Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Send email with the download link
    const subject = "Product Low Stock Report CSV download link";
    const content = `<p>Dear User,</p>
                     <p>Your Product Low Stock Report till date is ready. You can download it from the link below:</p>
                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    // Response with formatted data
    return res.status(200).json({
      data: formattedData,
      message: "Product Low Stock report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating Product Low Stock report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message,
    });
  }
};

exports.grossPaymentsByMonth = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filter setup
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Aggregate gross payments by month
    const grossPayments = await Order.aggregate([
      {
        $match: {
          isDelete: false,
          orderStatus: { $in: ["DELIVERED", "COLLECTED"] },
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalGrossPayment: { $sum: "$wholeTotal" },
          orderCount: { $count: {} }, // Optional: Count orders per month
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalGrossPayment: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ]);

    // Optional: Add month names for better readability
    const formattedData = grossPayments.map((entry) => ({
      month: new Date(entry.year, entry.month - 1).toLocaleString("default", {
        month: "long",
      }),
      year: entry.year,
      totalGrossPayment: entry.totalGrossPayment.toFixed(2),
      orderCount: entry.orderCount,
    }));

    // Prepare CSV data
    const csvData = formattedData.map((entry) => ({
      month: entry.month,
      year: entry.year,
      totalGrossPayment: entry.totalGrossPayment,
      orderCount: entry.orderCount,
      // startDate:startDate,
      // endDate:endDate,
    }));

    // Define CSV file path and headers
    const csvFilePath = `${Date.now()}_grossPaymentsByMonth.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "month", title: "Month" },
        { id: "year", title: "Year" },
        { id: "totalGrossPayment", title: "Total Gross Payment" },
        { id: "orderCount", title: "Order Count" },
        // { id: 'startDate', title: 'Start Date' },
        // { id: 'endDate', title: 'End Date' },
      ],
    });

    // Write the records to the CSV file
    await csvWriter.writeRecords(csvData);

    // Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);
    // Send email with the download link
    const subject = "Gross Payments by Month Report CSV download link";
    const content = `<p>Dear User,</p>
                     <p>Your Gross Payments by Month Report is ready for the period from <strong>${startDate}</strong> to <strong>${endDate}</strong>. You can download it from the link below:</p>
                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error sending email:", error);
    }

    return res.status(200).json({
      data: formattedData,
      message: "Gross Payments by Month report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating Gross Payments by Month report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message,
    });
  }
};

exports.productOrdersAndReturnsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filter setup
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Aggregate orders and returns data
    const productReportData = await Order.aggregate([
      {
        $match: {
          isDelete: false,
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },
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
        $addFields: {
          isReturned: { $eq: ["$orderStatus", "RETURNED"] },
          isCancelled: { $eq: ["$orderStatus", "CANCELLED"] },
          isFailed: { $eq: ["$orderStatus", "FAILED"] },
        },
      },
      {
        $group: {
          _id: "$products.productId",
          productName: { $first: "$productDetails.name" },
          totalOrders: { $sum: 1 },
          quantitySold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: "$products.wholeTotal" },
          numberOfReturns: {
            $sum: { $cond: [{ $eq: ["$isReturned", true] }, 1, 0] },
          },
          quantityReturned: {
            $sum: {
              $cond: [{ $eq: ["$isReturned", true] }, "$products.quantity", 0],
            },
          },
          numberOfCancelled: {
            $sum: { $cond: [{ $eq: ["$isCancelled", true] }, 1, 0] },
          },
          quantityCancelled: {
            $sum: {
              $cond: [{ $eq: ["$isCancelled", true] }, "$products.quantity", 0],
            },
          },
          numberOfFailed: {
            $sum: { $cond: [{ $eq: ["$isFailed", true] }, 1, 0] },
          },
          quantityFailed: {
            $sum: {
              $cond: [{ $eq: ["$isFailed", true] }, "$products.quantity", 0],
            },
          },
        },
      },
      {
        $project: {
          productId: "$_id",
          productName: 1,
          totalOrders: 1,
          quantitySold: 1,
          totalRevenue: 1,
          numberOfReturns: 1,
          quantityReturned: 1,
          numberOfCancelled: 1,
          quantityCancelled: 1,
          numberOfFailed: 1,
          quantityFailed: 1,
        },
      },
      { $sort: { totalOrders: -1 } },
    ]);

    // Optional: Format the data for better readability
    const formattedData = productReportData.map((entry) => ({
      productName: entry.productName,
      totalOrders: entry.totalOrders,
      quantitySold: entry.quantitySold,
      totalRevenue: entry.totalRevenue.toFixed(2),
      numberOfReturns: entry.numberOfReturns,
      quantityReturned: entry.quantityReturned,
      numberOfCancelled: entry.numberOfCancelled,
      quantityCancelled: entry.quantityCancelled,
      numberOfFailed: entry.numberOfFailed,
      quantityFailed: entry.quantityFailed,
      startDate,
      endDate,
    }));

    // Prepare CSV data
    const csvData = formattedData.map((entry) => ({
      productName: entry.productName,
      totalOrders: entry.totalOrders,
      quantitySold: entry.quantitySold,
      totalRevenue: entry.totalRevenue,
      numberOfReturns: entry.numberOfReturns,
      quantityReturned: entry.quantityReturned,
      numberOfCancelled: entry.numberOfCancelled,
      quantityCancelled: entry.quantityCancelled,
      numberOfFailed: entry.numberOfFailed,
      quantityFailed: entry.quantityFailed,
      startDate,
      endDate,
    }));

    // Define CSV file path and headers
    const csvFilePath = `${Date.now()}_productOrdersAndReturnsReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "productName", title: "Product Name" },
        { id: "totalOrders", title: "Total Orders" },
        { id: "quantitySold", title: "Quantity Sold" },
        { id: "totalRevenue", title: "Total Revenue" },
        { id: "numberOfReturns", title: "Number of Returns" },
        { id: "quantityReturned", title: "Quantity Returned" },
        { id: "numberOfCancelled", title: "Number of Cancelled" },
        { id: "quantityCancelled", title: "Quantity Cancelled" },
        { id: "numberOfFailed", title: "Number of Failed" },
        { id: "quantityFailed", title: "Quantity Failed" },
        { id: "startDate", title: "Start Date" },
        { id: "endDate", title: "End Date" },
      ],
    });

    // Write the records to the CSV file
    await csvWriter.writeRecords(csvData);

    // Upload the CSV file to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;

    // Send email with the download link
    const subject = "Product Orders and Returns Report CSV download link";
    const content = `<p>Dear User,</p>
                     <p>Your Product Orders and Returns Report for the period from <strong>${startDate}</strong> to <strong>${endDate}</strong> is ready. You can download it from the link below:</p>
                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;
    console.log("fileUrl", fileUrl);

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error sending email:", error);
    }

    return res.status(200).json({
      data: formattedData,
      message: "Product Orders and Returns report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating Product Orders and Returns report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating report",
      error: error.message,
    });
  }
};

exports.abcAnalysisReport = async (req, res) => {
  try {
    // Fetch aggregated data by product
    const productData = await Order.aggregate([
      { $unwind: "$products" }, // Unwind products array
      {
        $addFields: {
          // Convert price and quantity to numbers to ensure numeric calculation
          convertedQuantity: { $toDouble: "$products.quantity" },
          convertedPrice: { $toDouble: "$products.pricePerUnit" }
        }
      },
      {
        $group: {
          _id: "$products.productId",
          totalRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$convertedQuantity", 0] }, 
                { $ifNull: ["$convertedPrice", 0] }
              ]
            },
          },
          totalQuantitySold: { $sum: { $toDouble: "$products.quantity" } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" }, // Flatten the product details
      { $sort: { totalRevenue: -1 } }, // Sort by revenue in descending order
    ]);

    if (!productData || productData.length === 0) {
      return res.status(200).json({
        message: "No product data available for ABC analysis.",
        data: [],
        error_code: 0,
      });
    }

    // Calculate total revenue
    const totalRevenue = productData.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0
    );

    // Assign ABC grades
    let cumulativeRevenue = 0;
    const gradedProducts = productData.map((item) => {
      cumulativeRevenue += item.totalRevenue || 0;
      const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;

      let grade = "C-Grade"; // Default to C
      if (cumulativePercentage <= 80) grade = "A-Grade";
      else if (cumulativePercentage <= 95) grade = "B-Grade";

      return {
        productId: item.product._id,
        productName: item.product.name,
        sku: item.product.sku,
        revenue: Number(item.totalRevenue || 0).toFixed(2),
        totalQuantitySold: Number(item.totalQuantitySold || 0).toFixed(0),
        grade,
      };
    });

    // Create CSV for report
    const csvFilePath = `${Date.now()}_abcAnalysisReport.csv`;
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "productId", title: "Product ID" },
        { id: "productName", title: "Product Name" },
        { id: "sku", title: "SKU" },
        { id: "revenue", title: "Revenue" },
        { id: "totalQuantitySold", title: "Total Quantity Sold" },
        { id: "grade", title: "Grade" },
      ],
    });

    await csvWriter.writeRecords(gradedProducts);

    // Upload CSV to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    const fileUrl = s3Response.Location;
    console.log("fileUrl", fileUrl);

    // Send email with the download link
    const subject = "ABC Analysis Report CSV download link";
    const content = `<p>Dear User,</p>
                  <p>Your ABC Analysis Report is ready. You can download it from the link below:</p>
                  <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    // Respond with the graded data and file link
    return res.status(200).json({
      data: gradedProducts,
      downloadLink: fileUrl,
      message: "ABC Analysis report generated successfully",
      error_code: 0,
    });
  } catch (error) {
    console.error("Error generating ABC Analysis report:", error);
    return res.status(500).json({
      error_code: 1,
      message: "Error generating ABC Analysis report",
      error: error.message,
    });
  }
};

