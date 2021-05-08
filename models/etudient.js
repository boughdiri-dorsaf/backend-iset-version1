let connexion = require("../config/db");

class Etudient {
    constructor(row) {
        this.row = row;
    }

    static createEtudient(data, callBack) {
        connexion.query(
            "INSERT INTO `etudiant`(`gouvern_naissance`, `situation`, `id_classe`, `id_departement`, `id_user`) VALUES (?,?,?,?,?)",
            [data.gouvern_naissance, data.situation, data.id_classe, data.id_departement, data.id_user],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListEtudient(callBack) {
        connexion.query("SELECT * FROM `etudiant`,classe,departement,cursus,user WHERE etudiant.id_classe=classe.id_classe and etudiant.id_departement=departement.id_departement and etudiant.id_cursus=cursus.id_cursus and etudiant.id_user=user.id_user",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Etudient(row)))
            }
        );
    }

    static getEtudientById(id_classe, callBack) {
        connexion.query(
            "SELECT * FROM `etudiant`,classe,departement,cursus,user WHERE etudiant.id_classe=classe.id_classe and etudiant.id_departement=departement.id_departement and etudiant.id_cursus=cursus.id_cursus and etudiant.id_user=user.id_user and etudiant.id_etudiant =?",
            [id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateEtudient(data, callBack) {
        connexion.query(
            "UPDATE `etudiant` SET `id_etudiant`=?,`gouvern_naissance`=?,`situation`=?,`id_classe`=?,`id_departement`=?,`id_cursus`=?,`id_user`=? WHERE etudiant.id_etudiant =?",
            [data.gouvern_naissance, data.situation, data.id_classe, data.id_departement, data.id_cursus, data.id_user, data.id_etudiant],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteEtudient(id_etudiant, callBack) {
        connexion.query(
            "DELETE FROM `etudiant` WHERE id_etudiant=?",
            [id_etudiant],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}
module.exports = Etudient;
