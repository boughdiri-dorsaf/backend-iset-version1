let connexion = require("../config/db");

class Role {
    constructor(row) {
        this.row = row;
    }

    static createRole(data, callBack) {
        connexion.query(
            "INSERT INTO `role`(`libelle`) VALUES (?)",
            [data.libelle],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListRole(callBack) {
        connexion.query("SELECT * FROM `role`",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Role(row)))
            });
    }

    static getRoleById(id_role, callBack) {
        connexion.query(
            "SELECT * FROM `role` where id_role = ?",
            [id_role],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateRole(data, callBack) {
        connexion.query(
            "UPDATE `role` SET `libelle`=? where id_role = ?",
            [data.libelle, data.id_role],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteRole(id_role, callBack) {
        connexion.query(
            "DELETE FROM `role` where id_role = ?",
            [id_role],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}

module.exports = Role;
