const axios = require('axios');

/**
 * Create shipment using the PostShipping API
 * @param {Array} shipmentPayload - The shipping request payload array
 * @returns {Promise} - Returns the shipping creation response
 */
async function createShipment(shipmentPayload) {
    const API_URL = 'https://api.postshipping.com/api2/shipments';
    
    try {
        // Convert single object to array if needed
        const payload = Array.isArray(shipmentPayload) ? shipmentPayload : [shipmentPayload];
        
        // Input validation
        for (const shipment of payload) {
            validateShipmentPayload(shipment);
        }

        const response = await axios({
            method: 'POST',
            url: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Token': 'E06FF0B12EB2B9405103758DE5D0C0DF'
            },
            data: payload
        });

        return {
            success: true,
            data: response.data
        };
        
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Validates the shipment payload structure
 * @param {Object} shipment - Single shipment object to validate
 * @throws {Error} - Throws error if validation fails
 */
function validateShipmentPayload(shipment) {
    const requiredDetails = ['SenderDetails', 'ReceiverDetails', 'PackageDetails', 'PickupDetails'];
    
    for (const detail of requiredDetails) {
        if (!shipment[detail] || typeof shipment[detail] !== 'object') {
            throw new Error(`Missing or invalid ${detail} in shipment payload`);
        }
    }

    // Validate required nested fields
    const requiredFields = {
        SenderDetails: ['SenderName', 'SenderCountryCode', 'SenderAdd1', 'SenderAddPostcode'],
        ReceiverDetails: ['ReceiverName', 'ReceiverCountryCode', 'ReceiverAdd1', 'ReceiverAddPostcode'],
        PackageDetails: ['GoodsDescription', 'CustomValue', 'CustomCurrencyCode'],
        PickupDetails: ['ReadyTime', 'CloseTime', 'AddressPostalCode', 'AddressCountryCode']
    };

    for (const [section, fields] of Object.entries(requiredFields)) {
        for (const field of fields) {
            if (!shipment[section][field]) {
                throw new Error(`Missing required field ${field} in ${section}`);
            }
        }
    }
}
   

function handleApiError(error) {
    if (error.response) {
        return {
            success: false,
            error: `API Error: ${error.response.status}`,
            details: error.response.data
        };
    } else if (error.request) {
        return {
            success: false,
            error: 'No response received from server',
            details: error.request
        };
    } else {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
}

/**
 * Handler function to process shipment creation
 * @param {Array|Object} payload - The shipment payload (array or single object)
 * @returns {Promise} - Returns the processed result
 */
async function handleShipmentCreation(payload) {
    try {
        const result = await createShipment(payload);
        if (result.success) {
            console.log('Shipment created successfully:', result.data);
            return {
                success: true,
                data: result.data
            };
        } else {
            console.error('Failed to create shipment:', result.error);
            return {
                success: false,
                error: result.error,
                details: result.details
            };
        }
    } catch (error) {
        console.error('Error in shipment creation handler:', error);
        return {
            success: false,
            error: 'Internal server error',
            details: error.message
        };
    }
}

module.exports = {
    createShipment,
    handleShipmentCreation
};