const passport =require("passport")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const createConnection = require('../config/dbConnect');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    passReqToCallback: true,

},
async function(request, accessToken, refreshToken, profile, done) {
    try {
        const connection = await createConnection();
        const [rows] = await connection.query('SELECT * FROM users INNER JOIN user_accounts ON user_accounts.user_id = users.user_id WHERE google_id = ? ', [profile.id]);
        
        if (rows.length > 0) {        
            // ผู้ใช้มีอยู่ในฐานข้อมูล
            return done(null, rows[0]);

        } else if(rows.length === 0) {
            const [userExist] = await connection.query('SELECT * FROM users WHERE google_id IS NULL AND email = ?', [profile.emails[0].value]);
            if(userExist.length === 0) {

                // สร้างผู้ใช้ใหม่และบันทึกลงในฐานข้อมูล
                let role = 'member';
                if (/^[^\s@]+@kmitl\.ac\.th$/.test(profile.emails[0].value)) {
                    role = 'user_admin';
                } 
             
                const newUser = {
                    google_id: profile.id,
                    email: profile.emails[0].value,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    role: role
                };

                const [userData] = await connection.query('INSERT INTO users (first_name, last_name, email, registration_date, google_id) VALUES (?, ?, ?, NOW(), ?)', [newUser.firstname, newUser.lastname, newUser.email, newUser.google_id]);

                // ตรวจสอบว่ามีข้อมูลผู้ใช้ที่ถูกสร้างขึ้นหรือไม่
                if (userData.length === 0) {
                    console.error('Error inserting user:', error);
                    return done(error);
                }
                
                const userId = userData.insertId;        
                const [userAccountData] = await connection.query('INSERT INTO user_accounts (user_id ,password, user_type) VALUES (?, ?, ?)', [userId ,'google_auth',  role]);
            
                if (userAccountData.length === 0) {
                    console.error('Error inserting user:', error);
                    return done(error);
                }
            
                console.log('User inserted successfully:');
                return done(null, newUser);
            }
            else {
                // ผู้ใช้มีอยู่ในฐานข้อมูล             
                console.log('User successfully:',rows.length);
                return done(null, rows[0]);
            }
        }
        else {
            return done(new Error('User already have'));
        }
       
    } catch (error) {
        return done(new Error(error));
    }
}
));

passport.serializeUser(function(user, done) {
    done(null, user.google_id); 
});

passport.deserializeUser(async function(id, done) {
    try {
        const connection = await createConnection();
        if(id == null){
            return done(new Error('User not found'));
        }
        const [rows] = await connection.query('SELECT users.user_id , email , user_type FROM users INNER JOIN user_accounts ON user_accounts.user_id = users.user_id WHERE google_id = ?', [id]);
        if (rows.length === 0) {
            return done(new Error('User not found'));
        }
        const user = rows[0];
        console.log('User found:', user);
        done(null, user); 
    } catch (error) {
        done(error);
    }
});