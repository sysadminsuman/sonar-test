import { celebrate, Joi } from "celebrate";

export const verifyPasscodeValidate = celebrate({
  body: Joi.object({
    room_id: Joi.number().required(),
    passcode: Joi.string().required(),
  }),
});
