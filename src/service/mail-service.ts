import SMTPTransport from "nodemailer/lib/smtp-transport";
import {Transporter} from "nodemailer";

const nodemailer = require('nodemailer');

function mail(href: string) {
    return `
    <div style="
        font-family: sans-serif;
        width: calc(100% - 40px);
        
        background: -webkit-linear-gradient(90deg,#354dc0,#813ba8,#a52a8a); 
        background: linear-gradient(90deg,#354dc0,#813ba8,#a52a8a);
        margin: 0;
        padding: 20px;
        color: #1E1E1E;
    ">
        <h1 style="margin-bottom: 50px;">Для активации аккаунта перейдите по ссылке</h1>
        <a href=${href} style="
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            font-size: 25px;
            background: -webkit-linear-gradient(90deg,#8b3088,#693a90,#414191);background: linear-gradient(90deg,#8b3088,#693a90,#414191);
            border-radius: 5px 12px;
            width: auto;
            box-shadow: 2px 1px 20px rgba(0, 0, 0, 0.5);
        " >Нажмите</a>
        <p style="
            color: #AEAEAE;
            font-size: 15px;
            word-spacing: -2px;
            margin: 100px 0 20px 0;
        ">Это письмо сгенерировано автоматически при регистрации, вам не нужно отвечать на него.</p>
</div>
    
    `
}

class MailService {
    private transporter: Transporter<SMTPTransport.SentMessageInfo>;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на фокбулатова.рф',
            text: '',
            html: mail(link)
        })
    }
}

module.exports = new MailService();
