import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";
const router = Router();

/* Routes for budgets */

router.use(limiter)

router.post('/create-account' , 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('password')
        .isLength({min : 8}).withMessage('El password es muy corto (mínimo 8 caracteres)'),
    body('email')
        .isEmail().withMessage('E-mail no válido'   ),
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account' , 
    body('token')
        .isLength({min: 6}).withMessage('Token no válido'),
        handleInputErrors,
    AuthController.confirmAccount )

router.post('/login' , 
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    body('password')
        .notEmpty().withMessage('El Password es obligatorio'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password' ,
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.forgotPassword

)

router.post('/validate-token' ,
    body('token')
        .isLength({min: 6}).withMessage('Token no válido')
        .notEmpty().withMessage('Token no válido'),
        handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token' ,
    param('token')
        .isLength({min: 6}).withMessage('Token no válido')
        .notEmpty().withMessage('Token no válido'),
        handleInputErrors,
    body('password')
        .isLength({min : 8}).withMessage('El password es muy corto (mínimo 8 caracteres)'),
        handleInputErrors,
        AuthController.resetPasswordWithToken
    )
    
router.get('/user' , 
    authenticate,
    AuthController.user
)

router.put('/user',
    authenticate,
    AuthController.updateUser
)
    
router.post('/update-password',
    authenticate,
    body('current-password')
        .notEmpty().withMessage('El Password no debe ir vacio'),
    body('password')
        .isLength({min : 8}).withMessage('El password nuevo es muy corto (mínimo 8 caracteres)'),
    AuthController.updateCurrentUSerPassword
)
router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('El Password no debe ir vacio'),
    AuthController.checkPassword
)

export default router; 