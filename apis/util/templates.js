const { BASE_URL } = require("../config/constants/common")
const customMailerService = require("../app/services/custom.mailer.service")

exports.sendOtp = (otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; padding: 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 30px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Verification Code</h1>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 30px 40px;">
                                <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                                    Hello,
                                </p>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                                    You have requested a verification code. Please use the following OTP to complete your action:
                                </p>
                                <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; text-align: center; margin: 30px 0;">
                                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000000">${otp}</span>
                                </div>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                                    This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                                </p>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                                    For security reasons, never share this code with anyone.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                <p style="margin: 0; font-size: 14px; color: #666666;">
                                    This is an automated message, please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
}

exports.orderPlaced = (orderDetails) => {
    // return `
    //     <!DOCTYPE html>
    //     <html>
    //     <head>
    //         <meta charset="utf-8">
    //         <title>${orderDetails?.store} - Order confirmation</title>
    //         <link rel="preconnect" href="https://fonts.googleapis.com">
    //         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    //         <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;300;400;700;900&display=swap" rel="stylesheet">
    //         <style>
    //             body {
    //                 margin: 0;
    //                 padding: 0;
    //                 background-color: #f4f4f4;
    //                 color: #000000;
    //                 text-align: justify;
    //             }
    //             .container {
    //                 max-width: 600px;
    //                 margin: auto;
    //                 overflow: hidden;
    //             }
    //             .main {
    //                 padding: 20px 0;
    //             }
    //             .main p {
    //                 font-size: 14px;
    //                 line-height: 1.6em;
    //             }
    //             .order-details p{
    //                 margin: 0;
    //             }
    //             .order-details p span{
    //                 font-weight: bold;
    //             }
    //             .order-summary {
    //                 margin: 20px 0;
    //             }
    //             .delivery-address{
    //                 margin: 20px 0 0 0;
    //                 font-size: 14px;
    //             }
    //             .delivery-address p{
    //                 margin: 0;
    //                 font-weight: 600;
    //             }
    //             .order-summary table {
    //                 width: 100%;
    //                 border-collapse: collapse;
    //                 margin-top: 20px;
    //             }
    //             .order-summary th, .order-summary td {
    //                 padding: 15px;
    //                 text-align: left;
    //                 border-bottom: 1px solid #ddd;
    //             }
    //             .order-summary th {
    //                 background-color:${'#' + orderDetails.secondaryColor.split('0xFF')[1]};
    //                 color: white;
    //             }
    //             .order-summary td img {
    //                 width: 60px;
    //                 height: auto;
    //                 border-radius: 5px;
    //             }
    //             .order-summary .product-info {
    //                 display: flex;
    //                 align-items: center;
    //             }
    //             .order-summary .product-info p {
    //                 margin: 0;
    //                 margin-left: 10px;
    //             }
    //             .order-summary .total {
    //                 font-size: 18px;
    //                 font-weight: bold;
    //                 margin-top: 10px;
    //                 color: ${'#' + orderDetails.primaryColor.split('0xFF')[1]}
    //             }
    //         </style>
    //     </head>
    //     <body style="font-family: 'Manrope', Arial, sans-serif;">
    //         <div class="container main">
    //             <div id="branding">
    //                 <img src="${orderDetails?.branding}" alt="Store" width="200px">
    //             </div>
    //             <h1>Order Confirmation</h1>
    //             <div class="order-details">
    //                 <p>Order placed on <span>${orderDetails?.date}</span></p>
    //                 <p>Order <span>${orderDetails?.order}</span></p>
    //             </div>
    //             <p>Hi ${orderDetails?.name},</p>
    //             <p>Thank you for your order! We have received your order and it is currently being processed. Below is a summary of your order:</p>
    //             <div class="order-summary">
    //                 <table>
    //                     <thead>
    //                         <tr>
    //                             <th>Product</th>
    //                             <th>Quantity</th>
    //                             <th>Price</th>
    //                             <th>Total</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         ${orderDetails.products.map(product =>
    //     `<tr>
    //                                 <td class="product-info">
    //                                     <img src="${product?.thumbnail}" height="60px" width="60px" alt="${product?.title}">
    //                                     <p>${product?.title}</p>
    //                                 </td>
    //                                 <td>${product.quantity}</td>
    //                                 <td>${product.price}</td>
    //                                 <td>${product.total}</td>
    //                             </tr>`
    // ).join('')}
    //                     </tbody>
    //                 </table>
    //                 <p class="total">Order Total: ${orderDetails?.total}</p>
    //             </div>
    //             <div class="delivery-address">
    //                 <p>Delivery to:</p>
    //                 <div>${orderDetails?.address?.lane}</div>
    //                 <div>${orderDetails?.address?.city}</div>
    //                 <div>${orderDetails?.address?.state}</div>
    //             </div>
    //             <p>We will send you another email with the shipping details once your order has been dispatched. If you have any questions, feel free to contact us.</p>
    //             <p>Thank you for shopping with us!</p>
    //             <p>&copy; 2023 ${orderDetails?.store}. All rights reserved</p>
    //         </div>
    //     </body>
    //     </html>
    // `
    return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500&display=swap" rel="stylesheet">
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
         .footer-wrapper {
            display: flex;
            max-width: 560px;
            align-items: center;
            gap: 40px 100px;
           
            flex-wrap: wrap;
            margin-top: 20px;
        }
            .brand-container {
            align-self: stretch;
            display: flex;
            flex-direction: column;
            color: rgba(95, 95, 95, 1);
            justify-content: start;
            width: 224px;
            margin: auto 0;
            font: 400 14px Jost, sans-serif;
        }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Jost', Arial, sans-serif; color: #5F5F5F; line-height: 1.6; background-color: #f3f5f7;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #f3f5f7; padding: 20px;">
        <tr>
            <td>
                <!-- Header -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: black; text-align: center; margin-bottom: 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/Frame.png" alt="Logo" style="max-width: 200px; height: auto;">
                        </td>
                    </tr>
                </table>

                <!-- Order Confirmation Box -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 300px; margin: 0 auto;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/confirm.png" alt="Confirmation" style="max-width: 96px; height: auto;">
                                        <h1 style="font-size: 24px; font-weight: 500; color: #000000; margin: 20px 0 10px 0;">Order Confirmation</h1>
                                        <div style="background-color: #e4e4e7; padding: 10px; border-radius: 6px; font-size: 14px;">
                                            Order Number:${orderDetails.order}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 20px 20px 20px; text-align: center;">
                            <p style="color: #000000;">Hi ${orderDetails.name},</p>
                            <p style="margin: 10px 50px;">Thank you for your order! We're excited to confirm that we've received your order and it's currently being processed. Here's a summary of your purchase:</p>
                        </td>
                    </tr>
                </table>

                <!-- Order Details -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                    <tr>
                        <td>
                            <h3 style="color: #000000; margin-bottom: 10px;">Order Details</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="padding: 20px;">
                                <tr>
                                    <td style="padding-bottom: 10px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td>Order Date:</td>
                                                <td style="text-align: right;">${orderDetails.date}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 10px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td>Order Total:</td>
                                                <td style="text-align: right;">${orderDetails.total}
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-top: 1px solid rgba(0,0,0,0.1); padding: 10px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td>Payment Method:</td>
                                                <td style="text-align: right;">${orderDetails.paymentMethod}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Products -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                    <tr>
                        <td>
                            <h3 style="color: #000000; margin-bottom: 10px;">Product Ordered</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="padding: 20px;">
                               
                               ${orderDetails.products.map(product =>
        `<tr>

                                    <td style="padding: 10px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="70" style="vertical-align: top;">
                                                    <img src="${product?.thumbnail}" alt="${product?.title}" style="width: 60px; height: 60px; margin-right: 10px;">
                                                </td>
                                                <td>
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td>Quantity</td>
                                                            <td style="text-align: right;">${product?.quantity}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Price</td>
                                                            <td style="text-align: right;">${product.price}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Total</td>
                                                            <td style="text-align: right;">${product.total}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr> `
                                ).join('')}
                              
                                <tr>
                                    <td style="border-bottom: 1px solid rgba(0,0,0,0.1);"></td>
                                </tr>
                              
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Payment Details -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                    <tr>
                        <td>
                            <h3 style="color: #000000; margin-bottom: 10px;">Payment Details</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="padding: 20px;">
                                <!-- Payment rows -->
                                <tr>
                                    <td style="padding-bottom: 10px;">
                                       <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="padding: 20px;">
    <!-- Payment Details Header -->
    <tr>
        <td style="padding-bottom: 10px;">
            <h3>Payment Details</h3>
        </td>
    </tr>

    <!-- Payment Rows -->
    <tr>
        <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">${orderDetails.subtotal}</td>
                </tr>
                
                
                <tr>
                    <td>Additional charges:</td>
                    <td style="text-align: right;">${orderDetails.additionalCharge}</td>
                </tr>
                <tr>
                    <td>VAT 5%:</td>
                    <td style="text-align: right;">${orderDetails.tax}</td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Divider -->
    <tr>
        <td style="border-top: 1px solid #ddd; padding-top: 10px;"></td>
    </tr>

    <!-- Total -->
    <tr>
        <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td><strong>Total:</strong></td>
                    <td style="text-align: right;"><strong>${orderDetails.grandtotal}</strong></td>
                </tr>
            </table>
        </td>
    </tr>
</table>

                                    </td>
                                </tr>
                                <!-- Add other payment rows similarly -->
                                
                </table>

                <!-- Delivery Address -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
    <tr>
        <td>
            <h3 style="color: #000000; margin-bottom: 10px;">Delivery Address</h3>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="padding: 20px;">
                <tr>
                    <td>
                      <strong>Street Address:</strong><br>
                         ${orderDetails.address.lane},<br>
                         ${orderDetails.address.state},<br>
                         ${orderDetails.address.city}<br>
                        
                    </td>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>


                <!-- Footer -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px; background-color: white; padding: 20px;">
    <tr>
        <td style="text-align: center; font-family: 'Jost', sans-serif; color: #5F5F5F;">
            <p style="margin: 0;">We'll send you another email with the shipping details once your order has been dispatched.</p>
            <p style="margin-top: 20px;">Thank you for choosing Knowear. We appreciate your business!</p>
        </td>
    </tr>
    <tr>
        <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                <tr>
                    <td width="50%" style="padding-right: 20px; text-align: center;">
                        <img src="https://knowear.s3.ap-south-1.amazonaws.com/knowear.png" alt="Knowear Logo" style="width: 76px; height: auto;">
                        <p style="margin-top: 12px; font-size: 14px; color: #5F5F5F;">© 2025 Knowear. All rights reserved.</p>
                    </td>
                    <td width="50%" style="text-align: center; vertical-align: top;">
                        <p style="font-size: 14px; color: #5F5F5F;">Stay connected with us</p>
                        <div style="display: flex; justify-content: center; gap: 6px; margin-top: 12px;">
                           <a href="https://www.instagram.com/knowear.me/" style="text-decoration: none;" target="_blank" rel="noopener noreferrer">
            <img src="/icons/instagram.svg" alt="Instagram" style="width: 24px; height: 24px;">
        </a>
        <a href="https://www.facebook.com/KnoWear.Dubai" style="text-decoration: none;" target="_blank" rel="noopener noreferrer">
            <img src="/icons/facebook.svg" alt="Facebook" style="width: 24px; height: 24px;">
        </a>
        <a href="https://www.tiktok.com/@knowear" style="text-decoration: none;" target="_blank" rel="noopener noreferrer">
            <img src="/icons/tiktok-svg.svg" alt="TikTok" style="width: 24px; height: 24px;">
        </a>
        <a href="https://www.snapchat.com/add/knowear" style="text-decoration: none;" target="_blank" rel="noopener noreferrer">
            <img src="/icons/snap4.svg" alt="Snapchat" style="width: 24px; height: 24px;">
        </a>
        <a href="https://www.youtube.com/@KnoWearofficial" style="text-decoration: none;" target="_blank" rel="noopener noreferrer">
            <img src="/icons/youtube.svg" alt="YouTube" style="width: 24px; height: 24px;" v        </a>
        <a href="https://www.linkedin.com/company/knowear" style="text-decoration: none;" target="_blank" rel="noopener noreferrer">
            <img src="/icons/linkedin.svg" alt="LinkedIn" style="width: 24px; height: 24px;">
        </a>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

            </td>
        </tr>
    </table>
</body>
</html>`
}

exports.orderAccepted = async (data) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Accepted</title>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;200;300;400;500;600;700;800;900&display=swap"
        rel="stylesheet">
        <style>
            body {
                font-family: 'Manrope', sans-serif !important;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                text-align: center;
            }
            .logo {
                max-width: 200px;
                margin: 0 auto 20px;
                display: block;
            }
            .header {
                background-color: ${'#' + data.primaryColor.split('0xFF')[1]};
                color: #fff;
                text-align: center;
                padding: 15px 0;
            }
            .content {
                padding: 20px;
            }
            .footer {
                text-align: center;
                background-color: #f5f5f5;
                padding: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src=${data?.logoUrl} alt="Fresh Fruit Mart" class="logo">
            <div class="header">
                <h1>Your Order has been Accepted</h1>
            </div>
            <div class="content">
                <p>Hello ${data.customerName},</p>
                <p>Thank you for placing an order with ${data.storeName}. We are pleased to inform you that your order ${data.orderNo} has been accepted and is now being processed.</p>
                <p>Here are the details of your order:</p>
                <ul>
                    <li><strong>Order Number:</strong> ${data.orderNo}</li>
                    <li><strong>Order Date:</strong> ${data.orderDate}</li>
                    <li><strong>Total Amount:</strong> ${data.orderTotal}</li>
                </ul>
                <p>If you have any questions or need further assistance, please don't hesitate to contact our customer support team at  ${data.supportEmail} or  ${data.supportPhone}.</p>
                <p>Thank you for choosing  ${data.storeName}. We appreciate your business!</p>
            </div>
            <div class="footer">
                <p>This is an automated email, please do not reply to it. For any inquiries, please contact our customer support team.</p>
            </div>
        </div>
    </body>
    </html>    
    `
}

