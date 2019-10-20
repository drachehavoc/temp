import uuid from "uuid";

const sessionList: Map<string, Session> = new Map();
const sessionTime = (1000 * 60) * 5;

export class Session {
    private uid = uuid.v4();
    private timerId?: NodeJS.Timeout;

    constructor(
        readonly store: any = {}
    ) {
        console.log(`SESSÃO INICIADA: ${this.uid}`)
        sessionList.set(this.uid, this);
        this.timer();
    }

    static find(id: string, throwErr: boolean = false) {
        let ses = sessionList.get(id);
        if (!ses) return null;
        ses.timer();
        return ses;
    }

    static findOrCreate(id: string = '') {
        return Session.find(id) || new Session();
    }

    timer(): void {
        if (this.timerId)
            clearTimeout(this.timerId);
        this.timerId = setTimeout(() => this.selfDestruct.bind(this), sessionTime);
    }

    selfDestruct() {
        console.log(`SESSÃO TERMINADA: ${this.uid}`);
        sessionList.delete(this.uid);
    }

    get id(): string {
        return this.uid;
    }
}