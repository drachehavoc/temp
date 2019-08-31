import mariadb from 'mariadb';

export const connection = mariadb.createPool({
    connectionLimit: 15,
    database: 'eventos', 
    host: '127.0.0.1',
    user: 'root', 
});