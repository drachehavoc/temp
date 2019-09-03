import express from 'express';
import multer = require('multer');
import { Subscription } from '../api/Subscription';
const upload = multer();
const router = express.Router()

router.get('/',
    (req, res) => Subscription
        .get(req.query.ses, req.query.event)
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

router.post('/',
    upload.none(),
    (req, res) => Subscription
        .save(req.query.ses, req.query.activity)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

router.put('/',
    upload.none(),
    (req, res) => Subscription
        .save(req.query.ses, req.query.activity)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

export default router;