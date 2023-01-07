import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser";
import errorMiddleware from './middlewares/error-middleware'
import router from './routes/api-routes'

const PORT = 8080;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware)
app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`));
