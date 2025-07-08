const { z } = require('zod');
const axios = require('axios');

class AccuWeatherAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'accuweather';
        this.apiKey = process.env.ACCUWEATHER_API_KEY;
        this.baseUrl = 'http://dataservice.accuweather.com';
    }

    async init() {
        return !!this.apiKey;
    }

    async _getLocationKey(query) {
        const url = `${this.baseUrl}/locations/v1/cities/search`;
        const params = { apikey: this.apiKey, q: query, language: 'en-us', details: false };
        const { data } = await axios.get(url, { params });
        if (data.length === 0) throw new Error('Location not found');
        return data[0].Key;
    }

    getTools() {
        return [
            {
                title: 'Current Weather',
                name: 'current_weather',
                description: 'Get current weather conditions by location name',
                inputSchema: {
                    location: z.string()
                },
                handler: async ({ location }) => {
                    const locationKey = await this._getLocationKey(location);
                    const url = `${this.baseUrl}/currentconditions/v1/${locationKey}`;
                    const params = { apikey: this.apiKey, language: 'en-us', details: true };
                    const { data } = await axios.get(url, { params });
                    if (!data || data.length === 0) throw new Error('Weather data not found');
                    const weather = data[0];
                    return {
                        location,
                        weather: {
                            temperature: weather.Temperature.Metric.Value,
                            unit: weather.Temperature.Metric.Unit,
                            weatherText: weather.WeatherText,
                            humidity: weather.RelativeHumidity,
                            windSpeed: weather.Wind.Speed.Metric.Value,
                            windDirection: weather.Wind.Direction.Localized,
                            uvIndex: weather.UVIndex,
                            precipitationProbability: weather.PrecipitationProbability
                        },
                        observationTime: weather.LocalObservationDateTime
                    };
                }
            },
            {
                title: '5-Day Forecast',
                name: 'five_day_forecast',
                description: 'Get a 5-day weather forecast by location name',
                inputSchema: {
                    location: z.string()
                },
                handler: async ({ location }) => {
                    const locationKey = await this._getLocationKey(location);
                    const url = `${this.baseUrl}/forecasts/v1/daily/5day/${locationKey}`;
                    const params = { apikey: this.apiKey, language: 'en-us', metric: true };
                    const { data } = await axios.get(url, { params });
                    if (!data || !data.DailyForecasts) throw new Error('Forecast data not found');
                    return {
                        location,
                        forecast: data.DailyForecasts.map(day => ({
                            date: day.Date,
                            temperatureMin: day.Temperature.Minimum.Value,
                            temperatureMax: day.Temperature.Maximum.Value,
                            unit: day.Temperature.Minimum.Unit,
                            dayDescription: day.Day.IconPhrase,
                            nightDescription: day.Night.IconPhrase,
                            precipitationProbabilityDay: day.Day.PrecipitationProbability,
                            precipitationProbabilityNight: day.Night.PrecipitationProbability
                        }))
                    };
                }
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [
            {
                title: 'AccuWeather Assistant',
                name: 'accuweather_assistant',
                description: 'Get weather information and forecasts',
                arguments: [
                    {
                        name: 'location',
                        description: 'Place to check weather for',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can provide current weather and 5-day forecasts for your location.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me for current weather or forecast by city name.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = AccuWeatherAddon;