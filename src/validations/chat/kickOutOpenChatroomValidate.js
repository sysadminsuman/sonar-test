import { celebrate, Joi } from "celebrate";

export const kickOutOpenChatroomValidate = celebrate({
  body: Joi.object({
    room_id: Joi.number().required(),
    chat_member_id: Joi.number().required(),
  }),
});
