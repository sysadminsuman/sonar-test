import { celebrate, Joi } from "celebrate";

export const chatroomDetailsValidate = celebrate({
  query: Joi.object({
    room_id: Joi.number().required(),
    user_id: Joi.number(),
  }),
});