exports.orderDelivered = async (data) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;200;300;400;500;600;700;800;900&display=swap"
        rel="stylesheet">
        <style>
            body {
                font-family: 'Manrope', sans-serif !important;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                text-align: center;
            }
            .logo {
                max-width: 200px;
                margin: 0 auto 20px;
                display: block;
            }
            .header {
                background-color: ${'#' + data.primaryColor.split('0xFF')[1]};
                color: #fff;
                text-align: center;
                padding: 15px 0;
            }
            .content {
                padding: 20px;
            }
            .footer {
                text-align: center;
                background-color: #f5f5f5;
                padding: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src=${data?.logoUrl} alt="Fresh Fruit Mart" class="logo">
            <div class="header">
                <h1>Your Order has been Delivered</h1>
            </div>
            <div class="content">
                <p>Hello ${data.customerName},</p>
                <p>We are pleased to inform you that your order ${data.orderNo} has been delivered to your address.</p>
                <p>Here are the details of your order:</p>
                <ul>
                    <li><strong>Order Number:</strong> ${data.orderNo}</li>
                    <li><strong>Order Date:</strong> ${data.orderDate}</li>
                    <li><strong>Total Amount:</strong> ${data.orderTotal}</li>
                </ul>
                <p>If you have any questions or need further assistance, please don't hesitate to contact our customer support team at  ${data.supportEmail} or  ${data.supportPhone}.</p>
                <p>Thank you for choosing  ${data.storeName}. We appreciate your business!</p>
            </div>
            <div class="footer">
                <p>This is an automated email, please do not reply to it. For any inquiries, please contact our customer support team.</p>
            </div>
        </div>
    </body>
    </html>    
    `
}

exports.orderCancelled = async (data) => {
    // return `
    // <!DOCTYPE html>
    // <html lang="en">
    // <head>
    //     <meta charset="UTF-8">
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //     <title>Order Cancelled</title>
    //     <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;200;300;400;500;600;700;800;900&display=swap"
    //     rel="stylesheet">
    //     <style>
    //         body {
    //             font-family: 'Manrope', sans-serif !important;
    //             background-color: #f5f5f5;
    //             margin: 0;
    //             padding: 0;
    //         }
    //         .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             padding: 20px;
    //             background-color: #ffffff;
    //             text-align: center;
    //         }
    //         .logo {
    //             max-width: 200px;
    //             margin: 0 auto 20px;
    //             display: block;
    //         }
    //         .header {
    //             background-color: ${'#000000'};
    //             color: #fff;
    //             text-align: center;
    //             padding: 15px 0;
    //         }
    //         .content {
    //             padding: 20px;
    //         }
    //         .footer {
    //             text-align: center;
    //             background-color: #f5f5f5;
    //             padding: 10px 0;
    //         }
    //     </style>
    // </head>
    // <body>
    //     <div class="container">
    //         <img src=${data?.logoUrl} alt="Fresh Fruit Mart" class="logo">
    //         <div class="header">
    //             <h1>Your Order has been Cancelled</h1>
    //         </div>
    //         <div class="content">
    //             <p>Hello ${data.customerName},</p>
    //             <p>We are pleased to inform you that your order ${data?.orderNo} has been cancelled.</p>
    //             <p>Here are the details of your order:</p>
    //             <ul>
    //                 <li><strong>Order Number:</strong> ${data.orderNo}</li>
    //                 <li><strong>Order Date:</strong> ${data.orderDate}</li>
    //                 <li><strong>Total Amount:</strong> ${data.orderTotal}</li>
    //             </ul>
    //             <p>If you have any questions or need further assistance, please don't hesitate to contact our customer support team at  ${data.supportEmail} or  ${data.supportPhone}.</p>
    //             <p>Thank you for choosing  ${data.storeName}. We appreciate your business!</p>
    //         </div>
    //         <div class="footer">
    //             <p>This is an automated email, please do not reply to it. For any inquiries, please contact our customer support team.</p>
    //         </div>
    //     </div>
    // </body>
    // </html>    
    // `
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Order Cancellation</title>
    <!--[if mso]>
    <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Jost', Arial, sans-serif; color: #5F5F5F; line-height: 1.6; background-color: #f3f5f7;">
    <center style="width: 100%; background-color: #f3f5f7; padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
            <!-- Header -->
            <tr>
                <td bgcolor="black" align="center" style="padding: 20px;">
                    <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/Frame.png" alt="Company Logo" style="max-width: 132px; height: 26px;"/>
                </td>
            </tr>

            <!-- Main Content -->
            <tr>
                <td bgcolor="white">
                    <!-- Order Status -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="padding: 40px;">
                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/ordercancel.png" alt="Order cancellation icon" style="max-width: 96px; height: auto;"/>
                                <h1 style="font-size: 24px; font-weight: 500; color: #000000; margin-top: 10px;">Your Order has been Cancelled</h1>
                                <div style="border-radius: 6px; background: #e4e4e7; padding: 10px; margin-top: 10px; font-size: 14px;">Order Number: #10000273</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Greeting -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <p style="color: black; margin: 0;">Hello ${data.customerName},</p>
                                <p style="color: #5F5F5F; margin: 20px 50px;">We confirm that your order has been cancelled</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Order Summary -->
            <tr>
                <td bgcolor="#f3f5f7" style="padding: 30px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="white" style="padding: 20px;">
                        <tr>
                            <td style="padding: 10px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td>Order Number:</td>
                                        <td align="right">${data.orderNo}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr><td style="border-top: 1px solid rgba(0,0,0,0.1); padding: 8px 0;"></td></tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td>Order Date:</td>
                                        <td align="right">${data.orderDate}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr><td style="border-top: 1px solid rgba(0,0,0,0.1); padding: 8px 0;"></td></tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td>Total Amount:</td>
                                        <td align="right">${data.orderTotal}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Notification -->
            <tr>
                <td align="center" style="padding: 20px;">
                    <p style="margin: 0;">If you have any questions about this cancellation or need further assistance, please don't hesitate to contact our customer support team.</p>
                </td>
            </tr>

            <!-- Thank You Message -->
            <tr>
                <td align="center" style="padding: 20px;">
                    <p style="margin: 0;">Thank you for your interest in KnoWear. We hope to serve you again in the future!</p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td>
                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/footerlogo.png" alt="KnoWear company logo" style="width: 76px;"/>
                                <p style="font-size: 14px; color: #5F5F5F; margin-top: 12px;">© 2024 knoWear. All rights reserved.</p>
                            </td>
                            <td align="right">
                                <p style="font-size: 14px; color: #5F5F5F; margin-bottom: 12px;">Stay connected with us</p>
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 0 3px;">
                                            <a href="#" style="display: inline-block; background-color: #f3f5f7; padding: 8px; width: 40px; height: 40px; text-align: center;">
                                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;"/>
                                            </a>
                                        </td>
                                        <td style="padding: 0 3px;">
                                            <a href="#" style="display: inline-block; background-color: #f3f5f7; padding: 8px; width: 40px; height: 40px; text-align: center;">
                                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/x.png" alt="X" style="width: 24px; height: 24px;"/>
                                            </a>
                                        </td>
                                        <td style="padding: 0 3px;">
                                            <a href="#" style="display: inline-block; background-color: #f3f5f7; padding: 8px; width: 40px; height: 40px; text-align: center;">
                                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/youtube.png" alt="YouTube" style="width: 24px; height: 24px;"/>
                                            </a>
                                        </td>
                                        <td style="padding: 0 3px;">
                                            <a href="#" style="display: inline-block; background-color: #f3f5f7; padding: 8px; width: 40px; height: 40px; text-align: center;">
                                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"/>
                                            </a>
                                        </td>
                                        <td style="padding: 0 3px;">
                                            <a href="#" style="display: inline-block; background-color: #f3f5f7; padding: 8px; width: 40px; height: 40px; text-align: center;">
                                                <img src="https://knowearcommerce.s3.ap-south-1.amazonaws.com/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"/>
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`
}

exports.resetPassword = async (data) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
        </head>
        <body>
            <h1>Forgot your password?</h1>
            <p>You have requested to reset your password. Please click the button below to reset your password. This link will get expired in 5 minutes </p>  
            <a href=${data.link} target="_blank" style="display: inline-block; background-color: #0000 color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; margin-top: 20px;">Reset Password</a>
            <p>If you did not request a password reset, please ignore and delete this email. Your account is secure.</p> 
            <p>Thank you,<br>Knowear Team</p>
        </body>
        </html>
   `
}
// ${'#' + data.primaryColor.split('0xFF')[1]};
exports.supportEmailVerification = async (data, settings) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <link href="https://fonts.googleapis.com/css2?family=Sen:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
            }

            body {
                background-color: #f4f4f4;
                text-align: center;
            }

            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }

            h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }

            p {
                font-size: 16px;
                color: #555555;
                line-height: 1.6;
            }

            a {
                margin: 10px 0;
                display: inline-block;
                padding: 12px 24px;
                background-color: ${'#' + settings?.colors?.primary?.split('0xFF')[1]};
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Email Verification</h1>
            <p>Hello</p>
            <p>To verify your email address as support email address for ${settings?.name}, please click the button below</p>
            <p>
                <a href=${data?.url} target="_blank">Verify email address</a>
            </p>
            <p>Please ignore and delete this email if it's not you.</p>
            <p>&copy; ${new Date().getFullYear()} Knowear. All rights reserved.</p>
        </div>
    </body>
    </html>
    `
}

exports.enquirySubmission = async (enquiry, settings) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            body {
                font-family:  Arial, sans-serif !important;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header{
                text-align: center;
            }
            .content {
                font-size: 15px;
            }
            table {
                width: 100%;
                font-size: 15px;
            }
            table, th, td {
                border: 1px solid #ddd;
                border-collapse: collapse;
            }
            th, td {
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
        </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img alt="Store" src=${BASE_URL + settings?.logo} width="200px"/>
                </div>
                <div class="content">
                    <p>Hello Admin 👋,</p>
                    <p>A new enquiry form has been submitted with the following details:</p>
                    <table>
                        <tr>
                            <th>&nbsp;</th>
                            <th>Details</th>
                        </tr>
                        <tr>
                            <td>First Name</td>
                            <td>${enquiry?.firstname}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>${enquiry?.email}</td>
                        </tr>
                        <tr>
                            <td>Message</td>
                            <td>${enquiry?.message}</td>
                        </tr>
                    </table>
                    <p>Please take appropriate action to respond to this enquiry as soon as possible.</p>
                    <p>Thank you<br>Commerce Castle Team</p>
                </div>
            </div>
        </body>
        </html>
    `
}

