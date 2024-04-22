import { celebrate, Joi } from "celebrate";

export const reportMessageDetailsValidate = celebrate({
  params: Joi.object({
    conversation_id: Joi.number().integer().required(),
  }),
});
