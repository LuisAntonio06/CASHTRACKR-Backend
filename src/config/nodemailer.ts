import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();


const config = () => {
    return {
        host: process.env.MAILTRAP_HOST,
        port: +process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
    }
}


export const transport = nodemailer.createTransport(config());
