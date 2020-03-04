import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import StartDeliveryController from './app/controllers/StartDeliveryController';

import authMiddleware from './app/middlewares/auth';
import EndDeliveryController from './app/controllers/EndDeliveryController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.post('/recipients', RecipientController.store);

routes.use(authMiddleware);

routes.put('/recipients/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.get('/deliveryman', DeliverymanController.index);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

routes.get('/deliveryman/:id', DeliveryController.index);
routes.get('/deliveryman/:id/deliveries', DeliveryController.show);

routes.post('/deliveries', DeliveryController.store);

routes.put('/startDelivery', StartDeliveryController.update);

routes.put(
  '/endDelivery/:id/:deliveryman_id',
  upload.single('file'),
  EndDeliveryController.update
);

export default routes;
