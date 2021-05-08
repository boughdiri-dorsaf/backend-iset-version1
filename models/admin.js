let connexion = require("../config/db")

class Admin{

    constructor(row){
      this.row = row;
    }

    static getAdminById(id, callBack){
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

    static updateAdmin(data, callBack){
        connexion.query('Update `user` set `email` = ?, `password` = ?, `id_role` = ?, `nom` = ?, `prenom` = ?, `age` = ?, `cin` = ?, `sexe` = ?, `num_passport` = ?, `date_naissance` = ? where id_user = ?',
            [
            data.email,
            data.password,
            2,
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
                return callBack(null, res);
            }
        );
    };

    static getAdminByEmail(email, callBack){
        connexion.query(
        `select * from user where email = ? and id_role=2`,
        [email],
        (error, results, fields) => {
            if (error) {
            callBack(error);
            }
            return callBack(null, results[0]);
        }
        );
    };
  

    
}

module.exports = Admin
