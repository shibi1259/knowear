const mediaService = require("../app/services/media.service")
const adminService = require("../app/services/auth.service");
const slug = require("./slug");
const db = require("../app/db/index");

exports.uploader = async (email, details, uploaded) => {
    const adminDetails = await adminService.adminDetails({ email: email });
    const payload = {
        title: details.filename,
        path: details.path,
        slug: await slug.createSlug(db.Media, details.filename, { slug: await slug.generateSlug(details.filename) }),
        size: bytesToMB(details.size).toFixed(2),
        type: details.mimetype,
        uploadedDescription: uploaded.description,
        uploadedBy: adminDetails?._id,
        uploadedTo: uploaded.to
    }

    const media = await mediaService.create(payload);
    return media;
}

function bytesToMB(bytes) {
    return bytes / (1024 * 1024);
}