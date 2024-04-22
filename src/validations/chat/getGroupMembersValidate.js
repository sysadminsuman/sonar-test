import { celebrate, Joi } from "celebrate";

export const getGroupMembersValidate = celebrate({
  params: Joi.object({
    room_id: Joi.number().required(),
  }),
});
