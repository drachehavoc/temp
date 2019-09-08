import express from 'express';
import multer = require('multer');
import { Subscription } from '../api/Subscription';
import { finder } from '../api/finder';
const upload = multer();
const router = express.Router()

router.get('/',
    finder(
        Subscription.get,
        ["ses", "event"],
        []
    ));

router.post('/',
    upload.none(),
    finder(
        Subscription.save,
        ["ses", "activity"],
        []
    ));

router.put('/',
    upload.none(),
    finder(
        Subscription.save,
        ["ses", "activity"],
        []
    ));

export default router;