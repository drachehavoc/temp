import { connection } from "./connection";
import { Login } from './Login';

export class Activity {
    static async getList(event_id: number) {
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await connection();
                let res = await conn.query(`
                    SELECT 
                        id, 
                        title,
                        seats, 
                        start_at,
                        duration, 
                        activity_type_id  
                    FROM 
                        activity 
                    WHERE 
                        event_id=? 
                    ORDER BY 
                        start_at ASC 
                    LIMIT 
                        100`, [event_id]);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }

    static async getTypes() {
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await connection();
                let res = await conn.query(`
                    SELECT 
                        id, 
                        name
                    FROM 
                        activity_type 
                    LIMIT 
                        100`);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }

    static async register(ses: string, event_id: number, data: {
        event_id: number,
        title: string,
        seats: number,
        start_at: string,
        duration: number,
        activity_type_id: number
    }) {
        data.event_id = event_id;
        Login.permission(ses, `event:${event_id}:activity:register`);
        return new Promise(async (resolve, reject) => {
            let conn = await connection();
            try {
                let keys = Object.keys(data);
                let vals = Object.values(data);
                let info = await conn.query(`INSERT INTO activity(${keys.join(', ')}) VALUES(${'?, '.repeat(vals.length - 1)} ?)`, vals);
                resolve(info.insertId.toString());
            } catch (err) {
                reject(err);
            }
        });
    }

    static async alter(ses: string, id: number, event_id: number, data: {
        event_id: number,
        title: string,
        seats: number,
        start_at: string,
        duration: number,
        activity_type_id: number
    }) {
        data.event_id = event_id;
        Login.permission(ses, `event:${event_id}:activity:alter`);
        return new Promise(async (resolve, reject) => {
            let conn = await connection();
            try {
                let keys = Object.keys(data).map(key => key + '=?');
                let vals = Object.values(data);
                let info = await conn.query(`UPDATE activity SET ${keys.join(', ')} WHERE id=? LIMIT 1`, [...vals, id]);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}