exports.enquiryThanking = (enquiry, settings) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                     <img alt="Store" src=${BASE_URL + settings?.logo} width="200px"/>
                </div>  
                <div class="content">
                    <p>Dear ${enquiry?.firstname}👋,</p>
                    <p>Thank you for submitting your enquiry. We have received your message and will get back to you as soon as possible.</p>
                    <p>We appreciate your interest and will do our best to assist you with your request.</p>
                    <p>Thank you again for contacting us.</p>
                    <p>Sincerely, <br> ${settings?.name}</p>
                </div>
            </div>
        </body>
        </html>
    `
}

exports.voucherConfirmation = (voucherDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Voucher Creation Confirmation</title>
      <style>
        body {
          font-family: monospace, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          font-size: 16px;
        }

        .logo{
            height: auto;
            width: 200px;
            object-fit: contain;
        }
    
        h2 {
          color: #333;
        }
    
        p {
          color: #666;
        }
    
        ul {
          list-style: none;
          padding: 0;
        }
    
        li {
          margin-bottom: 10px;
        }
    
        .footer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          color: #888;
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <img src=${voucherDetails?.logo} class="logo" alt=${voucherDetails?.store}>
        <h2>Voucher Created Successfully!</h2>
        <p>Hello ${voucherDetails?.name},</p>
        <p>We are pleased to inform you that your voucher has been created successfully. Below are the details:</p>
        <ul>
          <li><strong>Voucher Code:</strong> ${voucherDetails?.voucher}</li>
          <li><strong>Value:</strong> ${voucherDetails?.currency} ${voucherDetails?.amount}</li>
          <li><strong>Expiration Date:</strong> ${new Date(voucherDetails?.expiry).toLocaleDateString()}</li>
        </ul>
        <p>Thank you for choosing our services. If you have any questions, feel free to contact us.</p>
        <div class="footer">
          <p> Best regards, ${voucherDetails?.store} </p>
        </div>
      </div>
    </body>
    
    </html>   
    `
}

