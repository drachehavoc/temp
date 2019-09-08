let src = new URLSearchParams(document.location.search);
let evento_id = src.get('evt') || null;

if (src.get('recovery')) {
    let modal = document.querySelector('.modal.recovery-password');
    modal.dataset.code = src.get('recovery');
    modal.classList.add('open')
}

const startLoading = () => document.body.classList.add('loading');

const endLoading = () => document.body.classList.remove('loading');

const pad = (num, size) => {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}

const getPeriodo = date => {
    let hrs = date.getHours();

    if (hrs >= 6 && hrs < 12)
        return 'Manhã';

    if (hrs >= 12 && hrs < 18)
        return 'Tarde';

    if (hrs >= 18 && hrs < 24)
        return 'Noite';

    return 'Madrugada';
}

const modalMsgEl = document.querySelector('.modal.msg');
const modalMsgElTitle = modalMsgEl.querySelector('h2');
const modalMsgElMsg = modalMsgEl.querySelector('span.msg');
const modalMsg = (cls, title, msg, closeOther = true) => {
    if (closeOther)
        document.querySelector('.modal.open').classList.remove('open');
    modalMsgElTitle.innerHTML = title;
    modalMsgElMsg.innerHTML = msg;
    modalMsgEl.className = `modal msg ${cls}`;
    modalMsgEl.classList.add('open');
}

const modalError = (title, msg, closeOther = true) =>
    modalMsg('error', title, msg, closeOther);

const modalOk = (title, msg, closeOther = true) =>
    modalMsg('ok', title, msg, closeOther);

const loadSubscription = async () => {
    startLoading();
    let request = await fetch(`../../subscription?ses=${localStorage.getItem('ses') || ''}&event=${evento_id}`);
    let response = await request.json();
    if (!response.err) {
        document.querySelectorAll(`.activity.registered`).forEach(el => el.classList.remove('registered'));
        response.forEach(d => {
            document.querySelector(`.activity[data-id="${d.id}"]`).classList.add('registered');
        });
    }
    endLoading();
}

let icons = {
    'palestra': 'forum',
    'minicurso': 'event_note',
    'workshop': 'bubble_chart',
    'painel': 'forum',
    'abertura': 'touch_app',
};

document
    .querySelectorAll('.modal .close')
    .forEach(el =>
        el.addEventListener('click', evt =>
            el.closest('.modal').classList.remove('open')));

document
    .querySelectorAll('[data-modal]')
    .forEach(el =>
        el.addEventListener('click', evt => {
            evt.preventDefault();
            evt.stopPropagation();
            let dom = document.querySelector(`.modal.${el.dataset.modal}`);
            if (dom) dom.classList.add('open');
        }));

document
    .querySelector('button.register-person')
    .addEventListener('click', async evt => {
        startLoading();
        evt.preventDefault();
        let form = evt.target.closest('.content').querySelector('form');
        let request = await fetch('../../person', {
            method: 'POST',
            body: new FormData(form)
        });
        let response = await request.json()

        if (response.err == true) {
            endLoading();
            return modalError('Erro ao Cadastrar', response.msg, false);
        }

        if (response.err == false) {
            endLoading();
            return modalOk('Cadastrado', response.msg);
        }

        endLoading();
        modalError('Erro de Sistema', 'Ocorreu um erro interno ao cadastrar, tente novamente caso o erro persita, por favor entrar em contato pelo email: etic@ifc.edu.br.')
    });

document
    .querySelector('button.bt-request-recovery-password')
    .addEventListener('click', async evt => {
        startLoading();
        evt.preventDefault();
        let form = evt.target.closest('.content').querySelector('form');
        let request = await fetch(`../../login/request-recovery?document_id=${form.document_id.value}`);

        let response = await request.json()

        if (response.err == true) {
            endLoading();
            return modalError('Erro ao solicitar recuperação de senha', response.msg);
        }

        if (response.err == false) {
            endLoading();
            return modalOk('Pedido enviado', response.msg);
        }

        endLoading();
        modalError('Erro de Sistema', 'Ocorreu um erro interno ao cadastrar, tente novamente caso o erro persita, por favor entrar em contato pelo email: etic@ifc.edu.br.')
    });

document
    .querySelector('button.bt-recovery-password')
    .addEventListener('click', async evt => {
        startLoading();
        evt.preventDefault();
        let form = evt.target.closest('.content').querySelector('form');
        let request = await fetch(`../../login/recovery?hash=${src.get('recovery')}`, {
            method: 'POST',
            body: new FormData(form)
        });

        let response = await request.json()

        if (response.err == true) {
            endLoading();
            return modalError('Erro ao recuperar senha', response.msg);
        }

        if (response.err == false) {
            endLoading();
            return modalOk('Sucesso', response.msg);
        }

        endLoading();
        modalError('Erro de Sistema', 'Ocorreu um erro interno ao cadastrar, tente novamente caso o erro persita, por favor entrar em contato pelo email: etic@ifc.edu.br.')
    });

