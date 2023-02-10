import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser";
import errorMiddleware from './middlewares/error-middleware'
import router from './routes/api-routes'
import UserDto from "./dtos/user-dto";
import AdminJS from "adminjs";

import * as AdminJSPrisma from '@adminjs/prisma'
import {PrismaClient} from '@prisma/client'
import {DMMFClass} from '@prisma/client/runtime'

const prisma = new PrismaClient()

AdminJS.registerAdapter({
    Resource: AdminJSPrisma.Resource,
    Database: AdminJSPrisma.Database,
})

const dmmf = ((prisma as any)._baseDmmf as DMMFClass)
const adminOptions = {
    resources: [
        {
            resource: {model: dmmf.modelMap.Event, client: prisma},
            options: {},
        },
        {
            resource: { model: dmmf.modelMap.User, client: prisma },
            options: {},
        },
        {
            resource: { model: dmmf.modelMap.Book, client: prisma },
            options: {},
        }
    ],
}

const AdminJSExpress = require('@adminjs/express')

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

const admin = new AdminJS(adminOptions)

const DEFAULT_ADMIN = {
    email: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASSWORD,
}

const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN)
    }
    return null
}

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'helo'
    },
    null
)
app.use(admin.options.rootPath, adminRouter)

console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ['https://фокбулатова.рф', 'http://localhost:3000']
}));
app.use('/api', router);
app.use(errorMiddleware)
app.listen(PORT, () => console.log(`Server hosted in ${PORT} port`));
