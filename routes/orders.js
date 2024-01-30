const {
  requireAuth,
} = require('../middleware/auth');

const { getOrders } = require('../controller/orders');

module.exports = (app, nextMain) => {
  app.get('/orders', requireAuth, getOrders);

  app.get('/orders/:orderId', requireAuth, (req, resp, next) => {
  });

  app.post('/orders', requireAuth, (req, resp, next) => {
  });

  app.put('/orders/:orderId', requireAuth, (req, resp, next) => {
  });

  app.delete('/orders/:orderId', requireAuth, (req, resp, next) => {
  });

  nextMain();
};
