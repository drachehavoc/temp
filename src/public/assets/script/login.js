let login = document.querySelector('#login');
let senha = document.querySelector('#senha');
let loader = document.querySelector('.loader');
let messageArea = document.querySelector('.messageArea')

async function logar(){
     busca(()=>{
        loader.style.display = 'block';
     }, `http://localhost:8080/./login?email=${login.value}&pass=${senha.value}`).then((request)=>{

        request.text().then(async (response)=>{
            
            loader.style.display = 'none'
            if(response === 'false'){//SE LOGIN FALHAR
                messageArea.innerHTML = 'Email ou senha incorretos'
            }
            else{
                await setHash(response);
                window.location.href = 'http://localhost:8080/static/inscricoes.html'
            }
        })
    })

    
    
    
}

function busca(loading, url){
    loading();
    return fetch(url);
}



 async function setHash(hash){
    let request = await fetch(`http://localhost:8080/./login?ses=${hash}`);
    let response = await request.text(); 
    localStorage.setItem('hash', response);
}



document.querySelector('#button-logar').addEventListener('click', logar)