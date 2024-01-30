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

      let query;
      if (isObjectId) {
        query = { _id: new ObjectId(userId) };
      } else  {
        query = { email: userId }
      }

      const userData = await user.findOne(query);
      
      if (!userData) {
        return resp.status(404).json({ error: 'el ususario solicitado no existe' });
      }
      const userDataId = userData._id;
     
      if (req.userRole !== 'admin') {
        if(req.userId !== userDataId.toString()) {
          return resp.status(403).json({ error: 'No tienes permiso' });
        };
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

     // validar si escribio correo y password
     if (!email || !password) {
      return resp.status(400).json({ error: 'se necesita un email y un password' });
    }
    if (password.length < 5) {
      console.log(password.length);
      return resp.status(400).json({ error: 'debe ser un password mínimo de 5 carácteres' });
    }

    const newUser = {
      email,
      password: bcrypt.hashSync(password, 10),
      role
    };

    try {
      const db = connect();
      const user = db.collection('user');
      // validar si el usuario existe
      const userExist = await user.findOne({ email });
      if (userExist) {
        return resp.status(403).json({ error: 'ya existe el email' });
      }
     
      // validar si el correo es valido
      const regexEmail = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/g;
      if (!regexEmail.test(email)) {
        return resp.status(400).json({ error: 'debe ser un email válido' });
      }

      // validar si existe rol y es alguno de los tres validos
      // if (!(role === 'admin' || role === 'waiter' || role === 'chef')) {
      //   console.log('debe contener un rol válido');
      //   return resp.status(400).json({ error: 'debe contener un rol válido' });
      // }

      await user.insertOne(newUser);
     
      delete newUser.password;
      resp.status(200).json(newUser);
      console.log('Se agrego el usuario con exito');

    } catch (error) {
      return next(500)
    }
  },

  putUsers: async (req, resp, next) => {
    try {
      const db = connect();
      const user = db.collection('user');

      const userId = req.params.uid;
      const isObjectId = ObjectId.isValid(userId);

      let query;
      if (isObjectId) {
        query = { _id: new ObjectId(userId) };
      } else {
        query = { email: userId };
      }

      const userData = await user.findOne(query);
      console.log(userData);

      

      if (!userData) {
        return resp.status(404).json({ error: 'El usuario solicitado no existe' });
      }

      const userDataId = userData._id;

      // Validar permisos para actualizar
      if (req.userId !== userDataId.toString()) {
        console.log(req.userId, 'del body');
        console.log(userDataId,'del token');
        if(req.userRole !== 'admin') {
          console.log(req.userRole, 'en el body');
          return resp.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
        }
      }


      const body = req.body;
      console.log(body.password);
      if (body.hasOwnProperty('password')) {
        const hashedPassword = bcrypt.hashSync(body.password, 10);
        body.password = hashedPassword;
      }
      console.log(body.password);

      if (!body || Object.keys(body).length === 0) {
        return resp.status(400).json({ error: 'Debe haber al menos una propiedad para actualizar' });
      }
      
      if(req.userRole !== 'admin' && body.hasOwnProperty('role') ){
        return resp.status(403).json({ error: 'No tienes permiso para actualizar tu role' });
      }

      const userUpdate = await user.updateOne(query, { $set: body });

      resp.json({ userUpdate, message: 'El usuario ha sido actualizado' });
    } catch (error) {
      console.error(error);
      return next(500);
    }
  },

  deleteUsers: async (req, resp, next) => {
    try {

      const db = connect();
      const user = db.collection('user');

      const userId = req.params.uid;
      const isObjectId = ObjectId.isValid(userId);

      let query;
      if (isObjectId) {
        query = { _id: new ObjectId(userId) };
      } else {
        query = { email: userId };
      }

      // Verifica si se encuentra el usuario antes de eliminarlo
      const userData = await user.findOne(query);
      console.log(userData); // Verifica si userData contiene al usuario correcto
      if(!userData){
        return resp.status(404).json({ error: 'El usuario solicitado no existe' });
      }


      const userDataId = userData._id;

      if (req.userId !== userDataId.toString()) {
        if(req.userRole !== 'admin') {
          console.log(req.userRole, 'en el body');
          return resp.status(403).json({ error: 'No tienes permiso para borrar el usuario' });
        }
      }

    
      

      // Elimina al usuario
      const userDelete = await user.deleteOne(query);

      resp.json({ userDelete, message: 'El usuario ha sido borrado' });
    } catch (error) {
      console.error(error);
      return next(500);
    }


  },
};
  

