import express from 'express';
import multer = require('multer');
import { Activity } from '../../api/Activity';

const upload = multer();
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

router.get('/slug/:slug',
    (req, res) => Activity
        .getBySlug(req.params.slug)
        .then(data => res.send(data))
        .catch(err => {
            res.send(err);
            console.error(err);
        })

);

router.post('/',
    upload.none(),
    (req, res) => Activity
        .register(req.query.ses, req.query.event, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })

);

router.put('/',
    upload.none(),
    (req, res) => Activity
        .alter(req.query.ses, req.query.id, req.query.event, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

export default router;