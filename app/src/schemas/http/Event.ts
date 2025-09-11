import Joi from "joi"

export const CreateEventSchema: Joi.Schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string().required(),
    date: Joi.number().required().custom((value, helpers) => {
        if (value < Math.ceil(Date.now() / 1000)) {
            return helpers.error("any.invalid", { message: "Date cannot be in the past" });
        }
        return value;
    }, "Future date validation"),
    location: Joi.object().keys({
        value: Joi.string().required(),
        coordinates: Joi.object().keys({
            lat: Joi.number().required(),
            lon: Joi.number().required(),
        })
    })
})
