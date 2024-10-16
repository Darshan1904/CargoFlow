import {Router} from 'express';
import { getSuggestions } from '../controllers/mapController.js';

const mapRouter = Router();

mapRouter.get('/autocomplete', getSuggestions);

export default mapRouter;