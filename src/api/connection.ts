import mariadb from 'mariadb';

// DESCOBRIR COMO FAZER A POOL NÃO DAR ERRO
// const handler = mariadb.createPool({
//     // connectionLimit: 15,
//     database: 'eventos',
//     host: '127.0.0.1',
//     user: 'root',
// });

// export const connection = async (): Promise<mariadb.Connection> => {
//     let conn = await handler.getConnection();
//     return conn as mariadb.Connection;
// }

const handler = mariadb.createConnection({
    // connectionLimit: 15,
    database: 'eventos', 
    host: '127.0.0.1',
    user: 'root', 
});

export const connection = async () => handler;