const { connect } = require("../connect");
const { ObjectId } = require("mongodb");
const db = connect();
const products = db.collection("product");

module.exports = {
  postProducts: async (req, resp, next) => {
    const { name, price, image, type } = req.body;

    try {
      // const products = db.collection("product");
      // validar si el producto existe
      const productExist = await products.findOne({ name });
      if (productExist) {
        return resp.status(403).json({ error: "ya existe el producto" });
      }

      if (!name || !price) {
        return resp
          .status(400)
          .json({ error: "tienes que ingresar todos los datos" });
      }
      const newProduct = {
        name,
        price,
        image,
        type,
        dateEntry: new Date(),
      };
      // console.log(newProduct);

      await products.insertOne(newProduct);

      resp.status(200).json(newProduct);
      console.log("Se agrego el producto con exito");
    } catch (error) {
      console.log(error);
      resp.status(500).json({ error: "Error al crear el producto" });
    }
  },

  getProducts: async (req, resp, next) => {
    try {
      // const db = connect();
      // Obtener todos los usuarios de la colección
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query._limit) || 10;
      const startIndex = (page - 1) * limit;

      const productsAll = await products
        .find({})
        .skip(startIndex)
        .limit(limit)
        .toArray();

      resp.status(200).json(productsAll);

      // TODO: Implement the necessary function to fetch the `users` collection or table
    } catch (error) {
      console.error(error);
      resp
        .status(500)
        .json({ error: "Error al obtener la lista de productos" });
    }
  },

  getProductsId: async (req, resp, next) => {
    try {
      // const db = connect();
      // const products = db.collection("product");
      const productsId = req.params.productId;

      if (!/^[0-9a-fA-F]{24}$/.test(productsId)) {
        return resp
          .status(404)
          .json({ error: "El ID del producto solicitado no es válido" });
      }

      let query = { _id: new ObjectId(productsId) };
      const productData = await products.findOne(query);

      if (!productData) {
        return resp
          .status(404)
          .json({ error: "el producto solicitado no existe" });
      }

      resp.json(productData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al obtener el producto" });
    }
  },

  putProducts: async (req, resp, next) => {
    try {
      // const products = db.collection("product");
      const productsId = req.params.productId;

      if (!/^[0-9a-fA-F]{24}$/.test(productsId)) {
        return resp
          .status(404)
          .json({ error: "El ID del producto solicitado no es válido" });
      }

      let query = { _id: new ObjectId(productsId) };
      const productData = await products.findOne(query);

      if (!productData) {
        return resp
          .status(404)
          .json({ error: "El producto solicitado no existe" });
      }

      const body = req.body;

      if (!body || Object.keys(body).length === 0) {
        return resp
          .status(400)
          .json({ error: "Debe haber al menos una propiedad para actualizar" });
      }

      if (body.hasOwnProperty("price")) {
        const price = body.price;
        if (typeof price !== "number") {
          // Verificar si el precio no es un número
          return resp
            .status(400)
            .json({ error: "El precio debe ser un número" });
        }
      }

      await products.updateOne(query, { $set: body });
      const updatedProduct = await products.findOne(query);
      resp.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al actualizar el producto" });
    }
  },

  deleteProducts: async (req, resp, next) => {
    try {
      // const products = db.collection("product");
      const productsId = req.params.productId;

      if (!/^[0-9a-fA-F]{24}$/.test(productsId)) {
        return resp
          .status(404)
          .json({ error: "El ID del producto solicitado no es válido" });
      }

      let query = { _id: new ObjectId(productsId) };
      const productData = await products.findOne(query);

      if (!productData) {
        return resp
          .status(404)
          .json({ error: "El producto solicitado no existe" });
      }

      const productDelete = await products.deleteOne(query);

      resp
        .status(200)
        .json({ productDelete, message: "El producto ha sido borrado" });
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: "Error al borrar el producto" });
    }
  },
};
