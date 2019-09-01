import uuid from "uuid";

const hash: Map<string, Session> = new Map();

export class Session {
    private uid = uuid.v4();
    private timerId?: NodeJS.Timeout;

    constructor(
        readonly store: any = {}
    ) {
        console.log(`SESSÃO INICIADA: ${this.uid}`)
        hash.set(this.uid, this);
        this.timer();
    }

    static find(id: string, throwErr: boolean = false) {
        let ses = hash.get(id);

        if (ses) {
            ses.timer();
            return ses;
        }

        return null;
    }

    static findOrCreate(id: string = '') {
        return Session.find(id) || new Session();
    }

    timer(): void {
        if (this.timerId)
            clearTimeout(this.timerId);

        this.timerId =
            setTimeout(() => this.selfDestruct.bind(this), 1000 * 60);
    }

    selfDestruct() {
        console.log(`SESSÃO TERMINADA: ${this.uid}`);
        hash.delete(this.uid);
    }


    get id(): string {
        return this.uid;
    }
}