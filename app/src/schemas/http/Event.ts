import Joi from "joi"

export const CoordinatesSchema: Joi.Schema = Joi.object().keys({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180),
    radius: Joi.number().default(3).min(1).max(15)
})

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
        coordinates: CoordinatesSchema
    }),
    topics: Joi.array()
})


