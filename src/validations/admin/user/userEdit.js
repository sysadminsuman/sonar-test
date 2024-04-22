import { celebrate, Joi } from "celebrate";

export const userUpdateValidate = celebrate({
  params: Joi.object({
    user_id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().empty(""),
  }),
});

export const userPasswordUpdateValidate = celebrate({
  params: Joi.object({
    user_id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    new_password: Joi.string().required(),
  }),
});
export const userRequestValidate = celebrate({
  body: Joi.object({
    user_id: Joi.number().integer().required(),
    status: Joi.number().integer().required(),
  }),
});
