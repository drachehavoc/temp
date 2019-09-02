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
        Deus não joga dados.
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

    static permission(ses: string, permissionHash: string) {
        let session = Session.find(ses);
        if (!session) throw {
            err: true,
            msg: `Você precisa logar-se para executar esta ação`
        }
        if(!session.store.permissions.has(permissionHash)) throw {
            err: true,
            msg: `Você não tem premissão para executar esta ação, é requerido o privilégio '${permissionHash}'`
        };
        return session;
    }

    static async loadPermissions(store: any) {
        let conn = await connection();
        let streamUserPermission = conn.queryStream(`
            SELECT 
                hash 
            FROM 
                permission_login 
                    LEFT JOIN permission 
                        ON permission.id = permission_id 
            WHERE 
                login_id=?`
            , [store.login]);

        let streamUserGroup = conn.queryStream(`
            SELECT 
                hash
            FROM 
                permission_group
                    LEFT JOIN permission 
                        ON permission.id = permission_id 
            WHERE 
                group_id=?`
            , [store.group]);

        streamUserPermission.on('data', row => store.permissions.add(row.hash));
        streamUserGroup.on('data', row => store.permissions.add(row.hash));
        return true;
    }

    static async register(userId: number, login: string, pass: string) {
        let secret = await Login.secret(login, pass);
        let conn = await connection();
        let info = await conn.query(`INSERT INTO login(person_id, secret_key) VALUES(?, ?)`, [userId, secret]);
        return info;
    }

    static async alter(userId: number, login: string, pass: string) {
        let secret = await Login.secret(login, pass);
        let conn = await connection();
        let info = await conn.query(`UPDATE login SET secret_key=? WHERE id=? LIMIT 1`, [secret, userId]);
        return info;
    }

    static async find(login: string, pass: string) {
        return new Promise(async (resolve, reject) => {
            let secret = await Login.secret(login, pass);
            let conn = await connection();
            let stream = conn.queryStream('SELECT id, person_id, group_id FROM login WHERE secret_key=? LIMIT 1', [secret]);
            stream.on('data', row => {
                let session = new Session({
                    person: row.person_id,
                    login: row.id,
                    group: row.group_id,
                    permissions: new Set<string>()
                });
                Login.loadPermissions(session.store);
                resolve(session.id);
            });
            stream.on('error', err => reject(err));
            stream.on('end', () => reject(`login e senha inválidos: ${login}`));
            stream.on('close', () => reject(`login e senha inválidos: ${login}`));
        })
    }

    static logout(ses: string) {
        let session = Session.find(ses);
        if (session) session.selfDestruct();
        return session != null;
    }
}