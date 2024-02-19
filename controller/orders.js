const { connect } = require("../connect");
const { ObjectId } = require("mongodb");
const db = connect();

module.exports = {
  postOrders: async (req, resp, next) => {
    const { userId, client, products, status } = req.body;
    const user = req.userId;
    // console.log(req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return resp.status(400).json({ error: "Debes ingresar todos los datos" });
    }

    if (!client || !products) {
      return resp.status(400).json({ error: "Debes ingresar todos los datos" });
    }

    try {

      const newOrder = {
        userId,
        client,
        products,
        status,
        dateEntry: new Date(),
      };

      const orders = db.collection("order");
      
      await orders.insertOne(newOrder);

      resp.status(200).json(newOrder);
      console.log("Se agrego la orden con exito");
    } catch (error) {
      console.log(error);
      return resp
        .status(500)
        .json({ error: "Ha ocurrido un error en el servidor" });
    }
  },

  getOrders: async (req, resp, next) => {
    try {
      const order = db.collection("order");

      const ordersData = await order.find({}).toArray();

      resp.json(ordersData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al obtener la lista de ordenes" });
    }
  },

  getOrdersId: async (req, resp, next) => {
    try {
      const order = db.collection("order");
      const ordersId = req.params.orderId;

      if (!/^[0-9a-fA-F]{24}$/.test(ordersId)) {
        return resp
          .status(404)
          .json({ error: "El ID de la ordén solicitada no es válido" });
      }

      let query = { _id: new ObjectId(ordersId) };
      // console.log(query);

      const orderData = await order.findOne(query);
      // console.log(orderData);

      if (!orderData) {
        return resp
          .status(404)
          .json({ error: "la ordén solicitada no existe" });
      }

      resp.json(orderData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al obtener la ordén" });
    }
  },

  putOrders: async (req, resp, next) => {
    try {
      const order = db.collection("order");
      const ordersId = req.params.orderId;
      console.log({ ordersId });

      if (!/^[0-9a-fA-F]{24}$/.test(ordersId)) {
        return resp
          .status(404)
          .json({ error: "El ID de la ordén solicitada no es válido" });
      }

      let query = { _id: new ObjectId(ordersId) };
      console.log({ query });

      const orderData = await order.findOne(query);
      console.log({ orderData });

      if (!orderData) {
        return resp
          .status(404)
          .json({ error: "La ordén solicitada no existe" });
      }

      const body = req.body;
      console.log({ body });

      if (!body || Object.keys(body).length === 0) {
        return resp
          .status(400)
          .json({ error: "Debe haber al menos una propiedad para actualizar" });
      }

      if (
        !(
          body.status === "pending" ||
          body.status === "canceled" ||
          body.status === "preparing" ||
          body.status === "delivering" ||
          body.status === "delivered"
        )
      ) {
        console.log("debe contener un status válido");
        return resp
          .status(400)
          .json({ error: "debe contener un status válido" });
      }

      if (body.status === "delivered") {
        body.dateProcessed = new Date();
      }

      await order.updateOne(query, { $set: body });
      const updatedOrder = await order.findOne(query);
      resp.status(200).json(updatedOrder);

    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al actualizar la ordén" });
    }
  },

  deleteOrders: async (req, resp, next) => {
    try {
      const orders = db.collection("order");
      const orderId = req.params.orderId;
      // console.log(orderId);

      if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
        return resp
          .status(404)
          .json({ error: "El ID de la ordén solicitada no es válido" });
      }

      let query = { _id: new ObjectId(orderId) };
      // console.log({ query });

      const orderData = await orders.findOne(query);
      // console.log({ orderData });

      if (!orderData) {
        return resp
          .status(404)
          .json({ error: "La ordén solicitada no existe" });
      }

      const orderDelete = await orders.deleteOne(query);

      resp
        .status(200)
        .json({ orderDelete, message: "La ordén ha sido borrado" });
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al borrar la ordén" });
    }
  },
};
