import { celebrate, Joi } from "celebrate";

export const myChatroomDetailsValidate = celebrate({
  body: Joi.object({
    room_id: Joi.number().required(),
    user_id: Joi.number(),
  }),
});
