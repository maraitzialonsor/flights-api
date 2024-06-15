import { Request, Response } from 'express';
import { FlightModel } from '../models/Flight';
import { getWeatherData } from '../services/weatherService';

const flightModel = new FlightModel('./flights.db');

export const getFlightWeather = async (req: Request, res: Response) => {
  const flightNum = req.params.flightNum as string;

  try {
    const flight = await flightModel.getFlightCoordinates(flightNum);

    if (!flight) {
      res.status(404).json({ error: 'Flight not found' });
      return;
    }

    const { origin_latitude, origin_longitude, destination_latitude, destination_longitude } = flight;
    const originWeather = await getWeatherData(origin_latitude, origin_longitude);
    const destinationWeather = await getWeatherData(destination_latitude, destination_longitude);

    res.json({
      origin: {
        latitude: origin_latitude,
        longitude: origin_longitude,
        weather: originWeather
      },
      destination: {
        latitude: destination_latitude,
        longitude: destination_longitude,
        weather: destinationWeather
      }
    });
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
