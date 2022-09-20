const express = require('express')
const cors = require('cors')

const PORT = 8080
const app = express()
app.use(express.json())
app.use(cors())

const api = require('./routes/api-routes')
const auth = require('./routes/controllers/authorization-controller')

//app.use(auth.vk_auth)
app.use('/api', api)

app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`))

/*
.../api/user/account -> get post

.../api/manager/
*/