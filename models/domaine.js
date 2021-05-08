let connexion = require("../config/db");

class Domaine {
    constructor(row) {
        this.row = row;
    }

    static createDomaine(data, callBack) {
        connexion.query(
            "INSERT INTO `domaine`(`libelle`) VALUES (?)",
            [data.libelle],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListDomaine(callBack) {
        connexion.query("SELECT * FROM `domaine`",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Domaine(row)))
            });
    }

    static getDomaineById(id_domaine, callBack) {
        connexion.query(
            "SELECT * FROM `domaine` where id_domaine = ?",
            [id_domaine],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateDomaine(data, callBack) {
        connexion.query(
            "UPDATE `domaine` SET `libelle`=? where id_domaine = ?",
            [data.libelle, data.id_domaine],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteDomaine(id, callBack) {
        connexion.query(
            "DELETE FROM `domaine` where id_domaine = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}

module.exports = Domaine;
