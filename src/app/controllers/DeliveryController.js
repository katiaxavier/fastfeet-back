import * as Yup from 'yup';

import Order from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipients from '../models/Recipient';

import RegisterMail from '../jobs/RegisterMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    return res.json();
  }

  async store(req, res) {
    const { product, deliveryman_id, recipient_id, signature_id } = req.body;

    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const order = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
      signature_id,
    });

    const result = await Order.findOne({
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

    return res.json(order);
  }
}

export default new OrderController();