document
    .querySelector('button.entry')
    .addEventListener('click', async evt => {
        startLoading();
        evt.preventDefault();
        let form = evt.target.closest('.content').querySelector('form');
        let request = await fetch(`../../login?email=${form.email.value}&pass=${form.pass.value}`);
        let response = await request.json();

        if (response.err == true) {
            endLoading();
            return modalError('Acesso negado', response.msg, false);
        }

        if (response.err == false) {
            endLoading();
            document.querySelector('.modal.open').classList.remove('open');
            form.pass.value = '';
            localStorage.setItem('ses', response.id);
            loadSubscription();
            return;
        }

        endLoading();
        modalError('Erro de Sistema', 'Ocorreu um erro interno ao cadastrar, tente novamente caso o erro persita, por favor entrar em contato pelo email: etic@ifc.edu.br.')
    });

document
    .querySelector('button.unregister')
    .addEventListener('click', async evt => {
        startLoading()
        let modal = evt.target.closest('.modal');
        let id = modal.dataset.id;
        modal.classList.remove('open');
        evt.preventDefault();
        let request = await fetch(`../../subscription?ses=${localStorage.getItem('ses') || ''}&activity=${id}`, {
            method: "POST"
        });
        let response = await request.json();
        endLoading();

        if (response.err == false) {
            document.querySelector(`.activity[data-id="${id}"]`).classList.remove('registered');
            return;
        }

        modalError('Erro de Sistema', 'Ocorreu um erro interno ao cadastrar, tente novamente caso o erro persita, por favor entrar em contato pelo email: etic@ifc.edu.br.')
    });

(async () => {
    startLoading();
    let container = document.querySelector('main');
    let [activities, types, cities] = await Promise.all([
        (async () => {
            let request = await fetch(`../../activity?event=${evento_id}`);
            return await request.json();
        })(),

        (async () => {
            let request = await fetch(`../../activity/types`);
            return await request.json();
        })(),

        (async () => {
            let request = await fetch(`../../city`);
            let data = await request.json()
            let opts = data.map(d => `<option value='${d.id}'>${d.iso} ${d.city}</option>`);
            return opts.join('');
        })()
    ]);
    endLoading()

    document
        .querySelectorAll('select.cities')
        .forEach(el => el.innerHTML = cities);

    let template = document.createElement('template');
    let currentDay = 0;
    let currentPeriod = 0;
    let currentActivity = 0;
    let divDate = null;
    let divDateActivities = null;
    let divDateActivitiesType = null;

    activities.forEach(acitivity => {
        let start_at = new Date(acitivity.start_at);
        let nextDay = `${start_at.getFullYear()}/${pad(start_at.getMonth(), 2)}/${pad(start_at.getDate(), 2)}`
        let nextPeriod = getPeriodo(start_at);

        if (currentDay !== nextDay) {
            currentDay = nextDay;
            currentPeriod = null;
            currentActivity = null;
            template.innerHTML += `
                <div class="date">
                    <h2>dia ${currentDay}</h2>
                </div>
            `;
            divDate = template.content.querySelector('div.date:last-child');
        }

        if (currentPeriod !== nextPeriod) {
            currentPeriod = nextPeriod;
            currentActivity = null;
            divDate.innerHTML += `
                <div class="content">
                    <h3>${currentPeriod}</h3>
                </div>
            `;
            divDateActivities = divDate.querySelector('div.content:last-child')
        }

        if (divDateActivities && currentActivity !== acitivity.activity_type_id) {
            currentActivity = acitivity.activity_type_id;
            divDateActivities.innerHTML += `
                <div class="activity-type">
                    <h4>${types.find(el => el.id == currentActivity).name}</h4>
                </div>
            `;
            divDateActivitiesType = divDateActivities.querySelector('div.activity-type:last-child')
        }

        divDateActivitiesType.innerHTML += `
            <div class="activity" data-id="${acitivity.id}">
                <div class="info">
                    Inicio às ${pad(start_at.getHours(), 2)}:${pad(start_at.getMinutes(), 2)}
                    no ${acitivity.location}, com ${acitivity.duration}hrs de duração.
                </div>
                <div class="show">
                    <div class="title">${acitivity.title}</div>
                    <div class="speaker">com: ${acitivity.description}</div>
                </div>
            </div>
        `;
    });

    container.appendChild(template.content);

    document
        .querySelectorAll('.activity')
        .forEach(el => {
            el.addEventListener('click', async evt => {
                evt.preventDefault();
                evt.stopPropagation();

                if (el.classList.contains('registered')) {
                    let modal = document.querySelector('.modal.unregister');
                    modal.dataset.id = el.dataset.id;
                    modal.classList.add('open');
                    return;
                }

                startLoading();

                let request = await fetch(`../../subscription?ses=${localStorage.getItem('ses') || ''}&activity=${el.dataset.id}`, {
                    method: "POST"
                });

                let response = await request.json();
                endLoading();

                if (response.err == true) {
                    endLoading();
                    return modalError('Você precisa esperar', response.msg, false);
                }

                if (response.err == false) {
                    el.classList.add('registered');
                    return;
                }

                modalError('Erro de Sistema', 'Ocorreu um erro interno ao cadastrar, tente novamente caso o erro persita, por favor entrar em contato pelo email: etic@ifc.edu.br.', false)
            });
        });

    if (localStorage.getItem('ses'))
        loadSubscription()
})();
