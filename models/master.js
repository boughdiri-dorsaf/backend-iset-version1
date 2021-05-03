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
        connexion.query("select * from master, departement, etablissement, adresse where master.id_departement = departement.id_departement and master.id_etablissement=etablissement.id_etablissement and etablissement.id_adresse = adresse.id_adresse",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Master(row)))
            });
    }

}

module.exports = Master
