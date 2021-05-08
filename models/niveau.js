let connexion = require("../config/db");

class Niveau {
    constructor(row) {
        this.row = row;
    }

    static createNiveau(data, callBack) {
        connexion.query(
            "INSERT INTO `niveau`(`libelle`) VALUES (?)",
            [data.libelle],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListNiveau(callBack) {
        connexion.query("SELECT * FROM `niveau`",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Niveau(row)))
            });
    }

    static getNiveauById(id_niveau, callBack) {
        connexion.query(
            "SELECT * FROM `niveau` where id_niveau = ?",
            [id_niveau],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateNiveau(data, callBack) {
        connexion.query(
            "UPDATE `niveau` SET `libelle`=? where id_niveau = ?",
            [data.libelle, data.id_niveau],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteNiveau(id, callBack) {
        connexion.query(
            "DELETE FROM `niveau` where id_niveau = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}

module.exports = Niveau;
