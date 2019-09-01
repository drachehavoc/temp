import crypto from 'crypto';
import { Session } from "./Session";
import { connection } from "./connection";

const digest = 'sha256';
const iterations = 35;
const keyLength = 32;
const salt = `
        A religião do futuro será cósmica e transcenderá um Deus pessoal, evitando os dogmas e a teologia.
        Deus é a lei e o legislador do Universo.
        Deus é hábil, mas nunca enganador. 
        Deus não joga aos dados.
    `.replace(/\s/g, '');

export class Login {
    static async secret(user: string, pass: string) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(`${user}${pass}`, salt, keyLength, iterations, digest,
                (err, derivedKeyBuffer) => err
                    ? reject(err)
                    : resolve(derivedKeyBuffer.toString('base64'))
            );
        });
    }

    static async register(userId: number, login: string, pass: string) {
        let secret = await Login.secret(login, pass);
        let conn = await connection();
        let info = await conn.query(`INSERT INTO login(perfil_id, secret) VALUES(?, ?)`, [userId, secret]);
        return info;
    }

    static async alter(userId: number, login: string, pass: string) {
        let secret = await Login.secret(login, pass);
        let conn = await connection();
        let info = await conn.query(`UPDATE login SET secret=? WHERE id=? LIMIT 1`, [secret, userId]);
        return info;
    }

    static async find(login: string, pass: string) {
        return new Promise(async (resolve, reject) => {
            let secret = await Login.secret(login, pass);
            let conn = await connection();
            let stream = conn.queryStream('SELECT id, perfil_id FROM login WHERE secret = ? LIMIT 1', [secret]);
            stream.on('data', row => resolve(new Session({ perfil: row.perfil_id, login: row.id }).id));
            stream.on('error', err => reject(err));
            stream.on('end', () => reject(null));
            stream.on('close', () => reject(null));
        })
    }

    static logout(ses: string) {
        let session = Session.find(ses);
        if (session) session.selfDestruct();
        return session != null;
    }
}