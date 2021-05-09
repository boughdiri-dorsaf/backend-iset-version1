require("dotenv").config();

const app = require('express')();
let bodyParser = require('body-parser')
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

//Listes des models *****************************
const User = require('./models/user');
const Admin = require('./models/admin');
const Departement = require('./models/departement');
const Etablissement = require('./models/etablissement');
const Master = require('./models/master');
const Classe = require('./models/classe');
const Cursus = require('./models/cursus');
const Domaine = require('./models/domaine');
const Etudient = require('./models/etudient');
const Niveau = require('./models/niveau');
const ResponsableGroup = require('./models/responsableGroup');
const Role = require('./models/role');
const Specialite = require('./models/specialite');

//Mail configuration***********************************************
const mailgun = require("mailgun-js");
const DemandeMaster = require("./models/demandeMaster");
const { curry } = require("lodash");
const DOMAIN = 'sandbox8cbfcafa2ff54adfabcbdba4ce193360.mailgun.org';
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN })

//app.use(bodyParser.urlencoded({ extended: false })); une de methode body parser
app.use(bodyParser.json());
const versionApi = '/api';

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//User requests **********************************
app.get(`${versionApi}/users`, (req, res) => {
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

app.post(`${versionApi}/users`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else {
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    User.create(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add user"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
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


app.patch(`${versionApi}/users`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
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
        success: 1,
        data: req.body
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
        token: jsontoken,
        id_user: results.id_user

      });
    } else {
      return res.json({
        success: 0,
        data: "Invalid email or password"
      });
    }
  });
});

//Admin requests*****************************************************************
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
        token: jsontoken,
        id_user: results.id_user,
        id_role: results.id_role
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
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
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
        success: 1,
        data: req.body
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
    const email = body.email;
    //const result = compareSync(body.password, results.password);
    if (results) {
      const token = jwt.sign({ _id: results._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });
      const data = {
        from: 'noreply@bdorsaf.com',
        to: email,
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
        } else {
          //pass req for mail
          mg.messages().send(data, function (error, body) {
            if (error) {
              return res.json({
                error: error.message
              });
            } else {
              return res.json({
                success: 1,
                message: "Email has been sent, kindly follow the instruction"
              });
            }
          });


        }
      });
    }
  });
});

app.put(`${versionApi}/users/resetPassword`, (req, res) => {
  const body = req.body;
  if (body.resetLink) {
    jwt.verify(body.resetLink, process.env.RESET_PASSWORD_KEY, (err, results) => {
      if (err) {
        return res.status(401).json({
          success: 0,
          data: "Incorrect token or it is expired"
        });
      }
      User.getPasswordUser(body.resetLink, (err, results) => {
        if (err) {
          return res.status(400).json({
            success: 0,
            data: "User with this token does not exist"
          });
        }

        const salt = genSaltSync(10);
        body.newPassword = hashSync(body.newPassword, salt);

        User.updatePasswordUser(body.newPassword, body.resetLink, (err, result) => {
          if (err) {
            return res.status(400).json({
              success: 0,
              data: "reset password error"
            });
          } else {
            return res.status(200).json({
              success: 1,
              data: "Your password has been changed"
            });

          }
        })
      });
    });
  } else {
    return res.status(401).json({
      success: 0,
      data: "Authentication error"
    });
  }
});


//CRUD de departement requests************************************************************

