import * as Yup from 'yup';

import Order from '../models/Order';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, recipient_id, deliveryman_id, product } = await Order.create(
      req.body
    );

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
    });
  }
}

export default new OrderController();
