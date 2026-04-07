import { transport } from "../config/nodemailer"

type EmailType = {
    name: string,
    email: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user : EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTracker - Confirma tu cuenta',
            html: `
                <p>Hola ${user.name} has creado tu cuenta en Cashtrackr, ya esta casi lista</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
                <p>E ingresa el código: <b>${user.token}</b></p>
            `
        })
        console.log('Mensaje enviado' , email.messageId)
    }
    static sendPasswordResetToken = async (user : EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTracker - Reestablece tu Password',
            html: `
                <p>Hola ${user.name} has solicitado reestablecer tu password</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
                <p>E ingresa el código: <b>${user.token}</b></p>
            `
        })
        console.log('Mensaje enviado' , email.messageId)
    }
}