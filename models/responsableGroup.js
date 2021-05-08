let connexion = require("../config/db");

class ResponsableGroup {
    constructor(row) {
        this.row = row;
    }

    static create(data, callback) {
        connexion.query('INSERT INTO `user`( `nom`, `prenom`, `email`, `password`,`age`, `cin`, `sexe`, `num_passport`, `date_naissance`,`id_role`,reset_link) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [
                data.nom,
                data.prenom,
                data.email,
                data.password,
                data.age,
                data.cin,
                data.sexe,
                data.num_passport,
                data.date_naissance,
                data.id_role,
                null
            ], (err, res) => {
                if (err) throw err
                this.createResponsableGroup(data, res.insertId, function () { })
                return callback(null, res);
            })
    }

    static createResponsableGroup(data, id_user, callBack) {
        connexion.query(
            "INSERT INTO `responsable_group`(`qualite`, `id_user`) VALUES (?, ?)",
            [data.qualite, id_user],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListResponsableGroup(callBack) {
        connexion.query("SELECT * FROM `responsable_group`,user WHERE responsable_group.id_user=user.id_user",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new ResponsableGroup(row)))
            });
    }

    static getResponsableGroupById(id_responsable_group, callBack) {
        connexion.query(
            "SELECT * FROM `responsable_group`,user WHERE responsable_group.id_user=user.id_user and id_responsable_group = ?",
            [id_responsable_group],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static update(data, callBack) {
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
                if (err) throw err
                this.updateResponsableGroup(data, res.insertId, function () { })
                return callBack(null, res);
            }
        );
    };

    static updateResponsableGroup(data, id_user, callBack) {
        connexion.query(
            "UPDATE `responsable_group` SET `qualite`=?,`id_user`=? where id_responsable_group = ?",
            [data.qualite, id_user, data.id_responsable_group],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteResponsableGroup(id, callBack) {
        connexion.query(
            "DELETE FROM `responsable_group` where id_responsable_group = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}

module.exports = ResponsableGroup;
