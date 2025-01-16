import Joi from "joi";

export const bookingValidation = Joi.object({
  pnr: Joi.string().required(),
  user_id: Joi.number().integer().greater(0).required(),
  train_id: Joi.number().integer().greater(0).required(),
  journey_date: Joi.date().required(),
  booking_status: Joi.string()
    .valid("Confirmed", "Waiting", "Cancelled")
    .required(),
  booking_date: Joi.date().default(() => new Date()),
  total_amount: Joi.number().greater(0).required(),
  seat_numbers: Joi.array().items(Joi.string()).required(),
  user_name: Joi.string().max(255).required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  email: Joi.string().email().required(),
  from_city: Joi.string().max(100).required(),
  to_city: Joi.string().max(100).required(),
  booking_class: Joi.string()
    .valid(
      "First Class",
      "Second Class",
      "Sleeper",
      "AC 3 Tier",
      "AC 2 Tier",
      "AC First Class"
    )
    .required(),
});

module.exports = bookingValidation;
