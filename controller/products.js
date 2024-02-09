const { connect } = require('../connect');
const { ObjectId } = require('mongodb')
const db = connect();

module.exports = {
 postProducts: async (req, resp, next) => {
    const { name, price, image, type } = req.body;
    const newProduct = {
      name,
      price,
      image,
      type,
    };

    try {
      
      const products = db.collection('product');
      // validar si el producto existe
      const productExist = await products.findOne({ name });
      if (productExist) {
        return resp.status(403).json({ error: 'ya existe el producto' });
      }

      if (!name || !price) {
        return resp.status(400).json({ error: 'tienes que ingresar todos los datos' });
      }
      
      await products.insertOne(newProduct);
     
      resp.status(200).json(newProduct);
      console.log('Se agrego el producto con exito');

    } catch (error) {
      return next(500)
    }
  },

  getProducts: async (req, resp, next) => {
    try {
      // const db = connect();
      const products = db.collection('product');

      // Obtener todos los usuarios de la colección
      const productsAll = await products.find({}).toArray();
      
      resp.json(productsAll);

    // TODO: Implement the necessary function to fetch the `users` collection or table
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
  },

  getProductsId: async (req, resp, next) => {
    try {
      // const db = connect();
      const products = db.collection('product');
      
      const  productsId = req.params.productId;
    
      console.log( {productsId});
      if (!/^[0-9a-fA-F]{24}$/.test(productsId)) {
        return resp.status(404).json({ error: 'El ID del producto solicitado no es válido' });
      };

      let query = { _id: new ObjectId(productsId) };
      console.log(query);

      const productData = await products.findOne(query);
      console.log(productData);
      
      if (!productData) {
        return resp.status(404).json({ error: 'el producto solicitado no existe' });
      };

      resp.json(productData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al obtener el producto' });
    }
  },

  putProducts: async (req, resp, next) => {
    try {
        
      const products = db.collection('product');

      const  productsId = req.params.productId;
      
      if (!/^[0-9a-fA-F]{24}$/.test(productsId)) {
        return resp.status(404).json({ error: 'El ID del producto solicitado no es válido' });
      };

      let query = { _id: new ObjectId(productsId) };

      const productData = await products.findOne(query);

      if (!productData) {
        return resp.status(404).json({ error: 'El producto solicitado no existe' });
      }
      
      const body = req.body;

      if (!body || Object.keys(body).length === 0) {
        return resp.status(400).json({ error: 'Debe haber al menos una propiedad para actualizar' });
      }

      const productUpdate = await products.updateOne(query, { $set: body });

      resp.json({ productUpdate, message: 'El producto ha sido actualizado' });


    } catch (error) {
        console.error(error);
        resp.status(500).json({ error: 'Error al actualizar el producto' });
      }
  },

  deleteProducts: async ( req, resp, next) => {
    try{
        
        const products = db.collection('product');
        const  productsId = req.params.productId;
  
        let query = { _id: new ObjectId(productsId) };
  
        const productData = await products.findOne(query);
  
        if (!productData) {
          return resp.status(404).json({ error: 'El producto solicitado no existe' });
        }

        const productDelete = await products.deleteOne(query);

      resp.status(200).json({ productDelete, message: 'El producto ha sido borrado' });

    } catch (error) {
        console.error(error);
        resp.status(500).json({ error: 'Error al borrar el producto' });

    }

  },
}
