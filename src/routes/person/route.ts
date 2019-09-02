import express from 'express';
import multer = require('multer');
import { Person } from '../../api/Person';

const upload = multer();
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
    upload.none(),
    (req, res) => Person
        .register(req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

router.put('/',
    upload.none(),
    (req, res) => Person
        .alter(req.query.ses, req.body)
        .then(hash => res.send(hash))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);

export default router;