exports.voucherGift = (voucherDetails) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You've Received a Gift Voucher!</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0 auto;
                padding: 0;
                font-family: 'Andika', sans-serif;
                background-color: #ffffff;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                border-top: 6px solid red;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                background-color: #f9f9f9;
            }

            .logo{
                height: auto;
                width: 200px;
                object-fit: contain;
            }

            h2 {
                color: #333333;    
                font-weight: 700;
            }

            p {
                color: #666666;
                font-size: 18px;
            }

            ul {
                list-style: none;
                padding: 0;
            }

            li {
                margin-bottom: 10px;
                font-size: 16px;
            }

            .footer {
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                color: #888888;
                font-size: 12px;
                text-align: center;
            }
        </style>
        </head>
        <body>
            <div class="container" style="font-family: 'Andika', sans-serif;">
                <img src=${voucherDetails?.logo} class="logo" alt=${voucherDetails?.store}>
                <h2 style="font-family: 'Andika', sans-serif;">Congratulations ${voucherDetails?.recepient}!</h2>
                <p style="font-family: 'Andika', sans-serif;">You've received a gift voucher from ${voucherDetails?.name}. Here are the details:</p>
                <ul>
                    <li style="font-family: 'Andika', sans-serif;"><strong>Voucher Code:</strong> ${voucherDetails?.voucher}</li>
                    <li style="font-family: 'Andika', sans-serif;"><strong>Value:</strong> ${voucherDetails?.currency} ${voucherDetails?.amount}</li>
                    <li style="font-family: 'Andika', sans-serif;"><strong>Sender:</strong> ${voucherDetails?.name}</li>
                    <li style="font-family: 'Andika', sans-serif;"><strong>Message:</strong> ${voucherDetails?.message}</li>
                </ul>
                <p style="font-family: 'Andika', sans-serif;">Enjoy your purchase with the voucher. If you have any questions, feel free to contact us.</p>
            </div>
            <div class="footer">
                <p style="font-family: 'Andika', sans-serif;">Best regards,<br>${voucherDetails?.store}</p>
            </div>
        </body>
        </html>    
    `
}

exports.newsletterSubscribed = (newsletterDetails) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Our Newsletter!🎉</title>
        </head>
        <body>
            <p>Dear customer,</p>
            <p>Thank you for subscribing to our newsletter! We're excited to have you on board. You'll now receive regular updates on our latest products, promotions, and news.</p>
            <p>If you have any questions or feedback, feel free to reach out to us. We appreciate your interest in our brand.</p>
            <p>Happy reading!📚</p>
            <p>Best Regards,<br>${newsletterDetails?.store}</p>
        </body>
        </html>
    `
}

