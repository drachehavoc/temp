import { connection } from "./connection";
import { Login } from './Login';

export class Event {
    static async getList() {
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await connection();
                let res = await conn.query(`SELECT * FROM event ORDER BY start_at DESC LIMIT 10`);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }


    static async register(ses: string, data: {
        title: string,
        start_at: string,
        finish_at: string
    }) {
        Login.permission(ses, 'event:register');
        return new Promise(async (resolve, reject) => {
            let conn = await connection();
            try {
                let keys = Object.keys(data);
                let vals = Object.values(data);
                let info = await conn.query(`INSERT INTO event(${keys.join(', ')}) VALUES(${'?, '.repeat(vals.length - 1)} ?)`, vals);
                resolve(info.insertId.toString());
            } catch (err) {
                reject(err);
            }
        });
    }

    static async alter(ses: string, id: number, data: {
        title: string,
        start_at: string,
        finish_at: string
    }) {
        let session = Login.permission(ses, 'event:alter');
        return new Promise(async (resolve, reject) => {
            let conn = await connection();
            try {
                let keys = Object.keys(data).map(key => key + '=?');
                let vals = Object.values(data);
                let info = await conn.query(`UPDATE event SET ${keys.join(', ')} WHERE id=? LIMIT 1`, [...vals, id]);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}