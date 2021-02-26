const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getArticles, createArticle, deleteArticle,
} = require('../controllers/articles');

router.get('/', celebrate({
  headers: Joi.object().keys({
  }).unknown(true),
  body: Joi.object().keys({
    articleId: Joi.string().hex().length(24),
  }),
}), getArticles);

router.post('/', celebrate({
  headers: Joi.object().keys({
  }).unknown(true),
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    source: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    link: Joi.string().required().pattern(/(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_/0-9\-#.]*)\??([a-z_/0-9\-#=&]*)/),
    image: Joi.string().required().pattern(/(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_/0-9\-#.]*)\??([a-z_/0-9\-#=&]*)/),
  }),
}), createArticle);

router.delete('/:articleId', celebrate({
  headers: Joi.object().keys({
  }).unknown(true),
  params: Joi.object().keys({
    articleId: Joi.string().hex().length(24),
  }),
}), deleteArticle);

module.exports = router;
