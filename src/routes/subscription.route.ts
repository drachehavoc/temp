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

router.post('/checkin',
    upload.none(),
    finder(
        Subscription.checkin,
        [],
        ["subs", "slug"]
    ));

router.post('/checkin/cancel',
    upload.none(),
    finder(
        Subscription.checkinCancel,
        [],
        ["subs", "slug"]
    ));

router.put('/',
    upload.none(),
    finder(
        Subscription.save,
        ["ses", "activity"],
        []
    ));

export default router;