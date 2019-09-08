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

async function logout(){
    let request = await fetch(`http://localhost:8080/./login?ses=${localStorage.getItem('hash')}`, {
        method: 'DELETE'
    });
    let response = await request.text();
    if(response === 'true'){
        window.location.href = 'http://localhost:8080/static/login.html'
    }else{
        alert('Erro ao realizar o logout')
    }
}

document.querySelector('.sair').addEventListener('click', logout);
