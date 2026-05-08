const axios = require('axios');
const { updateOrderAndNotifyAdmins } = require('../payment-gateways/afterEffects-paymentVerification');
const db = require("../../app/db");
const { updatePayMentLogs } = require('../reusablefunctions');

require("dotenv").config()


const baseUrl = process.env.NETWORK_INTERNATIONAL_BASE_URL                                                
const apiToken =process.env.NETWORK_INTERNATIONAL_API_TOKEN 
// const apiToken ="YzFkMmM5MjYtYTlhMy00Y2E1LWIzODYtZGI0NzUzZDU1MzE0OjM2NzUwNGViLTI4YjQtNGIxNy1hNjgyLWIyMjgxMGU5MDk4Yg==" // live key
const outletReference= process.env.NETWORK_INTERNATIONAL_OUTLET_REFERENCE


async function getAccessToken() {
  try {
    const options = {
      method: 'POST',
      url: `${baseUrl}/identity/auth/access-token`,
      headers: {
        'Content-Type': 'application/vnd.ni-identity.v1+json',
        Authorization: `Basic ${apiToken}`
      }
    };

    const response = await axios.request(options);
    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw error;
  }
}






async function retrieveNetworkInternationalOrderStatus(orderDetails, res,helper,messages,service) {
    let orderReference = orderDetails?.payment?.referenceId;
    let orderNo = orderDetails?.orderNo;

   
  try {
    const accessToken = await getAccessToken();
    const options = {
      method: 'GET',
      url: `${baseUrl}/transactions/outlets/${outletReference}/orders/${orderReference}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };

    const response = await axios.request(options);


    if (response?.data) {
      const orderStatus = response.data;

     console.log("orderStatus?._embedded?.payment[0]?.state",orderStatus?._embedded?.payment[0]?.state);
     
      // Extract relevant information from the order status
      const paymentStatus = orderStatus?._embedded?.payment[0]?.state;
      const paymentAmount = orderStatus?.amount?.value;
      const paymentCurrency = orderStatus?.amount?.currencyCode;
      const paymentReference = orderStatus?._embedded?.payment[0]?._id;

      // Update the order status in your database
      let orderDataToUpdate={
            paymentAmount,
            paymentCurrency,
            paymentReference,
            gatewayStatus:paymentStatus,
            DirectPaymentInfoFromGateWay:orderStatus?._embedded?.payment||[],

      }

      
      if(paymentStatus== 'PURCHASED'){
        await db.Order.findByIdAndUpdate(orderDetails?._id, {orderStatus:"PLACED", paymentStatus:"PAID"})
        
        // Update product stock after successful payment
        const productService = require("../../services/product.service");
        for (let product of orderDetails?.products) {
          const productDetails = await productService.getSingleProduct({
            _id: product.productId,
            isActive: true,
            isDelete: false,
          });
          if (productDetails) {
            let stock = productDetails?.stock - Number(product?.quantity);
            await productService.updateProduct(productDetails?._id, {
              stock: stock,
            });
          }
        }
       
        helper.deliverResponse(res, 200, { order: orderReference }, {
          "error_code": 0,
          "error_message": "payment verified successfully"
        });
      } else {
        await db.Order.findByIdAndUpdate(orderDetails?._id, {orderStatus:"FAILED", paymentStatus:"FAILED"})
        helper.deliverResponse(res, 422, { order: orderReference }, {
          "error_code": 1,
          "error_message": "payment verification failed"
        });
      }

    }
  } catch (error) {
    console.log('Error retrieving order status :: ' + error);
      // Handle other errors
      helper.deliverResponse(res, 500, {
        "error_code":1,
        "error_message": "something went wrong while processing your request"
      });
    
  }
}

module.exports = {
  retrieveNetworkInternationalOrderStatus
};