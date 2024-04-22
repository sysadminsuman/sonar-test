import { celebrate, Joi } from "celebrate";

export const getUserAllChatroomValidate = celebrate({
  query: Joi.object({
    record_count: Joi.number(),
    last_message_id: Joi.number(),
  }),
});
