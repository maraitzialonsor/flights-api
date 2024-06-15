import sqlite3 from 'sqlite3';

export interface Flight {
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}

export class FlightModel {
  private db: sqlite3.Database;

  constructor(dbFilePath: string) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.error('Error al abrir la base de datos:', err.message);
      } else {
        console.log('Conectado a la base de datos SQLite.');
      }
    });
  }

  async getFlightCoordinates(flightNum: string): Promise<Flight | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT origin_latitude, origin_longitude, destination_latitude, destination_longitude
        FROM flights
        WHERE flight_num = ?
      `;
      this.db.get(query, [flightNum], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve(row as Flight);
        }
      });
    });
  }

  closeConnection() {
    this.db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        console.log('Conexión a la base de datos cerrada.');
      }
    });
  }
}
