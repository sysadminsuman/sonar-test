import { celebrate, Joi } from "celebrate";

export const getUserLatestChatroomValidate = celebrate({
  query: Joi.object({
    page: Joi.number(),
    record_count: Joi.number(),
    user_id: Joi.number(),
  }),
});
