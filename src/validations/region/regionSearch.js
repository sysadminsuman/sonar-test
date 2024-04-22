import { celebrate, Joi } from "celebrate";

export const fetchRegionSearch = celebrate({
  query: Joi.object({
    search_key: Joi.string(),
    page:Joi.number(),
    record_count: Joi.number(),
  }),
});