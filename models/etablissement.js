let connexion = require("../config/db");

class Etablissement {
    constructor(row) {
        this.row = row;
    }


    static createAdresse(data, id_user, callBack) {
        connexion.query('INSERT INTO `adresse`( `code_postale`, `rue`, `ville`, `gouvernorat_adresse`, `pays`, `id_user`) VALUES (?,?,?,?,?,?)',
            [
                data.code_postale,
                data.rue,
                data.ville,
                data.gouvernorat_adresse,
                data.pays,
                id_user
            ],
            (err, rows) => {
                if (err) throw err;
                this.createEtablissement(data, res.insertId, function(){})
                callBack(null, res);
            });
    }

    static createEtablissement(data, id_adresse, callBack) {
        connexion.query(
            "INSERT INTO `etablissement`(`libelle`, `id_adresse`) VALUES (?, ?)",
            [data.libelle, id_adresse],
            (err, rows) => {
                if (err) throw err;
                callBack(null, res);
            });
    }

    static getListEtablissement(callBack) {
        connexion.query("SELECT * FROM `etablissement`, adresse WHERE etablissement.id_adresse=adresse.id_adresse",
            (err, rows) => {
                if (err) throw err;
                callBack(rows.map((row) => new Etablissement(row)))
            });
    }

    static getEtablissementById(id, callBack) {
        connexion.query(
            "SELECT * FROM `etablissement`, adresse WHERE etablissement.id_adresse=adresse.id_adresse and etablissement.id_etablissement = ? limit 1",
            [id],
            (err, rows) => {
                if (err) throw err;
                callBack(null, res);
            }
        );
    }

    static updateAdresse(data, callback) {
        connexion.query('update `adresse`set `code_postale` = ?, `rue` = ?, `ville` = ?, `gouvernorat_adresse` = ?, `pays` = ? where `id_user` = ?',
            [
                data.code_postale,
                data.rue,
                data.ville,
                data.gouvernorat_adresse,
                data.pays,
                null
            ],
            (err, res) => {
                if (err) throw err
                this.updateAdresse(data, res.insertId, function () { });
                return callback(null, res);

            }
        )
    }

    static updateEtablissement(data, callBack) {
        connexion.query(
            "UPDATE `etablissement` SET libelle`=?,`id_adresse`=? where id = ?",
            [data.libelle, id_adresse, data.idEtablissement],
            (err, rows) => {
                if (err) throw err;
                callBack(null, res);
            }
        );
    }

    static deleteEtablissement(id, callBack) {
        connexion.query("DELETE FROM `etablissement` where id = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            });
    }
}

module.exports = Etablissement;
