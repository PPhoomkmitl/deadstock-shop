const bcrypt = require("bcrypt");
const { generateAccessToken } = require('../config/genJwtAccessToken');
const { generateRefreshToken } = require('../config/genJwtRefreshToken');
const getConnection = require('../config/dbConnect');
const { v4: uuidv4 } = require('uuid');


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
endpoint_secret = 'whsec_c3132e9310d21ee7a14ef87ec961c365cb15fb372397e6581886d85a1621d956';

// const decrypt = require('decrypt');
const { insertShippingAddress, insertBillingAddress } = require('../service/addressService');
require("../routes/authRoute");

/*------------------- User Side-------------------- */
const userRegister = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    
    const connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Check if the email is already in use
      const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

      if (existingUser.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Email is already in use" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // If email is not in use, proceed with user registration
      const [result_user] = await connection.query('INSERT INTO users( email , first_name , last_name ) VALUES (?, ? , ?)', [email , firstname , lastname]);
  
      if (result_user.affectedRows > 0) {
        const insertedUserId = result_user.insertId;
        console.log('User ID:', insertedUserId);
  
        const [result_user_account] = await connection.query('INSERT INTO user_accounts( user_id , password , user_type ) VALUES (?, ? , ?)', [insertedUserId , hashedPassword , 'member']);
  
        if (result_user_account.affectedRows > 0) {
          await connection.commit();
          return res.status(201).json({ message: "Registration successful" });
        }
      }

      // If any of the conditions fails, rollback the transaction
      await connection.rollback();
  
      // Return an error response
      return res.status(401).json({ message: "Unable to complete registration" });
  
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.destroy();
    }
  
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'An error occurred during registration.' });
  }
};


