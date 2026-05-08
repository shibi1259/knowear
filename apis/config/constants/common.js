module.exports = {
    BASE_URL: process.env.BASE_URL,
    PORT: process.env.PORT || 3000,
    KEYS: require('./key').KEYS[process.env.ENV],
    SALT_ROUNDS: 10,
    VIEW_LIMIT: 30,
    STATUS: ['SENT', 'PENDING', 'REJECTED']
}