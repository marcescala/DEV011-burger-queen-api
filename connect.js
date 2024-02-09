const { MongoClient } = require('mongodb');
const config = require('./config');

// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;
const options = {
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  serverSelectionTimeoutMS: 3000,
};
const client = new MongoClient(config.dbUrl, options);

 function connect() {
  try {
   // await client.connect();
    const db = client.db('burger_queen'); // Reemplaza <NOMBRE_DB> por el nombre del db
    console.log('DB conectada');
    return db;
  } catch (error) {
    console.error(error);
    //
  }
}

module.exports = { connect };
