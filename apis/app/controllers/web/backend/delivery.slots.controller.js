const { body, validationResult } = require("express-validator")
const service = require("../../../services/delivery.slots.service")
const adminService = require("../../../services/auth.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const orderService = require("../../../services/order.service")
const activity = require("../../../../util/activity.creator")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('days', 'Days is required'),
                body('from', 'From is required'),
                body('to', 'To is required'),
            ]
        }
        case 'update': {
            return [
                body('days', 'Days is required'),
                body('from', 'From is required'),
                body('to', 'To is required'),
                body('refid', 'Refid is required')
            ]
        }
    }
}

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req;
        const { email } = res?.locals?.user
        const admin = await getAdminDetails(email)

        for (let day of body.days) {
            const deliveryDetails = await service.findOne({ day: day, from: body?.from, to: body?.to, isDelete: false })
            if (deliveryDetails) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.DUPLICATE_DELIVERY_SLOT.error_code,
                    "error_message": messages.DUPLICATE_DELIVERY_SLOT.error_message
                });
                return;
            } else {
                let payload = { from: body.from, to: body.to, day: day }
                payload.refid = await service.count({}) + 1
                payload.createdBy = admin?._id
                payload.ordersPerSlot = body.ordersPerSlot
                let response = await service.add(payload)
                if (response instanceof Error) {
                    helper.deliverResponse(res, 422, response, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                    return;
                } else {
                    activity.logActivity(email, `${body.from} to ${body.to} on ${day} slot added`)
                }
            }
        }
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.DELIVERY_SLOT_ADDED.error_code,
            "error_message": messages.DELIVERY_SLOT_ADDED.error_message
        });
    } catch (error) {
        console.log("Error caught in delivery slot add api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req;
        const { email } = res?.locals?.user
        const deliveryDetails = await service.findOne({ from: body?.from, to: body?.to, day: body.day, isDelete: false, refid: { $ne: body?.refid } })
        if (deliveryDetails) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.DUPLICATE_DELIVERY_SLOT.error_code,
                "error_message": messages.DUPLICATE_DELIVERY_SLOT.error_message
            });
        } else {
            let response = await service.update({ refid: body.refid }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                })
            } else {
                activity.logActivity(email, `${body.from} to ${body.to} slot updated`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.DELIVERY_SLOT_UPDATED.error_code,
                    "error_message": messages.DELIVERY_SLOT_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in delivery slot update api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getDeliverySlots = async (req, res) => {
    try {
        const { type, day } = req.query
        const matchCriteria = { isDelete: false }
        day ? matchCriteria['day'] = day : null
        type == 'active' ? matchCriteria['isActive'] = true :
            type == 'inactive' ? matchCriteria['isActive'] = false : null

        let aggregate = [
            { $match: matchCriteria }, {
                $group: { _id: "$day", deliverySlots: { $push: "$$ROOT" } }
            }
        ]

        let slots = await service.aggregate(aggregate)
        let deliverySlots = {}
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        for (let slot of slots) {
            deliverySlots[slot['_id']] = slot['deliverySlots']
        }
        const result = days.map(day => ({ slots: deliverySlots[day], day: day }));
        helper.deliverResponse(res, 200, result, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in delivery slots api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}

//Formatted response starts here
exports.getDeliverySlotsPerDay = async (req, res) => {
    try {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayIndex = (new Date()).getDay();
        const currentDayName = daysOfWeek[currentDayIndex];
        const { type, bufferHours, bufferMinutes } = req.query;
        const bufferTimeInMinutes = timeToMinutes(`${bufferHours}:${bufferMinutes}`);
        const { day } = req.params;

        let query = {
            day: day,
            isDelete: false
        }

        type === 'active' ? query['isActive'] = true : type === 'inactive' ? query['isActive'] = false : null;

        const slotDetails = await service.find(query)
        let slots = []
        let formattedResponse = []
        for (let slotItem of slotDetails) {
            const orders = await orderService.getOrderCounts({ deliverySlot: slotItem?._id, orderStatus: { $nin: ['DELIVERED', 'FAILED'] } })
            orders == slotItem?.ordersPerSlot || orders > slotItem?.ordersPerSlot ? null : slots.push(slotItem)

            if (day == currentDayName && bufferHours && bufferMinutes) {
                slots = slots.filter(slot => timeToMinutes(slot.from) > bufferTimeInMinutes);
            }

            formattedResponse = slots.map(slot => {
                const formatTime = (time) => {
                    const hours = parseInt(time.split(':')[0]);
                    const minutes = parseInt(time.split(':')[1]);
                    const amOrPm = hours >= 12 ? 'PM' : 'AM';
                    const formattedHours = hours % 12 || 12; // Convert 0 to 12
                    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amOrPm}`;
                };

                return {
                    ...slot._doc,
                    from: formatTime(slot.from),
                    to: formatTime(slot.to)
                };
            });
        }

        helper.deliverResponse(res, 200, formattedResponse, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message,
        })

    } catch (error) {
        console.log("Error caught in delivery slots per day api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
//Formatted response starts here

//Raw time slots starts here
exports.getDeliverySlotsForDay = async (req, res) => {
    try {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayIndex = (new Date()).getDay();
        const currentDayName = daysOfWeek[currentDayIndex];

        const { day } = req.params;
        const { type } = req.query;
        let query = { day: day, isDelete: false }
        type === 'active' ? query['isActive'] = true : type === 'inactive' ? query['isActive'] = false : null;
        const slotDetails = await service.rawFind(query)
        helper.deliverResponse(res, 200, slotDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message,
        })
    } catch (error) {
        console.log("Error caught in delivery slots per day api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
//Raw time slots ends here

exports.getDeliverySlotDetails = async (req, res) => {
    try {
        const { delivery } = req.params
        let response = await service.findOne({ refid: delivery })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { delivery } = req.params
        const { email } = res?.locals?.user
        const slotDetails = await service.findOne({ refid: delivery })
        let response = await service.update({ refid: delivery }, { isDelete: true })
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            })
        } else {
            activity.logActivity(email, `${slotDetails.from} to ${slotDetails.to} slot deleted`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.DELIVERY_SLOT_DELETED.error_code,
                "error_message": messages.DELIVERY_SLOT_DELETED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in delivery slot delete api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateSlots = async (req, res) => {
    try {
        const { body } = req
        for (let slot of body?.slots) {
            const deliveryDetails = await service.findOne({ from: slot?.from, to: slot?.to, day: slot.day, isDelete: false, refid: { $ne: slot?.refid } })
            deliveryDetails ? null : await service.update({ refid: slot.refid }, slot)
        }
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.DELIVERY_SLOT_UPDATED.error_code,
            "error_message": messages.DELIVERY_SLOT_UPDATED.error_message
        });
    } catch (error) {
        console.log("Error caught in update delivery slots api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}