import * as Yup from 'yup';
import { Op } from 'sequelize';
import { getHours, startOfDay, endOfDay } from 'date-fns';
import Deliverys from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class StartDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, deliveryman_id } = req.body;

    const delivery = await Deliverys.findByPk(id);

    const ExistDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!ExistDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exists.' });
    }

    const start_date = new Date();

    if (getHours(start_date) < 8 || getHours(start_date) > 18) {
      return res.status(400).json({
        error: 'Deliveries can be made from 08h to 18h',
      });
    }

    const checkFiveDelivery = await Deliverys.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
        deliveryman_id,
      },
    });

    if (checkFiveDelivery.length >= 5) {
      return res
        .status(400)
        .json({ error: 'The courier can only make 5 withdrawals per day' });
    }

    delivery.update(req.body);

    return res.json(delivery);
  }
}

export default new StartDeliveryController();
