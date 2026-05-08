const axios = require('axios');
require("dotenv").config();
const db = require("../../app/db")
 // settings organizational heirarchy , select an outlet.
const redirectionWebsiteUrl =process.env.PAYMENT_GATEWAY_REDIRECTION_URL|| "";
const baseUrl = process.env.NETWORK_INTERNATIONAL_BASE_URL                                                
const apiToken =process.env.NETWORK_INTERNATIONAL_API_TOKEN//local 
// const apiToken ="YzFkMmM5MjYtYTlhMy00Y2E1LWIzODYtZGI0NzUzZDU1MzE0OjM2NzUwNGViLTI4YjQtNGIxNy1hNjgyLWIyMjgxMGU5MDk4Yg==" //production
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
    // const options = {
    //   method: 'POST',
    //   url: `${baseUrl}/identity/auth/access-token`,
    //   headers: {
    //     'Content-Type': 'application/vnd.ni-payment.v2+json',  // Changed from v1 to v2
    //     Authorization: `Basic ${apiToken}`
    //   }
    // };
   
  

    const response = await axios.request(options);
    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw error;
  }
}

async function processNetworkInternationalPayment(data, customerDetails, guestDetails, res) {
  let paymentResponse = null;
  let paymentDetails = null;
  let paymentError = false;
  let orderReference = null;
  let paymentPayload ={};
  let orderNo = data?.orderNo?.slice(1) ||""
  try {
    // Obtain the access token
   
   
    const accessToken = await getAccessToken();

    console.log("Access Token:", accessToken);
    
   

    if(!accessToken){paymentError = true; return { paymentResponse, paymentDetails, paymentError, orderReference };}
    const total= Number(data?.wholeTotal)
    
    // Validate redirect URL first
    if (!redirectionWebsiteUrl) {
      console.error("PAYMENT_GATEWAY_REDIRECTION_URL environment variable is not set");
      paymentError = true;
      return { paymentResponse, paymentDetails, paymentError, orderReference };
    }
    
    // Validate required email address
    const emailAddress = customerDetails?.email || guestDetails?.email ||data?.contactInfoForDelivery?.email ||data?.address?.email;
    if (!emailAddress) {
      console.error("Email address is required for payment processing");
      paymentError = true;
      return { paymentResponse, paymentDetails, paymentError, orderReference };
    }
    
    // Validate order number format
    const orderNumber = data?.orderNo?.split('#')[1];
    if (!orderNumber) {
      console.error("Invalid order number format:", data?.orderNo);
      paymentError = true;
      return { paymentResponse, paymentDetails, paymentError, orderReference };
    }

    // Validate total amount
    if (!total || total <= 0) {
      console.error("Invalid total amount:", total);
      paymentError = true;
      return { paymentResponse, paymentDetails, paymentError, orderReference };
    }

    paymentPayload = {
      action: 'PURCHASE', // or 'AUTH' if you want to authorize only
      amount: {
        currencyCode: 'AED', // Replace with the appropriate currency code
        value: Math.round(total * 100) // Assuming `data.total` contains the order amount
      },
      emailAddress: emailAddress,
      merchantAttributes: {
        redirectUrl: `${redirectionWebsiteUrl}/verify-payment?orderId=${orderNumber}`, // URL to redirect card-holder to after payment
        skipConfirmationPage: true,
        skip3D: false, // Indicates whether to skip 3D-Secure authentication
        cancelUrl: `${redirectionWebsiteUrl}/verify-payment?orderId=${orderNumber}`, // URL to redirect card-holder to if they cancel the payment
        cancelText: 'Cancel Order' // Text to display on the pay-page for canceling the order
      },
      merchantOrderReference: orderNumber
      
    };

    const options = {
      method: 'POST',
      url: `${baseUrl}/transactions/outlets/${outletReference}/orders`,
      headers: {
        accept: 'application/vnd.ni-payment.v2+json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.ni-payment.v2+json'
      },
      data: paymentPayload
    };

    console.log("Payment Request Payload:", JSON.stringify(paymentPayload, null, 2));
    console.log("Request URL:", options.url);
    
    const paymentResult = await axios.request(options);
    console.log("Payment Gateway Response Status:", paymentResult.status);
    console.log("Payment Gateway Response Data:", JSON.stringify(paymentResult.data, null, 2));
    
    // Validate response structure
    if (!paymentResult.data) {
      console.error("Empty response from payment gateway");
      paymentError = true;
      return { paymentResponse, paymentDetails, paymentError, orderReference };
    }
    
    if (!paymentResult.data.reference) {
      console.error("Missing reference in payment gateway response");
      paymentError = true;
      return { paymentResponse, paymentDetails, paymentError, orderReference };
    }
    
    paymentResponse = {
      orderReference: paymentResult?.data?.reference,
      paymentLink: paymentResult?.data?._links?.payment?.href
    };
    
    paymentDetails = paymentResult?.data;
    orderReference = paymentResult?.data?.reference; // Store the order reference
    data['paymentMethod'] = 'network-international';
    data['paymentStatus'] = 'PENDING';
    data['orderStatus'] = 'PENDING';
    data['payment'] = {
      referenceId: paymentResult?.data?.reference,
      status: paymentResult?.data?.orderStatus
    };
    data["paymentGateWay"]="network-international";

    setImmediate(async()=>{
      await db.PaymentGatewayLogs.create({
            status: 'pending' ,
            type: "request", 
            paymentGateway: "network-international",
            request: paymentPayload,
            response:paymentResult?.data|| {},
            referenceKey:  paymentResult?.data?.reference,// payment gateway reference for admin to use . 
            orderNo:"#"+orderNo,
            customerName:customerDetails?.name || guestDetails?.name||null,
            customerEmail:customerDetails?.email || guestDetails?.email||null,
            amount : total||"NA",

      })
    })

  } catch (error) {
    console.error("Payment Processing Error:", error);
    console.error("Error Status:", error?.response?.status);
    console.error("Error Data:", error?.response?.data);
    console.error("Error Headers:", error?.response?.headers);
    
    paymentError = true;
    setImmediate(async()=>{
      await db.PaymentGatewayLogs.create({
            status: 'failed' ,
            type: "request", 
            paymentGateway: "network-international",
            request: paymentPayload,
            response: {
              status: error?.response?.status,
              statusText: error?.response?.statusText,
              data: error?.response?.data||{},
              headers: error?.response?.headers||{}
            },
            referenceKey:  null,// payment gateway reference for admin to use . 
            orderNo:"#"+orderNo||null ,
            customerName:customerDetails?.name || guestDetails?.name||null,
            customerEmail:customerDetails?.email || guestDetails?.email||null,
            amount : data?.wholeTotal||"NA",
            error: error?.message || "Unknown error"

      })
    })
  }

  return { paymentResponse, paymentDetails, paymentError, orderReference };
}

module.exports = {
  processNetworkInternationalPayment
};