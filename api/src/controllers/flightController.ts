import { Request, Response } from 'express';
import { FlightModel } from '../models/Flight';
import { getWeatherData } from '../services/weatherService';
import NodeCache from 'node-cache';

const cache = new NodeCache();
const flightModel = new FlightModel('./flights.db');

export const getFlightWeather = async (req: Request, res: Response) => {
  const flightNum = req.params.flightNum as string;

  try {
    const cacheFlight = cache.get(flightNum);
    if(cacheFlight){
      console.log("Data in cache");
      return res.json(cacheFlight);
    }
    const flight = await flightModel.getFlightCoordinates(flightNum);

    if (!flight) {
      res.status(404).json({ error: 'Flight not found' });
      return;
    }

    const { origin_latitude, origin_longitude, destination_latitude, destination_longitude } = flight;
    const origin = flight.origin;
    const destination = flight.destination;
    const origin_name = flight.origin_name;
    const destination_name = flight.destination_name;
    const originWeather = await getWeatherData(origin_latitude, origin_longitude);
    const destinationWeather = await getWeatherData(destination_latitude, destination_longitude);

    const response = {
      origin: {
        origin: origin,
        origin_name: origin_name,
        weather: originWeather
      },
      destination: {
        destination: destination,
        destination_name: destination_name,
        weather: destinationWeather
      }
    };
    cache.set(flightNum, response, 300);
    res.json(response);
  } catch (error) {
    console.error('Error al obtener datos del vuelo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cerrar la conexión a la base de datos al finalizar la aplicación
process.on('SIGINT', () => {
  flightModel.closeConnection();
  process.exit();
});
