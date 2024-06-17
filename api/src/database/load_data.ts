import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { FlightData } from './types';

const db = new sqlite3.Database('./flights.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

const insertFlight = db.prepare(`
  INSERT INTO flights (
    origin, destination, airline, flight_num,
    origin_iata_code, origin_name, origin_latitude, origin_longitude,
    destination_iata_code, destination_name, destination_latitude, destination_longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const flightNumbers = new Set<string>();

db.each("SELECT flight_num FROM flights", (err, row: { flight_num: string }) => {
  if (err) {
    console.error('Error al leer flight_nums:', err.message);
  } else {
    flightNumbers.add(row.flight_num);
  }
}, () => {
  const csvFilePath = path.resolve(__dirname, '../flights.csv');

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row: FlightData) => {
      const { 
        origin, destination, airline, flight_num, 
        origin_iata_code, origin_name, origin_latitude, origin_longitude, 
        destination_iata_code, destination_name, destination_latitude, destination_longitude 
      } = row;

      if (!flightNumbers.has(flight_num)) {
        insertFlight.run(
          origin, destination, airline, flight_num,
          origin_iata_code, origin_name, parseFloat(origin_latitude), parseFloat(origin_longitude),
          destination_iata_code, destination_name, parseFloat(destination_latitude), parseFloat(destination_longitude)
        );
        flightNumbers.add(flight_num);
      }
    })
    .on('end', () => {
      console.log('Datos importados exitosamente.');
      insertFlight.finalize();
      db.close((err) => {
        if (err) {
          console.error('Error al cerrar la base de datos:', err.message);
        } else {
          console.log('Conexión a la base de datos cerrada.');
        }
      });
    })
    .on('error', (err) => {
      console.error('Error al leer el archivo CSV:', err.message);
    });
});
