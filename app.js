require("dotenv").config();
const User = require('./models/user');
const Admin = require('./models/admin');
const app = require('express')();
let bodyParser = require('body-parser')
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const versionApi = '/api';
const { sign } = require("jsonwebtoken");
const { checkToken } = require("./auth/token_validation")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get(`${versionApi}/users`, checkToken,(req, res) => {
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

app.post(`${versionApi}/users/signup`, (req, res) => {
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

app.post(`${versionApi}/users/forgotPassword`, (req, res) => {
  const thisUser = Admin.getAdminByEmail(req.body.email);
  if (thisUser) {
    const id = uuidv1();
    const request = {
        id,
        email: thisUser.email,
    };
    createResetRequest(request);
    sendResetLink(thisUser.email, id);
  }
  res.status(200).json();
}); 
 
app.patch(`${versionApi}/users/resetPassword`, (req, res) => {
    const thisRequest = getResetRequest(req.body.id);
    if (thisRequest) {
      const user =  Admin.getAdminByEmail(thisRequest.email);
      bcrypt.hash(req.body.password, 10).then(hashed => {
          user.password = hashed;
          updateUser(user);
          res.status(204).json();
      })
  } else {
      res.status(404).json();
  }
});

 
app.listen(process.env.APP_PORT, ()=>{
    console.log("Server up and running on port: ", process.env.APP_PORT);
})