import jwt from 'jsonwebtoken';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(400).json({ error: 'Password does not match' });
    }

    const { id, nome } = user;

    return res.json({
      user: {
        id,
        nome,
        email,
      },
      token: jwt.sign({ id }, '475ce025ab77af421f4a594a3b87335f', {
        expiresIn: '7d',
      }),
    });
  }
}

export default new SessionController();
