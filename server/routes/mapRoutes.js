import {Router} from 'express';
import { getSuggestions, getDirections } from '../controllers/mapController.js';
import protect from '../middleware/authMiddleware.js';

const mapRouter = Router();

// get suggestion for places
mapRouter.get('/autocomplete', getSuggestions);

// get directions
mapRouter.get('/directions', protect, getDirections);

export default mapRouter;