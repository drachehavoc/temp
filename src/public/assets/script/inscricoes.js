import setUserName from './lateral-menu.js'


let hash = localStorage.getItem('hash');
let check_icons;
let acts = [];//vetor de objetos atividades;
let subscriptions;

window.onload = async () => {
    setUserName();//mostra nome do usuário
    subscriptions = await getSubscriptions();
    //configura atividades na página de acordo com a data
    let activities = await getActivities();
    let event_day_section;
    let data;
    Object.values(activities).forEach(activity => {

        data = new Date(activity.start_at);
        let day_selector;

        switch (data.getDate()) {
            case 22:
                day_selector = '.day-1';
                break;

            case 23:
                day_selector = '.day-2';
                break;

            case 24:
                day_selector = '.day-3';
                break;

            case 25:
                day_selector = '.day-4';
                break;
        }

        event_day_section = document.querySelector(`${day_selector} .events-list`);
        event_day_section.innerHTML += `<li value="${activity.id}">${data.getHours()}:${data.getMinutes()} - ${activity.title} <img src="./assets/images/check-icon2.png" class="image is-16x16 check-icon"></li>`
    });

    let itens = document.querySelectorAll('.events-list li')
    
    check_icons = document.querySelectorAll('.check-icon')
    let ob;

    itens.forEach(async (item, i) => {
       
        ob = new Activity(item, check_icons[i], false)
        // acts.push(new Activity(item, check_icons[i]), false) não sei porque esse trecho não funciona como deveria
        acts.push(ob);
        acts[i].getItem().addEventListener('click', () => {
            acts[i].subscribe();
        })

    })

    


    //marca as atividades que o usuário já se inscreveu
    subscriptions.forEach(subscription=>{
        acts.forEach(act=>{
            if(subscription.id == act.id){
                act.setSubscribed();
            }
        })
    })
}







//retorna as atividades do evento(ex:palestras, minicursos, etc)
async function getActivities() {
    let request = await fetch(`http://localhost:8080/./activity?ses=${hash}&event=1`);
    let response = await request.json();
    return response;
}

//retorna todas as atividades que o usuário já se inscreveu
async function getSubscriptions() {
    let request = await fetch(`http://localhost:8080/./subscription?ses=${hash}&event=1`);
    let response = await request.json();
    return response;
}


class Activity {
    constructor(item, check_icon, subscribed) {
        this.subscribed = subscribed;
        this.item = item;
        this.check_icon = check_icon;
        this.id = this.item.value;
        this.modal = document.createElement('div');
        this.modal.setAttribute('class', 'modal');
        this.modal.innerHTML = `
                <div class="modal-background"></div>
                <div class="modal-content">
                    <div>Tem certeza que deseja se desinscrever? Após realizar esta ação só poderá voltar a se inscrever neste evento depois de 15 minutos.</div>
                    <div class="buttons-area">
                        <button class="button confirma-button">Confirmar</button>
                        <button class="cancela-button">Cancelar</button>
                    </div>
                    
                    
                </div>
                <button class="modal-close is-large" aria-label="close"></button>
        `
        document.body.appendChild(this.modal);
        if(this.subscribed){
            this.check_icon.style.display = 'block';
        }
    }

    isSubscribed() {
        return this.subscribed;
    }
    setSubscribed(){
        this.subscribed = true;
        this.check_icon.style.display = 'block'
    }
    getItem() {
        return this.item;
    }

    async subscribe() {
        let response;
        if (this.isSubscribed()) {
            this.showModal();


        } else {
            let request = await fetch(`http://localhost:8080/./subscription?ses=${localStorage.getItem('hash')}&activity=${this.id}`, {
                method: 'POST',
                body: this.id
            })
           
                response = await request.text();
                if (response == 'subscribe') {
                    // this.item.style.background = '#cee697';
                    this.check_icon.style.display = 'block';
                    this.subscribed = true;

                }else{
                    response = JSON.parse(response);
                    alert(response.msg);
                }
            
            

            
        }

    }

    async unsubscribe() {
        let request = await fetch(`http://localhost:8080/./subscription?ses=${localStorage.getItem('hash')}&activity=${this.id}`, {
            method: 'POST',
            body: this.id
        })
        let response = await request.text();
        if (response == 'unsubscribe') {
            this.check_icon.style.display = 'none';
            this.subscribed = false;
            console.log('voce se desinscreveu');
            this.closeModal();
        }


    }

    showModal() {
        this.modal.className += ' active-modal';
        document.querySelector('.active-modal .cancela-button').addEventListener('click', () => { this.closeModal() })
        document.querySelector('.active-modal .confirma-button').addEventListener('click', () => { this.unsubscribe() })
    }

    closeModal() {
        this.modal.className = 'modal'
    }

}