exports.newsletterUnsubscribed = (newsletterDetails) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sad to See You Go!📚</title>
        </head>
        
        <style>
            .container{
                margin: 0 auto;
                border-top: .3125rem solid #4CAF50;
                max-width: 37.5rem;
                padding: 1.875rem 0 0 0;
            }

            img{
                height: auto;
                width: 200px;
            }
        </style>
        
        <body>
            <div class="container">
                <img src="${newsletterDetails?.logo}" alt="Knowear">
                <p>Dear customer,</p>
                <p>We're sorry to see you go, but we respect your decision to unsubscribe from our newsletter. Your preferences
                    matter to us, and we want to ensure you receive only the content you find valuable.</p>
                <p>If you unsubscribed by mistake or changed your mind, you can always resubscribe through our website.🔄</p>
                <p>Thank you for being a part of our community. If you ever decide to rejoin us, we'll be here with the latest
                    updates.</p>
                <p>Best Wishes,<br>${newsletterDetails?.store}</p>
            </div>
        </body>
        
        </html>
    `
}

exports.newsletterVerification = (newsletterDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email subscription confirmation</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap');
    
            body {
                font-family: 'Figtree', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
            }
    
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #f8f8f8;
            }
    
            img {
                height: auto;
                width: 200px;
            }
    
            h2 {
                color: #333;
            }
    
            p {
                color: #555;
            }
    
            .verification-link {
                display: inline-block;
                margin-top: 15px;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: #fff;
                text-decoration: none;
                border-radius: 3px;
            }
    
            .footer {
                margin-top: 20px;
                color: #888;
                font-size: 12px;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <img style="font-family: 'Figtree', sans-serif;" src="${newsletterDetails?.logo}" alt="Knowear">
            <h2 style="font-family: 'Figtree', sans-serif;">Email subscription confirmation</h2>
            <p style="font-family: 'Figtree', sans-serif;">Dear Subscriber,</p>
            <p style="font-family: 'Figtree', sans-serif;">Thank you for subscribing to our newsletter. To complete your subscription, please click the verification
                link below:</p>
            <a style="font-family: 'Figtree', sans-serif;" href="${newsletterDetails?.link}" class="verification-link">Verify subscription</a>
            <p style="font-family: 'Figtree', sans-serif;" class="footer">
                If you have received this email by mistake, simply delete it. You won't be subscribed if you don't click the verification link.
            </p>
        </div>
    </body>
    
    </html>
    `
}

