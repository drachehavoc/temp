import { connection } from "./connection";
import { Login } from './Login';
import { Session } from "./Session";

export class Person {
    static async register(data: {
        name: string,
        lastname: string,
        document_id: string,
        birth: Date,
        birth_city: number,
        current_city: number,
        current_school: number,
        // login data
        email: string,
        password: string
    }) {
        return new Promise(async (resolve, reject) => {
            let conn = await connection();
            try {
                let person = {
                    name: data.name,
                    lastname: data.lastname,
                    document_id: data.document_id,
                    birth: data.birth,
                    birth_city: data.birth_city,
                    current_city: data.current_city,
                    current_school: data.current_school,
                    email: data.email,
                };
                let personKeys = Object.keys(person);
                let personVals = Object.values(person);
                let pInfo = await conn.query(`INSERT INTO person(${personKeys.join(', ')}) VALUES(${'?, '.repeat(personVals.length - 1)} ?)`, personVals);
                let lInfo = await Login.register(pInfo.insertId, data.email, data.password);
                let ses = new Session().id;
                resolve(ses);
            } catch (err) {
                reject(err);
            }
        });
    }

    static async alter(
        ses: string,
        data: {
            name: string,
            lastname: string,
            birth: Date,
            birth_city: number,
            current_city: number,
            current_school: number,
            // login data
            email: string,
            password: string
        }
    ) {
        return new Promise(async (resolve, reject) => {
            let conn = await connection();
            try {
                let session = Session.find(ses);

                if (!session) throw {
                    err: true,
                    msg: 'você precisa logar-se para alterar seus dados'
                };

                let person = {
                    "name=?": data.name,
                    "lastname=?": data.lastname,
                    "birth=?": data.birth,
                    "birth_city=?": data.birth_city,
                    "current_city=?": data.current_city,
                    "current_school=?": data.current_school,
                    "email=?": data.email,
                };

                let personKeys = Object.keys(person);
                let personVals = Object.values(person);
                let pInfo = await conn.query(`UPDATE person SET ${personKeys.join(', ')} WHERE id=? LIMIT 1`, [...personVals, session.store.person]);
                let lInfo = await Login.alter(session.store.login, data.email, data.password);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    static async me(ses: string) {
        let conn = await connection();
        let session = Session.find(ses);
        if (!session) throw {
            err: true,
            msg: 'você precisa logar-se para visualizer seus dados'
        };
        let row = await conn.query(`SELECT name, lastname, document_id, email, birth, current_school FROM person WHERE id = ? LIMIT 1`, [session.store.person]);
        return row[0] || null;
    }
}