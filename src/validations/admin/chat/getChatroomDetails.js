import { celebrate, Joi } from "celebrate";

export const chatroomDetailsValidate = celebrate({
  params: Joi.object({
    room_id: Joi.number().required(),
  }),
});
