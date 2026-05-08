const axios = require('axios');
const db = require("../app/db/index");
const moment = require('moment/moment');

const STATUS_MAPPING = {
  // 1: 'DELIVERED',
  // 2: 'SHIPPED',
  // // 3: 'IN TRANSIT',
  // // 4: 'COLLECTED',
  // // 5: 'PENDING',
  // 8: 'ON HOLD',
  // 9: 'ON HOLD',
  // 10: 'ON HOLD',
  // 11: 'FAILED',
  // // 14: 'OUT FOR DELIVERY',
  // 15: 'OUT FOR DELIVERY',
  // 16: 'FAILED',
  // 17: 'FAILED',
  // 18: 'FAILED',
  // 20: 'ON HOLD',
  // // 21: 'COLLECTED',
  // // 37: 'SHIPPED',
  // 39: 'RETURNED',
  // 43: 'FAILED',
  // 44: 'FAILED',
  // 45: 'RETURNED',
  // 46: 'FAILED',
  // 51: 'FAILED',
  // 52: 'ON HOLD',
  // 53: 'FAILED',
  // 56: 'RETURNED',
  // 58: 'ON HOLD',
  // 60: 'ON HOLD',
  // 62: 'ON HOLD',
  // 63: 'ON HOLD',
  // 64: 'ON HOLD',
  // 65: 'ON HOLD',
  // 66: 'PLACED',
  // 74: 'FAILED',
  // 80: 'FAILED',
  // 81: 'ON HOLD',
  // 82: 'FAILED',
  // 83: 'ON HOLD',
  // 85: 'ON HOLD',
  // 87: 'RETURNED',
  // 90: 'PACKED',
  // 91: 'SHIPPED',
  // 97: 'FAILED',
  // 98: 'FAILED',
  // 100: 'FAILED',
  // 104: 'FAILED',
  // 106: 'ON HOLD',
  // 107: 'ON HOLD',
  // 120: 'ON HOLD',
  // 129: 'FAILED',
  // 130: 'FAILED',
  // 131: 'FAILED',
  // 132: 'FAILED',
  // 133: 'FAILED',
  // 134: 'FAILED',
  // 136: 'ON HOLD',
  // 142: 'FAILED',
  // 143: 'FAILED',
  // 144: 'FAILED',
  // 145: 'ON HOLD',
  // 160: 'FAILED',
  // // 161: 'PARTIAL PROCESSED',
  // 247: 'ON HOLD',
  // 262: 'OUT FOR DELIVERY',
  // 289: 'FAILED',
  // 291: 'FAILED',
  // 295: 'FAILED',
  // // 351: 'SHIPPED',
  // 411: 'PACKED'
  1: 'DELIVERED',
  2: 'SHIPPED',
  411:'PICKUP',
  15:'OUT FOR DELIVERY',
  16:'ATTEMPTED DELIVERY',
  18:'ATTEMPTED DELIVERY',
  43:'ATTEMPTED DELIVERY',
  44:'ATTEMPTED DELIVERY',
  60:'ATTEMPTED DELIVERY',
  85:'ATTEMPTED DELIVERY',
  106:'ATTEMPTED DELIVERY',
  107:'ATTEMPTED DELIVERY',
  39:'ORDER REJECTED',
  56:'ORDER RETURNED',

  // 56:
  
};

class PostShippingService {
  constructor() {
    this.baseUrl = 'https://api.postshipping.com/api2';
    this.apiKey = 'E06FF0B12EB2B9405103758DE5D0C0DF'; // Make sure to set this in your env
  }

