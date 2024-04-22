import { celebrate, Joi } from "celebrate";

export const notificationSettingValidate = celebrate({
  params: Joi.object({
    room_id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    is_enable_notification: Joi.string().valid("y", "n").required(),
  }),
});
