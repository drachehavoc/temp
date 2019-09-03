import setUserName from './lateral-menu.js'

let nome = document.querySelector('#nome');
let sobrenome = document.querySelector('#sobrenome');
let email = document.querySelector('#email');
let birth = document.querySelector('#birth');
let birth_city = document.querySelector('#birth_city option');
let current_city = document.querySelector('#current_city option');
let cpf = document.querySelector('#cpf');


window.onload = ()=>{
    setUserName();
    setUserData();
}

async function setUserData(){
    let dados = await getUserData();
    nome.value = dados.name;
    sobrenome.value = dados.lastname;
    email.value = dados.email;
    cpf.value = dados.document_id;
    birth_city.innerHTML = await getBirthCity()
    current_city.innerHTML = await getCurrentCity();
    

    let data = new Date(dados.birth);
    console.log(`${data.getDate()}-${data.getMonth()}-${data.getFullYear()}`);
    birth.value = `${data.getDate()}-${data.getMonth()}-${data.getFullYear()}`
}



export default async function getUserData(){
    let request = await fetch(`http://localhost:8080/./person?ses=${localStorage.getItem('hash')}`);
    let response = await request.json();
    return response;
}

async function getBirthCity(){
    let request = await fetch(`http://localhost:8080/./person/city/birth?ses=${localStorage.getItem('hash')}`);
    let response = await request.json();
    return response.city;
}

async function getCurrentCity(){
    let request = await fetch(`http://localhost:8080/./person/city/current?ses=${localStorage.getItem('hash')}`);
    let response = await request.json();
    return response.city;
}