const userLogin = async (req, res) => {
  const connection = await getConnection();

  const Password = req.body.password;
  const Email = req.body.email;

  await connection.beginTransaction();

  try {
  
    const [result] = await connection.query('SELECT users.user_id, user_accounts.password FROM user_accounts INNER JOIN users ON users.user_id = user_accounts.user_id WHERE email = ?', [Email]);
    
    if (result.length > 0) {
      const passwordMatch = await bcrypt.compare(Password, result[0].password);

      console.log(passwordMatch);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Username or password incorrect" });
      } else {
        const access_token = generateAccessToken(result[0].user_id , 'member');
        const refresh_token = generateRefreshToken(result[0].user_id , 'member');

        return res.status(200).json(
          { 
            access_token, 
            refresh_token   
          }
        )
      }
    } else {
      console.error('User not found in the database');
      return res.status(401).json({ error: 'Username or password incorrect' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  } finally {
    connection.destroy();
  }
};

const getCheckLogin = async (req, res) => {
  const connection = await getConnection();

  try {
    const { user_id , role } = req.user
    const [user] = await connection.query('SELECT first_name ,	last_name	, email	 FROM users WHERE user_id = ?', [user_id]);  
    if(user.length > 0) {
      return res.status(200).json({ user_id , role });
    }
    else {
      return res.status(401).json({ error: 'Username not found' });
    }
  } catch (error) {
    console.error('Error checking login:', error);
    res.status(500).json({ error: 'An error occurred while checking login status.' });
  } finally{
    connection.destroy();  
  }
}


// access token has expired 
const createRefreshToken = async (req, res) => {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    console.log(req.user);
    const [result] = await connection.query('SELECT user_id FROM users WHERE user_id = ?', [req.user.user_id]);
    if (result.length > 0) {
      const userData = result[0];
      const access_token = generateAccessToken(userData.user_id , userData.role);
      const refresh_token = generateRefreshToken(userData.user_id , userData.role);
   
      return res.status(200).json(
        { 
          access_token, 
          refresh_token   
        }
      )
      
    } else {
      console.error('User not found in the database');
      return res.status(401).json({ error: 'User not found in the database' });
    }
  } catch (error) {
    console.error('Error creating refresh token:', error);
    return res.status(500).json({ error: 'An error occurred while creating refresh token.' });
  } finally {
    connection.destroy();
  }
};



/*------------------- Admin Side-------------------- */

// admin login
const loginAdmin = async (req, res) => {
  const connection = await getConnection();

  try {
    const { Email, Password } = req.body;

    // Validate email and password
    if (!Email || !Password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [result] = await connection.query('SELECT users.email, user_accounts.password , user_accounts.user_type FROM user_accounts INNER JOIN users ON users.user_id = user_accounts.user_id WHERE email = ?', [Email]);
    
    console.log(result);
    if (result.length > 0) {
      const passwordMatch = await bcrypt.compare(Password, result[0].password);

      if (!passwordMatch) {vc 
        return res.status(401).json({ message: "Username or password incorrect" });
      } else {
        const access_token = generateAccessToken(Email , result[0].role);
        const refresh_token = generateRefreshToken(Email , result[0].role);


        return res.status(200).json(
          { 
            access_token, 
            refresh_token   
          }
        )

      }
    } else {
      console.error('User not found in the database');
      return res.status(401).json({ error: 'Username or password incorrect' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  } finally {
    connection.destroy();
  }
};

const logout = async(req, res) => {
  try {
      // Clear JWT token cookie
      res.logout();

      // Send response with success message
      return res.json({ message: 'Successfully logged out' });
  } catch (error) {
      // Handle errors if any
      console.error('Error during logout:', error);
      return res.status(500).json({ message: 'An error occurred during logout' });
  }
}

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const connection = await getConnection();

  try {
    const deleteQuery = 'DELETE FROM user WHERE id = ?';
    const [deleteResult] = await connection.query(deleteQuery, [id]);

    if (deleteResult.affectedRows > 0) {
      res.json({
        message: 'User deleted successfully.',
      });
    } else {
      res.status(404).json({
        message: 'User not found.',
      });
    }
  } catch (error) {

    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  } finally {
    connection.destroy();
  }
};

const updatedUser = async (req, res) => {
  const connection = await getConnection();
  const { id } = req.user;

  try {
    const [result] = await (await connection).query('SELECT * FROM users WHERE id = ?', [id]);

    if (result.length > 0) {
      const userData = result[0];

      const updatedData = {
        username: req.body.username,
        password: req.body.password,
      };

      const [updateResult] = await (await connection).query('UPDATE users SET email = ? WHERE id = ?', [updatedData.username, id]);

      if (updateResult.affectedRows > 0) {
        return res.json({
          message: "User updated successfully",
          updatedUser: {
            id: userData.id,
            username: updatedData.username,
            email: userData.email,
          },
        });
      } else {
        console.error('Failed to update user');
        return res.status(500).json({ message: "Failed to update user" });
      }
    } else {
      console.error('User not found in the database');
      return res.status(401).json({ error: 'User not found in the database' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    connection.destroy();
  }
};

const saveAddress = async (req, res, next) => {
  const connection = await getConnection();
  const { user_id } = req.body;

  try {
    await connection.beginTransaction();

    const { address_line1 , address_line2 , city , postal_code , country} = req.body;

    console.log(user_id , address_line1 );
    const [result] = await connection.query(
      'SELECT * FROM user_address WHERE user_id = ?',
      [user_id]
    );

    console.log(result.length);
    if (result.length > 0 ) {
      const [updatedUser] = await connection.query(
        'UPDATE user_address SET address_line1 = ?, address_line2 = ?, city = ?, postal_code = ?, country = ? WHERE user_id = ?',
        [address_line1, address_line2, city, postal_code, country, user_id]
      );
      await connection.commit(); 
      res.json(updatedUser[0]);
    } else {
      console.log('hello'); 
      const [insertResult] = await connection.query(
        'INSERT INTO user_address (user_id, address_line1, address_line2, city, postal_code, country) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, address_line1, address_line2, city, postal_code, country]
      );

      if (insertResult.affectedRows > 0) {
        const [newUser] = await connection.query(
          'SELECT * FROM user_address WHERE user_id = ?',
          [user_id]
        );

        await connection.commit(); 
        res.json(newUser[0]);
      } else {
        res.status(500).json({ error: 'Failed to save address.' });
      }
    }
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};


const addUserCart = async (req, res) => {
  const connection = await getConnection();
  const { cart } = req.body;
  const { user_id } = req.user;

  try {
    await connection.beginTransaction();

    const [existingCart] = await connection.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);


    if (existingCart.length > 0) {
      console.log('test12');
      const [existingCartItems] = await connection.query('SELECT * FROM cart_item WHERE cart_id = ?', [existingCart[0].cart_id]);
      const existingCartItemsMap = new Map(existingCartItems.map(item => [item.product_id, item]));

      for (let i = 0; i < cart.length; i++) {
        const product_id = cart[i].product_id;
        const quantity = cart[i].quantity;

        if (existingCartItemsMap.has(product_id)) {
          await connection.query('UPDATE cart_item SET quantity = ? WHERE cart_id = ? AND product_id = ?',
            [quantity, existingCart[0].cart_id, product_id]);
        } else {
          await connection.query('INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)',
            [existingCart[0].cart_id, product_id, quantity]);
        }
      }
    } else {
      const [newCart] = await connection.query('INSERT INTO cart (user_id) VALUES (?)', [user_id]);

      for (let i = 0; i < cart.length; i++) {
        const product_id = cart[i].product_id;
        const quantity = cart[i].quantity;
        console.log(product_id);
        await connection.query('INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)',
          [newCart.insertId, product_id, quantity]);
      }
    }

    await connection.commit();
    res.json({ message: 'Cart updated successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });

  } finally {
    connection.destroy();
  }
};


const getUserCart = async (req, res) => {
  const connection = await getConnection();
  const { user_id } = req.user;
 
  console.log(user_id);
  try {
    const [userCartData] = await connection.query(`
      SELECT ci.*, p.*
      FROM cart_item ci
      JOIN product p ON ci.product_id = p.product_id
      JOIN cart c ON ci.cart_id = c.cart_id
      WHERE c.user_id = ?;
    `, [user_id]);

    const cart = {
      products: userCartData.map(item => ({
          id: item.cart_item_id,
          name: item.product_name,
          price: parseFloat(item.price) * parseInt(item.quantity),
          size: 'M',
          quantity: parseInt(item.quantity) ,
          imageUrl: item.image_url,
      })),
    };

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error retrieving user cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const emptyCart = async (req, res) => {
  const connection = await getConnection();
  const { user_id } = req.user;
  const { id } = req.params; 

  const cart_item_id  = id;
  console.log(user_id , cart_item_id );

  try {
    await connection.beginTransaction();

    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    const [userData] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);

    if (userData.length > 0) {
      // ตรวจสอบว่ามีตะกร้าสินค้าของผู้ใช้หรือไม่
      const [cartData] = await connection.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);

      console.log(cartData[0].cart_id);

      if (cartData.length > 0) {
        // ลบรายการสินค้าออกจากตะกร้าโดยใช้ product_id
        await connection.query('DELETE FROM cart_item WHERE cart_id = ? AND cart_item_id = ?', [cartData[0].cart_id, cart_item_id]);

        // ตรวจสอบจำนวนสินค้าในตะกร้าหลังจากลบ
        const [cartItemCount] = await connection.query('SELECT COUNT(*) AS itemCount FROM cart_item WHERE cart_id = ?', [cartData[0].cart_id]);
        const itemCount = cartItemCount[0].itemCount;

        // ถ้าไม่มีรายการสินค้าในตะกร้าอีกต่อไป ให้ลบข้อมูลตะกร้าทั้งหมดของผู้ใช้
        if (itemCount === 0) {
          await connection.query('DELETE FROM cart_item WHERE cart_id = ?', [cartData[0].cart_id]);
          await connection.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
        }

        await connection.commit();
        res.json({ message: 'Product removed from cart successfully' });
      } else {
        await connection.rollback();
        res.status(404).json({ error: 'Cart not found' });
      }
    } else {
      await connection.rollback();
      res.status(404).json({ error: 'User not found' });
    }

  } catch (error) {
    await connection.rollback();
    console.error('Error removing product from cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });

  } finally {
    connection.destroy();
  }
};



/* ----------------------- Order --------------------- */
/* ยังไม่เสร็จ */
const createOrder = async (req, res) => {
  const connection = await getConnection();
  const { shippingAddressData, billingAddressData } = req.body;
  const { user_id } = req.user;

  if (!shippingAddressData || !Array.isArray(shippingAddressData) || shippingAddressData.length === 0) {
    return res.status(400).json({ error: 'Shipping address data is missing or invalid' });
  }
  
  if (!billingAddressData || !Array.isArray(billingAddressData) || billingAddressData.length === 0) {
    return res.status(400).json({ error: 'Billing address data is missing or invalid' });
  }

  let session;
  const orderId = uuidv4();
  let finalAmount = 0;

  try {
    await connection.beginTransaction();

    const [userData] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);

    if (userData.length < 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }


    // Find Cart By User
    const [userCartData] = await connection.query(`SELECT cart_item.product_id , cart_item.quantity , product.price , product.product_name FROM cart 
    INNER JOIN cart_item ON cart.cart_id = cart_item.cart_id 
    INNER JOIN product ON cart_item.product_id = product.product_id 
    WHERE user_id = ?`, [user_id]);
    
    if (userCartData.length > 0) {

      let lineItems = [];
      for (const item of userCartData) {
        const { product_id, quantity } = item;
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product_name,
            },
            unit_amount: item.price * quantity * 100,
          },
          quantity: quantity,
        });
      }


      const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `http://localhost:3000/${orderId}`,
        cancel_url: `http://localhost:3000/${orderId}`,
      });

      console.log(session)

      const orderData = {
        session_id: session.id,
        shipping_status: 'Pending',
        fullfill_status: session.status,
        total_price: finalAmount,
        order_id: orderId,
        user_id: user_id
      };

      await connection.query("INSERT INTO orders SET ?", orderData);

      
      for (const item of userCartData) {
        const { product_id, quantity, price } = item;
        finalAmount += quantity * price;

        const orderDetailsInsertQuery = `
          INSERT INTO order_details (order_id, product_id, quantity, subtotal_price)
          VALUES (?, ?, ?, ?)
        `;
        await connection.query(orderDetailsInsertQuery, [orderId, product_id, quantity, quantity * price]);
      }
      
      await connection.query("UPDATE orders SET total_price = finalAmount WHERE order_id = ?", orderData);
      

      // Insert shipping address
      await insertShippingAddress(user_id, shippingAddressData);

      // Insert billing address
      await insertBillingAddress(user_id, billingAddressData);

      
      await connection.commit();
      res.json({
        message: "Checkout success.",
        id: session.id,
        orderData: orderData,
      });

    }
    else {
      return;
    }
 

  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error.message);
    res.status(400).json({ error: "Error payment" });
  } finally {
    connection.destroy();
  }
};

const getOrderById = async (req, res) => {
  const connection = await getConnection();
  const orderId = req.params.id;
  const { user_id } = req.user;

  try {
    const [rows] = await connection.query('SELECT * FROM orders WHERE user_id = ?', [user_id]);

    if (rows.length > 0) {
      const [productRow] = await connection.query(`
      SELECT * FROM order_details
      INNER JOIN product ON product.product_id = order_details.product_id
      INNER JOIN orders ON orders.order_id = order_details.order_id
      WHERE orders.order_id = ?
    `, [orderId]);

  
      const userOrder = {
        detail: productRow
      };

      res.json(userOrder);
    } else {
      res.json({ message: 'No orders found for the user' });
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};


const updateOrderStatus = async (req, res) => {
  const connection = await getConnection();
  const { status , order_id } = req.body;

  try {
    await connection.beginTransaction();


    const [result] = await connection.query(
      'UPDATE orders SET orderStatus = ?, paymentIntent_status = ? WHERE order_id = ?',
      [status, status, order_id]
    );

    if (result.affectedRows === 1) {
      const [updatedOrder] = await connection.query('SELECT * FROM orders WHERE order_id = ?', [order_id]);
      await connection.commit(); // commit transaction หากทุกอย่างเรียบร้อย
      res.json(updatedOrder[0]);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }    
  } catch (error) {
    await connection.rollback(); // rollback transaction หากเกิดข้อผิดพลาด
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};

const getAllOrder = async (req, res) => {
  const connection = await getConnection();

  try { 
    const [allUserOrders] = await connection.query('SELECT * FROM orders');
    res.json(allUserOrders);
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};


const getOrderByUserId = async (req, res) => {
  const connection = await getConnection();
  const { id } = req.params;
  
  try {
    const [rows] = await connection.query('SELECT * FROM orders WHERE order_id = ?', [id]);
    
    if (rows.length > 0) {
      const orderId = rows[0].order_id;
      const [productRows] = await connection.query('SELECT * FROM products WHERE order_id = ?', [orderId]);
      const [userRows] = await connection.query('SELECT * FROM users WHERE id = ?', [rows[0].user_id]);

      const userOrderData = {
        order: rows[0],
        products: productRows,
        orderId: userRows[0]
      };

      res.json(userOrderData);
    } else {
      res.json({ message: 'No orders found for the user' });
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    connection.destroy();
  }
};


const createInvoice = async(req, res) => {
  const connection = await getConnection();
  const { user_id } = req.user;
  try {
      // Start transaction
      await connection.beginTransaction();

      // Insert invoice
      const [invoiceResult] = await connection.query('INSERT INTO invoice (user_id, total_amount) VALUES (?, ?)', [user_id, totalAmount]);
      const invoice_id = invoiceResult.insertId;

      // Insert invoice details
      for (const detail of invoiceDetails) {
          await connection.query('INSERT INTO invoice_detail (invoice_id, product_id, quantity, price_per_unit, total_price) VALUES (?, ?, ?, ?, ?)',
              [invoice_id, detail.productId, detail.quantity, detail.pricePerUnit, detail.totalPrice]);
      }

      // Commit transaction
      await connection.commit();

      res.status.json({message:'Invoice created successfully'});
      console.log('Invoice created successfully');

  } catch (error) {
      // Rollback transaction in case of error
      await connection.rollback();
      throw error;
  } finally {
      // Close connection
      connection.destroy();
  }
}


const getInvoiceById = async (req , res) => {
  const connection = await getConnection();
  const { invoice_id } =req.params

  try {
      // Query the invoice and its details
      const [invoiceResults] = await connection.query('SELECT * FROM invoice WHERE invoice_id = ?', [invoice_id]);
      if (invoiceResults.length === 0) {
          throw new Error('Invoice not found');
      }

      const [detailResults] = await connection.query('SELECT * FROM invoice_detail WHERE invoice_id = ?', [invoice_id]);

      // Format the result
      const invoice = {
          invoice: invoiceResults[0],
          details: detailResults
      };

      res.status.json(invoice);

  } catch (error) {
      throw error;
  } finally {
      // Close connection
      connection.destroy();
  }
}

// CREATE TABLE receipt (
//   receipt_id INT PRIMARY KEY AUTO_INCREMENT,
//   order_id INT,
//   receipt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (order_id) REFERENCES orders(order_id)
// );

// -- สร้างตารางสำหรับใบเสร็จ
// CREATE TABLE receipt_details (
//     detail_id INT PRIMARY KEY AUTO_INCREMENT,
//     receipt_id INT,
//     product_id INT,
//     quantity INT NOT NULL,
//     total_price DECIMAL(10, 2) NOT NULL,
//     FOREIGN KEY (receipt_id) REFERENCES receipts(receipt_id),
//     FOREIGN KEY (product_id) REFERENCES products(product_id)
// ); 

const createReceipt = async (req, res) => {
  const connection = await getConnection();
  const { order_id } = req.body;
  const { user_id } = req.user;

  if (!order_id || !user_id) {
    return res.status(400).json({ error: 'data is missing or invalid' });
  }

  try {
    const [userData] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);

    if (userData.length < 0) {
      res.status(404).json({ error: 'User not found' });
    }

    const [userOrderData] = await connection.query(`SELECT orders.product_id , orders.quantity , product.price FROM order_detail
    INNER JOIN product ON cart_item.product_id = product.product_id 
    WHERE user_id = ?`, [user_id]);

    const receiptInsertQuery = `
     'INSERT INTO receipt (order_id, receipt_date) VALUES (?, ?)', [order_id, receipt_date]
    `;
    const [receiptInsertResult] = await connection.query(receiptInsertQuery, [user_id, 0]); 

    const receiptId = receiptInsertResult.insertId;

    let finalAmount = 0;

    if (userOrderData.length > 0) {
      for (const item of userOrderData) {
        const { product_id, quantity, price } = item;
        finalAmount += quantity * price;

        const receiptDetailsInsertQuery = `
          INSERT INTO receipt_details (receipt_id, receipt_id, quantity, subtotal_price)
          VALUES (?, ?, ?, ?)
        `;
        await connection.query(receiptDetailsInsertQuery, [receiptId, product_id, quantity, quantity * price]);
      }
    }

    const receiptUpdateQuery = `
      UPDATE receipt
      SET total_price = ?
      WHERE receipt_id = ?
    `;
    await connection.query(receiptUpdateQuery, [finalAmount, orderId]);

    res.json({ message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.destroy();
  }
};

const getHandleEventHook =  async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = 'whsec_c3132e9310d21ee7a14ef87ec961c365cb15fb372397e6581886d85a1621d956'

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const paymentSuccessData = event.data.object;
      const sessionId = paymentSuccessData.id;

      const data = {
        status: paymentSuccessData.status,
      };

      const result = await conn.query("UPDATE orders SET ? WHERE session_id = ?", [
        data,
        sessionId,
      ]);

      console.log("=== update result", result);

      // event.data.object.id = session.id
      // event.data.object.customer_details คือข้อมูลลูกค้า
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
}

  


module.exports = {
  userRegister,
  userLogin,
  createRefreshToken,
  updatedUser,
  deleteUser,
  loginAdmin,
  saveAddress,
  addUserCart,
  getUserCart,
  emptyCart,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getCheckLogin,
  getAllOrder,
  getOrderByUserId,
  createInvoice ,
  getInvoiceById,
  getHandleEventHook
  // googleAuth,
  // googleCallback,
  // successRedirect
};
