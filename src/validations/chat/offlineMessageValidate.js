import { celebrate, Joi } from "celebrate";

export const offlineMessageValidate = celebrate({
  body: Joi.object({
    offline_data: Joi.string().required(),
    last_conversation_timestamp: Joi.number().required(),
  }),
});
