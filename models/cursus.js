let connexion = require("../config/db");

class Cursus {
    constructor(row) {
        this.row = row;
    }

    static createCursus(data, callBack) {
        connexion.query(
            "INSERT INTO `cursus`(`annee`, `moyenne`, `credit`, `mention`, `session`, `note_pfe`, `id_domaine`, `id_etablissement`, id_niveau, id_etudient) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [data.annee, data.moyenne, data.credit,data.mention, data.session, data.note_pfe, data.id_domaine, data.id_etablissement, data.id_niveau, data.id_etudient],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static getListCursus(callBack) {
        connexion.query("SELECT * FROM cursus,domaine,etablissement,specialite,niveau WHERE cursus.id_domaine=domaine.id_domaine and cursus.id_etablissement=etablissement.id_etablissement and cursus.id_specialite=specialite.id_specialite and cursus.id_niveau=niveau.id_niveau",
            (err, res) => {
                if (err) throw err;
                callBack(res.map((row) => new Cursus(row)))
            }
        );
    }

    static getCursusById(id_classe, callBack) {
        connexion.query(
            "SELECT * FROM cursus,domaine,etablissement,specialite,niveau WHERE cursus.id_domaine=domaine.id_domaine and cursus.id_etablissement=etablissement.id_etablissement and cursus.id_specialite=specialite.id_specialite and cursus.id_niveau=niveau.id_niveau and cursus.id_cursus =?",
            [id_classe],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static updateCursus(data, callBack) {
        connexion.query(
            "UPDATE `cursus` SET `annee`=?,`moyenne`=?,`credit`=?,`mention`=?,`session`==?,`note_pfe`=?,`id_domaine`=?,`id_etablissement`=?,`id_specialite`=?,`id_niveau`=? WHERE id_cursus=?",
            [data.annee, data.moyenne, data.credit,data.mention, data.session, data.note_pfe, data.id_domaine, data.id_etablissement, data.id_specialite, data.id_niveau, data.id_cursus],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }

    static deleteCursus(id_cursus, callBack) {
        connexion.query(
            "DELETE FROM `cursus` WHERE id_cursus=?",
            [id_cursus],
            (err, res) => {
                if (err) throw err;
                return callBack(null, res);
            }
        );
    }
}
module.exports = Cursus;
