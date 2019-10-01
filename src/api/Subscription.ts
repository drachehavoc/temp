import { connection } from "./connection";
import { Session } from "./Session";

const limiteParaReInscricao = 15; // minutos

export class Subscription {
    static async get(ses: string, event: Number) {
        let conn = await connection();
        let session = Session.find(ses);
        if (!session) throw {
            err: true,
            msg: `é preciso logar-se para buscar os atividades em que está inscrito.`
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

    static async checkSeats(activity_id: number) {
        let conn = await connection();
        let find = await conn.query(`
            SELECT 
                (seats - count(1)) as remain, 
                seats, 
                title 
            FROM 
                subscription 
            JOIN 
                activity 
                ON activity_id=activity.id 
            WHERE 
                activity_id=? AND
                unsubscribed_at IS NULL
            GROUP BY 
                activity_id
            LIMIT 
                1
        `, [activity_id]);

        if (find[0] && find[0].seats >= 0 && find[0].remain <= 0) throw {
            err: true,
            msg: `Este evento não possui mais vagas, me desculpe :/`
        };

        return true;
    }

    static async timeCollision(activity_id: number, person_id: number) {
        let conn = await connection();
        let find = await conn.query(`
            SELECT
                a.title,
                a.start_at
                FROM 
                    activity AS a
                JOIN activity AS t 
                    ON t.id=?
                    AND a.event_id = t.event_id
                    AND a.start_at >= t.start_at 
                    AND a.start_at <= DATE_ADD(t.start_at, INTERVAL t.duration * 60 MINUTE)
                JOIN subscription AS s
                    ON s.activity_id = a.id
                    AND unsubscribed_at IS NULL
                    AND person_id=?
        `, [activity_id, person_id]);

        if (find.length) throw {
            err: true,
            msg: `Não é possivel se increver nesta atividade, pois você esta inscrito nas seguintes atividades que acorrem no mesmo horário: <ul>${find.map((col: any) => `<li>${col.title}</li>`).join('')}</ul>`
        }

        return false;
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
                subscription.id, 
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

        if (find.length <= 0)
            return Subscription.subscribe(session, activity_id);

        if (!find[0].unsubscribed_at)
            return Subscription.unsubscribe(session, activity_id);

        return Subscription.resubscribe(session, activity_id, find[0].unsubscribed_at)
    }

    static async subscribe(session: Session, activity_id: number) {
        try {
            await Subscription.checkSeats(activity_id);
        } catch (e) {
            throw (e);
        }
        
        await Subscription.timeCollision(activity_id, session.store.person);

        let conn = await connection();
        let info = await conn.query(`INSERT INTO subscription(person_id, activity_id) VALUES(?, ?)`, [session.store.person, activity_id]);
        throw {
            err: false,
            msg: "subscribe"
        };
    }

    static async unsubscribe(
        session: Session,
        activity_id: number
    ) {
        let conn = await connection();
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

    static async resubscribe(
        session: Session,
        activity_id: number,
        unsubscribed_at: Date
    ) {
        let conn = await connection();
        const diffInMinutes = (Date.now() - unsubscribed_at.getTime()) / (1000 * 60);

        if (diffInMinutes < 14) throw {
            err: true,
            msg: `A menos de ${limiteParaReInscricao} minutos você se desinscreveu desta atividade, para se reinscrever você ainda precisa aguardar ${Math.round(limiteParaReInscricao - diffInMinutes)} minutos.`
        }

        await Subscription.timeCollision(activity_id, session.store.person);

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