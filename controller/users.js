const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const db = connect();
      const user = db.collection('user');

      // Obtener todos los usuarios de la colección
      const users = await user.find({}, { projection: { password: 0 } }).toArray();
      // console.log(users);
      resp.json(users);

    // TODO: Implement the necessary function to fetch the `users` collection or table
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  postUsers: async (req, resp, next) => {
    try {
      const db = connect();
      const user = db.collection('user');
      console.log('aqui vamos', user);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};
