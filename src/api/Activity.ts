import { connection } from "./connection";
import { Login } from './Login';

export class Activity {
    static async getList(event_id: number) {
        let conn = await connection();
        let res = await conn.query(`
            SELECT 
                id, 
                title,
                subtitle,
                description,
                seats, 
                start_at,
                duration, 
                activity_type_id,
                location
            FROM 
                activity 
            WHERE 
                event_id=? 
            ORDER BY 
                start_at ASC,
                activity_type_id ASC
            LIMIT 
                100
            `, [
                event_id
            ]
        );
        return res;

    }

    static async getTypes() {
        let conn = await connection();
        let res = await conn.query(`SELECT id, name FROM activity_type LIMIT 100`);
        return res;
    }

    static async register(ses: string, event_id: number, data: {
        event_id: number,
        title: string,
        seats: number,
        start_at: string,
        duration: number,
        activity_type_id: number,
        location: string,
        description: string
    }) {
        data.event_id = event_id;
        Login.permission(ses, `event:${event_id}:activity:register`);
        let conn = await connection();
        let keys = Object.keys(data);
        let vals = Object.values(data);
        let info = await conn.query(`INSERT INTO activity(${keys.join(', ')}) VALUES(${'?, '.repeat(vals.length - 1)} ?)`, vals);
        return info.insertId.toString();
    }

    static async alter(ses: string, id: number, event_id: number, data: {
        event_id: number,
        title: string,
        seats: number,
        start_at: string,
        duration: number,
        activity_type_id: number,
        location: string,
        description: string
    }) {
        data.event_id = event_id;
        Login.permission(ses, `event:${event_id}:activity:alter`);
        let conn = await connection();
        let keys = Object.keys(data).map(key => key + '=?');
        let vals = Object.values(data);
        let info = await conn.query(`UPDATE activity SET ${keys.join(', ')} WHERE id=? LIMIT 1`, [...vals, id]);
        return true;
    }
}