import { celebrate, Joi } from "celebrate";

export const reportMessageValidate = celebrate({
  body: Joi.object({
    conversation_id: Joi.number().required(),
	description:Joi.string().allow("").optional().max(500),
	type:Joi.string().valid('harmful', 'illegal', 'scam', 'other').required(),
  }),
});
