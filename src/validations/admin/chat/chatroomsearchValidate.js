import { celebrate, Joi } from "celebrate";

export const chatroomsearchValidate = celebrate({
  query: Joi.object({
    record_count: Joi.number().empty(""),
    page: Joi.number().empty(""),
    search_key: Joi.string().empty(""), //name
    group_type: Joi.string().valid("general", "location", "all").empty(""), //chatroom type
    cities: Joi.string().empty(""), //city/country /region
    is_secret: Joi.string().empty(""), //is secret
    user: Joi.string().empty(""), //user name
    status: Joi.string().empty(""),
    create_start_date: Joi.date().empty(""),
    create_end_date: Joi.date().empty(""),
    last_start_date: Joi.date().empty(""),
    last_end_date: Joi.date().empty(""),
    search_type: Joi.string().empty("").valid("noisy", "hot", "location"), //order by
  }),
});
