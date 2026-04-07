import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter';
import authRouter from './routes/authRouter'
import logger from './config/logger';



export async function connectDB() {
    try {
        await db.authenticate();
        db.sync();
        console.log(colors.green('Conexión exitosa a la BD'));
        logger.info('Conexión exitosa a la BD'); 
        
    } catch (error) { 
        logger.error('Fallo la conexión a la BD: ' + error.message); 
        console.log(colors.red('Fallo la conexión a la BD'));
    }
}

connectDB();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/budgets' , budgetRouter)
app.use('/api/auth' , authRouter)

console.log(process.env.NODE_ENV)

export default app


