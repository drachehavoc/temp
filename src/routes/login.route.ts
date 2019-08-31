import express from 'express';
import { Login } from '../api/Login';
import { Session } from '../api/Session';
const router = express.Router()
router.get('/', (req, res) => {
    if (req.query.ses) {
        let ses = Session.find(req.query.ses);
        return (ses)
            ? res.end(ses.id)
            : res.end(':/');
    }

    Login
        .find(req.query.user, req.query.pass)
        .then(hash => res.end(hash))
        .catch(err => res.end(':/'));
});
export default router;