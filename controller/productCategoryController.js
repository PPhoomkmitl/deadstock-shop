const getConnection = require('../config/dbConnect');

const createCategory = async (req, res) => {
  const connection = await getConnection();

  try {
    
    const checkQuery = 'SELECT COUNT(*) as count FROM product_type WHERE type_name = ?';
    const [checkResult] = await connection.execute(checkQuery, [req.body.type_name]);

    if (checkResult[0].count > 0) {
      return res.status(400).json({ error: 'Duplicate category name' });
    }


    const insertQuery = 'INSERT INTO product_type (type_name) VALUES (?)';
    const [insertResult] = await connection.execute(insertQuery, [req.body.type_name]);

    res.json({ id: insertResult.insertId, name: req.body.type_name });
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};


const updateCategory = async (req, res) => {
  const { id } = req.params;
  const connection = await getConnection();

  try {
    // ตรวจสอบว่า category ที่จะอัปเดตนั้นมีหรือไม่
    const checkQuery = 'SELECT * FROM product_type WHERE product_type_id = ?';
    const [checkResult] = await connection.query(checkQuery, [id]);

    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // ทำการอัปเดต category
    const updateQuery = 'UPDATE product_type SET type_name = ? WHERE product_type_id = ?';
    await connection.execute(updateQuery, [req.body.type_name, id]);

    // ดึงข้อมูล category ที่อัปเดตขึ้นมาเพื่อส่งให้กับ client
    const selectQuery = 'SELECT * FROM product_type WHERE product_type_id = ?';
    const [selectResult] = await connection.query(selectQuery, [id]);
    const updatedCategory = selectResult[0];

    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const connection = await getConnection();

  try {
    // ตรวจสอบว่า category ที่จะลบนั้นมีหรือไม่
    const checkQuery = 'SELECT * FROM product_type WHERE product_type_id = ?';
    const [checkResult] = await connection.execute(checkQuery, [id]);

    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // ทำการลบ category
    const deleteQuery = 'DELETE FROM product_type WHERE product_type_id = ?';
    await connection.execute(deleteQuery, [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};

const getCategory = async (req, res) => {
  const { name } = req.params;
  const connection = await getConnection();

  try {
      // Sanitize input by escaping special characters
      const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // ดึงข้อมูล category ตาม product_type_id
      const selectQuery = 'SELECT * FROM product_type WHERE type_name = ?';
      const [selectResult] = await connection.query(selectQuery, [safeName]);

    if (selectResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const getCategory = selectResult[0];
    res.json(getCategory);
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};

const getProductByCategory = async (req, res) => {
  const { name } = req.params;
  const connection = await getConnection();

  try {
      // Sanitize input by escaping special characters
      const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // ดึงข้อมูล category ตาม product_type_id
      const selectQuery = `SELECT * 
      FROM product 
      INNER JOIN product_type 
      ON product.product_type_id = product_type.product_type_id 
      WHERE product_type.type_name = ?;
      `;
      const [selectResult] = await connection.query(selectQuery, [safeName]);

    if (selectResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const getCategory = selectResult[0];
    res.json([getCategory]);
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};

const getallCategory = async (req, res) => {
  const connection = await getConnection();

  try {
    const selectQuery = 'SELECT * FROM product_type';
    const [selectResult] = await connection.query(selectQuery);

    res.json(selectResult);
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  getProductByCategory
};