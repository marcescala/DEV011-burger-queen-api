const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const db = connect();
      const collection = db.collection('user');

      // Obtener todos los usuarios de la colección
      const users = await collection.find();
      console.log(users);

      resp.json(users);
    // TODO: Implement the necessary function to fetch the `users` collection or table
    } catch (error) {
      console.error(error);
      next(500).json({ mensaje: 'Error al obtener usuarios' });
    }
    // next();
  },
};
