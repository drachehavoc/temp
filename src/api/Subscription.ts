import { connection } from "./connection";
import { Session } from "./Session";

const limiteParaReInscricao = 15; // minutos

export class Subscription {
    static async get(ses: string, event: Number) {
        let conn = await connection();
        let session = Session.find(ses);
        if (!session) throw {
            err: true,
            msg: `é preciso logar-se para buscar os eventos cadastrados.`
        }
        let find = await conn.query(`
            SELECT 
                activity_id AS id
            FROM 
                subscription 
                LEFT JOIN activity ON activity_id=activity.id
                LEFT JOIN event ON event_id=event.id
            WHERE
                event.id=?
                AND person_id=?
                AND unsubscribed_at IS NULL
            LIMIT
                100`,
            [event, session.store.person]
        );
        return find;
    }

    static async save(ses: string, activity_id: number) {
        let conn = await connection();
        let session = Session.find(ses);

        if (!session) throw {
            err: true,
            msg: `É preciso logar-se antes de inscrever-se em um atividade do evento.`
        };

        let find = await conn.query(`
            SELECT 
                id, 
                subscribed_at, 
                unsubscribed_at 
            FROM 
                subscription 
            WHERE 
                activity_id=? 
                AND person_id=? 
            LIMIT 1`,
            [activity_id, session.store.person]
        );

        if (find.length > 0) {
            return Subscription.alter(
                session,
                activity_id,
                new Date(find[0].subscribed_at),
                find[0].unsubscribed_at
                    ? new Date(find[0].unsubscribed_at)
                    : null
            );
        }

        return Subscription.register(session, activity_id);
    }

    static async register(sesion: Session, activity_id: number) {
        let conn = await connection();
        let info = await conn.query(`INSERT INTO subscription(person_id, activity_id) VALUES(?, ?)`, [sesion.store.person, activity_id]);
        throw {
            err: false,
            msg: "subscribe"
        };
    }

    static async alter(
        session: Session,
        activity_id: number,
        subscribed_at: Date,
        unsubscribed_at: Date | null
    ) {
        let conn = await connection();

        if (!unsubscribed_at) {
            let info = await conn.query(`
                UPDATE 
                    subscription 
                SET 
                    unsubscribed_at=NOW() 
                WHERE 
                    activity_id=? 
                    AND person_id=? 
                `,
                [activity_id, session.store.person]
            );
            throw {
                err: false,
                msg: "unsubscribe"
            }
        }

        const diffInMinutes = (Date.now() - unsubscribed_at.getTime()) / (1000 * 60);
        // const diffInMinutes = (subscribed_at.getTime() - unsubscribed_at.getTime()) / (1000 * 60);
        // console.log("->", subscribed_at.toLocaleString("en-US", {timeZone: "America/New_York"}))
        if (diffInMinutes < 14) throw {
            err: true,
            msg: `A menos de ${limiteParaReInscricao} minutos você se desinscreveu desta atividade, para se reinscrever você ainda precisa aguardar ${Math.round(limiteParaReInscricao - diffInMinutes)} minutos.`
        }

        let info = await conn.query(`
            UPDATE 
                subscription 
            SET 
                subscribed_at=NOW(),
                unsubscribed_at=NULL
            WHERE 
                activity_id=? 
                AND person_id=? 
            `,
            [activity_id, session.store.person]
        );

        throw {
            err: false,
            msg: "re-subscribe"
        }
    }
}