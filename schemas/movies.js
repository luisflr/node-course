const zod = require('zod')

const movieSchema = zod.object({
  title: zod.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title es required'
  }),
  year: zod.number().int()
    .min(1900, {
      message: 'The number must be greater than 1900'
    }),
  director: zod.string(),
  duration: zod.number().int().positive(),
  poster: zod.string().url({
    message: 'Poster must be a valid url'
  }),
  rate: zod.number().default(0.5),
  genre: zod.array(
    zod.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )

})

function validateMovieSchema (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovieSchema (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovieSchema,
  validatePartialMovieSchema
}
