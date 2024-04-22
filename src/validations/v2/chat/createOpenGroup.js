import { celebrate, Joi } from "celebrate";

const locationSchema = Joi.alternatives().try(Joi.number().required());

export const createOpenGroupValidate = celebrate({
  body: Joi.object({
    group_type: Joi.string().valid("general", "location").required(),
    latitude: Joi.when("group_type", {
      is: "location",
      then: locationSchema.required(),
    }),
    longitude: Joi.when("group_type", {
      is: "location",
      then: locationSchema.required(),
    }),
    area_radius: Joi.when("group_type", {
      is: "location",
      then: Joi.number().valid(5, 10, 15).required(),
    }),
    cities: Joi.when("group_type", {
      is: "general",
      then: Joi.array().required(),
    }),
    address: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    country: Joi.string().allow("").optional(),
    passcode: Joi.string().allow("").optional(),
    tags: Joi.array().allow("").optional(),
    show_previous_chat_history: Joi.string().required(),
  }),
});
