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
        connexion.query("select * from master, departement, etablissement where master.id_departement = departement.id_departement and master.id_etablissement=etablissement.id_etablissement",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Master(row)))
            });
    }

    static getMasterById(id_master, callBack) {
        connexion.query("select * from master, departement, etablissement where master.id_departement = departement.id_departement and master.id_etablissement=etablissement.id_etablissement and master.id_master = ?",
        [id_master],
        (err, res) => {
            if (err) throw err;
            return callBack(null, res);
        });
    }

    static updateMaster(data, callBack) {
        connexion.query(
            'UPDATE `master` SET `nom`=?,`id_departement`=?,`seuil_admission`=?,`seuil_admis_attente`=?,`date_fin_master`=?,`id_etablissement`=? WHERE id_master=?',
            [data.nom, data.id_departement, data.seuil_admission, data.seuil_admis_attente, data.date_fin_master, data.id_etablissement, data.id_master],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteMaster(id_master, callBack) {
        connexion.query(
            "DELETE FROM `master` WHERE `id_master`=?",
            [id_master],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

}

module.exports = Master
