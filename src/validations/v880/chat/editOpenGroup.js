import { celebrate, Joi } from "celebrate";

export const editOpenGroupValidate = celebrate({
  params: Joi.object({
    room_id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    passcode: Joi.string().allow("").optional(),
    is_secure_enable: Joi.string().valid("y", "n").allow("").optional(),
    area_radius: Joi.number().valid(5, 10, 15).allow("").optional(),
    group_image: Joi.string().allow("").allow(null),
    is_default_group_image: Joi.string().valid("y", "n").allow("").optional(),
  }),
});