exports.newsletterSubscriptionAlert = async (newsletterDetails) => {
    const mailerDetails = await customMailerService.findOne({ type: "newsletter-notification" })
    let emailTemplate = mailerDetails.email
    emailTemplate = emailTemplate.replace('{{EMAIL}}', newsletterDetails?.email);
    emailTemplate = emailTemplate.replace('{{STORE}}', newsletterDetails?.store);
    return emailTemplate
}

exports.abandonnedCart = (cartDetails) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abandoned Cart Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
        <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
                <td style="padding: 20px; background-color: #f5f5f5; text-align: center;">
                    <h2 style="margin: 0; color: #333;">Your Cart is Waiting!</h2>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <p>Hello,</p>
                    <p>We noticed that you left some items in your shopping cart on our website. We wanted to remind you about them and provide you with an opportunity to complete your purchase.</p>
                    <p>To continue shopping, simply click the button below:</p>
                    <p style="text-align: center;">
                        <a href="https://knowear.me/cart" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Return to Cart</a>
                    </p>
                    <p>If you have any questions or need assistance, feel free to reach out to our customer support team.</p>
                    <p>Thank you for considering our products!</p>
                    <p>Best regards,<br>Knowear</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background-color: #f5f5f5; text-align: center;">
                    <p style="margin: 0; color: #777;">You received this email because you recently visited our website and left items in your shopping cart. If you wish to unsubscribe from similar emails, you can do so by adjusting your email preferences in your account settings.</p>
                </td>
            </tr>
        </table>
        </body>
        </html>
    `
}

exports.adminExportDownload = (exportDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File export notification</title>
        <style>    
            body {
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
    
            img{
                height: auto;
                width: 200px;
            }
    
            h1 {
                color: #333;
            }
    
            .button {
                display: inline-block;
                padding: 10px 20px;
                text-decoration: none;
                background-color: #3498db;
                color: #ffffff;
                border-radius: 3px;
                font-size: 16px;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <img style="font-family: 'Figtree', sans-serif;" src="${exportDetails?.logo}" alt="Knowear">
            <h1 style="font-family: 'Figtree', sans-serif;">File export notification</h1>
            <p style="font-size: 16px; font-family: 'Figtree', sans-serif;">The file has been exported successfully. Please find the download link below:</p>
            <a class="button" style="color: #ffffff; font-family: 'Figtree', sans-serif;" href="${exportDetails?.link}" download>Download File</a>
            <p style="font-size: 16px; font-family: 'Figtree', sans-serif;">If you have any questions or concerns, please contact the administrator.</p>
            <div style="font-size: 16px; font-family: 'Figtree', sans-serif;">
                <div>Thank you for using our service!</div>
                <div>Knowear</div>
            </div>
        </div>
    </body>
    </html>
    `
}

