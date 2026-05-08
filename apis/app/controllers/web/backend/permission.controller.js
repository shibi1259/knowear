const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/permission.service')
const { permissions } = require('../../../../util/permission.content')
const adminService = require("../../../services/auth.service")
const { Mutex } = require('async-mutex')
const mutex = new Mutex();

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.uploadPermissions = async (req, res, next) => {
    try {
        const { email } = res?.locals?.user;
        const admin = await getAdminDetails(email);
        let count = 0;

        for (const permission of permissions) {
            permission.createdBy = admin?._id;
            const permissionExists = await service.findOne({ tag: permission.tag });
            if (permissionExists) {
                count++;
            } else {
                const response = await service.create(permission);
                if (response instanceof Error) {
                    helper.deliverResponse(res, 422, permissionCleared, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                    return;
                } else {
                    count++;
                }
            }
        }

        helper.deliverResponse(res, 200, { permissions: count }, {
            "error_code": messages.ADD_PERMISSION.error_code,
            "error_message": messages.ADD_PERMISSION.error_message
        });
    } catch (error) {
        console.log('Error caught while uploading permissions :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
};

exports.getPermissions = async (req, res) => {
    try {
        let query = [
            {
                $group: {
                    _id: "$type",
                    permissions: {
                        $push: { _id: "$_id", name: "$name" }
                    }
                }
            },
            {
                $project: { _id: 0, tag: "$_id", permissions: 1 }
            },
            {
                $sort: { tag: 1 } // Sort by tag (type) in ascending order (A to Z)
            }
        ]
        const respone = await service.aggregate(query)
        helper.deliverResponse(res, 200, respone, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught while get permissions :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
