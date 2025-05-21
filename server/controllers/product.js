//import functions from Product model
import {
    getProductsByCategory,
    getProducts,
    getProductById,
    insertProduct,
    updateProductById,
    deleteProductById,
  } from "../models/productModel.js";
  
  //get products by category1ID
  export const showProductsByCategory = (req, res) => {
    getProductsByCategory(req.params.category1ID, (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.json(results);
      }
    })
  }

  //get all products
  export const showProducts = (req, res) => {
    getProducts((err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.json(results);
      }
    });
  };
  
  //Get a single product by productID
  export const showProductById = (req, res) => {
    getProductById(req.params.id, (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.json(results);
      }
    });
  };
  
  //create new product
  export const createProduct = (req, res) => {
    const data = req.body;
    insertProduct(data, (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.json(results);
      }
    });
  };
  
  // Update Product
  export const updateProduct = (req, res) => {
    const data = req.body;
    const id = req.params.id;
    updateProductById(data, id, (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.json(results);
      }
    });
  };
  
  // Delete Product
  export const deleteProduct = (req, res) => {
    const id = req.params.id;
    deleteProductById(id, (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.json(results);
      }
    });
  };