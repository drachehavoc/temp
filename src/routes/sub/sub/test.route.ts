import express from "express";
import multer from "multer";

const router = express.Router()
const uploader = multer({ dest: 'uploads/' });

router.get('/', (req, res) => {
    res.send("foi");
});

router.post(
    '/',
    uploader.array('avatar'),
    async (req, res) => {
        console.log(req.file);
        console.log(req.files);
        console.log(req.body);
        res.send('Hello World!');
    }
);

export default router;