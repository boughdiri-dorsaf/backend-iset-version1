let connexion = require("../config/db");

class DemandeMaster {
    constructor(row) {
        this.row = row;
    }

    static createDemandeMaster(data, callBack) {
        connexion.query(
            "INSERT INTO `demande_master`(`date_inscrit`, `etat`, `id_master`, `id_etudiant`, `fichier`) VALUES (?,?,?,?,?)",
            [data.date_inscrit, data.etat, data.id_master, data.id_etudiant, data.fichier],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListDemandeMaster(callBack) {
        connexion.query("SELECT * FROM `demande_master`, master, etudiant, etablissement,departement,user,adresse WHERE demande_master.id_master = master.id_master and master.id_departement=departement.id_departement and master.id_etablissement=etablissement.id_etablissement and demande_master.id_etudiant = etudiant.id_etudiant and etudiant.id_user = user.id_user and adresse.id_user=user.id_user ",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new DemandeMaster(row)))
            }
        );
    }

    static getDemandeMasterById(id_demande, callBack) {
        connexion.query(
            "SELECT * FROM `demande_master`, master, etudiant, etablissement,departement,user,adresse WHERE demande_master.id_master = master.id_master and master.id_departement=departement.id_departement and master.id_etablissement=etablissement.id_etablissement and demande_master.id_etudiant = etudiant.id_etudiant and etudiant.id_user = user.id_user and adresse.id_user=user.id_user AND demande_master.id_demande=?",
            [id_demande],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateDemandeMaster(data, callBack) {
        connexion.query(
            "UPDATE `demande_master` SET `date_inscrit`=?,`etat`=?,`id_master`=?,`id_etudiant`=?,`fichier`=? WHERE id_demande =?",
            [data.date_inscrit, data.etat, data.id_master, data.id_etudiant, data.fichier, data.id_demande],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteDemandeMaster(id_classe, callBack) {
        connexion.query(
            "DELETE FROM `demande_master` WHERE id_demande = ?",
            [id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}
module.exports = DemandeMaster;
