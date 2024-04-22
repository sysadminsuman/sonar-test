import { celebrate, Joi } from "celebrate";

export const getUserAllChatroomValidate = celebrate({
  query: Joi.object({
    page: Joi.number(),
    record_count: Joi.number(),
  }),
});
