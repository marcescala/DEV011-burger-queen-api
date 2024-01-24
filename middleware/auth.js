const jwt = require('jsonwebtoken');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  console.log(req.headers);

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    console.log('esta decodificado midelware', decodedToken.uid);
    if (err) {
      return next(403);
    }
    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role;
    return next();

    // TODO: Verify user identity using `decodeToken.uid`
  });
  // next();
};

module.exports.isAuthenticated = (req) => {
  const userId = req.userId ? req.userId.toString() : null;
  console.log(userId, 'midelware');
  if (userId) {
    console.log('Usuario autenticado:', userId);
    return true;
  }
  console.log('Usuario no autenticado');
  return false;

  // TODO: Decide based on the request information whether the user is authenticated
};

module.exports.isAdmin = (req) => {
  const userRole = req.userRole ? req.userRole.toString() : null;
  if (userRole === 'admin') {
    console.log('es administrador midelware', userRole);
    return true;
  }
  return false;
};

// TODO: Decide based on the request information whether the user is an admin

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
