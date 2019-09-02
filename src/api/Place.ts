import { connection } from "./connection";
import { Session } from "./Session";
import { Login } from "./Login";

const cache = new Map();

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
                    city.name AS city,
                    state.name AS state
                    
                FROM 
                    person

                    LEFT JOIN place_city AS city 
                        ON city.id = person.${column}

                    LEFT JOIN place_state AS state 
                        ON state.id = city.state_id

                WHERE 
                    person.id = ?

                LIMIT 1        
            `, [session.store.person]);

            stream.on('data', row => resolve(row));
            stream.on('error', err => reject(err));
            stream.on('end', () => reject(`nenhuma cidade encontrada`));
            stream.on('close', () => reject(`nenhuma cidade encontrada`));
        });
    }

    static async birth(ses: string) {
        Login.permission(ses, 'hadoken');
        return Place.getPlace(ses, 'birth_city');
    }

    static async current(ses: string) {
        return Place.getPlace(ses, 'current_city');
    }

    static async getBrazil() {
        return new Promise(async (resolve, reject) => {
            if (cache.has('cidades')) {
                resolve(cache.get('cidades'));
            }
            try {
                let conn = await connection();
                let res = await conn.query(`
                    SELECT 
                        city.id,
                        city.name AS city,
                        state.name AS state,
                        state.iso AS iso

                    FROM 
                        place_city AS city 
                        
                        LEFT JOIN place_state AS state 
                            ON state.id = city.state_id
                        
                        LEFT JOIN place_country AS country 
                            ON country.id = state.country
                `);
                cache.set('cidades', res);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }
}