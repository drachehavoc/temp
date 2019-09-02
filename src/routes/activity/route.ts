import express from 'express';
import bodyParser from 'body-parser';
import { Activity } from '../../api/Activity';

const router = express.Router()

router.get('/',
    (req, res) => Activity
        .getList(req.query.event)
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

router.post('/',
    bodyParser.urlencoded({ extended: false }),
    (req, res) => Activity
        .register(req.query.ses, req.query.event, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })

);

router.put('/',
    bodyParser.urlencoded({ extended: false }),
    (req, res) => Activity
        .alter(req.query.ses, req.query.id, req.query.event, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

export default router;