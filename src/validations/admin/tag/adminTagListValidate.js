import { celebrate, Joi } from "celebrate";

export const adminTagListValidate = celebrate({
  query: Joi.object({
    record_count: Joi.number().empty(""),
    page: Joi.number().empty(""),
    name: Joi.string().empty(""),
    startDate: Joi.date().empty(""),
    endDate: Joi.date().empty(""),
    status: Joi.string().empty(""),
    startRange: Joi.number().empty(""),
    endRange: Joi.number().empty(""),
  }),
});
