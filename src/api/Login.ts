import crypto from 'crypto';
import { Session } from "./Session";
import { connection } from "./connection";
import { transporter } from './transporter';
import uuid = require('uuid');
import { validatePass } from './Person';

let registerTemplate = (
    nome: string,
    code: string
) => `
    Olá ${nome},<br>
    você solicitou recuperação de senha, para alterar<br>
    sua senha acesse o link:<br>
    <a href="http://etic.ifc.edu.br/?recovery=${code}">http://etic.ifc.edu.br/?pass-recovery=${code}</a><br>
    <br>
    <i>caso não tenha sido você quem solicitou esta recuperação,<br>
    apenas ignore este email, dentro de 24h este link sera desativado.</i>
`

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
        user = user.trim();
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(`${user}${pass}`, salt, keyLength, iterations, digest,
                (err, derivedKeyBuffer) => err
                    ? reject(err)
                    : resolve(derivedKeyBuffer.toString('base64'))
            );
        });
    }

    static async requestRecovery(cpf: string) {
        cpf = (cpf) ? cpf.replace(/[.-]/g, '') : '';
        let conn = await connection();
        let data = await conn.query(`
            SELECT 
                login.id AS login, 
                person.name,
                person.email
            FROM 
                login 
                    LEFT JOIN person ON person.id = person_id 
            WHERE 
                document_id=?
            LIMIT 
                1
        `, [cpf]);

        if (!data.length) throw {
            err: true,
            msg: `CPF de usuário não encontrado`
        }

        let code = uuid.v4();

        await conn.query(`
            UPDATE login SET recovery=?, recovery_time=NOW() WHERE id=? LIMIT 1
        `, [code, data[0].login]);

        let info = await transporter.sendMail({
            from: '"eTic" <etic@ifc.edu.br>',
            to: data[0].email,
            subject: 'Recuperação de senha',
            html: registerTemplate(data[0].name, code)
        });

        transporter.sendMail(info, (err, data) => {
            if (err) throw {
                err: true,
                msg: `Erro ao enviar email para o endereço ${data.email}, caso não consiga efetuar o cadastro novamente entre em contato pelo email etic@ifc.edu.br.`
            }
        });

        return {
            err: false,
            msg: `Verifique seu e-mail. Não se esqueça de verificar na sua caixa de spam.`
        }
    }

    static async recovery(hash: string, pass: string) {
        validatePass(pass);
        let conn = await connection();
        let data = await conn.query(`
            SELECT 
                login.id AS login, 
                person.name,
                person.email
            FROM 
                login 
                    LEFT JOIN person ON person.id = person_id 
            WHERE 
                recovery=? AND
                recovery_time >= NOW() - INTERVAL 1 DAY
            LIMIT 
                1
        `, [hash]);

        if (!data.length) throw {
            err: true,
            msg: `O HASH informado para recuperação de senha expirou ou não é um HASH válido.`
        }

        let secret = await Login.secret(data[0].email, pass);
        let info = await conn.query(`UPDATE login SET secret_key=?, recovery=NULL, recovery_time=NULL WHERE id=? LIMIT 1`, [secret, data[0].login]);
        
        return {
            err: false,
            msg: 'Senha alterada com sucesso. Você já pode logar-se com a nova senha.'
        };
    }

    static permission(ses: string, permissionHash: string) {
        let session = Session.find(ses);
        if (!session) throw {
            err: true,
            msg: `Você precisa logar-se para executar esta ação`
        }
        if (!session.store.permissions.has(permissionHash)) throw {
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

    static async check(ses: string) {
        let session = Session.find(ses);
        return (session) ? true : false;
    }

    static async find(login: string, pass: string) {
        let secret = await Login.secret(login, pass);
        let conn = await connection();
        let stream = conn.queryStream('SELECT id, person_id, group_id FROM login WHERE secret_key=? LIMIT 1', [secret]);
        return new Promise(async (resolve, reject) => {
            stream.on('data', row => {
                let session = new Session({
                    person: row.person_id,
                    login: row.id,
                    group: row.group_id,
                    permissions: new Set<string>()
                });
                Login.loadPermissions(session.store);
                resolve({ err: false, id: session.id });
            });

            let err = {
                err: true,
                msg: `Usuário e/ou senha não encontrado(s).`
            }

            stream.on('error', err => reject(err));
            stream.on('end', () => reject(err));
            stream.on('close', () => reject(err));
        });
    }

    static logout(ses: string) {
        let session = Session.find(ses);
        if (session) session.selfDestruct();
        return (session) ? true : false;
    }

    static async checkSecret(secret: string) {
        let conn = await connection();
        let query = await conn.query('SELECT id FROM login WHERE secret_key=? LIMIT 1', [secret]);
        return (query[0]) ? true : false;
    }
}