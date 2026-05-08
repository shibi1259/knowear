const paymentService = require("../../app/services/payment.details.service");
const PayTabs = require("paytabs_pt2")
const settingsService = require("../../app/services/general.settings.service");

exports.createTransaction = async (orderId, cart, customer) => {
    try {
        //Payment keys
        const paymentDetails = await paymentService.findOne({ paymentGateway: 'paytabs' })
        const profileID = paymentDetails ? paymentDetails?.profileId : "48393",
            serverKey = paymentDetails ? paymentDetails?.serverKey : "SHJNL9KNB6-JHB9RW2LKB-K26MR99W6T",
            region = paymentDetails ? paymentDetails?.region : "ARE";
        //Payment keys

        PayTabs.setConfig(profileID, serverKey, region);

        const storeDetails = await settingsService.findOne({ })
        const websiteUrl = storeDetails?.domain
        let paymentMethods = ["all"];
        let transaction = { type: "sale", class: "ecom" };
        let transaction_details = [transaction.type, transaction.class];
        let cart_details = [cart.id, cart.currency, cart.amount, cart.description];
        let customer_details = [
            customer.name, customer.email, customer.phone,
            customer.street, customer.city, customer.state,
            customer.country, customer.zip, customer.IP
        ];
        let shipping_address = customer_details;
        let url = {
            response: `${websiteUrl}order-processing?orderId=${orderId}`,
            callback: `${process.env.API_URL}api/v1/w/verify-paytabs'`
        }
        let response_URLs = [url.callback, url.response];
        let langugae = "en";
        let frameMode = true;

        paymentPageCreated = function (results) {
            console.log(results);
        }

        return new Promise((resolve, reject) => {
            PayTabs.createPaymentPage(
                paymentMethods,
                transaction_details,
                cart_details,
                customer_details,
                shipping_address,
                response_URLs,
                langugae,
                function (results) {
                    if (results?.response_code == 400) {
                        reject(results?.result);
                    } else {
                        resolve(results);
                    }
                },
                frameMode
            )
        })
    } catch (error) {
        return error;
    }
}