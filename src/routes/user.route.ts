import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../api/User';

const router = express.Router()

router.post('/',

    bodyParser.urlencoded({
        extended: false
    }),

    (req, res) => User
        .register(req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })


);

router.put('/',

    bodyParser.urlencoded({
        extended: false
    }),

    (req, res) => User
        .alter(req.query.ses, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })

);

export default router;