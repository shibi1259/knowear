const { BASE_URL } = require("../../config/constants/common")

exports.dailyReport = (orders, settings) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Order Summary</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@100;300;400;700;900&display=swap" rel="stylesheet">
            <style>
                .container{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    font-size: 15px
                }

                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                th, td {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                    font-size: 15px
                }

                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body style="font-family: 'Manrope', sans-serif;">
            <div class="container">
                <img src=${BASE_URL + settings?.logo} alt="Store" width="200px">
                <h2>Daily Order Summary</h2>
                <h3>Here's your daily report for the day (${orders?.date})</h3>
                <p>Hello Admin👋,</p>
                <p>${orders?.date} - ${settings?.name}</p>
                <table>
                    <tr>
                        <th>&nbsp;</th>
                        <th>Results</th>
                    </tr>
                    <tr>
                        <td>Orders Placed</td>
                        <td>${orders?.placed}</td>
                    </tr>
                    <tr>
                        <td>Orders Pending</td>
                        <td>${orders?.pending}</td>
                    </tr>
                    <tr>
                        <td>Orders Delivered</td>
                        <td>${orders?.delivered}</td>
                    </tr>
                    <tr>
                        <td>Orders Collected</td>
                        <td>${orders?.collected}</td>
                    </tr>
                    <tr>
                        <td>Total Sales</td>
                        <td>${settings?.currency} ${orders?.total}</td>
                    </tr>
                </table>
                <p>Thank you for your attention to this report. If you have any questions or need further details, please don't hesitate to reach out.</p>
                <p>Best regards,<br> Commerce Castle</p>
            </div>
        </body>
        </html>
    `
}