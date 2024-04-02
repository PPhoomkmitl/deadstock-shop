const getConnection = require('../config/dbConnect');

const escapeHtml = (unsafe) => {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

const createProduct = async (req, res) => {
  const connection = await getConnection();

  try {

    const { product_name, description, price , image_url , measurement } = req.body;

    const createProductQuery = 'INSERT INTO product (product_name , description, price , image_url , measurement) VALUES (?, ?, ?, ?, ?)';
    const [newProduct] = await connection.query(createProductQuery, [product_name, description, price, image_url , measurement]);
  
    res.json({ id: newProduct.insertId, product_name, description, price });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    connection.destroy();
  }
};
  

const updateProduct = async (req, res) => {
  const connection = await getConnection();
  
  try {
    const productId = escapeHtml(req.params.id);  

    const { product_name, description, price } = req.body;

    const updateProductQuery = 'UPDATE product SET product_name	=?, description=?, price=? WHERE product_id=?';
    const [updatedRows] = await connection.query(updateProductQuery, [product_name, description, price, productId]);

    if (updatedRows.affectedRows > 0) {

      const getUpdatedProductQuery = 'SELECT * FROM product WHERE product_id=?';
      const [updatedProduct] = await connection.query(getUpdatedProductQuery, [productId]);

      if (updatedProduct.length > 0) {
        res.json(updatedProduct[0]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};

  

const deleteProduct = async (req, res) => {
  const connection = await getConnection();
  const productId = escapeHtml(req.params.id); 
  
  try {
 
    const deleteProductQuery = 'DELETE FROM product WHERE product_id=?';
    const [deletedRows] = await connection.query(deleteProductQuery, [productId]);

    if (deletedRows.affectedRows > 0) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};


const getProduct = async (req, res) => {
    const connection = await getConnection();
    const productId = escapeHtml(req.params.id); 

    // console.log(productId);
   
    try {
 
      const getProductQuery = 'SELECT * FROM product WHERE product_id=?';
      const [product] = await connection.query(getProductQuery, [productId]);
  
      if (product.length > 0) {
        res.json(product[0]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      connection.destroy();
    }
};
  

const getAllProduct = async (req, res) => {
  const connection = await getConnection();
  try {
    console.log('123');
    const getProductQuery = 'SELECT * FROM product';
    // Execute the query
    const [products] = await connection.query(getProductQuery);


    res.status(200).json({
      products
    });

  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};

const getSearchProduct = async (req, res) => {
  const connection = await getConnection();
  const searchQuery = req.query.search;

  // Sanitize input by escaping special characters
  const safeName = searchQuery.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const [rows] = await connection.query(
      `SELECT * 
       FROM product 
       INNER JOIN product_type ON product.product_type_id = product_type.product_type_id 
       WHERE product.product_name LIKE CONCAT('%', ?, '%') 
       OR product.description LIKE CONCAT('%', ?, '%') 
       OR product_type.type_name LIKE CONCAT('%', ?, '%')
       LIMIT 4`,
      [searchQuery, searchQuery, searchQuery]
    );

    // const productList = rows.map(row => row.product_name); 

    res.json(rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'An error occurred while searching data' });
  }
};

const updateStockProduct = async (req, res) => {
  const connection = await getConnection();
  const productId = escapeHtml(req.params.id); 
  
  try {
 
    const updateProductQuery = 'UPDATE product SET reserved_quantity = reserved_quantity + 1 WHERE product_id = ?';
    const [updatedRows] = await connection.query(updateProductQuery, [productId]);

    if (updatedRows.affectedRows > 0) {
      res.json({ message: 'Product update stock successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};


module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getSearchProduct,
  updateStockProduct 
};