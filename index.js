const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const secretKey = process.env.JWT_ACCESS_SECRET;
// const { generateToken } = require('./config/jwtToken');
const verifyAccessToken  = require('./middleware/authAccess');
const verifyRefreshToken  = require('./middleware/authRefresh');

const {generateAccessToken}  = require('./config/genJwtAccessToken');
const {generateRefreshToken}  = require('./config/genJwtRefreshToken');


const PORT = process.env.PORT || 5000;
const dbConnect = require('./config/dbConnect');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/*--------- Route ---------*/
const authRouter = require("./routes/authRoute");
app.use("/api/user", authRouter);




app.get('/' ,(req, res) => {
    const {username} = req.body;
    const key = generateAccessToken(username);
    res.status(200).send({key})
});

app.get('/check-key' ,verifyAccessToken ,(req, res) => {
    res.status(200).send('You Authen!')
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(username)
    var sql = "select username, password from users where username = ?"
    var param = [username];

    db.getData(sql,param,function(result){
			if(result.length==0 || result==null)
			{
				callback(false);
			}
			else
			{
				callback(result);	
			}
		});
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
          const token = jwt.sign({ username: username }, secretKey, {
            expiresIn: "1h",
          });
          return res.status(200).json({ token });
        }
      }
    );
  });

// app.post("/auth/refresh", verifyRefreshToken , async(req, res) => {

//     const [user] = await dbConnect.query('SELECT * FROM users WHERE id = ?', [decoded.username]);

//     if (!user || user.length === 0) {
//         return res.status(401).json({ error: 'User not found in the database' });
//     }
  
//     // if (!user || userIndex < 0) return res.sendStatus(401)
  
//     const access_token = generateAccessToken(user)
//     const refresh_token = generateRefreshToken(user)
  
  
//     return res.json({
//       access_token,
//       refresh_token,
//     })
//   })


/*--------- Attempt to start the server ---------*/
const server = app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});
  
/*---------Handling errors if the server fails to start ---------*/
server.on('error', (error) => {
    /* --------- Find PORT --------- */
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please choose another port.`);
    } else {
      console.error(`Unable to start the server: ${error.message}`);
    }
});