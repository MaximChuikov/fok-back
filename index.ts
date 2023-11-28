const express = require('express')
const cors = require('cors')

const api = require('./routes/api-routes')

const PORT = 8080
const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.json('hello world')
})
app.use(api)


app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`))