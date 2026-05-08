const Simplify = require("simplify-commerce")
const settingsService = require("../../app/services/general.settings.service");
const paymentService = require("../../app/services/payment.details.service");

exports.createRakBankTransaction = async (orderId, orderAmount, token) => {
    const settings = await settingsService.findOne({ });
    const paymentDetails = await paymentService.findOne({ paymentGateway: 'rakbank' });
    const client = Simplify.getClient({
        publicKey: paymentDetails?.publicKey || 'sbpb_MjUxY2VlZmUtYWRmMi00YWRhLTkxNWQtNzg4ODEyNjJhMmYz',
        privateKey: paymentDetails?.privateKey || 'f3go5zv9A3nINfPZIpXvHqTfBX0q/R8sU6Wzb/Yl4q15YFFQL0ODSXAOkNtXTToq'
    });

    return new Promise((resolve, reject) => {
        client.payment.create({
            amount: orderAmount,
            token: token,
            description: `Payment for order ${orderId}`,
            currency: settings?.currency || 'AED'
        }, function (errData, data) {
            if (errData) {
                return reject(errData);
            }

            resolve(data);
        });
    });
}


exports.createToken = async (cardDetails) => {
    const paymentDetails = await paymentService.findOne({ paymentGateway: 'rakbank' });
    const client = Simplify.getClient({
        publicKey: paymentDetails?.publicKey || 'sbpb_MjUxY2VlZmUtYWRmMi00YWRhLTkxNWQtNzg4ODEyNjJhMmYz',
        privateKey: paymentDetails?.privateKey || 'f3go5zv9A3nINfPZIpXvHqTfBX0q/R8sU6Wzb/Yl4q15YFFQL0ODSXAOkNtXTToq'
    });

    return new Promise((resolve, reject) => {
        client.cardtoken.create({
            card: {
                expMonth: cardDetails.expMonth,
                expYear: cardDetails.expYear,
                cvc: cardDetails.cvc,
                number: cardDetails.number
            }
        }, function (errData, data) {
            if (errData) {
                return reject(errData);
            }

            resolve(data);
        });
    });
}
