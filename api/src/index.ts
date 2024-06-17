// src/index.ts
import express from 'express';
import flightRoutes from './routes/flightRoute';
import { FlightModel } from './models/Flight';

const app = express();
const port = 3000;

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api', flightRoutes);

const flightModel = new FlightModel('./flights.db');

// Base de datos
process.on('SIGINT', () => {
  flightModel.closeConnection();
  process.exit();
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
