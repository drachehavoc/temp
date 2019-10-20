import express from 'express';
import { Checkin } from '../api/Checkin';
import multer = require('multer');
import { finder } from '../api/finder';

const router = express.Router();
const upload = multer();

router.get('/auditorio/persons',
    finder(
        Checkin.getAuditorioPersons,
        [],
        []
    ));

router.get('/auditorio/current',
    finder(
        Checkin.getCurrentAuditorio,
        [],
        []
    ));

router.post('/auditorio/select',
    upload.none(),
    finder(
        Checkin.select,
        [],
        ["hash", "act"]
    ));

router.post('/auditorio/right',
    upload.none(),
    finder(
        Checkin.right,
        [],
        ["cpf"]
    ));

router.post('/auditorio/left',
    upload.none(),
    finder(
        Checkin.left,
        [],
        ["cpf", "name", "lastname", "email"]
    ));

export default router;