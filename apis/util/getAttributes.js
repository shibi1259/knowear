const productService = require("../app/services/product.service");
const ObjectId = require('mongoose').Types.ObjectId;

exports.getAttributes = async (parentId) => {
    const products = await productService.aggregate([
        {
            '$match': {
                'parentId': new ObjectId(parentId),
                'isActive': true,
                'isDelete': false
            }
        }, {
            '$unwind': '$attributes'
        }, {
            '$match': {
                'attributes.title': { '$ne': '' },
                'attributes.value': { '$ne': '' }
            }
        }, {
            '$group': {
                '_id': '$attributes.title',  // Group by attribute title
                'values': { '$addToSet': '$attributes.value' } // Collect unique values for each title
            }
        },
        {
            '$project': {
                '_id': 0, // Exclude the _id field from the final output
                'title': '$_id', // Rename _id to title
                // 'values': 1 // Include the values field
                'values': { '$sortArray': { 'input': '$values', 'sortBy': 1 } } // Sort alphabetically by attribute value
            }
        }
    ]);

    return products;
}
