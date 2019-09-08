import express from 'express';
import multer = require('multer');
import { Person } from '../../api/Person';
import { finder } from '../../api/finder';

const upload = multer();
const router = express.Router()

router.get('/',
    finder(
        Person.me,
        ["ses"],
        []
    )
);

router.post('/',
    upload.none(),
    finder(
        Person.register,
        [""],
        "..."
    )
);

router.put('/',
    upload.none(),
    finder(
        Person.alter,
        ["ses"],
        "..."
    )
);

export default router;