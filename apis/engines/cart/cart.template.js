const { BASE_URL } = require("../../config/constants/common")

exports.cart = (carts, settings) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abandoned Cart Summary</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;300;400;700;900&display=swap" rel="stylesheet">
            <style>
                .container{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    font-size: 16px
                }

                table {
                    border-collapse: collapse;
                    width: 100%;
                  }
              
                  table, th, td {
                    border: 1px solid black;
                  }
              
                  th, td {
                    padding: 10px;
                    text-align: left;
                  }
              
                  th {
                    background-color: #f2f2f2;
                  }
            </style>
        </head>
        <body style="font-family: 'Manrope', sans-serif;">
            <div class="container">
                <img src=${BASE_URL + settings?.logo} alt="Store" width="200px">
                <h2>Daily Abandoned Cart Summary</h2>
                <h3>Here's your daily report for the day (${carts?.date})</h3>
                <p>Hello Admin👋,</p>
                <p>${carts?.date} - ${settings?.name}</p>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Total</th>
                        <th>URL</th>
                    </tr>
                    ${carts?.details?.map(item => {
                        return `<tr>
                            <td>${item?.name}</td>
                            <td>${item?.total}</td>
                            <td><a href=${item?.url}>View details</a></td>
                        </tr>`
                    }).join('')}
            </div>
        </body>
        </html>
    `
}