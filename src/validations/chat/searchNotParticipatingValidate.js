import { celebrate, Joi } from "celebrate";

export const searchNotParticipatingValidate = celebrate({
  body: Joi.object({
    latitude: Joi.number().required(),
	longitude: Joi.number().required(),
	radius: Joi.number().allow("").optional(),
	search_type:Joi.string().allow("").optional(),
	durationmonth: Joi.number().allow("").optional(),
	durationday: Joi.number().allow("").optional(),
	tag_id:Joi.string().allow("").optional(),
	record_count: Joi.number().allow("").optional(),
	is_secret:Joi.string().allow("").optional(),
	city: Joi.array().items(Joi.number().optional()).allow("").optional(),
  }),
});
