
const cartService = require("../../app/services/cart.service")
const productService = require("../../app/services/product.service")
const service = require("../../app/services/order.service")
const settingsService = require("../../app/services/general.settings.service");
const adminService = require("../../app/services/auth.service");
const mailer = require("../sendMail")
const templates = require("../templates");
const admin = require("firebase-admin");
const db = require("../../app/db");
require("dotenv").config()
const updateOrderAndNotifyAdmins = async ( orderDetails) => {
    try {
      
      let orderNo = orderDetails?.orderNo||"";
      if(!orderNo) {console.log("No order number found");return}
      const orderData = await service.getOrderDetails({ orderNo: orderDetails?.orderNo });
      let customerId = orderDetails?.customerId?._id;
      let customerDetails = orderDetails?.customerId||{};
      //loyalty and wallet discount handling . 

      // Update the payment status of each product to 'PAID'
      for (let product of orderDetails?.products) {
        if (product?.productId?._id) {
          await service.update(
            { orderNo: '#' + orderNo, 'products.productId': product?.productId?._id },
            { $set: { 'products.$.paymentStatus': 'PAID' } }
          );
        }
      }
  

      let orderResponse = await service.getOrderDetails({ orderNo:  orderNo });
      if(orderResponse?.orderStatus != "PLACED"){
        let newProductsList = orderResponse.products?.map((product) => ({
          ...product,
          paymentStatus: "PAID",
          history: [{ status: "PLACED", date: new Date().toISOString() }],
        }))
      orderResponse = await db.Order.findOneAndUpdate({orderNo: orderResponse?.orderNo},{
        products : newProductsList,
        orderStatus:"PLACED",
      },{new:true})
  
      }
      if (orderResponse?.orderStatus === 'PLACED') {

        let cartDetails = await cartService.getCart({ _id: orderResponse?.cart, isActive: true, isDelete: false });
        const cartData = {
          date: { added: cartDetails?.date?.added, purchased: new Date().toISOString() },
          isPurchased: true
        };
        await cartService.updateCart({ _id: cartDetails?._id }, cartData);
  
        const settings = await settingsService.findOne({});
        
//------------------------------------------------------------------------------------
// if (orderData?.customerId?._id) {
//   await sendOrderPlacedUserNotification(customerDetails,orderData);
// }

//sending mail notification
let orderedProducts = [];
for (let product of (orderResponse?.products||[])) {
  const productDetails = await productService.getSingleProduct({
    _id: product?.productId,
  });
  orderedProducts.push({
    image:process.env.AWS_S3BUCKET_BASE_URL + productDetails?.thumbnail?.path,
    name: productDetails?.name?.en,
    quantity: product?.quantity,
    price: productDetails?.price?.selling||"",
    total: product?.total,
  });
  
}

const subject = `Your order ${orderResponse?.orderNo} has been placed!`;
const content = `We're pleased to confirm your order no ${orderResponse?.orderNo}. Thank you for shopping with ${settings?.name}`;
const orderDetailsForEmail = {
data: orderResponse,
store: settings?.name,
branding: process.env.AWS_S3BUCKET_BASE_URL + settings?.logo,
total: settings?.currency + " " + orderResponse.total,
primaryColor: "#0000",
secondaryColor: "#F3F5F7",
products: orderedProducts,
createdAt: orderResponse?.createdAt,
orderNo: orderResponse?.orderNo,
address: {
//   lane:(orderResponse?.address?.firstlane||"") + (orderResponse?.address?.secondlane||""),
 lane: orderResponse?.address?.aptSuiteUnit ? orderResponse?.address?.streetAddress + ", " + orderResponse?.address?.aptSuiteUnit : orderResponse?.address?.streetAddress,
  city: (orderResponse?.address?.city||""),
  state: (orderResponse?.address?.state||""),
},
};
if (orderData?.customerId?.name) {
  orderDetailsForEmail.name = orderData?.customerId?.name||"";
} 
const html = await templates.orderPlaced(orderDetailsForEmail);
let email = orderData?.customerId?.email || orderData?.guestId?.email ||null;

if(email){
  await mailer.sendMail(email, subject, content, html,"order");
}

  //---------------------------------------------------------------------------------------------
        const admins = await adminService.getAdmins({ isDelete: false, isActive: true });
        for (let _admin of admins) {
          if (_admin.deviceTokens.length > 0) {
            let pushMessage = {
              tokens: _admin?.deviceTokens,
              notification: { title: 'Order placed', body: `Online Order ${orderDetails.orderNo} has been placed successfully. Order total amount is ${settings?.currency} ${orderDetails.total}` },
              webpush: { fcm_options: { link: '/app/orders/update?order=' + orderDetails?.orderNo } }
            };
  
            admin.messaging().sendMulticast(pushMessage).catch((error) => { console.error('Error sending push notification:', error); });
          }
        }


   

       await Promise.all(
          orderDetails.products.map(async (product) => {
            const productDetails = await productService.getSingleProduct({
              _id: product?.productId,
            });
            return {
              userid: productDetails?.sellerId,
              name: productDetails?.name.en,
            };
          })
        );

      }
    } catch (error) {
      console.error('Error updating order and notifying admins:', error);
      throw error; // Rethrow the error for further handling
    }
  };


  module.exports={updateOrderAndNotifyAdmins}