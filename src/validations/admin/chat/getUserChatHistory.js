import { celebrate, Joi } from "celebrate";

export const getUserChatHistoryValidate = celebrate({
  query: Joi.object({
    room_id: Joi.number().required(),
    timestamp: Joi.number().integer().default(0),
    //timestamp: Joi.required(),
    //is_first_call: Joi.required(),
    page: Joi.number().required(),
    record_count: Joi.number().required(),
    result_type: Joi.string().empty(""),
    search_text: Joi.string().empty(""),
  }),
});
