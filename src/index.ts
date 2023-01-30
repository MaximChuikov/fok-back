import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser";
import errorMiddleware from './middlewares/error-middleware'
import router from './routes/api-routes'
import UserDto from "./dtos/user-dto";

const PORT = 8080;

// userDto variable in request after auth middleware only
declare global {
    namespace Express {
        interface Request {
            user: UserDto
        }
    }
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "https://фокбулатова.рф"
}));
app.use('/api', router);
app.use(errorMiddleware)
app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`));
