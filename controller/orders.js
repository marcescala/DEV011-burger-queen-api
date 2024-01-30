const bcrypt = require('bcrypt');
const { connect } = require('../connect');

module.exports = {
    getOrders: async (req, resp, next) => {
      try {
        const db = connect();
        const order = db.collection('order');
  
        // Obtener todos los usuarios de la colección
        const orders = await order.find({}, { projection: { password: 0 } }).toArray();
        
        resp.json(orders);
  
      // TODO: Implement the necessary function to fetch the `users` collection or table
      } catch (error) {
        console.error(error);
        resp.status(500).json({ error: 'Error al obtener la lista de ordenes' });
      }
    },
}