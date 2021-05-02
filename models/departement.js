let connexion = require("../config/db");

class Departement {
    constructor(row) {
        this.row = row;
    }

    static createDepartement(data, callBack) {
        connexion.query(
            "INSERT INTO `departement`(`code`, `libelle`, `description`) VALUES (?, ?, ?)",
            [data.code, data.libelle, data.description],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListDepartement(callBack) {
        connexion.query("SELECT * FROM `departement`",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Departement(row)))
            });
    }

    static getDepartementById(id, callBack) {
        connexion.query(
            "SELECT * FROM `departement` where id_departement = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateDepartement(data, callBack) {
        connexion.query(
            "UPDATE `departement` SET `code`=?,`libelle`=?,`description`=? where id_departement = ?",
            [data.code, data.libelle, data.description, data.id_departement],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteDepartement(id, callBack) {
        connexion.query(
            "DELETE FROM `departement` where id_departement = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}

module.exports = Departement;
