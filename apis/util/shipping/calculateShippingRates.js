const axios = require('axios');


exports.calculateShippingRates=async(payload)=> {
    try {
        // Validate required fields
        // const requiredFields = [
        //     'DepartureCountryCode',
        //     'DeparturePostcode',
        //     'ArrivalCountryCode',
        //     'ArrivalPostcode',
        //     'WeightMeasure',
        //     'Weight',
        //     'PaymentCurrencyCode'
        // ];
   
        // for (const field of requiredFields) {
        //     if (!payload[field]) {
        //         throw new Error(`Missing required field: ${field}`);
        //     }
        // }
        
        // Validate items if present
        if (payload.Items) {
            payload.Items.forEach((item, index) => {
                const requiredItemFields = ['Weight', 'Length', 'Width', 'Height'];
                for (const field of requiredItemFields) {
                    if (!item[field]) {
                        throw new Error(`Missing required field in item ${index + 1}: ${field}`);
                    }
                }
            });
        }
    
        // Set default values
        payload.NumofItem = payload.NumofItem || 1;
        
        // Make API request
        const response = await axios({
            method: 'POST',
            url: 'https://api.postshipping.com/api2/rates',
            headers: {
                'Content-Type': 'application/json',
                //    You should store this in environment variables
                'Token': 'E06FF0B12EB2B9405103758DE5D0C0DF'
            },
            data: payload
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            // API error response
            throw new Error(`API Error: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
            // Network error
            throw new Error('Network error occurred while fetching shipping rates');
        } else {
            // Validation or other errors
            throw error;
        }
    }
}