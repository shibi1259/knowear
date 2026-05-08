const mongoose = require('mongoose');

const careerApplicationSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, required: true },
    phone: { type: String, required: true },
    designation: { type: String, required: true },
    resume: { type: String, required: true },
    coverLetter: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('career.applications', careerApplicationSchema);