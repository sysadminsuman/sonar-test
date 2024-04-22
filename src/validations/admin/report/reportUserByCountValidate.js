import { celebrate, Joi } from "celebrate";

export const reportUserByCountValidate = celebrate({
  query: Joi.object({
    record_count: Joi.number().empty(""),
    page: Joi.number().empty(""),
    repoted_count: Joi.number().empty(""), //Min. reported count
    reported_user: Joi.string().empty(""), //user name
    create_start_date: Joi.date().empty(""),
    create_end_date: Joi.date().empty(""),
  }),
});
