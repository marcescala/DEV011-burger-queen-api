# Burger Queen API

Esta es una API REST diseñada para la gestión integral de un restaurante, incluyendo autenticación de usuarios, manejo de productos y gestión de órdenes.

## Características

- Autenticación de usuarios: Permite registrar nuevos usuarios y autenticar usuarios existentes.
- Manejo de usuarios, productos y órdenes: Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar).

## Endpoints de la API

#### Autenticación

```http
  POST /login
```

| Body Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | correo|
| `password` | `string` | contraseña |
 

Crea un Token de autenticación.

La aplicación trae un admin por defecto y un password "changeme"

#### Users

```http
  GET /users 
```

```http
  GET /users/:uid
```

```http
  POST /users
```

```http
  PUT /users/:uid
```

```http
  DELETE /users/:uid
```
#### Products

```http
  GET /Products 
```

```http
  GET /products/:productId
```

```http
  POST /products
```

```http
  PUT /products/:productId
```

```http
  DELETE /products/:productId
```
#### Orders

```http
  GET /orders 
```

```http
  GET /orders/:ordersId
```

```http
  POST /orders
```

```http
  PUT /orders/:ordersId
```

```http
  DELETE /orders/:ordersId
```
## Documentation

[Documentation](https://app.swaggerhub.com/apis-docs/ssinuco/BurgerQueenAPI/3.0.0)


## Authors

- [@marcescala](https://github.com/marcescala)


## Tecnologías


**Node**

**Express**

**JavaScript**

**MongoDB**

**JSON Web Tokens (JWT)**

**Bcrypt**

## Ejecución

Para iniciar

```bash
  npm start
```
corre en la url 

```http
  http://localhost:8080/
```
