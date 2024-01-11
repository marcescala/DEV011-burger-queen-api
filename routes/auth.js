const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const { connect } = require('../connect');

const { secret } = config;

module.exports = (app, nextMain) => {
  app.post('/login', async (req, resp, next) => {
    const { email, password } = req.body;

    try {
      const db = await connect();
      const collection = db.collection('user');

      const userValid = await collection.findOne({ email });
      if (!userValid) {
        return next(401);
      }
      const authPassword = await bcrypt.compare(password, userValid.password);
      if (authPassword) {
        const tokenIs = jwt.sign({ uid: userValid._id, email: userValid.email, role: userValid.roles }, secret, { expiresIn: '1h' });
        console.log(tokenIs);
        resp.json({ token: tokenIs });
      }

      // TODO: Authenticate the user
      // It is necessary to confirm if the email and password
      // match a user in the database
      // If they match, send an access token created with JWT

      next();
    } catch (error) {
      console.error(error); // Imprimir el mensaje de error en la consola
      return next(500); // Enviar una respuesta de error al cliente
    }

    return nextMain();
  });
};
