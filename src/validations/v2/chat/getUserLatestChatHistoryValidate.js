import { celebrate, Joi } from "celebrate";

export const getUserLatestChatHistoryValidate = celebrate({
  query: Joi.object({
    room_id: Joi.number().required(),
    timestamp: Joi.number().integer().default(0),
    conversation_id: Joi.number().integer().default(0),
    //is_first_call: Joi.number().integer().default(0),
    page: Joi.number().required(),
    record_count: Joi.number().required(),
    result_type: Joi.string().empty(""),
  }),
});
