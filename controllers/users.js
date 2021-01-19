const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequestError = require('../errors/BadRequest');
const ConflictError = require('../errors/Conflict');
const NotFoundError = require('../errors/NotFound');
const UnauthorizedError = require('../errors/Unauthorized');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send(user);
      }
      throw new NotFoundError('User ID not found');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Invalid ID');
      }
      next(err);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 12)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    }))
    .then((user) => res.status(201).send({ id: user._id, email: user.email, name: user.name }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Invalid data');
      } else if (err.name === 'MongoError' || err.name === 'ValidationError') {
        throw new ConflictError('User with those credentials already exists');
      }
      next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Incorrect password or email.');
      } else {
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'practicum', { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Invalid data');
      }
      next(err);
    })
    .catch(next);
};
