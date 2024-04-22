import { celebrate, Joi } from "celebrate";

export const getAllMediaValidate = celebrate({
  query: Joi.object({
    room_id: Joi.number().required(),
    page: Joi.number(),
    record_count: Joi.number(),
  }),
});
