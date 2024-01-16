const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const config = require('../config');
const { connect } = require('../connect');

const { secret } = config;

module.exports = (app, nextMain) => {
  app.post('/login', async (req, resp, next) => {
    const { email, password } = req.body;

    try {
      const db = connect();
      const collection = db.collection('user');

      const userValid = await collection.findOne({ email }, { password });
      console.log(userValid);

      console.log(userValid._id);

      if (userValid) {
        const tokenIs = jwt.sign({ uid: userValid.id, email: userValid.email, role: userValid.role }, secret, { expiresIn: '1h' });

        resp.json({ 'acsses token': tokenIs });
      } else {
        next(401);
      }

      // const authPassword = await bcrypt.compare(password, userValid.password);
      // if (authPassword) {
      //   const tokenIs = jwt.sign(email, secret, { expiresIn: '1h' });
      //   console.log(tokenIs);
      //   resp.send.json({ token: tokenIs });
      // }

      // next();
    } catch (error) {
      console.error(error); // Imprimir el mensaje de error en la consola
      return next(500); // Enviar una respuesta de error al cliente
    }
    // TODO: Authenticate the user
    // It is necessary to confirm if the email and password
    // match a user in the database
    // If they match, send an access token created with JWT
  });
  return nextMain();
};
