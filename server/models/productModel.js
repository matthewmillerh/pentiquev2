//import db connection
import db from "../config/database.js";

//Get all products from the specified level 1 category, also get category information from category tables
export const getProductsByCategory = (categoryID, result) => {
  db.query("SELECT product.*, category1.*, category2.*, category3.* FROM `product` LEFT OUTER JOIN category1 ON category1.category1ID = product.category1ID LEFT OUTER JOIN category2 ON category2.category2ID = product.category2ID LEFT OUTER JOIN category3 ON category3.category3ID = product.category3ID WHERE product.category1ID = ?", [categoryID], (err, results) => {
    if (err) {
      console.log(err)
      result(err, null)
    } else {
      result(null, results)
    }
  })
}

//get all products
export const getProducts = (result) => {
  db.query("SELECT * FROM product", (err, results) => {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      result(null, results);
    }
  });
};

//get single product
export const getProductById = (id, result) => {
  db.query(
    "SELECT product.*, category1.category1Name, category2.category2Name, category3.category3Name FROM product LEFT OUTER JOIN category1 ON category1.category1ID = product.category1ID LEFT OUTER JOIN category2 ON category2.category2ID = product.category2ID LEFT OUTER JOIN category3 ON category3.category3ID = product.category3ID WHERE productID = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        result(null, results[0]);
      }
    }
  );
};

//insert product to database
export const insertProduct = (data, result) => {
  db.query("INSERT INTO product SET ?", [data], (err, results) => {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      result(null, results);
    }
  });
};

// Update Product in Database
export const updateProductById = (data, id, result) => {
  db.query(
    "UPDATE product SET productName = ?, productPrice = ? WHERE productID = ?",
    [data.product_name, data.product_price, id],
    (err, results) => {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        result(null, results);
      }
    }
  );
};

// Delete Product from Database
export const deleteProductById = (id, result) => {
  db.query("DELETE FROM product WHERE productID = ?", [id], (err, results) => {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      result(null, results);
    }
  });
};