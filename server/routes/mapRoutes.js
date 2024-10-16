import {Router} from 'express';
import { getSuggestions } from '../controllers/mapController';

const mapRoute = Router();

mapRoute.get('/autocomplete', getSuggestions);

export default mapRoute;