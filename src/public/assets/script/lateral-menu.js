import getUserData from './dadosPessoais.js'

// async function getUserData(){
//     let request = await fetch(`http://localhost:8080/./person?ses=${hash}`);
//     let response = await request.json(); 
//     return response;
// }

export default async function(){
    let dados = await getUserData();
    document.querySelector('#username').innerHTML = await dados.name;
}

let menu_bars = document.querySelector('.menu-bars');
let menu = document.querySelector('.menu');
let show = false;
menu_bars.addEventListener('click', menuScroll);

function menuScroll(){
    if(show == false){
        menu.style.left = '0';
        show = true;
    }
    
}
