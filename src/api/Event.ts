import { connection } from "./connection";
import { Login } from './Login';

export class Event {
    static async getList() {
        let conn = await connection();
        let res = await conn.query(`SELECT * FROM event ORDER BY start_at DESC LIMIT 10`);
        return res;
    }

    static async register(
        ses: string,
        data: {
            title: string,
            start_at: string,
            finish_at: string
        }
    ) {
        Login.permission(ses, 'event:register');
        let conn = await connection();
        let keys = Object.keys(data);
        let vals = Object.values(data);
        let info = await conn.query(`INSERT INTO event(${keys.join(', ')}) VALUES(${'?, '.repeat(vals.length - 1)} ?)`, vals);
        return info.insertId.toString();

    }

    static async alter(
        ses: string,
        id: number,
        data: {
            title: string,
            start_at: string,
            finish_at: string
        }
    ) {
        let session = Login.permission(ses, 'event:alter');
        let conn = await connection();
        let keys = Object.keys(data).map(key => key + '=?');
        let vals = Object.values(data);
        let info = await conn.query(`UPDATE event SET ${keys.join(', ')} WHERE id=? LIMIT 1`, [...vals, id]);
        return true;

    }
}