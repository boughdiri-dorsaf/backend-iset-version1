let connexion = require("../config/db")

class User{

    constructor(row){
      this.row = row;
    }

    static getUsers(callBack){
      connexion.query('Select * from user', (err, rows) => {
        if(err) throw err
        callBack(rows.map((row) => new User(row)))
      })
    };

    static create(data, callback){
      connexion.query('INSERT INTO `user`(`email`, `password`, `id_role`, `nom`, `prenom`, `age`, `cin`, `sexe`, `num_passport`, `date_naissance`) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
       data.email,
       data.password,
       1,
       data.nom,
       data.prenom,
       data.age,
       data.cin,
       data.sexe,
       data.num_passport,
       data.date_naissance 
      ], (err, res) => {
        if(err) throw err
        this.createAdresse(data,res.insertId,function(){})      
        return callback(null, res);

        
      })
    }
    static createAdresse(data, id_user, callback){
      connexion.query('INSERT INTO `adresse`( `code_postale`, `rue`, `ville`, `gouvernorat_adresse`, `pays`, `id_user`) VALUES (?,?,?,?,?,?)',
      [
       data.code_postale,
       data.rue,
       data.ville,
       data.gouvernorat_adresse,
       data.pays,
       id_user
      ], 
      (err, res) => {
        if(err) throw err      
        return callback(null, res);

      }
      )
    }

    static getUserByUserId(id, callBack){
      connexion.query(
        `select * from user, adresse where user.id_user = adresse.id_user and user.id_user=?`,
        [id],
        (error, results, fields) => {
          if (error) {
            callBack(error);
          }
          return callBack(null, results);
        }
      );
    };

  static getAdresse(id_user, callBack){
    connexion.query('select * from adresse where id_user = ?',
    [
     id_user
    ], 
    (error, results, fields) => {
      if (error) {
        callBack(error);
      }
    }
    );
  }

  static updateUser(data, callBack){
    connexion.query('Update `user` set `email` = ?, `password` = ?, `id_role` = ?, `nom` = ?, `prenom` = ?, `age` = ?, `cin` = ?, `sexe` = ?, `num_passport` = ?, `date_naissance` = ? where id_user = ?',
      [
       data.email,
       data.password,
       1,
       data.nom,
       data.prenom,
       data.age,
       data.cin,
       data.sexe,
       data.num_passport,
       data.date_naissance,
       data.id_user
      ], (err, res) => {
        if(err) throw err
        this.updateAdresse(data, function(){})
        return callBack(null, res);
      }
    );
  };

  static updateAdresse(data, callback){
    connexion.query('update `adresse`set `code_postale` = ?, `rue` = ?, `ville` = ?, `gouvernorat_adresse` = ?, `pays` = ? where `id_user` = ?',
    [
     data.code_postale,
     data.rue,
     data.ville,
     data.gouvernorat_adresse,
     data.pays,
     data.id_user
    ], 
    (err, res) => {
      if(err) throw err
      return callback(null, res);

    }
    )
  }

  static getUserByUserEmail(email, callBack){
    connexion.query(
      `select * from user where email = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  };

  static updateResetLinkUser(password, email, callBack){
    connexion.query(
      'update user set reset_link =? where `email` = ?',
      [
        password,
        email
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  };
  
  static getPasswordUser(resetLink, callBack){
    connexion.query(
      'select password from user where reset_link = ?',
      [
        resetLink,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  };

  static updatePasswordUser(password, resetLink, callBack){
    connexion.query(
      'update user set password = ? where reset_link = ?',
      [
        password,
        resetLink
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  };
  
    
}

module.exports = User
