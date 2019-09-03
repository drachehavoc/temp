
let cities;
async function getCities(){
    let request = await fetch('http://localhost:8080/./city');
    let response = await request.json();
    return response;
}

window.onload = async ()=>{
    let x;//string das cidades nos elementos html
    let citiesList = document.querySelectorAll('.cities-list');
    cities = await getCities();

    citiesList.forEach(list=>{
        Object.values(cities).forEach(city => {
            x += `<option value="${city.id}">${city.city}</option>`
        });
        list.innerHTML = x;
    })
    

    document.querySelector('#button-cadastrar').addEventListener('click', cadastrar)
    
}

async function cadastrar(){
    let formData = new FormData(document.querySelector('form'));
    console.log(formData);
    let request = await fetch('http://localhost:8080/./person', {
        method: 'POST',
        body: formData
    })
    let response = await request.text();
    console.log(response);
}