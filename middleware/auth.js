const jwt = require('jsonwebtoken');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    console.log(decodedToken.uid);
    if (err) {
      return next(403);
    }
    // req.userId = decodedToken.uid;
    req.userRole = decodedToken.role;
    return next();

    // TODO: Verify user identity using `decodeToken.uid`
  });
  next();
};

module.exports.isAuthenticated = (req) => (

  // TODO: Decide based on the request information whether the user is authenticated
  true
);

module.exports.isAdmin = (req) => (

  // TODO: Decide based on the request information whether the user is an admin
  true
);

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
