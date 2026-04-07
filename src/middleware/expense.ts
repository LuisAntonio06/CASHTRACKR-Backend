import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import Expense from '../models/Expense';

declare global {
    namespace Express {
        interface Request {
            expense: Expense
        }
    }
}


export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => { 

    await body('name')
        .notEmpty().withMessage('El nombre del gasto no puede ir vacio').run(req);

    await body('amount')
        .notEmpty().withMessage('La cantidad del gasto no puede ir vacia')
        .isNumeric().withMessage('Cantidad no válida')
        .custom(value => value > 0).withMessage('El gasto debe ser mayor a 0').run(req);

    next()
}

export const validateExpendId = async (req: Request, res: Response, next: NextFunction) => {
    await param('expenseId').isInt().custom(value => value > 0).withMessage('ID no válido').run(req)

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}  

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params;
        const expense = await Expense.findByPk(expenseId);

        if (!expense) {
            const error = new Error('Gasto no encontrado');
            return res.status(404).json({ error: error.message });
        }

        /* Pasarlo via request */
        req.expense = expense;
        next();
    } catch (error) {
        res.status(500).json({error : 'Hubo un error'})
    }
}   

export const belongsToBudget = async (req: Request, res: Response, next: NextFunction) => {
    if (req.budget.id !== req.expense.budgetId) {
        const error = new Error('Acción no válida');
        return res.status(403).json({error: error.message});
    };

    next();
};