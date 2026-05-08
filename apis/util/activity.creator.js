const activityService = require("../app/services/activity.service");
const adminService = require("../app/services/auth.service");

exports.logActivity = async (email, action) => {
    const adminDetails = await adminService.adminDetails({ email: email });
    const payload = {
        admin: adminDetails?._id,
        time: new Date().toLocaleTimeString(),
        activity: action,
        date: new Date(),
        refid: await activityService.count({}) + 1
    }
    activityService.create(payload)
}