import express from 'express';
import { getFlightWeather } from '../controllers/flightController';

const router = express.Router();

router.get('/flight/:flightNum/weather', getFlightWeather);

export default router;
