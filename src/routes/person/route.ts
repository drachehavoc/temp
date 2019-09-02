import express from 'express';
import bodyParser from 'body-parser';
import { Person } from '../../api/Person';

const router = express.Router()

router.get('/',
    (req, res) => Person
        .me(req.query.ses)
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send(err);
        })

);

router.post('/',
    bodyParser.urlencoded({ extended: false }),
    (req, res) => Person
        .register(req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

router.put('/',
    bodyParser.urlencoded({ extended: false }),
    (req, res) => Person
        .alter(req.query.ses, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

export default router;