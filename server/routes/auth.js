import {Router} from 'express';
import {signUp, signIn} from '../controllers/auth.js';

const authRoute = Router();

authRoute.post('/register', signUp);
authRoute.post('/login', signIn);

export default authRoute;