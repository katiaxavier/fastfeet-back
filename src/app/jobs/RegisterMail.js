import Mail from '../../lib/Mail';

class RegisterMail {
  get key() {
    return 'RegisterMail';
  }
  
  async handle({ data }) {
    const { deliveryman } = data.result;
    const { recipient } = data.result;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda',
      template: 'register',
      context: {
        deliveryman: deliveryman.name,
        product: data.result.product,
        user: recipient.name
      },
    });
  }
}

export default new RegisterMail();