import { celebrate, Joi } from "celebrate";

export const userLoginValidate = celebrate({
  body: Joi.object({
    customer_id: Joi.string().required(),
    name: Joi.string().required(),
    profile_image: Joi.string().allow("").optional(),
    device_uuid: Joi.string().required(),
    is_overall_notification: Joi.string().allow("").optional(),
    is_room_creation_notification: Joi.string().allow("").optional(),
    is_location_enabled: Joi.string().allow("").optional(),
  }),
});
