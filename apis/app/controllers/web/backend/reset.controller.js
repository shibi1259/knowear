const mongoose = require("mongoose");

exports.dropProducts = async (req, res) => {
    const { servertoken } = req.headers;

    if (servertoken != process.env.SERVER_TOKEN) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(collection => collection.name === 'products' || collection.name === 'products.heads');
    if (!collectionExists) return res.status(404).json({ message: `Collection does not exist.` });
    await mongoose.connection.db.dropCollection("products");
    await mongoose.connection.db.dropCollection("products.heads");
    res.status(200).send("Product collections dropped successfully");
}

exports.dropUsers = async (req, res) => {
    const { servertoken } = req.headers;

    if (servertoken != process.env.SERVER_TOKEN) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(collection => collection.name === 'customers');
    if (!collectionExists) return res.status(404).json({ message: `Collection does not exist.` });
    await mongoose.connection.db.dropCollection("customers");
    res.status(200).send("Customers collections dropped successfully");
}

exports.dropOrders = async (req, res) => {
    const { servertoken } = req.headers;

    if (servertoken != process.env.SERVER_TOKEN) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(collection => collection.name === 'orders');
    if (!collectionExists) return res.status(404).json({ message: `Collection does not exist.` });
    await mongoose.connection.db.dropCollection("orders");
    res.status(200).send("Orders collections dropped successfully");
}