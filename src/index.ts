import express from 'express'
import cors from 'cors'
const api = require('./routes/api-routes')

declare global {
    namespace Express {
        interface Request {
            vk_id: number
        }
    }
}

const PORT = 8080;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', api);
app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`));
