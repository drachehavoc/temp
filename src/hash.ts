import { Login } from "./api/Login";
const args = process.argv.slice(2);
if (!args[0] || !args[1]) {
    console.error('hash espera dois argumentos: login(email) e senha.');
    process.exit(1);
}

Login
    .secret(args[0], args[1])
    .then(hash => {
        console.log(hash);
        process.exit(0);
    })
    .catch(console.error);