let connexion = require("../config/db");

class Classe {
    constructor(row) {
        this.row = row;
    }

    static createClasse(data, callBack) {
        connexion.query(
            "INSERT INTO `classe`(`libelle`, `id_responsable`, `nb_etudiant`) VALUES (?, ?, ?)",
            [data.libelle, data.id_responsable, data.nb_etudiant],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListClasse(callBack) {
        connexion.query("SELECT * FROM `classe`,responsable_group,user,adresse WHERE classe.id_responsable=responsable_group.id_responsable_group and responsable_group.id_user=user.id_user and adresse.id_user=user.id_user",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Classe(row)))
            }
        );
    }

    static getClasseById(id_classe, callBack) {
        connexion.query(
            "SELECT * FROM `classe`,responsable_group,user,adresse WHERE classe.id_responsable=responsable_group.id_responsable_group and responsable_group.id_user=user.id_user and adresse.id_user=user.id_user and classe.id_classe = ?",
            [id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateClasse(data, callBack) {
        connexion.query(
            "UPDATE `classe` SET `libelle`=?,`id_responsable`=?,`nb_etudiant`=? WHERE id_classe=?",
            [data.libelle, data.id_responsable, data.nb_etudiant, data.id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteClasse(id_classe, callBack) {
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
module.exports = Classe;
