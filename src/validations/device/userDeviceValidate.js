import { celebrate, Joi } from "celebrate";

export const userDeviceValidate = celebrate({
  body: Joi.object({
    device_uuid: Joi.string().required(),
    device_type: Joi.string().required(),
    device_token: Joi.string().required(),
    user_id: Joi.number().integer().optional(),
    is_overall_notification: Joi.string().allow("").optional(),
    is_room_creation_notification: Joi.string().allow("").optional(),
    is_location_enabled: Joi.string().allow("").optional(),
    is_logged_in: Joi.string().allow("").optional(),
  }),
});
