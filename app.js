require("dotenv").config();
const User = require('./models/user');
const Admin = require('./models/admin');
const app = require('express')();
let bodyParser = require('body-parser')
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const versionApi = '/api';
const { sign } = require("jsonwebtoken");
const { checkToken } = require("./auth/token_validation")
const uuidv1 = require('uuid/v1');
const jwt = require("jsonwebtoken");
const _ = require("lodash");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get(`${versionApi}/users`,(req, res) => {
        User.getUsers((results, err) => {
            if (err) {
              console.log(err);
              return;
            }
            return res.json({
              success: 1,
              data: results
            });
        });
})

app.post(`${versionApi}/users/signup`,(req, res) => {
    if(req.body === undefined || req.body === ''){
        res.json("Vous n'avez pas entré de informations :( ")
    }else{
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        User.create(body, (err, results) => {
            if(err){
                console.log(err);
            }
            if (!results) {
              return res.json({
                success: 0,
                message: "Failed to add user"
              });
            }
            return res.status(200).json({
                success : 1,
                data : results
            });
        })
    }
})

app.get(`${versionApi}/users/:id`, (req, res) => {
    const id = req.params.id;
    User.getUserByUserId(id, (err, results) => {
          if (err) {
            console.log(err);
            return;
          }
          if (!results) {
            return res.json({
              success: 0,
              message: "Record not Found"
            });
          }
          results.password = undefined;
          return res.json({
            success: 1,
            data: results
          });
        });
})

 
app.patch(`${versionApi}/users`, checkToken, (req, res) => {
    if(req.body === undefined || req.body === ''){
        res.json("Vous n'avez pas entré de message :( ")
    }else{
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        User.updateUser(body, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
              return res.json({
                success: 0,
                message: "Failed to update user"
              });
            }
            return res.status(200).json({
                success : 1,
                data : req.body
            });
        });
    }
});

app.post(`${versionApi}/users/login`, (req, res) => {
    const body = req.body;
    User.getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          data: "Invalid email or password"
        });
      }
      const result = compareSync(body.password, results.password);
      if (result) {
        results.password = undefined;
        const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
          expiresIn: "1h"
        });
        return res.json({
          success: 1,
          message: "login successfully",
          token: jsontoken
        });
      } else {
        return res.json({
          success: 0,
          data: "Invalid email or password"
        });
      }
    });
}); 

app.post(`${versionApi}/admin/login`, (req, res) => {
  const body = req.body;
  Admin.getAdminByEmail(body.email, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (!results) {
      return res.json({
        success: 0,
        data: "Invalid email or password"
      });
    }
    const result = compareSync(body.password, results.password);
    if (result) {
      results.password = undefined;
      const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
        expiresIn: "1h"
      });
      return res.json({
        success: 1,
        message: "login successfully",
        token: jsontoken
      });
    } else {
      return res.json({
        success: 0,
        data: "Invalid email or password"
      });
    }
  });
}); 

app.patch(`${versionApi}/admin`, (req, res) => {
  if(req.body === undefined || req.body === ''){
      res.json("Vous n'avez pas entré de message :( ")
  }else{
      const body = req.body;
      const salt = genSaltSync(10);
      body.password = hashSync(body.password, salt);
      Admin.updateAdmin(body, (err, results) => {
          if (err) {
              console.log(err);
              return;
          }
          if (!results) {
            return res.json({
              success: 0,
              message: "Failed to update user"
            });
          }
          return res.status(200).json({
              success : 1,
              data : req.body
          });
      });
  }
});

app.put(`${versionApi}/users/forgotPassword`, (req, res) => {
  const body = req.body;
    User.getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          data: "User with this mail does not exist"
        });
      }
      //const result = compareSync(body.password, results.password);
      if (results) {
        const token = jwt.sign({_id: results._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});
        const data = {
          from: 'noreply@iset.com',
          to: 'dorsaf@gmail.com',
          subject: 'account reset password link',
          html: `
            <h2>Please click on given link to reset your password</h2>
            <p>${process.env.CLIENT_URL}/users/resetpassword/${token}</p>      
          `
        };

        return User.updateResetLinkUser(token, body.email, (err, results) => {
          if (err) {
            return res.json({
              error: err.message
            });
          }else{
            //pass req for mail
            return res.json({
              success: 1,
              data: "Email has been sent, kindly follow the instruction"
            });
          }
        });
      }
    });
}); 
 
app.put(`${versionApi}/users/resetPassword`, (req, res) => {
    const body =req.body;
    if(body.resetLink){
      jwt.verify(body.resetLink, process.env.RESET_PASSWORD_KEY, (err, results) => {
        if(err){
          return res.status(401).json({
            success: 0,
            data: "Incorrect token or it is expired"
          });
        }
        User.getPasswordUser(body.resetLink, (err, results) => {
          if(err){
            return res.status(400).json({
              success: 0,
              data: "User with this token does not exist"
            });
          }

          const salt = genSaltSync(10);
          body.newPassword = hashSync(body.newPassword, salt);

          User.updatePasswordUser(body.newPassword, body.resetLink, (err, result) =>{
            if(err){
              return res.status(400).json({
                success: 0,
                data: "reset password error"
              });
            }else{
                return res.status(200).json({
                  success: 1,
                  data: "Your password has been changed"
                });
              
            }
          })
        });
      });
    }else{
      return res.status(401).json({
        success: 0,
        data: "Authentication error"
      });
    }
});

 
app.listen(process.env.APP_PORT, ()=>{
    console.log("Server up and running on port: ", process.env.APP_PORT);
})