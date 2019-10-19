import { connection } from "./connection";
import { Login } from "./Login";

export class Checkin {
    static auditorio: any = null;

    static async select(hash: string, activity_id: string) {
        let check = await Login.checkSecret(hash);
        if (!check) return false;
        Checkin.auditorio = activity_id;
        let conn = await connection();
        let query = await conn.query('SELECT id, title, slug FROM activity WHERE id=? LIMIT 1', [activity_id]);
        if (query[0])
            Checkin.auditorio = query[0];
        return true;
    }

    static async getCurrentAuditorio() {
        return Checkin.auditorio || false;
    }

    static async right(cpf: string) {
        let conn = await connection();
        let query = await conn.query('SELECT id, name, lastname, email FROM person WHERE document_id=?', [cpf.replace(/[\.-]/g, '')]);
        if (!query[0]) return false;
        let person = query[0];
        query = await conn.query('SELECT id, check_in FROM subscription WHERE person_id=? AND activity_id=?', [person.id, Checkin.auditorio.id]);
        if (!query[0]) return { ...person, act: null };
        let act = query[0];
        if (!act.check_in)
            await conn.query('UPDATE subscription SET check_in=NOW() WHERE person_id=? AND activity_id=?', [person.id, Checkin.auditorio.id]);
        return { ...person, act };
    }

    static async left(cpf: string, name: string, lastname: string, email: string) {
        let conn = await connection();
        let query = await conn.query('INSERT INTO outsider(activity_id, document_id, name, lastname, email) VALUES(?, ?, ?, ?, ?)', [
            Checkin.auditorio.id,
            cpf.replace(/[\.-]/g, ''),
            name,
            lastname,
            email
        ]);
        return true;
    }
}