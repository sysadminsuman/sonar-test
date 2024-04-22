import { celebrate, Joi } from "celebrate";

export const reportUserByCountDetailsValidate = celebrate({
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
  query: Joi.object({
    record_count: Joi.number().empty(""),
    page: Joi.number().empty(""),
    reason_type: Joi.string().empty(""), //reason-type
    chatroom_name: Joi.string().empty(""), //name
    group_type: Joi.string().valid("general", "location", "all").empty(""), //chatroom type
    is_secret: Joi.string().empty(""), //is secret
    reported_by: Joi.string().empty(""), //reported by -user name
    create_start_date: Joi.date().empty(""),
    create_end_date: Joi.date().empty(""),
  }),
});
