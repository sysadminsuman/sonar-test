import { celebrate, Joi } from "celebrate";

export const getNotParticipatingChatroomsValidate = celebrate({
  body: Joi.object({
    page: Joi.number(),
    record_count: Joi.number(),
    search_key: Joi.string().empty(""),
  }),
});
