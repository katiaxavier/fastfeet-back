import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman } = data.delivery;
    const { recipient } = data.delivery;
    const { description } = data.problem;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda Cancelada',
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        product: data.delivery.product,
        user: recipient.name,
        description,
      },
    });
  }
}

export default new CancellationMail();
