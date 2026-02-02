import { describe, expect, it } from "vitest";
import { getFlightInfo, analyzeFlightDelay, FlightData } from "./utils/flightApi";

describe("Flight API", () => {
  describe("getFlightInfo", () => {
    it("should return simulated flight data for Turkish Airlines flight", async () => {
      const result = await getFlightInfo("TK1234", "2024-01-15");
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.airline.iata).toBe("TK");
      expect(result.data?.airline.name).toBe("Turkish Airlines");
      expect(result.data?.flight.iata).toBe("TK1234");
    });

    it("should return simulated flight data for Pegasus flight", async () => {
      const result = await getFlightInfo("PC123", "2024-01-15");
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.airline.iata).toBe("PC");
      expect(result.data?.airline.name).toBe("Pegasus Airlines");
    });

    it("should handle unknown airline codes", async () => {
      const result = await getFlightInfo("XX999", "2024-01-15");
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.airline.iata).toBe("XX");
    });

    it("should include departure and arrival information", async () => {
      const result = await getFlightInfo("TK100", "2024-01-15");
      
      expect(result.success).toBe(true);
      expect(result.data?.departure).toBeDefined();
      expect(result.data?.departure.iata).toBeDefined();
      expect(result.data?.arrival).toBeDefined();
      expect(result.data?.arrival.iata).toBeDefined();
    });
  });

  describe("analyzeFlightDelay", () => {
    it("should detect delay from flight data", () => {
      const flightData: FlightData = {
        flight_date: "2024-01-15",
        flight_status: "landed",
        departure: {
          airport: "Istanbul Airport",
          timezone: "Europe/Istanbul",
          iata: "IST",
          icao: "LTFM",
          terminal: "A",
          gate: "A1",
          delay: 180, // 3 hours delay
          scheduled: "2024-01-15T10:00:00Z",
          estimated: "2024-01-15T13:00:00Z",
          actual: "2024-01-15T13:00:00Z",
        },
        arrival: {
          airport: "Frankfurt Airport",
          timezone: "Europe/Berlin",
          iata: "FRA",
          icao: "EDDF",
          terminal: "1",
          gate: "B5",
          baggage: "3",
          delay: 180,
          scheduled: "2024-01-15T12:00:00Z",
          estimated: "2024-01-15T15:00:00Z",
          actual: "2024-01-15T15:00:00Z",
        },
        airline: {
          name: "Turkish Airlines",
          iata: "TK",
          icao: "THY",
        },
        flight: {
          number: "1234",
          iata: "TK1234",
          icao: "THY1234",
        },
      };

      const analysis = analyzeFlightDelay(flightData);

      expect(analysis.hasDelay).toBe(true);
      expect(analysis.delayMinutes).toBe(180);
      expect(analysis.isCancelled).toBe(false);
      expect(analysis.departureAirport).toBe("IST");
      expect(analysis.arrivalAirport).toBe("FRA");
      expect(analysis.airlineName).toBe("Turkish Airlines");
    });

    it("should detect cancelled flight", () => {
      const flightData: FlightData = {
        flight_date: "2024-01-15",
        flight_status: "cancelled",
        departure: {
          airport: "Istanbul Airport",
          timezone: "Europe/Istanbul",
          iata: "IST",
          icao: "LTFM",
          terminal: "A",
          gate: "A1",
          delay: null,
          scheduled: "2024-01-15T10:00:00Z",
          estimated: null,
          actual: null,
        },
        arrival: {
          airport: "Frankfurt Airport",
          timezone: "Europe/Berlin",
          iata: "FRA",
          icao: "EDDF",
          terminal: "1",
          gate: "B5",
          baggage: "3",
          delay: null,
          scheduled: "2024-01-15T12:00:00Z",
          estimated: null,
          actual: null,
        },
        airline: {
          name: "Turkish Airlines",
          iata: "TK",
          icao: "THY",
        },
        flight: {
          number: "1234",
          iata: "TK1234",
          icao: "THY1234",
        },
      };

      const analysis = analyzeFlightDelay(flightData);

      expect(analysis.hasDelay).toBe(true);
      expect(analysis.isCancelled).toBe(true);
    });

    it("should detect on-time flight", () => {
      const flightData: FlightData = {
        flight_date: "2024-01-15",
        flight_status: "landed",
        departure: {
          airport: "Istanbul Airport",
          timezone: "Europe/Istanbul",
          iata: "IST",
          icao: "LTFM",
          terminal: "A",
          gate: "A1",
          delay: 0,
          scheduled: "2024-01-15T10:00:00Z",
          estimated: "2024-01-15T10:00:00Z",
          actual: "2024-01-15T10:00:00Z",
        },
        arrival: {
          airport: "Frankfurt Airport",
          timezone: "Europe/Berlin",
          iata: "FRA",
          icao: "EDDF",
          terminal: "1",
          gate: "B5",
          baggage: "3",
          delay: 0,
          scheduled: "2024-01-15T12:00:00Z",
          estimated: "2024-01-15T12:00:00Z",
          actual: "2024-01-15T12:00:00Z",
        },
        airline: {
          name: "Turkish Airlines",
          iata: "TK",
          icao: "THY",
        },
        flight: {
          number: "1234",
          iata: "TK1234",
          icao: "THY1234",
        },
      };

      const analysis = analyzeFlightDelay(flightData);

      expect(analysis.hasDelay).toBe(false);
      expect(analysis.delayMinutes).toBe(0);
      expect(analysis.isCancelled).toBe(false);
    });
  });
});
