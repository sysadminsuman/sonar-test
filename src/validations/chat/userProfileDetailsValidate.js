import { celebrate, Joi } from "celebrate";

export const userProfileDetailsValidate = celebrate({
  query: Joi.object({
    room_id: Joi.number(),
    chat_member_id: Joi.number(),
  }),
});
