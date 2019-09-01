import express from 'express';
import glob from 'glob';
import path from 'path';

const port = 8080;
const app = express();
const routesFolder = path.join(__dirname, 'routes');

glob('**/*route.{ts,js}', { cwd: routesFolder, absolute: true }, (err, matches) => {
    if (err) throw err;
    matches.forEach(async file => {
        let rel = path.relative(routesFolder, file);
        rel = rel.replace(/\.{0,1}route.*/, '');
        rel = '/' + rel.replace(/\\/g, '/');
        let moduleItems = await import(file);
        Object.values(moduleItems).forEach((item: any) => {
            if (Object.getPrototypeOf(item) == express.Router)
                app.use(rel, item as express.Router)
        });
    });
});

app.listen(port, () => {
    console.log(`SERVER`);
    console.log(`PID ${process.pid}`);
    console.log(`PORT ${port}`);
});