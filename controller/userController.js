const bcrypt = require("bcrypt");
const { generateAccessToken } = require('../config/genJwtAccessToken');
const { generateRefreshToken } = require('../config/genJwtRefreshToken');
const dbConnect = require('../config/dbConnect');


const userRegister = async (req, res) => {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    dbConnect.query(
      "insert into users(username, password) values(?, ?)",
      [username, hashedPassword],
      async function (error, result, fields)  {
        // dbConnect.release();
        if (error) {
          return res
            .status(401)
            .json({ message: "Unable to complete registration" });
        }
        else {
          return res.status(201).json({ message: "Register successfully" });
        }
      }
    );
};
  
const userLogin = async (req, res) => {
    const { username, password } = req.body;
   
    dbConnect.query(
      "select username, password from users where username = ?",
      [username],
      async function (err, result, fields) {
        if (err) {
          return res.status(401).json({ message: "can't connect db" });
        }
        const passwordMatch = await bcrypt.compare(password, result[0].password);
        if (!passwordMatch) {
          return res
            .status(401)
            .json({ message: "Username or Password incorrect" });
        } else {
            const access_token = generateAccessToken(username)
            const refresh_token = generateRefreshToken(username)
            return res.status(200).json({ access_token , refresh_token });
        }
      }
    );
};

const createRefreshToken = async (req, res) => {
    console.log(req.user);

    try {
        // const userResults = await dbConnect.query('SELECT * FROM users WHERE username = ?', [req.user.username]);
        dbConnect.query(
        "SELECT username, password FROM users WHERE username = ?",
        [req.user.username],
        function (err, result, fields) {
            if (err) {
                // Handle the error
                console.error(err);
                return res.status(401).json({ message: "Invalidate Refresh Token" });
            
            }
            if(result !== null){
                const userData = result[0];
                // console.log(userData);
                const access_token = generateAccessToken(userData.username);
                const refresh_token = generateRefreshToken(userData.username);
                req.user.token = refresh_token;
                return res.json({
                    access_token,
                    refresh_token,
                });
  
            }
            else {
                console.error('User not found in the database');
                return res.status(401).json({ error: 'User not found in the database' });
            }         
        }
);


    

       
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'An error occurred while fetching user data.' });
    }
};




module.exports = {
    userRegister ,
    userLogin ,
    createRefreshToken
};
// dbConnect.query(
//     "SELECT username, password FROM users WHERE username = ?",
//     [username],
//     function (err, result, fields) {
//         if (err) {
//             // Handle the error
//             console.error(err);
           
//         }
//         if(result !== null){
//             const userData = result[0]; // Assuming there is only one row
//             const username = userData.username;
//             const password = userData.password;
//         }
//         else {
//             console.error('User not found in the database');
//             return res.status(401).json({ error: 'User not found in the database' });
//         }

//         console.log(result);
//     }
// );