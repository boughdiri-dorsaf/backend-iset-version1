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
        connexion.query("SELECT * FROM `classe`,responsable_group,user,adresse WHERE classe.id_responsable=responsable_group.id_responsable_group and responsable_group.id_user=user.id_user and adresse.id_user=user.id_user",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Classe(row)))
            }
        );
    }

    static getDemandeMasterById(id_classe, callBack) {
        connexion.query(
            "SELECT * FROM `classe`,responsable_group,user,adresse WHERE classe.id_responsable=responsable_group.id_responsable_group and responsable_group.id_user=user.id_user and adresse.id_user=user.id_user and classe.id_classe = ?",
            [id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateDemandeMaster(data, callBack) {
        connexion.query(
            "UPDATE `classe` SET `libelle`=?,`id_responsable`=?,`nb_etudiant`=? WHERE id_classe=?",
            [data.libelle, data.id_responsable, data.nb_etudiant, data.id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteDemandeMaster(id_classe, callBack) {
        connexion.query(
            "DELETE FROM `classe` WHERE `id_classe`=?",
            [id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}
module.exports = DemandeMaster;
