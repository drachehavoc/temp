import express from 'express';
import { Login } from '../api/Login';
import { finder } from '../api/finder';
import multer = require('multer');

const upload = multer();
const router = express.Router()

router.post('/recovery',
    upload.none(),
    finder(
        Login.recovery,
        ["hash"],
        ["pass"]
    ));

router.get('/request-recovery',
    finder(
        Login.requestRecovery,
        ["document_id"],
        []
    ));

router.get('/check',
    finder(
        Login.check,
        ["ses"],
        []
    ));

router.post('/',
    upload.none(),
    finder(
        Login.find,
        [],
        ["email", "pass"]
    ));

router.delete('/',
    finder(
        Login.logout,
        ["ses"],
        []
    ));

export default router;