import express from 'express';
import { Place } from '../../api/Place';

const router = express.Router()

router.get('/birth', (req, res) => Place
    .birth(req.query.ses)
    .then(hash => res.send(hash))
    .catch(err => {
        console.error(err);
        res.send(err);
    })
);

router.get('/current', (req, res) => Place
    .current(req.query.ses)
    .then(hash => res.send(hash))
    .catch(err => {
        console.error(err);
        res.send(err);
    })
);

export default router;