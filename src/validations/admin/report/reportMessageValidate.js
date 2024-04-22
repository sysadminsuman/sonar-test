import { celebrate, Joi } from "celebrate";

export const reportMessageValidate = celebrate({
  body: Joi.object({

  record_count: Joi.number().empty(""),
  page: Joi.number().empty(""),
  reason_type: Joi.string().empty(""), //reason-type
  chatroom_name: Joi.string().empty(""), //name
  group_type: Joi.string().valid("general", "location", "all").empty(""), //chatroom type
  reported_message: Joi.string().empty("").max(500), // text-message
  reported_by: Joi.string().empty(""), //user name
  message_posted_by: Joi.string().empty(""), //user name
  message_type: Joi.string().valid("text", "video","image", "all").empty(""),
  create_start_date: Joi.date().empty(""),
  create_end_date: Joi.date().empty(""),
  }),
});
