import express from 'express';
import multer = require('multer');
import { Event } from '../api/Event';
import { finder } from '../api/finder';

const upload = multer();
const router = express.Router();

router.get('/',
    finder(
        Event.getList,
        [],
        []
    ));

router.post('/',
    upload.none(),
    finder(
        Event.register,
        ["ses"],
        "..."
    ));

router.put('/',
    upload.none(),
    finder(
        Event.alter,
        ["ses", "id"],
        "..."
    ));

export default router;