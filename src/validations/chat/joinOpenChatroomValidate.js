import { celebrate, Joi } from "celebrate";

export const joinOpenChatroomValidate = celebrate({
  body: Joi.object({
    room_id: Joi.number().required(),
  }),
});
