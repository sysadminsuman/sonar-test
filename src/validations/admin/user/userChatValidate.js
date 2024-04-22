import { celebrate, Joi } from "celebrate";
export const userChatValidate = celebrate({
  query: Joi.object({
    page: Joi.number(),
    record_count: Joi.number(),
    search_name: Joi.string().empty(""),
    member_type: Joi.string().empty("").valid("member", "owner", "all"),
    chatroom_type: Joi.string().empty("").valid("general", "location", "all"),
    privacy_type: Joi.string().empty("").valid("everyone", "secret", "all"),
    startDate: Joi.date().empty(""),
    endDate: Joi.date().empty(""),
  }),
});
