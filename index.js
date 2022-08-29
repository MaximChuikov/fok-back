const express = require('express')
const cors = require('cors')

const PORT = 8080
const app = express()

app.use(cors())

app.get('/', (req, res) => {
    res.status(200).send(JSON.stringify({
        name: "hello",
        age: 0
    }))
})

app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`))