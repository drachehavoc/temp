import { Connection } from "mariadb";
import { connection } from "./connection";
import { Login } from './Login';
import { Session } from "./Session";
import { transporter } from "./transporter";

const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();

const validateEmail = (email: string) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const validatePass = (pass: string) => {
    if (
        // !/[A-Z]/.test(pass) ||
        // !/[\.$@$!%*#?&]/.test(pass) ||
        pass.length < 6
    ) throw {
        err: true,
        msg: `Sua senha precisa ter mais que <strong>seis caracteres</strong>.`
    }
}

const testCPF = (strCPF: string) => {
    var Soma;
    var Resto;
    Soma = 0;

    if (!strCPF)
        return false;

    if (strCPF == "00000000000")
        return false;

    for (let i = 1; i <= 9; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))
        Resto = 0;

    if (Resto != parseInt(strCPF.substring(9, 10)))
        return false;

    Soma = 0;

    for (let i = 1; i <= 10; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))
        Resto = 0;

    if (Resto != parseInt(strCPF.substring(10, 11)))
        return false;

    return true;
}

let registerTemplate = (
    nome: string,
    code: string
) => `
    Prezado ${nome},<br>
    <br>
    <br>Seu cadastro foi efetuado com sucesso!
    <br>Agora você pode gerenciar sua participação em todos os eventos do <b>X e-TIC</b> (Encontro de Tecnologia da Informação e Comunicação) que ocorrerá de 22 a 25 de outubro.
    <br>
    <br>Seu Número Inscrição e Código de Indicação é <b>${code}</b>
    <br>
    <br>Este número pode ser fornecido a um amigo e ser utilizado no cadastro dele como um Código de Indicação
    <br>
    <br>Convide e traga mais gente com você! Aqueles que tiverem mais indicações e estiverem presentes na cerimônia de encerramento (25/10 a partir das 19h) concorrerão a prêmios.
    <br>
    <br>Você pode convidar e compartilhar seu Código de Indicação para seus amigos através do link <a href="http://etic.ifc.edu.br/?indication=${code}">http://etic.ifc.edu.br/?indication=${code}</a>.
    <br>
    <br>Você tem inúmeras razões para participar e trazer muita gente contigo para o X e-TIC.
    <br>
    <br>Em caso de dúvidas não deixe de nos comunicar:
    <br>
    <br><b>Redes sociais</b>
    <ul>
        <li>Instagram: <a href="http://www.instagram.com/etic.ifc">www.instagram.com/etic.ifc</a></li>
        <li>Facebook: <a href="http://www.facebook.com/eticIFC">www.facebook.com/eticIFC</a></li>
    </ul>
    <br>
    <br><b>E-mail</b>
    <ul>
        <li>etic@ifc.edu.br</li>
    </ul>
    <br>
    <br> Respeitosamente,
    <br>Comissão Organizadora  do X e-TIC - 2019
    <br>
    <br><a href="http://www.etic.ifc.edu.br">www.etic.ifc.edu.br</a>
`

