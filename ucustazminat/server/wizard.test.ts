import { describe, expect, it } from "vitest";
import { 
  searchAirports, 
  calculateFlightDistance, 
  getCompensationByDistance,
  getAirportByCode
} from "../shared/airports";

describe("Airport Search and Distance Calculation", () => {
  describe("searchAirports", () => {
    it("should find airports by city name", () => {
      const results = searchAirports("İstanbul");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(a => a.code === "IST")).toBe(true);
      expect(results.some(a => a.code === "SAW")).toBe(true);
    });

    it("should find airports by code", () => {
      const results = searchAirports("IST");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe("IST");
    });

    it("should find airports by country", () => {
      const results = searchAirports("türkiye");
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(a => a.country === "Türkiye")).toBe(true);
    });

    it("should return empty array for short queries", () => {
      const results = searchAirports("a");
      expect(results).toEqual([]);
    });

    it("should limit results to 10", () => {
      const results = searchAirports("air");
      expect(results.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getAirportByCode", () => {
    it("should find airport by code", () => {
      const airport = getAirportByCode("IST");
      expect(airport).toBeDefined();
      expect(airport?.name).toBe("İstanbul Havalimanı");
      expect(airport?.city).toBe("İstanbul");
    });

    it("should be case insensitive", () => {
      const airport1 = getAirportByCode("ist");
      const airport2 = getAirportByCode("IST");
      expect(airport1).toEqual(airport2);
    });

    it("should return undefined for unknown code", () => {
      const airport = getAirportByCode("XXX");
      expect(airport).toBeUndefined();
    });
  });

  describe("calculateFlightDistance", () => {
    it("should calculate distance between Istanbul and Ankara", () => {
      const distance = calculateFlightDistance("IST", "ESB");
      expect(distance).toBeDefined();
      // Istanbul - Ankara yaklaşık 350-400 km
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(500);
    });

    it("should calculate distance between Istanbul and London", () => {
      const distance = calculateFlightDistance("IST", "LHR");
      expect(distance).toBeDefined();
      // Istanbul - London yaklaşık 2500 km
      expect(distance).toBeGreaterThan(2000);
      expect(distance).toBeLessThan(3000);
    });

    it("should calculate distance between Istanbul and New York", () => {
      const distance = calculateFlightDistance("IST", "JFK");
      expect(distance).toBeDefined();
      // Istanbul - New York yaklaşık 8000 km
      expect(distance).toBeGreaterThan(7500);
      expect(distance).toBeLessThan(9000);
    });

    it("should return null for unknown airport codes", () => {
      const distance = calculateFlightDistance("IST", "XXX");
      expect(distance).toBeNull();
    });
  });

  describe("getCompensationByDistance", () => {
    it("should return 250€ for distances up to 1500km", () => {
      const result = getCompensationByDistance(500);
      expect(result.amount).toBe(250);
      expect(result.minDelay).toBe(2);
    });

    it("should return 250€ for exactly 1500km", () => {
      const result = getCompensationByDistance(1500);
      expect(result.amount).toBe(250);
    });

    it("should return 400€ for distances 1501-3500km", () => {
      const result = getCompensationByDistance(2500);
      expect(result.amount).toBe(400);
      expect(result.minDelay).toBe(3);
    });

    it("should return 400€ for exactly 3500km", () => {
      const result = getCompensationByDistance(3500);
      expect(result.amount).toBe(400);
    });

    it("should return 600€ for distances over 3500km", () => {
      const result = getCompensationByDistance(5000);
      expect(result.amount).toBe(600);
      expect(result.minDelay).toBe(4);
    });
  });

  describe("Compensation calculation for common routes", () => {
    it("Istanbul - Ankara should be 250€ tier", () => {
      const distance = calculateFlightDistance("IST", "ESB");
      expect(distance).toBeDefined();
      const compensation = getCompensationByDistance(distance!);
      expect(compensation.amount).toBe(250);
    });

    it("Istanbul - London should be 400€ tier", () => {
      const distance = calculateFlightDistance("IST", "LHR");
      expect(distance).toBeDefined();
      const compensation = getCompensationByDistance(distance!);
      expect(compensation.amount).toBe(400);
    });

    it("Istanbul - New York should be 600€ tier", () => {
      const distance = calculateFlightDistance("IST", "JFK");
      expect(distance).toBeDefined();
      const compensation = getCompensationByDistance(distance!);
      expect(compensation.amount).toBe(600);
    });
  });
});
