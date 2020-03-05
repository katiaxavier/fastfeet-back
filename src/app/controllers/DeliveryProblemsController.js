import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblems';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    const { id } = req.params;

    const problem = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'street', 'number', 'state', 'city'],
            },
          ],
        },
      ],
    });

    if (!problem) {
      return res.status(400).json({ error: 'There are no delivery problems.' });
    }

    return res.json(problem);
  }

  async show(req, res) {
    const problems = await DeliveryProblem.findAll({
      order: ['id'],
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'deliveryman_id'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'street', 'number', 'state', 'city'],
            },
          ],
        },
      ],
    });

    if (!problems) {
      return res.status(400).json({ error: 'There are no delivery problems.' });
    }
    return res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const ExistDelivery = await Delivery.findByPk(id);

    if (!ExistDelivery) {
      return res.status(401).json({ error: 'Delivery does not exists.' });
    }

    const { description } = req.body;

    const problem = await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const existProblem = await DeliveryProblem.findByPk(id);

    if (!existProblem) {
      return res
        .status(400)
        .json({ error: 'There is no problem registered for this delivery' });
    }

    const { delivery_id } = existProblem;

    const delivery = await Delivery.findOne({
      where: {
        id: delivery_id,
      },
      attributes: ['id', 'product', 'start_date', 'canceled_at', 'end_date'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
      ],
    });

    const problem = await DeliveryProblem.findByPk(id);

    await delivery.update({ canceled_at: new Date() });

    await Queue.add(CancellationMail.key, {
      delivery,
      problem,
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemsController();
