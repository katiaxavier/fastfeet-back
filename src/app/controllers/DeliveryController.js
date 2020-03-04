import * as Yup from 'yup';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipients from '../models/Recipient';

import RegisterMail from '../jobs/RegisterMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { id } = req.params;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
    });
    return res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        start_date: { [Op.not]: null },
        end_date: { [Op.not]: null },
      },
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const { product, deliveryman_id, recipient_id } = req.body;

    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    const result = await Delivery.findOne({
      where: {
        recipient_id,
      },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipients,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
      ],
    });

    await Queue.add(RegisterMail.key, {
      result,
    });

    return res.json(delivery);
  }
}

export default new DeliveryController();
