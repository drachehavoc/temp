import express from 'express';
import { Login } from '../api/Login';
import { Session } from '../api/Session';

const router = express.Router()

router.get('/',
    (req, res) => {
        if (req.query.ses) {
            let ses = Session.find(req.query.ses);
            return (ses)
                ? res.send(ses.id)
                : res.send(false);
        }
        Login
            .find(req.query.email, req.query.pass)
            .then(hash => res.send(hash))
            .catch(err => {
                console.error(err);
                res.send(false);
            });
    });

router.delete('/',
    (req, res) => res.send(Login.logout(req.query.ses))
);

export default router;