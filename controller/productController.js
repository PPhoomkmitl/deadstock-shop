const getConnection = require('../config/dbConnect');

const createProduct = async (req, res) => {

  const connection = await getConnection();
  try {

    const { product_name, description, price } = req.body;

    const createProductQuery = 'INSERT INTO product (product_name , description, price) VALUES (?, ?, ?)';
    const [newProduct] = await connection.query(createProductQuery, [product_name, description, price]);
  
    res.json({ id: newProduct.insertId, product_name, description, price });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await connection.destroy();
  }
};
  

const updateProduct = async (req, res) => {
  const connection = await getConnection();
  
  try {
    const productId = req.params.id;  
    // if (req.body.product_name) {
    //   req.body.slug = slugify(req.body.product_name);
    // }

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
  const productId = req.params.id; 
  
  try {
    // Assuming you have a 'products' table in your MySQL database
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
    const productId = req.params.id; // Assuming the parameter is 'id'
   
    try {
      // Assuming you have a 'products' table in your MySQL database
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
  
const getSearchProduct = async (req, res) => {
  const connection = await getConnection();
  try {
    const { searchQuery } = req.body;

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(404).json({ message: 'Product not found' });
    }

    const safeSearchQuery = connection.escape(`%${searchQuery}%`);

    const getSearchProductQuery = `SELECT * FROM product WHERE product_name LIKE ${safeSearchQuery}`;
    const [product] = await connection.query(getSearchProductQuery);

    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
}


const getAllProduct = async (req, res) => {
  const connection = await getConnection();
  try {

    // // Filtering
    // const { gte, gt, lte, lt, ...queryObj } = req.query;
    // let whereClause = '';

    // // Building the WHERE clause for filters
    // Object.keys(queryObj).forEach((key) => {
    //   if (whereClause !== '') {
    //     whereClause += ' AND ';
    //   }
    //   whereClause += `${key} = ${connection.escape(queryObj[key])}`;
    // });

    // // Adding conditions for greater than or equal, greater than, less than or equal, less than
    // Object.keys({ gte, gt, lte, lt }).forEach((key) => {
    //   if (req.query[key]) {
    //     if (whereClause !== '') {
    //       whereClause += ' AND ';
    //     }
    //     whereClause += `${key} ${Op[key]} ${connection.escape(req.query[key])}`;
    //   }
    // });

    // Sorting
    // const sortBy = req.query.sort ? req.query.sort.split(",") : ["createdAt"];
    // const order = sortBy.join(',');

    // // Limiting the fields
    // const fields = req.query.fields ? req.query.fields.split(",") : null;

    // // Pagination
    // const page = req.query.page || 1;
    // const limit = req.query.limit || 10;
    // const offset = (page - 1) * limit;

    // // Construct the SQL query
    // const sql = `
    //   SELECT ${fields ? fields.join(',') : '*'}
    //   FROM products
    //   WHERE ${whereClause}
    //   ORDER BY ${order}
    //   LIMIT ${limit} OFFSET ${offset}
    // `;
    const sql = `
      SELECT *
      FROM product
    `;

    // Execute the query
    const [products] = await connection.query(sql);

    // Get the total count for pagination
    // const [totalCount] = await connection.query(`
    //   SELECT COUNT(*) as total FROM products WHERE ${whereClause}
    // `);
    // const totalProducts = totalCount[0].total;
    // const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      // page: parseInt(page),
      // totalPages,
      // totalProducts,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await connection.destroy();
  }
};



module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getSearchProduct
};