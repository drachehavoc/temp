import { connection } from "./connection";
import { Session } from "./Session";

export class Place {
    private static async getPlace(ses: string, column: 'birth_city' | 'current_city') {
        return new Promise(async (resolve, reject) => {
            let session = Session.find(ses);

            if (!session) {
                reject({
                    err: true,
                    msg: `é preciso logar-se para buscar cidade do usuário`
                });
                return;
            }

            let conn = await connection();

            let stream = conn.queryStream(`
                SELECT 
                    c.id AS city_id,
                    s.id AS state_id,
                    c.name AS city,
                    s.name AS state
                FROM 
                    perfil AS p
                    LEFT JOIN cidade AS c ON c.id = p.${column}
                    LEFT JOIN place_state AS s ON s.id = c.state
                WHERE 
                    p.id = ?
                LIMIT 1        
            `, [session.store.perfil]);

            stream.on('data', row => resolve(row));
            stream.on('error', err => reject(err));
            stream.on('end', () => reject(null));
            stream.on('close', () => reject(null));
        });
    }

    static async birth(ses: string) {
        return Place.getPlace(ses, 'birth_city');
    }

    static async current(ses: string) {
        return Place.getPlace(ses, 'current_city');
    }

    static async getBrazil() {
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await connection();
                let res = await conn.query(`
                    SELECT 
                        c.id AS city_id,
                        s.id AS state_id,
                        c.name AS city,
                        s.name AS state,
                        s.fs AS fs
                    FROM 
                        cidade AS c 
                        LEFT JOIN place_state AS s ON s.id = c.state
                        LEFT JOIN place_country AS cou ON cou.id = s.country
                `);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }
}