exports.replaceConfirmation = async (orderDetails) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Replace Request Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
            }
            p {
                margin-bottom: 20px;
                color: #666;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #999;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <h1>Replace Request Confirmation</h1>
            <p>Dear ${orderDetails.name},</p>
            <p>We have received your request for a replacement of ${orderDetails.product}.</p>
            <p>Details of your request:</p>
            <ul>
            <li>Request ID: ${orderDetails.reference}</li>
            <li>Item Name: ${orderDetails.product}</li>
            <li>Reason for Replacement: ${orderDetails.reason}</li>
            </ul>
            <p>We will process your request as soon as possible. You will receive further updates via email.</p>
            <p>Thank you for choosing our service!</p>
            <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
        </body>
        </html>
    `
}

exports.replaceInitiated = (replaceDetails) => {
    return `
            <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Replacement Request Initiated</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Replacement Request Initiated</h1>
                <p>Dear ${replaceDetails.name},</p>
                <p>We are writing to inform you that your replacement request for ${replaceDetails.product} has been initiated.</p>
                <p>Our team is currently processing your request and will get back to you with further instructions as soon as possible.</p>
                <p>If you have any questions or concerns, please feel free to contact our customer support team <a href=${replaceDetails.link} target="_blank">here</a>.</p>
                <p>Thank you for your understanding.</p>
                <p>Sincerely,<br>${replaceDetails.store}</p>
                <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; font-style: italic;">
                    <p>Note: This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `
}

exports.replaceRejected = (replaceDetails) => {
    return `
            <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Replacement Request Rejected</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; border: 1px solid #ddd; padding: 20px;">
            <div style="padding: 20px;">
                <h2 style="margin-top: 0; text-align: center;">Replacement Request Rejected</h2>
                <p>Dear ${replaceDetails.name},</p>
                <p>We regret to inform you that your replacement request for ${replaceDetails.product} has been rejected. Please refer to our terms and conditions for more information regarding our replacement policy.</p>
                <p>If you have any questions or concerns, please don't hesitate to contact our customer support team.</p>
                <p style="text-align: center;">Thank you for your understanding.</p>
                <p style="text-align: center;">Best regards,<br> ${replaceDetails.store}</p>
                <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; font-style: italic;">
                    <p>Note: This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </div>
        </body>
        </html>
    `
}

exports.welcomeCustomer = (emailDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Store!</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #000000;
            text-align: justify;
        }
        .container {
            max-width: 600px;
            margin: auto;
            overflow: hidden;
        }
    </style>
    </head>
    <body style="font-family: Arial, sans-serif;">
        <div class="container">
            <div id="branding">
                <img src="${emailDetails?.branding}" alt="Store" width="200px">
            </div>
            <table style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
                <tr>
                <td style="padding: 20px; background-color: #f5f5f5; text-align: center;">
                    <h1>Welcome to Our Store!</h1>
                </td>
                </tr>
                <tr>
                <td style="padding: 20px;">
                    <p>Hello ${emailDetails.name},</p>
                    <p>Thank you for registering with us. We are excited to have you as a new customer!</p>
                    <p>At ${emailDetails.store}, we strive to provide top-notch products and excellent customer service.</p>
                    <p>Your account has been successfully created, and you can now start exploring our store and making purchases.</p>
                    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                    <p>Happy shopping!</p>
                    <p>Best regards,<br>
                    ${emailDetails.store}</p>
                </td>
                </tr>
                <tr>
                <td style="padding: 20px; background-color: #f5f5f5; text-align: center;">
                    <p style="font-size: 12px; color: #777;">This is an automated email, please do not reply.</p>
                </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
`
}

