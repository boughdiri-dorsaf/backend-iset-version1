let connexion = require("../config/db");

class Etablissement {
    constructor(row) {
        this.row = row;
    }

    static createEtablissement(data, callBack) {
        connexion.query(
            "INSERT INTO `etablissement`(`libelle`, `code_postale`, `rue`, `ville`, `gouvernorat_adresse`, `pays`) VALUES (?, ?, ?, ?, ?, ?)",
            [data.libelle, data.code_postale, data.rue, data.ville, data.gouvernorat_adresse, data.pays],
            (err, rows) => {
                if (err) throw err;
                callBack(null, rows);
            });
    }

    static getListEtablissement(callBack) {
        connexion.query("SELECT * FROM `etablissement`",
            (err, rows) => {
                if (err) throw err;
                callBack(rows.map((row) => new Etablissement(row)))
            });
    }

    static getEtablissementById(id, callBack) {
        connexion.query(
            "SELECT * FROM `etablissement` WHERE id_etablissement = ?",
            [id],
            (err, rows) => {
                if (err) throw err;
                callBack(null, rows);
            }
        );
    }
    
    static updateEtablissement(data, callBack) {
        connexion.query(
            "UPDATE `etablissement` SET libelle =?, code_postale =?, rue =?, ville = ?, gouvernorat_adresse = ?, pays = ? where id_etablissement = ?",
            [data.libelle,data.code_postale, data.rue, data.ville, data.gouvernorat_adresse, data.pays, null, data.id_etablissement],
            (err, rows) => {
                if (err) throw err;
                callBack(null, rows);
            }
        );
    }

    static deleteEtablissement(id_etablissement, callBack) {
        connexion.query(
            "delete from `etablissement` where id_etablissement = ?",
            [id_etablissement],
            (err, rows) => {
                if (err) throw err;
                callBack(null, rows);
            }
        );
    }

}

module.exports = Etablissement;
