const getConnection = require('../config/dbConnect');

const insertShippingAddress = async (userId, shippingAddressData) => {
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

      console.log(recipient_name,address_line1,address_line2,);
  
      const query = `
        INSERT INTO shipping_address (user_id, recipient_name, address_line1, address_line2, city, postal_code, country, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(query, [userId, recipient_name, address_line1 , address_line2 , city, postal_code , country, phone_number]);
      return { success: true };
    } catch (error) {
      console.error('Error inserting shipping address:', error);
      return { success: false, error: 'Internal Server Error' };
    } finally {
      connection.destroy();
    }
  };
  
  const insertBillingAddress = async (userId, billingAddressData) => {
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
  
      const query = `
        INSERT INTO billing_address (user_id, recipient_name, address_line1, address_line2, city, postal_code, country, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(query, [userId, recipient_name, address_line1 , address_line2 , city, postal_code , country, phone_number]);
      return { success: true };
    } catch (error) {
      console.error('Error inserting billing address:', error);
      return { success: false, error: 'Internal Server Error' };
    } finally {
      connection.destroy();
    }
  };
  

module.exports = { insertShippingAddress, insertBillingAddress };
