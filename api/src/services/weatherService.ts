import axios from 'axios';

const API_KEY = 'ae432605fc8fb4b6d9d2fa8046cac572';

export const getWeatherData = async (latitude: number, longitude: number) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;

    // filtra json
    const filteredData = {
      weather: weatherData.weather.map((item: any) => ({
        id: item.id,
        main: item.main,
        description: item.description,
        icon: item.icon,
      })),
      main: {
        temp: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        temp_min: weatherData.main.temp_min,
        temp_max: weatherData.main.temp_max,
        pressure: weatherData.main.pressure,
        humidity: weatherData.main.humidity,
      },
    };

    return filteredData;

  } catch (error: any) {
    console.error('Error al obtener datos del clima:', error.message);
    throw error;
  }
};
