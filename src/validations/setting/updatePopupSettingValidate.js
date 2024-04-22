import { celebrate, Joi } from "celebrate";

export const updatePopupSettingValidate = celebrate({
  body: Joi.object({
    start_maintenance: Joi.string().required(),
    end_maintenance: Joi.string().required(),
    message: Joi.string().required(),
  }),
});
