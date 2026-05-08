/**
 * Run this ONCE on your server to create performance indexes.
 * Usage: node util/createIndexes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const dbUser = process.env.MONGODB_DATABASE_ADMIN_USER;
const dbPassword = process.env.MONGODB_DATABASE_ADMIN_PASSWORD;
const dbHost = process.env.MONGODB_HOST || 'localhost';
const dbPort = process.env.MONGODB_PORT || '27017';
const dbName = process.env.MONGODB_DATABASE || 'admin';

let connectionString = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
if (process.env.ENV == 'DEV') {
  connectionString = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
}

async function createIndexes() {
  await mongoose.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true, family: 4 });
  console.log('Connected. Creating indexes...');

  const db = mongoose.connection.db;

  // Products collection - most critical
  await db.collection('products').createIndex({ isActive: 1, isDelete: 1, isVisible: 1 });
  await db.collection('products').createIndex({ category: 1, isActive: 1, isDelete: 1 });
  await db.collection('products').createIndex({ slug: 1 }, { unique: true });
  await db.collection('products').createIndex({ parentId: 1, isActive: 1, isDelete: 1 });
  await db.collection('products').createIndex({ 'price.selling': 1 });
  await db.collection('products').createIndex({ name: 'text', sku: 'text' }); // text search
  await db.collection('products').createIndex({ createdAt: -1 });
  console.log('✅ Products indexes created');

  // Categories collection
  await db.collection('categories').createIndex({ slug: 1 });
  await db.collection('categories').createIndex({ isActive: 1, isDelete: 1 });
  await db.collection('categories').createIndex({ isDelete: 1, isActive: 1 });
  console.log('✅ Categories indexes created');

  // Collections collection
  await db.collection('collections').createIndex({ slug: 1 });
  await db.collection('collections').createIndex({ isActive: 1, isDelete: 1 });
  console.log('✅ Collections indexes created');

  // Guests collection
  await db.collection('guests').createIndex({ deviceToken: 1, isDelete: 1 });
  console.log('✅ Guests indexes created');

  // General settings
  await db.collection('generals').createIndex({ refid: 1 });
  console.log('✅ General settings indexes created');

  // Orders
  await db.collection('orders').createIndex({ createdAt: -1 });
  await db.collection('orders').createIndex({ userid: 1, isDelete: 1 });
  console.log('✅ Orders indexes created');

  await mongoose.disconnect();
  console.log('\n✅ All indexes created successfully!');
}

createIndexes().catch(err => {
  console.error('Index creation failed:', err);
  process.exit(1);
});
