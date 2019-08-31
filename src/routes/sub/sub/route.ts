import express from 'express';
const router = express.Router()
router.get('/', (req, res) => res.end('EXEMPLO ROOT'));
export default router;