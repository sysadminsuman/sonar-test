import { celebrate, Joi } from "celebrate";

export const reportUserValidate = celebrate({
  body: Joi.object({
    member_id: Joi.number().required(),
    room_id: Joi.number().required(),
    type: Joi.string().valid("harmful", "illegal", "scam", "other").required(),
    description: Joi.string().allow("").optional().max(500),
  }),
});
