const jwt = require("jsonwebtoken");
const constant = require("../config/constants");
const key = constant.common.KEYS

exports.createToken = (payload) => {
    try {
        const token = jwt.sign(payload, key.JWTSECRET, {
            expiresIn: key.JWT_EXPIRE
        });
        return token
    } catch (error) {
        throw error;
    }
}