  async calculateRates(orderProduct, order,state,countryCode) {
    let payload={}
    const totalWeight = orderProduct.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const totalCustomAmount = orderProduct.reduce((sum, item) => sum + item.total, 0);
    try {
       payload = {
        DepartureCountryCode: "AE", // Since you're in UAE (based on country code +971)
        DeparturePostcode: "",
        DepartureLocation: process.env.WAREHOUSE_LOCATION ||"Dubai",
        ArrivalCountryCode:countryCode|| "AE",
        ArrivalPostcode: "",
        ArrivalLocation: state||"Dubai",
        PaymentCurrencyCode: "AED", // Assuming UAE Dirham
        WeightMeasure: "G",
        Weight: totalWeight || 500, // You might need to add weight to your product schema
        NumofItem: orderProduct?.length?.toString(),
        ServiceType:countryCode==="AE"?"EDO":"EN",
        DimensionUnit: "CM",
        CustomCurrencyCode: "AED",
        CustomAmount: totalCustomAmount,
        Items: orderProduct
      };    
      const response = await axios.post(`${this.baseUrl}/rates`, payload, {
        headers: {
          'Token': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("calucate rates payload",JSON.stringify(payload))
      const logEntry = {
        apiType: 'rates',
        request: payload,
        response: response.data,
        status: response.status === 200 ? 'success' : 'failed',
        createdAt: new Date()
      };
      setImmediate(async()=>{
            await db.ShippingGatewayLogs.create({
                  status: 'success' ,
                  type: "request", 
                  shipmentType: "rates",
                  request: payload,
                  response:logEntry|| {},
                  referenceKey:  response.data?.PricingResponseDetails?.[0]?.AccountCode,// payment gateway reference for admin to use . 
                  amount : orderProduct.total||"NA",
            })
          })
      return {
        data: response.data,
        log: logEntry,
        shippingAmount:response?.data?.PricingResponseDetails?.[0]?.TotalAmount
      };

    } catch (error) {
      console.error('Error calculating shipping rates:', error);
      setImmediate(async()=>{
        await db.ShippingGatewayLogs.create({
              status: 'failed' ,
              type: "request", 
              shipmentType: "rates",
              request: payload,
              response:error?.response?.data||{},
              referenceKey:  "NA",// payment gateway reference for admin to use . 
              amount :"NA",
        })
      })
      throw error;
    }
  }

  async createShipment(orderProduct, order) {
    let payload = {};

    

    try {
       payload = [{
        ThirdPartyToken: "",
        SenderDetails: {
          SenderName: process.env.WAREHOUSE_SENDER_NAME ||"Knowear",
          SenderCompanyName: process.env.COMPANY_NAME||"Knowear",
          SenderCountryCode: "AE",
          SenderAdd1: process.env.WAREHOUSE_ADDRESS_1||"The Light Commercial Tower, 16, 5 street",
          SenderAdd2: process.env.WAREHOUSE_ADDRESS_2||"3 Hadaeq Mohammed Bin Rashid - Arjan - Al Barsha South",
          SenderAdd3:process.env.WAREHOUSE_ADDRESS_2||"DUBAI",
          SenderAddPostcode: process.env.WAREHOUSE_POSTCODE||"0",
          SenderPhone: process.env.WAREHOUSE_PHONE||"+9711529725961",
          SenderEmail: process.env.WAREHOUSE_EMAIL || "info@knowear.me"
        },
        ReceiverDetails: {
          ReceiverName: `${order.address.firstname} ${order.address.lastname}`,
          ReceiverCompanyName: order.address.companyName || "",
          ReceiverCountryCode: order.address.country,
          ReceiverAdd1: order.address.additionalAddress,
          ReceiverAdd2: order.address.deliveryAddress || "",
          // ReceiverAdd3: order.address.areanumber || "",
          ReceiverAddCity: order.address.city,
          ReceiverAddState: order.address.state,
          ReceiverAddPostcode: "",
          ReceiverPhone: order.address.mobile,
          ReceiverEmail: order.customerId ? order.customerId.email : "", // You'll need to populate this
        },
        PackageDetails: {
          GoodsDescription: orderProduct.productId.name, // You'll need to populate product details
          CustomValue: orderProduct.total,
          CustomCurrencyCode: "AED",
          DeliveryInstructions:order.shippingnotes || "",
          SenderRef1: "test shipment",
          Weight: orderProduct.weight || 500,
          WeightMeasurement: "G",
          NoOfItems: orderProduct.quantity,
          ServiceTypeName:order.address.country!=="AE"?"EN":"EDO",
          BusinessType: "B2C",
          ShipmentResponseItem: [{
            ItemNoOfPcs: orderProduct.quantity,
            ItemWeight: orderProduct.weight || 500,
            ItemDescription: orderProduct.productId.name,
            ItemCustomValue: order.wholeTotal,
            ItemCustomCurrencyCode: "AED",
            Pieces: [{
              GoodsDescription: orderProduct.productId.name,
              Quantity: orderProduct.quantity,
              Weight: orderProduct.weight || 500,
              CurrencyCode: "AED",
              CustomsValue: orderProduct.total
            }]
          }],
          ...(order?.paymentMethod === 'COD' && {
            CODAmount: order.wholeTotal,
            CODCurrencyCode: "AED"
          }),
          // OrderNumber:order.orderNo,
          Notes: order.shippingnotes || ""
        }
      }];
      console.log(JSON.stringify(payload,"payload"))
           const response = await axios.post(`${this.baseUrl}/shipments`, payload, {
        headers: {
          'Token': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const logEntry = {
        apiType: 'shipments',
        request: payload,
        response: response.data,
        status: response.status === 200 ? 'success' : 'failed',
        createdAt: new Date()
      };

      setImmediate(async()=>{
        await db.ShippingGatewayLogs.create({
              status: 'success' ,
              type: "request", 
              shipmentType: "shipping",
              request: payload,
              response:logEntry|| {},
              referenceKey:  response.data[0]?.ShipmentNumber,// payment gateway reference for admin to use . 
              amount : orderProduct.total||"NA",
        })
      })

      return {
        data: response.data,
        shipmentNumber: response.data[0]?.ShipmentNumber, // Assuming this is the field from Post Shipping response
        log: logEntry
      };
    } catch (error) {
      console.error('Error creating shipment:', error);
      setImmediate(async()=>{
        await db.ShippingGatewayLogs.create({
              status: 'failed' ,
              type: "request", 
              shipmentType: "shipping",
              request: payload,
              response:error?.response?.data||{},
              referenceKey:  "NA",// payment gateway reference for admin to use . 
              amount :"NA",
        })
      })
      throw error;
    }
  }


  async createBulkShipment(orderProduct, order) {
    let payload = {};
    
    const totalPrice = orderProduct.reduce((sum, item) => sum + item.ItemCustomValue, 0);
    const totalWeight = orderProduct.reduce((sum, item) => sum + (item.ItemWeight * item.ItemNoOfPcs), 0);
    let shipmentVariable = orderProduct?.map((product) => product?.GoodsDescription).join(", ");
    // console.log("shipmentVariable",orderProduct)
    try {
       payload = [{
        ThirdPartyToken: "",
        SenderDetails: {
          SenderName: process.env.WAREHOUSE_SENDER_NAME ||"Knowear",
          SenderCompanyName: process.env.COMPANY_NAME||"Knowear",
          SenderCountryCode: "AE",
          SenderAdd1: process.env.WAREHOUSE_ADDRESS_1||"The Light Commercial Tower, 16, 5 street",
          SenderAdd2: process.env.WAREHOUSE_ADDRESS_2||"3 Hadaeq Mohammed Bin Rashid - Arjan - Al Barsha South",
          SenderAdd3:process.env.WAREHOUSE_ADDRESS_2||"DUBAI",
          SenderAddCity: "Dubai",
         SenderAddState: "Dubai",

          SenderAddPostcode: process.env.WAREHOUSE_POSTCODE||"0",
          SenderPhone: process.env.WAREHOUSE_PHONE||"+9711529725961",
          SenderEmail: process.env.WAREHOUSE_EMAIL || "info@knowear.me"
        },
        ReceiverDetails: {
          ReceiverName: `${order.address.firstname} ${order.address.lastname}`,
          ReceiverCompanyName: order.address.companyName || "",
          ReceiverCountryCode: order.address.country || "",
          ReceiverAdd1: order.address.additionalAddress,
          ReceiverAdd2: order.address.deliveryAddress || "",
          // ReceiverAdd3: order.address.state  || "erere",
          // ReceiverAddCity: order.address.city,
          ReceiverAddState: order.address.state || "",
          ReceiverAddPostcode: "",
          ReceiverPhone: order.address.mobile,
          ReceiverMobile: order.address.mobile,
          ReceiverEmail: order.customerId ? order.customerId.email : "", // You'll need to populate this
        },
        PackageDetails: {
          GoodsDescription: shipmentVariable ||"Knowear", // You'll need to populate product details
          CustomValue: order.wholeTotal,
          CustomCurrencyCode: "AED",
          DeliveryInstructions:order.shippingnotes || "",
          SenderRef1: "test shipment",
          Weight: totalWeight || 500,
          WeightMeasurement: "G",
          NoOfItems: 1,
          CubicL:0 ,

          CubicW: 0,
    
          CubicH: 0,
    
          CubicWeight :0,
    
          DeadWeight: 0,
    
          ServiceTypeName: "EDO",
    
          BusinessType: "B2C",
    
          oodsOriginCountryCode:"AE",
          ServiceTypeName:order.address.country!=="AE"?"EN":"EDO",
          BusinessType: "B2C",
          ShipmentResponseItem: [{
            ItemNoOfPcs: orderProduct.reduce((sum, item) => sum + item.ItemNoOfPcs || 1, 0), // Default to 1 if not provided
            ItemWeight: orderProduct.reduce((sum, item) => sum + (item.ItemWeight * item.ItemNoOfPcs || 0), 0),
            ItemDescription: shipmentVariable || "Knowear",
            ItemCustomValue: order.wholeTotal,
            ItemCustomCurrencyCode: "AED",
            // Mandatory fields only below
            ItemCubicL: 10, // Replace with actual cubic length in cm (mandatory)
            ItemCubicW: 10, // Replace with actual cubic width in cm (mandatory)
            ItemCubicH: 10, // Replace with actual cubic height in cm (mandatory)
            ItemCubicWeight: orderProduct.reduce((sum, item) => sum + (item.ItemWeight * item.ItemNoOfPcs || 0), 0),
            Notes: "Shipment item", // Mandatory (minimal placeholder text)
            ItemDeadWeight: orderProduct.reduce((sum, item) => sum + (item.ItemWeight * item.ItemNoOfPcs || 0), 0),
            ItemGoodsOriginCountryCode: "AE", // Replace with actual ISO Alpha-2 country code
            Pieces: orderProduct
          }],
          ...(order?.paymentMethod === 'COD' && {
            CODAmount: order.wholeTotal,
            CODCurrencyCode: "AED"
          }),
          PickupDetails: {

      ReadyTim: "",

      CloseTime: "",

      SpecialInstructions: "",

      Address1: "The Light Commercial Tower, 16, 5 street",

      Address2: "3 Hadaeq Mohammed Bin Rashid - Arjan - Al Barsha South",

      Address3: "",

      AddressState: "Dubai",

      AddressCity: "Dubai",

      AddressPostalCode: "0",

      AddressCountryCode: "AE"

    },
          OrderNumber:order.orderNo,
          Notes: order.address.deliveryInstruction || ""
         
        },
      
      }];
      
 console.log(JSON.stringify(payload,"payload"))
      const response = await axios.post(`${this.baseUrl}/shipments`, payload, {
        headers: {
          'Token': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });  

      const logEntry = {
        apiType: 'shipments',
        request: payload,
        response: response.data,
        status: response.status === 200 ? 'success' : 'failed',
        createdAt: new Date()
      };

      setImmediate(async()=>{
        await db.ShippingGatewayLogs.create({
              status: 'success' ,
              type: "request", 
              shipmentType: "shipping",
              request: payload,
              response:logEntry|| {},
              referenceKey:  response.data[0]?.ShipmentNumber,// payment gateway reference for admin to use . 
              amount : orderProduct.total||"NA",
        })
      })

      return {
        data: response.data,
        shipmentNumber: response.data[0]?.ShipmentNumber, // Assuming this is the field from Post Shipping response
        log: logEntry
      };
    } catch (error) {
      console.error('Error creating shipment:', error);
      setImmediate(async()=>{
        await db.ShippingGatewayLogs.create({
              status: 'failed' ,
              type: "request", 
              shipmentType: "shipping",
              request: payload,
              response:error?.response?.data||{},
              referenceKey:  "NA",// payment gateway reference for admin to use . 
              amount :"NA",
        })
      })
      throw error;
    }
  }


//   async getTrackingDetails(shipmentNumber) {
//     try {
//         const url = `${this.baseUrl}/tracks?ReferenceNumber=${shipmentNumber}`;
//         const response = await axios.get(url, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Token': `${this.apiKey}`
//             }
//         });
//         await db.ShippingGatewayLogs.create({
//           status: 'success' ,
//           type: "request", 
//           shipmentType: "tracks",
//           request: {shipmentNumber:shipmentNumber},
//           response:response?.data||{},
//           referenceKey: shipmentNumber|| "NA",// payment gateway reference for admin to use . 
//           amount :"NA",
//     })

//         if (response.data?.TrackingDetail?.length > 0) {
//             const latestTracking = response.data.TrackingDetail.pop(); // Get the latest tracking event
//             return {
//                 trackingStatus: STATUS_MAPPING[latestTracking.TrackingEventCode] || 'SHIPPED',
//                 trackingDate: latestTracking.TrackingUTCDate,
//               };
      
//         }

//         return null;  // No tracking data found
//     } catch (error) {
//         console.error("Error fetching tracking details:", error);
//         setImmediate(async()=>{
//           await db.ShippingGatewayLogs.create({
//                 status: 'failed' ,
//                 type: "request", 
//                 shipmentType: "tracks",
//                 request: {shipmentNumber:shipmentNumber},
//                 response:error?.response?.data||{},
//                 referenceKey:  "NA",// payment gateway reference for admin to use . 
//                 amount :"NA",
//           })
//         })
//         return null;
//     }
// }
// async getTrackingDetails(shipmentNumber) {
//   try {
//     //  const url = `${this.baseUrl}/tracks?ReferenceNumber=${shipmentNumber}`;
//        const url = 'https://api.postshipping.com/api2/tracks?ReferenceNumber=022294857362';
      
//       const response = await axios.get(url, {
//           headers: {
//               'Content-Type': 'application/json',
//               'Token': `${this.apiKey}`
//           }
//       });
      
//       await db.ShippingGatewayLogs.create({
//           status: 'success',
//           type: "request",
//           shipmentType: "tracks",
//           request: {shipmentNumber: shipmentNumber},
//           response: response?.data || {},
//           referenceKey: shipmentNumber || "NA", // payment gateway reference for admin to use
//           amount: "NA",
//       });
      
//       console.log("TrackingDetail:", JSON.stringify(response.data?.TrackingDetail));
      
//       if (response.data?.TrackingDetail?.length > 0) {
//           // Process tracking events - keep only the latest occurrence of each event code
//           const eventMap = new Map();
          
//           // Loop through events and keep only the latest for each event code
//           for (const event of response.data.TrackingDetail) {
//               const eventCode = event.TrackingEventCode;
//               const currentDate = new Date(event.TrackingUTCDate);
              
//               if (!eventMap.has(eventCode) || new Date(eventMap.get(eventCode).TrackingUTCDate) < currentDate) {
//                   eventMap.set(eventCode, event);
//               }
//           }
          
//           // Convert map back to array and map to our desired format
//           const latestEvents = Array.from(eventMap.values()).map(event => ({
//               trackingStatus: STATUS_MAPPING[event.TrackingEventCode],
//               trackingDate: event.TrackingUTCDate,
//               trackingEventCode: event.TrackingEventCode,
//               trackingDescription: event.TrackingDescription
//           }));
          
//           return latestEvents;
//       }
      
//       return null; // No tracking data found
//   } catch (error) {
//       console.error("Error fetching tracking details:", error);
//       setImmediate(async() => {
//           await db.ShippingGatewayLogs.create({
//               status: 'failed',
//               type: "request",
//               shipmentType: "tracks",
//               request: {shipmentNumber: shipmentNumber},
//               response: error?.response?.data || {},
//               referenceKey: "NA", // payment gateway reference for admin to use
//               amount: "NA",
//           });
//       });
//       return null;
//   }
// }
async getTrackingDetails(shipmentNumber) {
  try {
    const url = `${this.baseUrl}/tracks?ReferenceNumber=${shipmentNumber}`;
    // const url = 'https://api.postshipping.com/api2/tracks?ReferenceNumber=022294886272';

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Token': `${this.apiKey}`
      }
    });

    // Save success log
    await db.ShippingGatewayLogs.create({
      status: 'success',
      type: "request",
      shipmentType: "tracks",
      request: { shipmentNumber },
      response: response?.data || {},
      referenceKey: shipmentNumber || "NA",
      amount: "NA",
    });

    const trackingDetails = response.data?.TrackingDetail || [];

    if (trackingDetails.length > 0) {
      const eventMap = new Map();

      // Keep latest event per event code
      for (const event of trackingDetails) {
        const eventCode = event.TrackingEventCode;
        const currentDate = new Date(event.TrackingUTCDate);

        // Skip if event code not in STATUS_MAPPING
        if (!STATUS_MAPPING[eventCode]) continue;

        const existingEvent = eventMap.get(eventCode);
        if (!existingEvent || new Date(existingEvent.TrackingUTCDate) < currentDate) {
          eventMap.set(eventCode, event);
        }
      }

      // Map to desired format
      const latestEvents = Array.from(eventMap.values()).map(event => ({
        trackingStatus: STATUS_MAPPING[event.TrackingEventCode],
        trackingDate: event.TrackingUTCDate,
        trackingEventCode: event.TrackingEventCode,
        // trackingDescription: event.TrackingEventName,
        trackingEventName: event.TrackingEventName,
      }));
     
      return latestEvents.length > 0 ? latestEvents : null;
    }

    return null;

  } catch (error) {
    console.error("Error fetching tracking details:", error);
    setImmediate(async () => {
      await db.ShippingGatewayLogs.create({
        status: 'failed',
        type: "request",
        shipmentType: "tracks",
        request: { shipmentNumber },
        response: error?.response?.data || {},
        referenceKey: "NA",
        amount: "NA",
      });
    });
    return null;
  }
}

async requestPickup(orderNumbers){
  try {
    const url = `${this.baseUrl}/pickup`;
    const collectionDate = moment().format("YYYY-MM-DD");

    const payload={
      "ThirdPartyToken": "",
      "CompanyName": process.env.WAREHOUSE_SENDER_NAME ||"Knowear",
      "ContactName": process.env.WAREHOUSE_SENDER_NAME ||"Knowear",
      "ContactNumber":  process.env.WAREHOUSE_PHONE||"+9711529725961",
      "Email": process.env.WAREHOUSE_EMAIL || "info@knowear.me",
      "CarrierCode": "",
      "CollectionDate": collectionDate,
      "ReadyTime": {
        "StartTime": "09:00",
        "EndTime": "18:00"
      },
      "PickupAddress": {
        "Address1": process.env.WAREHOUSE_ADDRESS_1||"The Light Commercial Tower, 16, 5 street",
        "Address2": process.env.WAREHOUSE_ADDRESS_2||"3 Hadaeq Mohammed Bin Rashid - Arjan - Al Barsha South",
        "Address3": process.env.WAREHOUSE_ADDRESS_2||"Dubai",
        "AddressState": "Dubai",
        "AddressCity": "Dubai",
        "AddressPostalCode": "0",
        "AddressCountryCode": "AE"
      },
      "ReferenceNumbers": orderNumbers||[],
      "SpecialInstruction": "fragile shipment. please take care.",
      "ServiceType": "DOME",
      "GoodsDescription": "Knoweat",
      "NoofItems": 1,
      "Weight": 3,
      "WeightMeasure": "G",
      "CubicLength":0,
      "CubicWidth":0,
      "CubicHeight":0,
      "CubicWeight":0,
      "CubicWeightMeasure":"G",
      "CubicDimensionMeasure":"cm",
      "SenderRef1": "test shipment",
      "SenderRef2": "",
      "SenderRef3": "",
      "RequestVehicle": "",
      "CashValue": 0
    }
    console.log(payload,"payload")
    const response = await axios.post(url,payload, {
        headers: {
            'Content-Type': 'application/json',
            'Token': `${this.apiKey}`
        }
    });
    await db.ShippingGatewayLogs.create({
      status: 'success' ,
      type: "request", 
      shipmentType: "pickup",
      request: payload,
      response:response?.data||{},
      referenceKey: "NA",// payment gateway reference for admin to use . 
      amount :"NA",
})

    // if (response.data?.TrackingDetail?.length > 0) {
    //     const latestTracking = response.data.TrackingDetail.pop(); // Get the latest tracking event
    //     return {
    //         trackingStatus: STATUS_MAPPING[latestTracking.TrackingEventCode] || 'SHIPPED',
    //         trackingDate: latestTracking.TrackingUTCDate,
    //       };
  
    // }

    return response;  // No tracking data found
} catch (error) {
    console.error("Error fetching tracking details:", error);
    setImmediate(async()=>{
      await db.ShippingGatewayLogs.create({
            status: 'failed' ,
            type: "request", 
            shipmentType: "pickup",
            response:error||{},
            referenceKey:  "NA",// payment gateway reference for admin to use . 
            amount :"NA",
      })
    })
    return null;
}
}

}

module.exports = new PostShippingService();
