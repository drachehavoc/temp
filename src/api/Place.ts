import { connection } from "./connection";
import { Session } from "./Session";
import { Login } from "./Login";

const cache = new Map();

export class Place {
    private static async getPlace(ses: string, column: 'birth_city' | 'current_city') {
        let session = Session.find(ses);

        if (!session) throw {
            err: true,
            msg: `é preciso logar-se para buscar cidade do usuário`
        }

        let conn = await connection();
        let person = session.store.person;

        return new Promise(async (resolve, reject) => {
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
                `, [
                    person
                ]
            );

            stream.on('data', row => resolve(row));
            stream.on('error', err => reject(err));
            stream.on('end', () => reject(`nenhuma cidade encontrada`));
            stream.on('close', () => reject(`nenhuma cidade encontrada`));
        });
    }

    static async birth(ses: string) {
        return Place.getPlace(ses, 'birth_city');
    }

    static async current(ses: string) {
        return Place.getPlace(ses, 'current_city');
    }

    static async getBrazil() {
        if (cache.has('cidades'))
            return cache.get('cidades')

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
        return res;
    }
}