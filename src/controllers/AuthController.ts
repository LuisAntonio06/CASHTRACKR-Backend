import { Request , Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";
import logger from "../config/logger";

export class AuthController {

    static createAccount = async  (req : Request, res: Response) => {
        const { email , password } = req.body;
        const userExists = await User.findOne({ where: { email } })

        
        /* Validar usuarios duplicados */
        if (userExists) {
            const error = new Error('Correo ya registrado');
            return res.status(409).json({ error: error.message });
        };

        try {
            const user = await User.create(req.body);    

            /* Hashear passwords */
            user.password = await hashPassword(password);
            
            /* Asignar Token */
            const token = generateToken();
            user.token = token;

            if (process.env.NODE_ENV !== 'production') {
                globalThis.cashTrackrConfirmationToken = token;
            }

            await user.save();

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })


            res.status(201).json('Cuenta creada correctamente. revisa tu E-mail para confirmarla.')

        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }
    
    static confirmAccount = async  (req : Request, res: Response) => {
    
        const { token } = req.body;

        const user = await User.findOne({where: {token}})
        if (!user) {
            const error = new Error('Token no válido');

            return res.status(401).json({error: error.message});
        }

        user.confirmed = true;
        user.token = ''

        await user.save();
        res.json('Cuenta confirmada correctamente')
    }

    static login = async (req: Request , res: Response) => {

        const { email , password } = req.body;
        
        const user = await User.findOne({where : {email}});
        if (!user) {
            const error = new Error('Usuario no encontrado');
            logger.error(`El correo ${email} no esta registrado`); // 
            return res.status(404).json({error : error.message});
        };

        if (!user.confirmed) {
            const error = new Error('La cuenta no ha sido confirmada');
            return res.status(403).json({error : error.message})
        };

        const isPasswordCorrect = await checkPassword(password , user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Contraseña incorrecta');
            return res.status(401).json({error: error.message});
        }

        const token = generateJWT(user.id)
        logger.debug('Función login correctamente en funcionamiento:');
        logger.debug(`Token: ${token} registrado`);
        res.json(token);
    }

    static forgotPassword = async (req: Request , res: Response) => {

        const { email } = req.body;

        const user = await User.findOne({where: {email}});
        if (!user) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({error : error.message})
        };

        user.token = generateToken(); 
        await user.save();

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        });

        res.json('Revisa tu E-mail para instrucciones');
    }

    static validateToken = async (req: Request , res: Response) => {
        const { token } = req.body;

        const tokenExists = await User.findOne({where : {token}});
        if (!tokenExists) {
            const error = new Error('Token no válido');
            return res.status(404).json({error: error.message});
        };

        res.json('Token Válido, asigna un nuevo password');
    
    }

    static resetPasswordWithToken = async (req: Request , res: Response) => {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({where : {token}});
        if (!user) {
            const error = new Error('Token no válido');
            return res.status(404).json({error: error.message});
        };

        user.password = await hashPassword(password);
        user.token = null;
        user.save();
        res.json('Contraseña reestablecida correctamente')

    };

    static user = async (req: Request , res: Response) => {
        res.json(req.user)
    };

    static updateCurrentUSerPassword = async (req: Request , res: Response) => {
        const { current_password , password} = req.body;
        const { id } = req.user;

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(current_password , user.password);
        if (!isPasswordCorrect) {
            const error = new Error('La contraseña es incorrecta');
            return res.status(401).json({error: error.message});
        };

        user.password = await hashPassword(password);
        await user.save();
        logger.warn(`Contraseña actualizada para el usuario: ${user.name}`)
        res.json('Contraseña actualizada correctamente');
    };

    static checkPassword = async (req: Request , res: Response) => {
        const { password } = req.body;
        const { id } = req.user;

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(password , user.password);

        if (!isPasswordCorrect) {
            const error = new Error('La contraseña es incorrecta');
            return res.status(401).json({error: error.message});
        };

        res.json('Acción autorizada');
    };


    static updateUser = async (req: Request , res: Response) => {

        const { name , email } = req.body;

        try {
            const existingUser = await User.findOne({where: { email }});
            if (existingUser && existingUser.id !== req.user.id) {
                const error = new Error('Ese correo ya esta registrado por otro ususario');
                return res.status(409).json({error: error.message});
            };

            await User.update({email, name}, {
                where: { id : req.user.id}
            });

            res.json('Perfil actualizado correctamente');

        } catch (error) {
            return res.status(500).json({error: 'Ocurrio un error'});
        }

    };

}