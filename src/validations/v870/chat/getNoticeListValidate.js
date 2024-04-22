import { celebrate, Joi } from "celebrate";

export const getNoticeListValidate = celebrate({
  query: Joi.object({
    room_id: Joi.number().required(),
    last_notice_id: Joi.number(),
    record_count: Joi.number(),
  }),
});
