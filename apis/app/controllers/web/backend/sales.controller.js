const orderService = require("../../../services/order.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const settingsService = require("../../../services/general.settings.service");
const { months } = require("../../../../util/months");

function getDatesBetween(start, end) {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= new Date(end)) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

function getFirstAndLastDateOfPastWeek() {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const firstDayOfPastWeek = new Date(today);
    const lastDayOfPastWeek = new Date(today);

    // Calculate the first day of the past week
    const daysToSubtract = currentDayOfWeek + 7;
    firstDayOfPastWeek.setDate(today.getDate() - daysToSubtract + 1);

    // Calculate the last day of the past week
    const daysToSubtractForLastDay = currentDayOfWeek;
    lastDayOfPastWeek.setDate(today.getDate() - daysToSubtractForLastDay);

    return {
        firstDayOfPastWeek: firstDayOfPastWeek.toISOString().split('T')[0],
        lastDayOfPastWeek: lastDayOfPastWeek.toISOString().split('T')[0]
    };
}

exports.sales = async (req, res) => {
    try {
        const { body } = req
        let dates = []
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        let dateDetails = { start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), end: new Date(new Date().setHours(23, 59, 59, 59)).toISOString() }

        switch (body.duration) {
            case 'lastweek':
                const { firstDayOfPastWeek, lastDayOfPastWeek } = getFirstAndLastDateOfPastWeek();
                dateDetails['start'] = new Date(new Date(firstDayOfPastWeek).setHours(0, 0, 0, 0)).toISOString()
                dateDetails['end'] = new Date(new Date(lastDayOfPastWeek).setHours(23, 59, 59, 59)).toISOString()
                const lastWeekdDates = getDatesBetween(firstDayOfPastWeek, lastDayOfPastWeek);
                dates = lastWeekdDates.map(date => date.toISOString().split('T')[0]);
                break
            case 'today':
                dateDetails['start'] = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
                dateDetails['end'] = new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
                dates = [new Date(today).toISOString().split('T')[0]];
                break
            case 'yesterday':
                let yesterday = new Date();
                yesterday.setDate(new Date().getDate() - 1);
                dateDetails['start'] = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
                dateDetails['end'] = new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
                dates = [new Date(yesterday).toISOString().split('T')[0]];
                break
            case 'current':
                const firstDateOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const formattedFirstDateOfMonth = firstDateOfMonth.toISOString().split('T')[0];
                dateDetails['start'] = new Date(new Date(formattedFirstDateOfMonth).setHours(0, 0, 0, 0)).toISOString()
                dateDetails['end'] = new Date(new Date(formattedToday).setHours(23, 59, 59, 59)).toISOString()
                const currentMonthDates = getDatesBetween(formattedFirstDateOfMonth, formattedToday);
                dates = currentMonthDates.map(date => date.toISOString().split('T')[0]);
                break
            case '30':
                const last30Days = new Date(today);
                last30Days.setDate(today.getDate() - 30);
                const formattedLast30Days = last30Days.toISOString().split('T')[0];
                dateDetails['start'] = new Date(new Date(formattedLast30Days).setHours(0, 0, 0, 0)).toISOString()
                dateDetails['end'] = new Date(new Date(formattedToday).setHours(23, 59, 59, 59)).toISOString()
                const pastDates = getDatesBetween(formattedLast30Days, formattedToday);
                dates = pastDates.map(date => date.toISOString().split('T')[0]);
                break
            case 'date-range':
                dateDetails['start'] = new Date(new Date(body['dates'][0]).setHours(0, 0, 0, 0)).toISOString()
                dateDetails['end'] = new Date(new Date(body['dates'][1]).setHours(23, 59, 59, 59)).toISOString()
                const rangeDates = getDatesBetween(body['dates'][0], body['dates'][1]);
                dates = rangeDates.map(date => date.toISOString().split('T')[0]);
                break
        }

        const settings = await settingsService.findOne({ })
        let salesDetails = []
        for (let dateItem of dates) {
            const query = [{
                '$match': {
                    'createdAt': {
                        '$gte': new Date(dateItem + 'T00:00:00.000Z'),
                        '$lte': new Date(dateItem + 'T23:59:59.999Z')
                    }
                }
            }, {
                '$addFields': { 'orderTotal': { '$toDouble': '$wholeTotal' } }
            }, {
                '$group': {
                    '_id': null,
                    'totalOrders': { '$sum': 1 },
                    'totalOrdersValue': { '$sum': '$orderTotal' },
                    'calledOffOrders': {
                        '$sum': { '$cond': [{ '$in': ['$orderStatus', ['CANCELLED', 'RETURNED']] }, 1, 0] }
                    },
                    'calledOffOrdersValue': {
                        '$sum': { '$cond': [{ '$in': ['$orderStatus', ['CANCELLED', 'RETURNED']] }, "$orderTotal", 0] }
                    },
                    'deliveredOrdersValue': {
                        '$sum': { '$cond': [{ '$eq': ['$orderStatus', 'DELIVERED'] }, '$orderTotal', 0] }
                    },
                    'returnedOrdersValue': {
                        '$sum': { '$cond': [{ '$eq': ['$orderStatus', 'RETURNED'] }, '$orderTotal', 0] }
                    },
                    'cancelledOrdersValue': {
                        '$sum': { '$cond': [{ '$eq': ['$orderStatus', 'CANCELLED'] }, '$orderTotal', 0] }
                    }
                }
            }]
            const response = await orderService.getOrdersByAggregate(query)
            salesDetails.push({
                date: months[new Date(dateItem).getMonth()] + ' ' + new Date(dateItem).getDate() + ', ' + new Date(dateItem).getFullYear(),
                totalOrders: response.length > 0 ? response[0].totalOrders : 0,
                totalOrdersValue: response.length > 0 ? `${settings?.currency} ${response[0].totalOrdersValue.toFixed(2)}` : `${settings?.currency} 0.00`,
                calledOffOrders: response.length > 0 ? response[0].calledOffOrders : 0,
                calledOffOrdersValue: response.length > 0 ? `${settings?.currency} ${response[0].calledOffOrdersValue.toFixed(2)}` : `${settings?.currency} 0.00`,
                deliveredOrdersValue: response.length > 0 ? `${settings?.currency} ${response[0].deliveredOrdersValue.toFixed(2)}` : `${settings?.currency} 0.00`,
                returnedOrdersValue: response.length > 0 ? `${settings?.currency} ${response[0].returnedOrdersValue.toFixed(2)}` : `${settings?.currency} 0.00`,
                cancelledOrdersValue: response.length > 0 ? `${settings?.currency} ${response[0].cancelledOrdersValue.toFixed(2)}` : `${settings?.currency} 0.00`,
                averageTransactionValue: response.length > 0 ? `${settings?.currency} ${(response[0].totalOrdersValue / response[0].totalOrders).toFixed(2)}` : `${settings?.currency} 0.00`
            })
        }
        helper.deliverResponse(res, 200, salesDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in sales API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}