let connexion = require("../config/db");

class Etablissement {
    constructor(row) {
        this.row = row;
    }


    static createAdresse(data, callBack) {
        connexion.query('INSERT INTO `adresse`( `code_postale`, `rue`, `ville`, `gouvernorat_adresse`, `pays`, `id_user`) VALUES (?,?,?,?,?,?)',
            [
                data.code_postale,
                data.rue,
                data.ville,
                data.gouvernorat_adresse,
                data.pays,
                null
            ],
            (err, rows) => {
                if (err) throw err;
                this.createEtablissement(data, rows.insertId, function(){})
                callBack(null, rows);
            });
    }

    static createEtablissement(data, id_adresse, callBack) {
        connexion.query(
            "INSERT INTO `etablissement`(`libelle`, `id_adresse`) VALUES (?, ?)",
            [data.libelle, id_adresse],
            (err, rows) => {
                if (err) throw err;
                callBack(null, rows);
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
                callBack(null, rows);
            }
        );
    }
    
    static updateEtablissement(data, callBack) {
        connexion.query(
            "UPDATE `etablissement`,adresse SET etablissement.libelle =?,adresse.code_postale =?, adresse.rue =?, adresse.ville = ?, adresse.gouvernorat_adresse = ?, adresse.pays = ?, adresse.id_user = ? where etablissement.id_adresse = adresse.id_adresse and etablissement.id_etablissement = ?",
            [data.libelle,data.code_postale, data.rue, data.ville, data.gouvernorat_adresse, data.pays, null, data.id_etablissement],
            (err, rows) => {
                if (err) throw err;
                callBack(null, rows);
            }
        );
    }

}

module.exports = Etablissement;
