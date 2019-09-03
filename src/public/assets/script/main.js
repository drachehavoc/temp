import setUserName from './lateral-menu.js'


let hash = localStorage.getItem('hash');

window.onload = async ()=>{
    setUserName();//mostra nome do usuário
    
    //configura atividades na página de acordo com a data
    let activities = await getActivities();
    let event_day_section;
    let data;
    Object.values(activities).forEach(activity => {
        
        data = new Date(activity.start_at);
        let day_selector;
        
        switch(data.getDate()){
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
        event_day_section.innerHTML += `<li>${data.getHours()}:${data.getMinutes()} - ${activity.title}</li>`
    });
}




//retorna as atividades do evento(ex:palestras, minicursos, etc)
async function getActivities(){
    let request = await fetch(`http://localhost:8080/./activity?ses=${hash}&event=1`);
    let response = await request.json(); 
    return response;
}



