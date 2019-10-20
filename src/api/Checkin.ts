import { connection } from "./connection";
import { Login } from "./Login";
import { testCPF, validateEmail } from "./Person";

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

    static async getAuditorioPersons() {
        if (!Checkin.auditorio)
            return [];
        let conn = await connection();
        let query = await conn.query(`
            (
                SELECT 
                    name, 
                    lastname, 
                    0 AS outsider, 
                    check_in 
                FROM 
                    subscription 
                    JOIN person ON person.id = person_id 
                WHERE 
                    check_in IS NOT NULL AND 
                    activity_id=?
            ) UNION (
                SELECT DISTINCT 
                    name, 
                    lastname, 
                    1 AS outsider, 
                    date AS check_in 
                FROM 
                    outsider 
                WHERE 
                    activity_id=? 
                GROUP BY 
                    document_id
            ) 
            ORDER BY 
                check_in DESC        
                `, [Checkin.auditorio.id, Checkin.auditorio.id]);
        return query;
    }

    static async right(cpf: string) {
        cpf = (cpf || '').replace(/[\.-]/g, '');

        let outsider = null;
        let inscricao = null;
        let person = null;

        if (!testCPF(cpf)) throw {
            err: true,
            msg: 'Número de CPF inválido.'
        }

        let conn = await connection();

        // find person
        let query = await conn.query('SELECT id, name, lastname, email FROM person WHERE document_id=? LIMIT 1', [cpf]);

        person = query[0];

        if (person)
            inscricao = await conn.query('SELECT id, check_in FROM subscription WHERE person_id=? AND activity_id=? LIMIT 1', [person.id, Checkin.auditorio.id]);
        else
            outsider = await conn.query('SELECT null as id, name, lastname, email FROM outsider WHERE activity_id=? AND document_id=? LIMIT 1', [Checkin.auditorio.id, cpf]);

        if (outsider && outsider[0]) return {
            ...outsider[0],
            act: null
        };

        if (!inscricao) return {
            ...person,
            act: null
        }

        if (!inscricao[0].check_in)
            await conn.query('UPDATE subscription SET check_in=NOW() WHERE person_id=? AND activity_id=? LIMIT 1', [person.id, Checkin.auditorio.id]);

        return {
            ...person,
            act: inscricao[0]
        };
    }

    static async left(cpf: string, name: string, lastname: string, email: string) {
        cpf = (cpf || '').replace(/[\.-]/g, '')
        name = name || '';
        lastname = lastname || '';
        email = email || '';

        if (!testCPF(cpf)) throw {
            err: true,
            msg: 'Número de CPF inválido.'
        }

        if (name.trim() == '' || name.length < 3) throw {
            err: true,
            msg: 'Não deixe o campo nome em branco.'
        }

        if (lastname.trim() == '' || lastname.length < 3) throw {
            err: true,
            msg: 'Não deixe o campo sobrenome em branco.'
        }


        email = email.trim();

        if (!validateEmail(email)) throw {
            err: true,
            msg: 'Email inválido.'
        }

        let conn = await connection();

        let query = await conn.query('SELECT id FROM outsider WHERE activity_id=? AND document_id=? LIMIT 1', [Checkin.auditorio.id, cpf,])

        if (query[0])
            return true;

        query = await conn.query('INSERT INTO outsider(activity_id, document_id, name, lastname, email) VALUES(?, ?, ?, ?, ?)', [
            Checkin.auditorio.id,
            cpf,
            name,
            lastname,
            email
        ]);
        return true;
    }
}