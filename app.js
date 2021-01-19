const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const users = require('./routes/users.js');
const articles = require('./routes/articles.js');
const auth = require('./middleware/auth.js');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middleware/logger');
const NotFoundError = require('./errors/NotFound.js');

const { PORT = 80 } = process.env;

const app = express();
require('dotenv').config();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // in 15 minutes
  max: 100,
});

app.use(limiter);

app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost:27017/aroundb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening at port ${PORT}`);
});

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use('/articles', auth, articles);
app.use('/users', auth, users);

app.use(() => {
  throw new NotFoundError('Page not found');
});

app.use(errors());
app.use(errorLogger);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'An error occurred on the server'
        : message,
    });
});