app.get(`${versionApi}/departement`, (req, res) => {
  Departement.getListDepartement((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/departement`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else {
    const body = req.body;
    Departement.createDepartement(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add departement"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/departement/:id`, (req, res) => {
  const id = req.params.id;
  Departement.getDepartementById(id, (err, results) => {
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

app.patch(`${versionApi}/departement`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Departement.updateDepartement(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update departement"
        });
      }
      return res.status(200).json({
        success: 1,
        data: req.body
      });
    });
  }
});

app.delete(`${versionApi}/departement/:id`, (req, res) => {
  const params = req.params;
  Departement.deleteDepartement(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});

//CRUD de etablissement requests************************************************************

app.get(`${versionApi}/etablissement`, (req, res) => {
  Etablissement.getListEtablissement((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/etablissement`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else {
    const body = req.body;
    Etablissement.createEtablissement(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add etablissment"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/etablissement/:id`, (req, res) => {
  const id = req.params.id;
  Etablissement.getEtablissementById(id, (err, results) => {
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

app.patch(`${versionApi}/etablissement`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Etablissement.updateEtablissement(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update etablissement"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/etablissement/:id`, (req, res) => {
  const params = req.params;
  Etablissement.deleteEtablissement(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});

//CRUD de master requests************************************************************

app.get(`${versionApi}/master`, (req, res) => {
  Master.getListMaster((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/master`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else {
    const body = req.body;
    Master.createMaster(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to create master"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/master/:id`, (req, res) => {
  const id = req.params.id;
  Master.getMasterById(id, (err, results) => {
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

app.patch(`${versionApi}/master`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Master.updateMaster(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update etablissement"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/master/:id`, (req, res) => {
  const params = req.params;
  Master.deleteMaster(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de role requests************************************************************

app.get(`${versionApi}/role`, (req, res) => {
  Role.getListRole((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/role`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else {
    const body = req.body;
    Role.createRole(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add role"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/role/:id`, (req, res) => {
  const id = req.params.id;
  Role.getRoleById(id, (err, results) => {
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

app.patch(`${versionApi}/role`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Role.updateRole(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update role"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/role/:id`, (req, res) => {
  const params = req.params;
  Role.deleteRole(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});

//CRUD de ResponsableGroup requests************************************************************

app.get(`${versionApi}/responsablegrp`, (req, res) => {
  ResponsableGroup.getListResponsableGroup((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/responsablegrp`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    ResponsableGroup.create(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add responsable groupe"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/responsablegrp/:id`, (req, res) => {
  const id = req.params.id;
  ResponsableGroup.getResponsableGroupById(id, (err, results) => {
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

app.patch(`${versionApi}/responsablegrp`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    ResponsableGroup.update(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update responsable groupe"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/responsablegrp/:id`, (req, res) => {
  const params = req.params;
  ResponsableGroup.deleteResponsableGroup(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de Etudient requests************************************************************

app.get(`${versionApi}/etudiant`, (req, res) => {
  Etudient.getListEtudient((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/etudiant`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    Etudient.createEtudient(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add etudiant"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/etudiant/:id`, (req, res) => {
  const id = req.params.id;
  Etudient.getEtudientById(id, (err, results) => {
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

app.patch(`${versionApi}/etudiant`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Etudient.updateEtudient(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update etudient"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/etudiant/:id`, (req, res) => {
  const params = req.params;
  Etudient.deleteEtudient(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de Cursus requests************************************************************

app.get(`${versionApi}/cursus`, (req, res) => {
  Cursus.getListCursus((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/cursus`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    Cursus.createCursus(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add cursus"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/cursus/:id`, (req, res) => {
  const id = req.params.id;
  Cursus.getCursusById(id, (err, results) => {
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

app.patch(`${versionApi}/cursus`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Cursus.updateCursus(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update cursus"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/cursus/:id`, (req, res) => {
  const params = req.params;
  Cursus.deleteCursus(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de Domaine requests************************************************************

app.get(`${versionApi}/domaine`, (req, res) => {
  Domaine.getListDomaine((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/domaine`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    Domaine.createDomaine(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add domaine"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/domaine/:id`, (req, res) => {
  const id = req.params.id;
  Domaine.getDomaineById(id, (err, results) => {
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

app.patch(`${versionApi}/domaine`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Domaine.updateDomaine(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update role"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/domaine/:id`, (req, res) => {
  const params = req.params;
  Domaine.deleteDomaine(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});

//CRUD de Specialite requests************************************************************

app.get(`${versionApi}/specialite`, (req, res) => {
  Specialite.getListSpecialite((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/specialite`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    Specialite.createSpecialite(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add specialite"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})

app.get(`${versionApi}/specialite/:id`, (req, res) => {
  const id = req.params.id;
  Specialite.getSpecialiteById(id, (err, results) => {
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

app.patch(`${versionApi}/specialite`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Specialite.updateSpecialite(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update specialite"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/specialite/:id`, (req, res) => {
  const params = req.params;
  Specialite.deleteSpecialite(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de Niveau requests************************************************************

app.get(`${versionApi}/niveau`, (req, res) => {
  Niveau.getListNiveau((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/niveau`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    Niveau.createNiveau(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add niveau"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})


app.get(`${versionApi}/niveau/:id`, (req, res) => {
  const id = req.params.id;
  Niveau.getNiveauById(id, (err, results) => {
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

app.patch(`${versionApi}/niveau`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Niveau.updateNiveau(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update niveau"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/niveau/:id`, (req, res) => {
  const params = req.params;
  Niveau.deleteNiveau(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de classe requests************************************************************

app.get(`${versionApi}/classe`, (req, res) => {
  Classe.getListClasse((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/classe`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    Classe.createClasse(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add classe"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})


app.get(`${versionApi}/classe/:id`, (req, res) => {
  const id = req.params.id;
  Classe.getClasseById(id, (err, results) => {
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

app.patch(`${versionApi}/classe`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    Classe.updateClasse(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update classe"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/classe/:id`, (req, res) => {
  const params = req.params;
  Classe.deleteClasse(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});


//CRUD de demandeMaster requests************************************************************

app.get(`${versionApi}/demandemaster`, (req, res) => {
  DemandeMaster.getListDemandeMaster((results, err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.json({
        success: 1,
        data: results
      });
    }
  });
})

app.post(`${versionApi}/demandemaster`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de informations :( ")
  } else { 
    const body = req.body;
    DemandeMaster.createDemandeMaster(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Failed to add demande master"
        });
      }
      return res.status(200).json({
        success: 1,
        data: results
      });
    })
  }
})


app.get(`${versionApi}/demandemaster/:id`, (req, res) => {
  const id = req.params.id;
  DemandeMaster.getDemandeMasterById(id, (err, results) => {
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

app.patch(`${versionApi}/demandemaster`, (req, res) => {
  if (req.body === undefined || req.body === '') {
    res.json("Vous n'avez pas entré de message :( ")
  } else {
    const body = req.body;
    DemandeMaster.updateDemandeMaster(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (!results) {
        return res.json({
          success: 0,
          message: "Failed to update demande master"
        });
      } else {
        return res.status(200).json({
          success: 1,
          data: req.body
        });
      }
    });
  }
});

app.delete(`${versionApi}/demandemaster/:id`, (req, res) => {
  const params = req.params;
  ResponsableGroup.deleteResponsableGroup(params.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      return res.status(200).json({
        success: 1,
        data: "delete success"
      });
    }
  });

});



app.listen(process.env.APP_PORT, () => {
  console.log("Server up and running on port: ", process.env.APP_PORT);
})