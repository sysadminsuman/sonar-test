import { celebrate, Joi } from "celebrate";

export const roomURLValidate = celebrate({
  params: Joi.object({
    room_unique_id: Joi.string().required(),
  }),
});
