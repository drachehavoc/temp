import express from "express";
const router = express.Router()
router.use(express.static(__dirname + '/../public'));
export default router;