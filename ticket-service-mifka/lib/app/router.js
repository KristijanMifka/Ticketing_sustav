import express from 'express';
import controller from './controller';
const router = express.Router();

router.post('/ticket', controller.newTicket); // Kreiranje novog ticketa
router.post('/ticket/message', controller.newMessage); // Nova poruka u ticketu

router.put('/ticket/status', controller.changeStatus); // Promjena stanja ticketa enable/disable

router.get('/ticket', controller.getTicket); // Dohvacanje svih spremljenih ticketa
router.get('/ticket/:uid', controller.getTicket); // Dohvcanje ticketa preko User Id
router.get('/ticket/:tid/message', controller.getMessages); // Dohvati sve poruke

export default router;
