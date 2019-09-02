import express from 'express';
import bodyParser from 'body-parser';
import { Event } from '../api/Event';


const router = express.Router()

router.get('/',
    (req, res) => Event
        .getList()
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

router.post('/',
    bodyParser.urlencoded({ extended: false }),
    (req, res) => Event
        .register(req.query.ses, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })

);

router.put('/',
    bodyParser.urlencoded({ extended: false }),
    (req, res) => Event
        .alter(req.query.ses, req.query.id, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

export default router;