exports.dashboardNotification = (emailDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailDetails?.subject}</title>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;300;400;700;900&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #000000;
            text-align: justify;
        }
        .container {
            max-width: 600px;
            margin: auto;
            overflow: hidden;
        }
    </style>
    </head>
    <body style="font-family: 'Manrope', sans-serif;">
        <div class="container">
            <div id="branding">
                <img src="${emailDetails?.branding}" alt="Store" width="200px">
            </div>
            <div>
                ${emailDetails?.body}
            </div>
            <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; font-style: italic;">
                <p>Note: This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
`
}

exports.adminPlaceOrderNotification = (emailDetails) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailDetails?.subject}</title>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;300;400;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 20px;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #dddddd;
                border-radius: 5px;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                color: #333333;
            }
            .order-details {
                margin-bottom: 20px;
            }
            .order-details h2 {
                margin: 0 0 10px 0;
                font-size: 20px;
                color: #333333;
            }
            .details-table {
                width: 100%;
                border-collapse: collapse;
            }
            .details-table th, .details-table td {
                padding: 10px;
                border: 1px solid #dddddd;
                text-align: left;
            }
            .details-table th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .order-view-button{
                margin-top: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .order-view-button a {
                display: inline-block;
                padding: 10px 20px;
                background-color:${'#' + emailDetails.secondaryColor.split('0xFF')[1]};
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            .order-summary table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .order-summary th, .order-summary td {
                padding: 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .order-summary th {
                background-color:${'#' + emailDetails.secondaryColor.split('0xFF')[1]};
                color: white;
            }
            .order-summary td img {
                width: 60px;
                height: auto;
                border-radius: 5px;
            }
            .order-summary .product-info {
                display: flex;
                align-items: center;
            }
            .order-summary .product-info p {
                margin: 0;
                margin-left: 10px;
            }
            .order-summary .total {
                font-size: 18px;
                font-weight: bold;
                margin-top: 10px;
                color: ${'#' + emailDetails.primaryColor.split('0xFF')[1]}
            }
        </style>
        </head>
        <body style="font-family: 'Manrope', Arial, sans-serif;">
            <div class="container">
                <div class="header">
                    <h1>Order Notification</h1>
                    <p>Dear Admin,</p>
                    <p>A new order has been placed on your store. Below are the details:</p>
                </div>
                <div class="order-details">
                    <h2>Order Details</h2>
                    <table class="details-table">
                        <tr>
                            <th>Order ID</th>
                            <td>${emailDetails?.orderNo}</td>
                        </tr>
                        <tr>
                            <th>Date</th>
                            <td>${emailDetails?.orderDate}</td>
                        </tr>
                        <tr>
                            <th>Customer Name</th>
                            <td>${emailDetails?.orderCustomer}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>${emailDetails?.orderEmail}</td>
                        </tr>
                        <tr>
                            <th>Payment Method</th>
                            <td>${emailDetails?.orderPayment}</td>
                        </tr>
                        <tr>
                            <th>Total Amount</th>
                            <td>${emailDetails?.orderTotal}</td>
                        </tr>
                    </table>
                </div>
                <div class="order-summary">
                    <h2>Order Items</h2>
                    <table class="items-table">
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                        ${emailDetails?.orderItems.map(item => `
                            <tr>
                                <td class="product-info">
                                    <img src="${item?.image}" height="60px" width="60px" alt="${item?.name}">
                                    <p>${item?.name}</p>
                                </td>
                                <td>${item.quantity}</td>
                                <td>${item.price}</td>
                                <td>${item.total}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                <div class="order-view-button">
                    <a href=${emailDetails?.orderRedirection}>View order</a>
                </div>
                <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; font-style: italic;">
                    <p>Note: This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `
}

exports.abandonnedWishlist = () => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abandoned Wishlist Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
        <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
                <td style="padding: 20px; background-color: #f5f5f5; text-align: center;">
                    <h2 style="margin: 0; color: #333;">Your Wishlist Items are Waiting!</h2>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <p>Hello,</p>
                    <p>We noticed that you have some items saved in your wishlist on our website. We wanted to remind you about these items that caught your interest.</p>
                    <p>To view your wishlist and continue shopping, simply click the button below:</p>
                    <p style="text-align: center;">
                        <a href="https://knowear.me/wishlist" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">View Wishlist</a>
                    </p>
                    <p>If you have any questions or need assistance, feel free to reach out to our customer support team.</p>
                    <p>Thank you for your interest in our products!</p>
                    <p>Best regards,<br>Knoweare</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background-color: #f5f5f5; text-align: center;">
                    <p style="margin: 0; color: #777;">You received this email because you have items saved in your wishlist on our website. If you wish to unsubscribe from similar emails, you can do so by adjusting your email preferences in your account settings.</p>
                </td>
            </tr>
        </table>
        </body>
        </html>
    `
}