let connexion = require("../config/db")

class Master {

    constructor(row) {
        this.row = row;
    }

    static createMaster(data, callBack) {
        connexion.query(
            "INSERT INTO `master`(`nom`, `id_departement`, `seuil_admission`, `seuil_admis_attente`, `date_fin_master`, `id_etablissement`) VALUES (?, ?, ?, ?, ?, ?)",
            [data.nom, data.id_departement, data.seuil_admission, data.seuil_admis_attente, data.date_fin_master, data.id_etablissement],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListMaster(callBack) {
        connexion.query("SELECT * FROM `departement`",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Departement(row)))
            });
    }

    static getMasterById(id, callBack) {
        connexion.query(
            "SELECT * FROM `departement` where id_departement = ?",
            [id],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateMaster(data, callBack) {
        connexion.query(
            "UPDATE `departement` SET `code`=?,`libelle`=?,`description`=? where id_departement = ?",
            [data.code, data.libelle, data.description, data.id_departement],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteMaster(id, callBack) {
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

module.exports = Master
