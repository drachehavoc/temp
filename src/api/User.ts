import { connection } from "./connection";
import { Login } from './Login';
import { Session } from "./Session";

export class User {
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
                let perfil = {
                    name: data.name,
                    lastname: data.lastname,
                    document_id: data.document_id,
                    birth: data.birth,
                    birth_city: data.birth_city,
                    current_city: data.current_city,
                    current_school: data.current_school,
                    email: data.email,
                };
                let perfilKeys = Object.keys(perfil);
                let perfilVals = Object.values(perfil);
                let pInfo = await conn.query(`INSERT INTO perfil(${perfilKeys.join(', ')}) VALUES(${'?, '.repeat(perfilVals.length - 1)} ?)`, perfilVals);
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

                let perfil = {
                    "name=?": data.name,
                    "lastname=?": data.lastname,
                    "birth=?": data.birth,
                    "birth_city=?": data.birth_city,
                    "current_city=?": data.current_city,
                    "current_school=?": data.current_school,
                    "email=?": data.email,
                };

                let perfilKeys = Object.keys(perfil);
                let perfilVals = Object.values(perfil);
                let pInfo = await conn.query(`UPDATE perfil SET ${perfilKeys.join(', ')} WHERE id=? LIMIT 1`, [...perfilVals, session.store.perfil]);
                let lInfo = await Login.alter(session.store.login, data.email, data.password);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}