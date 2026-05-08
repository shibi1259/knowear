exports.verificationTemplate = async (data) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;200;300;400;500;600;700;800;900&display=swap"
        rel="stylesheet">
        <style>
            body {
                font-family: 'Manrope', sans-serif;
                background-color: #f4f4f4;
                text-align: center;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .logo {
                max-width: 200px;
                margin: 0 auto 20px;
                display: block;
            }
            .button {
                display: inline-block;
                font-size: 16px;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                cursor: pointer;
                background-color: ${"#" + data?.primaryColor.split('0xFF')[1]};
                color: #ffffff;
                border-radius: 5px;
                text-align: center;
            }
            a{
                color: #ffffff !important;
                text-align: center;
            }
            p{
                font-size: 14px;
            }
            h2, p{
                text-align: center;
            }
        </style>
    </head>
    <body style="font-family: 'Manrope', sans-serif;">
        <div class="container">
            <img src=${data?.logoUrl} alt="Fresh Fruit Mart" class="logo">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up with ${data?.storeName}. Please click the button below to verify your email address.</p>
            <div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
            <a href=${data?.redirect} class="button">Verify Email</a>
             </div>
            <p>Please note that this verification link will expire in ${data?.expireIn} minutes.</p>
            <br>
            Thanks
            <br>
            <strong>${data?.storeName}</strong>
            <hr style="border:2px solid #eaeef3;border-bottom:0;margin:20px 0">
            <p style="text-align:center;color:#a9b3bc">
                If you did not make this request, please contact us by replying to this mail.
            </p>
        </div>
    </body>
    </html>
    `
}