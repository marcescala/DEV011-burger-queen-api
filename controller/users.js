const bcrypt = require('bcrypt');
const { connect } = require('../connect');
const { ObjectId } = require('mongodb');

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
      resp.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
  },

  getUsersUid: async (req, resp, next) => {
    try {
      const db = connect();
      const user = db.collection('user');

      const  userId = req.params.uid;
      const isObjectId = ObjectId.isValid(userId);
      console.log({userId});

      let query;
      if (isObjectId) {
        query = { _id: new ObjectId(userId) };
      } else  {
        query = { email: userId }
      }

      const userData = await user.findOne(query);
      console.log(userData);

      if (!userData) {
        console.log('el ususario solicitado no existe');
        return resp.status(404).json({ error: 'el ususario solicitado no existe' });
      }
      
      delete userData.password;
      resp.json(userData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al obtener el usuario' });
    }
  },

  postUsers: async (req, resp, next) => {
    const { email, password, role } = req.body;

    const newUser = {
      email,
      password: bcrypt.hashSync(password, 10),
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
      // validar si escribio correo y password
      if (!email || !password) {
        console.log('se necesita un email y un password');
        return resp.status(400).json({ error: 'se necesita un email y un password' });
      }
      // validar si el correo es valido
      const regexEmail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/g;
      if (!regexEmail.test(email)) {
        console.log('debe ser un email válido');
        return resp.status(400).json({ error: 'debe ser un email válido' });
      }
      // validar si existe rol y es alguno de los tres validos
      if (!(role === 'admin' || role === 'waiter' || role === 'chef')) {
        console.log('debe contener un rol válido');
        return resp.status(400).json({ error: 'debe contener un rol válido' });
      }

      await user.insertOne(newUser);
      console.log(newUser);
      delete newUser.password;
      resp.status(200).json({ newUser });

      console.log('Se agrego el usuario con exito');
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al crear un nuevo usuario' });
    }
  },
};
