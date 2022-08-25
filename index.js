const express = require('express')
const cors = require('cors')

const PORT = 8080
const app = express()

app.use(cors)

app.get('/', (req, res) => {
    res.send("<h3>Ролан, привет с нового сервера! :)</h3>")
})

app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`))