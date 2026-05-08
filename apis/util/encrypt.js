const encrypt = require("crypto-js")
require('dotenv').config

exports.encrypt = (data) => {
    const response = encrypt.AES.encrypt(data, process.env.CRYPTO_SECRET_KEY).toString();
    return response
}