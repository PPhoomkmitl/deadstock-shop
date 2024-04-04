const getConnection = require('../config/dbConnect');

const insertShippingAddress = async (userId ,orderId, shippingAddressData) => {
    const connection = await getConnection();
    try {
      const {
        recipient_name,
        address_line1,
        address_line2,
        city,
        postal_code,
        country,
        phone_number
      } = shippingAddressData[0];

      console.log(shippingAddressData[0]);

 
      const query = `
        INSERT INTO shipping_address (user_id, recipient_name, address_line1, address_line2, city, postal_code, country, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.query(query, [userId, recipient_name, address_line1, address_line2, city, postal_code, country, phone_number]);
      const shippingAddressId = result.insertId;


      // console.log("Shipping",shippingAddressId , orderId);
      // await connection.query("UPDATE orders SET shipping_address_id = ? WHERE order_id = ?", [shippingAddressId, orderId]);
 

      return shippingAddressId;

    } catch (error) {
      console.error('Error inserting shipping address:', error);
      return { success: false, error: 'Internal Server Error' };
    } finally {
      connection.destroy();
    }
  };
  
  const insertBillingAddress = async (userId ,orderId, billingAddressData) => {
    const connection = await getConnection();
    try {
      const {
        recipient_name,
        address_line1,
        address_line2,
        city,
        postal_code,
        country,
        phone_number
      } = billingAddressData[0];
  
      console.log(billingAddressData[0]);
      const query = `
      INSERT INTO billing_address (user_id, recipient_name, address_line1, address_line2, city, postal_code, country, phone_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // ทำการ insert ข้อมูลลงในตาราง billing_address
      const [result] = await connection.query(query, [userId, recipient_name, address_line1, address_line2, city, postal_code, country, phone_number]);
      const billingAddressId = result.insertId;
      

      // const updateQuery = `
      //     UPDATE billing_address
      //     SET order_id = ?
      //     WHERE address_id = ?
      // `;
      // console.log("Billing",billingAddressId , orderId);
      // await connection.query("UPDATE orders SET billing_address_id = ? WHERE order_id = ?", [billingAddressId, orderId]);


      return billingAddressId;
    } catch (error) {
      console.error('Error inserting billing address:', error);
      return { success: false, error: 'Internal Server Error' };
    } finally {
      connection.destroy();
    }
  };
  

module.exports = { insertShippingAddress, insertBillingAddress };