const validateData = async (conn: Connection, data: any) => {
    let document_id = (data.document_id || '').replace(/[\.-]/g, '')
    if (data.document_id !== null)
        if (!testCPF(document_id)) throw {
            err: true,
            msg: 'Número de CPF inválido.'
        }

    let email;
    if (data.email) {
        email = data.email.trim();

        if (!validateEmail(email)) throw {
            err: true,
            msg: 'Email inválido.'
        }

        let checkMail = await conn.query('SELECT 1 FROM person WHERE email=?', [email]);

        if (checkMail.length) throw {
            err: true,
            msg: `O e-mail informado já existe em nossa base de dados, tente recuperar senha.`
        }
    }

    let checkCpf
    if (data.document_id) {
        checkCpf = await conn.query('SELECT 1 FROM person WHERE document_id=?', [document_id]);

        if (checkCpf.length) throw {
            err: true,
            msg: `O CPF informado já existe em nossa base de dados, tente recuperar senha.`
        }
    }

    if (
        !data.birth
    ) throw {
        err: true,
        msg: `Idade não pode ser vazio`
    }

    let birth = new Date(data.birth);
    let now = new Date();
    if (now.getFullYear() - birth.getFullYear() < 1) throw {
        err: true,
        msg: `Data de nascimento precisa ser superior a um ano.`
    }

    if (
        typeof data.name == "undefined"
        || data.name.trim() == ""
        || typeof data.lastname == "undefined"
        || data.lastname.trim() == ""
    ) throw {
        err: true,
        msg: `O seu nome e sobrenome não podem ser vazios.`
    }

    return {
        name: data.name.toLocaleLowerCase().trim(),
        lastname: data.lastname.toLocaleLowerCase().trim(),
        document_id: document_id,
        birth: data.birth,
        birth_city: data.birth_city,
        current_city: data.current_city,
        current_school: data.current_school || '',
        email,
        special: data.special || '',
        indication: data.indication,
        code: uid.randomUUID(8)
    };
}

export class Person {
    static async register(data: {
        // 
        name: string,
        lastname: string,
        document_id: string,
        birth: Date,
        birth_city: number,
        current_city: number,
        current_school: number,
        special: string,
        // login data
        email: string,
        password: string
    }) {
        validatePass(data.password);

        let conn = await connection();
        let person = await validateData(conn, data);
        let personKeys = Object.keys(person);
        let personVals = Object.values(person);
        let pInfo = await conn.query(`INSERT INTO person(${personKeys.join(', ')}) VALUES(${'?, '.repeat(personVals.length - 1)} ?)`, personVals);
        let lInfo = await Login.register(pInfo.insertId, data.email, data.password);
        let ses = new Session().id;

        let info = await transporter.sendMail({
            from: '"eTic" <etic@ifc.edu.br>',
            to: person.email,
            subject: 'Bem vindo ao eTic',
            html: registerTemplate(person.name, person.code)
        });

        transporter.sendMail(info, (err, data) => {
            if (err) throw {
                err: true,
                msg: `Erro ao enviar email para o endereço ${data.email}, caso não consiga efetuar o cadastro novamente entre em contato pelo email etic@ifc.edu.br.`
            }
        });

        throw {
            err: false,
            msg: `Cadastro efetuado com sucesso. Verifique seu e-mail para informações de como acessar o sistema. Caso não encontre o e-mail verifique a sua caixa de spam.`
        };
    }

    static async alter(
        ses: string,
        data: {
            name: string,
            lastname: string,
            birth: Date,
            birth_city: number,
            current_city: number,
            current_school: number,
            document_id?: any,
            // login data
            email: string,
            password: string
        }
    ) {
        let conn = await connection();
        let session = Session.find(ses);

        if (!session) throw {
            err: true,
            msg: 'você precisa logar-se para alterar seus dados',
        };

        data.document_id = null;

        let d = await validateData(conn, data);

        let person = {
            "name=?": d.name,
            "lastname=?": d.lastname,
            "birth=?": d.birth,
            "birth_city=?": d.birth_city,
            "current_city=?": d.current_city,
            "current_school=?": d.current_school,
            // "email=?": d.email,
        };

        let personKeys = Object.keys(person);
        let personVals = Object.values(person);
        let pInfo = await conn.query(`UPDATE person SET ${personKeys.join(', ')} WHERE id=? LIMIT 1`, [...personVals, session.store.person]);
        let lInfo;
        if (data.password && data.password.trim() !== '') {
            validatePass(data.password);
            lInfo = await Login.alter(session.store.login, d.email, data.password);
        }
        return true;
    }

    static async me(ses: string) {
        let conn = await connection();
        let session = Session.find(ses);
        if (!session) throw {
            err: true,
            msg: 'você precisa logar-se para visualizer seus dados'
        };
        let row = await conn.query(`SELECT name, lastname, document_id, email, birth, current_school FROM person WHERE id = ? LIMIT 1`, [session.store.person]);
        return row[0] || null;
    }
}