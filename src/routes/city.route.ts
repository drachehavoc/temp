import express from 'express';
import { Place } from '../api/Place';

const router = express.Router()

router.get('/', (req, res) => Place
    .getBrazil()
    .then(cities => res.send(cities))
    .catch((err: any) => {
        console.error(err);  
        res.send(err);
    })
);

export default router;