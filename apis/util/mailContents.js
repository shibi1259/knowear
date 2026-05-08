exports.mailContent = (name, message, image) => {
    try {
        let content = ''
        if (image == '') {
            content = `
            <html>
            <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
            </head>
            <body style="font-family: 'Manrope', sans-serif;">
            <div style="width:100%;background:#00bdab;padding: 30px;border-radius: 15px;max-width: 650px;">
            <h3 style="color: #ffffff; margin: 0;">Greetings Dheemanth</h3>
            <h2 style="color: #ffffff; font-weight: 600; margin: 0;">Welcome to Commerce Castle</h2>
            </div>
            <p style="color: #111111;">Test<p>
            <p style="color: #111111;">Thank you, visit us at <a style="color: #00bdab; text-deoration: none;" href="https://ccadmin.previewbay.com">ccadmin.previewbay.com</a></p>
            </body>
            </html>`
        } else {
            content = `
            <html>
            <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
            </head>
            <body style="font-family: 'Manrope', sans-serif;">
            <div style="width:100%;background:#00bdab;padding: 30px;border-radius: 15px;max-width: 650px;">
            <h3 style="color: #ffffff; margin: 0;">Greetings ${name}</h3>
            <h2 style="color: #ffffff; font-weight: 600; margin: 0;">Welcome to Commerce Castle</h2>
            </div>
            <div style="margin: 20px 0;">
            <img src="${image}" style="height: 500px; width: 500px;">
            </div>
            <p style="color: #111111;">${message}<p>
            <p style="color: #111111;">Thank you, visit us at <a style="color: #00bdab; text-deoration: none;" href="https://ccadmin.previewbay.com">ccadmin.previewbay.com</a></p>
            </body>
            </html>`
        }

        return content
    } catch (error) {
        return error
    }
}