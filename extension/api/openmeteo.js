import { safeFetch, cl } from "../utils/shortcuts.js";

const BASE_URL = "https://api.open-meteo.com/v1";

export class OpenMeteoAPI {
    async getWeather(lat, lon) {
        if (!lat || !lon) return null;
        cl(`[OpenMeteo] Getting weather for: ${lat}, ${lon}`);
        const data = await safeFetch(
            `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        return data?.current_weather || null;
    }

    // Helper to get coordinates from city name (using OpenMeteo Geocoding API)
    async getCoordinates(city) {
        cl(`[OpenMeteo] Geocoding: ${city}`);
        const data = await safeFetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                city
            )}&count=1&language=en&format=json`
        );
        return data?.results?.[0] || null;
    }
}
