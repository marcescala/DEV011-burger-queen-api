const bcrypt = require("bcrypt");
const { connect } = require("../connect");
const { ObjectId } = require("mongodb");
const db = connect();
const user = db.collection("user");

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query._limit) || 10;

      const totalUsers = await user.countDocuments();
      const startIndex = (page - 1) * limit;

      const users = await user
        .find({}, { projection: { password: 0 } })
        .skip(startIndex)
        .limit(limit)
        .toArray();
      const consultUsers = {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit: limit,
        users: users, // Incluir la información de los usuarios en la respuesta
      };

      if (limit) {
        resp.status(200).json(Object.values(users));
      } else {
        resp.status(200).json(Object.values(consultUsers));
        // console.log(consultUsers);
      }
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al obtener la lista de usuarios" });
    }
  },

  getUsersUid: async (req, resp, next) => {
    try {
      const userId = req.params.uid;
      const isObjectId = ObjectId.isValid(userId);

      let query;
      if (isObjectId) {
        query = { _id: new ObjectId(userId) };
      } else {
        query = { email: userId };
      }

      const userData = await user.findOne(query);

      if (!userData) {
        return resp
          .status(404)
          .json({ error: "el ususario solicitado no existe" });
      }
      const userDataId = userData._id;

      if (req.userRole !== "admin") {
        if (req.userId !== userDataId.toString()) {
          return resp.status(403).json({ error: "No tienes permiso" });
        }
      }

      delete userData.password;
      resp.json(userData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al obtener el usuario" });
    }
  },

  postUsers: async (req, resp, next) => {
    const { email, password, role } = req.body;

    // validar si escribio correo y password
    if (!email || !password) {
      return resp
        .status(400)
        .json({ error: "se necesita un email y un password" });
    }
    if (password.length < 5) {
      return resp
        .status(400)
        .json({ error: "debe ser un password mínimo de 5 carácteres" });
    }

    const newUser = {
      email,
      password: bcrypt.hashSync(password, 10),
      role,
    };

    try {
      const userExist = await user.findOne({ email });
      if (userExist) {
        return resp.status(403).json({ error: "ya existe el email" });
      }

      // validar si el correo es valido
      const regexEmail = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;
      if (!regexEmail.test(email)) {
        return resp.status(400).json({ error: "debe ser un email válido" });
      }

      // validar si existe rol y es alguno de los tres validos
      // if (!(role === 'admin' || role === 'waiter' || role === 'chef')) {
      //   console.log('debe contener un rol válido');
      //   return resp.status(400).json({ error: 'debe contener un rol válido' });
      // }

      await user.insertOne(newUser);

      delete newUser.password;
      resp.status(200).json(newUser);
      console.log("Se agrego el usuario con exito");
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al ingresar el usuario" });
    }
  },

  putUsers: async (req, resp, next) => {
    try {
      // const db = connect();
      // const user = db.collection("user");

      const userId = req.params.uid;
      const isObjectId = ObjectId.isValid(userId);

      let query;
      if (isObjectId) {
        query = { _id: new ObjectId(userId) };
      } else {
        query = { email: userId };
      }

      const userData = await user.findOne(query);
      // console.log(userData);

      if (!userData) {
        return resp
          .status(404)
          .json({ error: "El usuario solicitado no existe" });
      }

      const userDataId = userData._id;

      // Validar permisos para actualizar
      if (req.userId !== userDataId.toString()) {
        // console.log(req.userId, 'del body');
        // console.log(userDataId,'del token');
        if (req.userRole !== "admin") {
          // console.log(req.userRole, 'en el body');
          return resp
            .status(403)
            .json({ error: "No tienes permiso para actualizar este usuario" });
        }
      }

      const body = req.body;
      // console.log(body.password);
      if (body.hasOwnProperty("password")) {
        const hashedPassword = bcrypt.hashSync(body.password, 10);
        body.password = hashedPassword;
      }
      // console.log(body.password);

      if (!body || Object.keys(body).length === 0) {
        return resp
          .status(400)
          .json({ error: "Debe haber al menos una propiedad para actualizar" });
      }

      if (req.userRole !== "admin" && body.hasOwnProperty("role")) {
        return resp
          .status(403)
          .json({ error: "No tienes permiso para actualizar tu role" });
      }

      const userUpdate = await user.updateOne(query, { $set: body });

      resp.status(200).json(userUpdate);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al actualizar el usuarios" });
    }
  },

  deleteUsers: async (req, resp, next) => {
    try {
      // const db = connect();
      // const user = db.collection("user");

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
      if (!userData) {
        return resp
          .status(404)
          .json({ error: "El usuario solicitado no existe" });
      }

      const userDataId = userData._id;

      if (req.userId !== userDataId.toString()) {
        if (req.userRole !== "admin") {
          // console.log(req.userRole, 'en el body');
          return resp
            .status(403)
            .json({ error: "No tienes permiso para borrar el usuario" });
        }
      }

      // Elimina al usuario
      const userDelete = await user.deleteOne(query);

      resp
        .status(200)
        .json({ userDelete, message: "El usuario ha sido borrado" });
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al borrar el usuarios" });
    }
  },
};
