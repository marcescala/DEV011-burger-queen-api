const bcrypt = require('bcrypt');
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
    const { email, password, role } = req.body;

    const newUser = {
      email,
      password,
      role,
    };

    try {
      const db = connect();
      const user = db.collection('user');
      // validar si el usuario existe
      const userExist = await user.findOne({ email });
      if (userExist) {
        console.log('ya existe el email');
        return resp.status(403).json({ error: 'ya existe el email' });
      }
      if (!email || !password) {
        console.log('se necesita un email y un password');
        return resp.status(400).json({ error: 'se necesita un email y un password' });
      }

      await user.insertOne(newUser);
      delete newUser.password;
      resp.status(200).json({ newUser });

      console.log('Se agrego el usuario con exito');
    } catch (error) {
      console.error(error);
      next(500);
    }
  },
};
