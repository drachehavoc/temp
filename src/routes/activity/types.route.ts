import express from 'express';
import { Activity } from '../../api/Activity';
const router = express.Router();
router.get('/',
    (req, res) => Activity
        .getTypes()
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send(err);
        })
);
export default router;