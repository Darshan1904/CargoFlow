import {Router} from 'express';

const mapRoute = Router();

mapRoute.get('/autocomplete', getSuggestions);

export default mapRoute;