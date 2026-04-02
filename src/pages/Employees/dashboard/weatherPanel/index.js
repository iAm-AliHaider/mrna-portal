import React, { useEffect, useState } from "react";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightIcon from "@mui/icons-material/Nightlight";
import CloudIcon from "@mui/icons-material/Cloud";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import AcUnitIcon from "@mui/icons-material/AcUnit";

const WeatherPanel = () => {
  const [city, setCity] = useState("Loading...");
  const [time, setTime] = useState("--:--");
  const [icon, setIcon] = useState(<CloudIcon color="primary" />);
  const [temperature, setTemperature] = useState(null);

  const apiKey = "70fa6745e448c41f14e8126c3443945f";
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=Riyadh&appid=${apiKey}&units=metric`;

  const getIconFromWeather = (weatherMain, isNight) => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return isNight ? <NightlightIcon color="primary" /> : <WbSunnyIcon color="primary" />;
      case "clouds":
        return <CloudIcon color="primary" />;
      case "thunderstorm":
        return <ThunderstormIcon color="primary" />;
      case "snow":
        return <AcUnitIcon color="primary" />;
      default:
        return <CloudIcon color="primary" />;
    }
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes();
      const formattedTime = `${hours % 12 || 12}:${mins.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
      const isNight = hours < 6 || hours > 18;

      setCity(data.name);
      setTime(formattedTime);
      setTemperature(data.main.temp);
      setIcon(getIconFromWeather(data.weather[0].main, isNight));
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow border w-full max-w-xs">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Weather
      </div>
      <div className="flex flex-col gap-2 text-sm text-gray-700 p-4">
        <div className="flex justify-between items-center">
          <span>{city}</span>
          <span className="font-bold text-black">{time}</span>
          <span>{icon}</span>
        </div>
        {temperature !== null && (
          <div className="text-xs text-gray-600 pt-2 pl-1">
            Temperature: <span className="font-semibold text-black">{temperature.toFixed(1)}°C</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPanel;
