const express = require('express')
const movies = require('./movies.json')
const cors = require('cors')
const crypto = require('node:crypto')
const { validateMovieSchema, validatePartialMovieSchema } = require('./schemas/movies')

const app = express()
const port = process.env.PORT ?? 3000

app.disable('x-powered-by')
app.use(express.json())

// metodos normales: GET, POST, HEAD
// metodos complejos: PUT, PATCH, DELETE

// CORS PRE-Flight requiere del Options

const WHITE_LIST = [
  'http://localhost:8800',
  'http://localhost:1234',
  'https://movies.com',
  'https://luisgfr.com'
]

// La forma clásica para arreglar el problema de CORS esta en la implemetnación app.options

// La otra forma de solucionar el error de CORS es
// instalando el Middleware cors con el sgt comando
// npm install cors -E
// y se utilizaría de la siguiente forma

// Sin embargo esto lo que haces es que acepta las request de absolutamente
// todos los origenes desde los que se realizaron

// app.use(cors())

// Si queremos personalizar esto sería mejor modificar un poco el middleware
// de la siguiente forma

app.use(cors({
  origin: (origin, callback) => {
    if (WHITE_LIST.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

// Ejemplo de un get simple
app.get('/', (req, res) => {
  res.json({ message: 'hola mundo' })
})

// Obtener las peliculas
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const moviesByGenre = movies.filter(movie =>
      movie.genre.some(_genre =>
        _genre.toLocaleLowerCase() === genre.toLocaleLowerCase()))
    return res.json(moviesByGenre)
  }
  res.json(movies)
})

// Obtener una pelicla por ID
app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)
  res.status(404).json({ message: 'not found' })
})

// Crear una película
app.post('/movies', (req, res) => {
  // Agregar validaciones
  const result = validateMovieSchema(req.body)

  if (result.error) res.status(400).json({ error: JSON.parse(result.error.message) })

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

// Actualizar una película
app.patch('/movies/:id', (req, res) => {
  const { id } = req.params

  const result = validatePartialMovieSchema(req.body)
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (result.error) res.status(400).json({ error: JSON.parse(result.error.message) })

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})

// Eliminar una película
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted successfully' })
})

// Añadir los permisos en CORS

// Esta sería la forma clásica sin instalaciones
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (WHITE_LIST.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  }

  res.send(200)
})

// Iniciar el servidor
app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`)
})
