import Deliverys from '../models/Delivery';
import File from '../models/File';

class EndDeliveryController {
  async update(req, res) {
    const { id } = req.params;

    const ExistDelivery = await Deliverys.findByPk(id);

    if (!ExistDelivery) {
      return res.status(401).json({ error: 'Delivery does not exists.' });
    }

    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    const endDelivery = await ExistDelivery.update({
      end_date: new Date(),
      signature_id: file.id,
    });

    return res.json(endDelivery);
  }
}

export default new EndDeliveryController();
