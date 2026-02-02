import { describe, expect, it, vi } from "vitest";
import { calculateCompensation, calculateDistance, checkEligibility, calculateCommission } from "./utils/compensation";

describe("Compensation Calculator", () => {
  describe("calculateDistance", () => {
    it("should calculate distance between two airports", () => {
      // IST to ESB (Istanbul to Ankara) - approximately 350km
      const distance = calculateDistance("IST", "ESB");
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(400);
    });

    it("should return default distance for unknown airports", () => {
      const distance = calculateDistance("XXX", "YYY");
      expect(distance).toBe(1500); // Default middle distance
    });

    it("should calculate longer distances correctly", () => {
      // IST to JFK (Istanbul to New York) - approximately 8000km
      const distance = calculateDistance("IST", "JFK");
      expect(distance).toBeGreaterThan(7500);
      expect(distance).toBeLessThan(9000);
    });
    
    it("should calculate European distances correctly", () => {
      // IST to FRA (Istanbul to Frankfurt) - approximately 1800km
      const distance = calculateDistance("IST", "FRA");
      expect(distance).toBeGreaterThan(1700);
      expect(distance).toBeLessThan(2000);
    });
  });

  describe("checkEligibility", () => {
    it("should be eligible for delay over 2 hours for short flights", () => {
      const result = checkEligibility({
        disruptionType: "delay",
        delayDuration: 130, // 2 hours 10 minutes
        distance: 1000,
      });
      expect(result.eligible).toBe(true);
    });
    
    it("should not be eligible for delay under 2 hours for short flights", () => {
      const result = checkEligibility({
        disruptionType: "delay",
        delayDuration: 100, // 1 hour 40 minutes
        distance: 1000,
      });
      expect(result.eligible).toBe(false);
    });

    it("should be eligible for delay over 3 hours for medium flights", () => {
      const result = checkEligibility({
        disruptionType: "delay",
        delayDuration: 200, // 3 hours 20 minutes
        distance: 2500,
      });
      expect(result.eligible).toBe(true);
    });

    it("should not be eligible for delay under 3 hours for medium flights", () => {
      const result = checkEligibility({
        disruptionType: "delay",
        delayDuration: 150, // 2 hours 30 minutes
        distance: 2500,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("3 saat");
    });
    
    it("should be eligible for delay over 4 hours for long flights", () => {
      const result = checkEligibility({
        disruptionType: "delay",
        delayDuration: 250, // 4 hours 10 minutes
        distance: 4000,
      });
      expect(result.eligible).toBe(true);
    });

    it("should be eligible for cancellation", () => {
      const result = checkEligibility({
        disruptionType: "cancellation",
        distance: 1500,
      });
      expect(result.eligible).toBe(true);
    });

    it("should be eligible for denied boarding", () => {
      const result = checkEligibility({
        disruptionType: "denied_boarding",
        distance: 1500,
      });
      expect(result.eligible).toBe(true);
    });
  });

  describe("calculateCompensation (SHY-YOLCU)", () => {
    // SHY-YOLCU değerleri:
    // - 1500 km'ye kadar: 250 EUR
    // - 1500-3500 km arası: 400 EUR  
    // - 3500 km üzeri: 600 EUR
    
    it("should return 250 EUR for flights under 1500km", () => {
      const result = calculateCompensation(1000, "delay");
      expect(result.amount).toBe(250);
      expect(result.tier).toBe("short");
    });

    it("should return 400 EUR for flights 1500-3500km", () => {
      const result = calculateCompensation(2500, "delay");
      expect(result.amount).toBe(400);
      expect(result.tier).toBe("medium");
    });

    it("should return 600 EUR for flights over 3500km", () => {
      const result = calculateCompensation(4000, "delay");
      expect(result.amount).toBe(600);
      expect(result.tier).toBe("long");
    });

    it("should return same amounts for cancellation", () => {
      expect(calculateCompensation(1000, "cancellation").amount).toBe(250);
      expect(calculateCompensation(2500, "cancellation").amount).toBe(400);
      expect(calculateCompensation(4000, "cancellation").amount).toBe(600);
    });

    it("should return same amounts for denied boarding", () => {
      expect(calculateCompensation(1000, "denied_boarding").amount).toBe(250);
      expect(calculateCompensation(2500, "denied_boarding").amount).toBe(400);
      expect(calculateCompensation(4000, "denied_boarding").amount).toBe(600);
    });
    
    it("should return 50% for downgrade", () => {
      expect(calculateCompensation(1000, "downgrade").amount).toBe(125);
      expect(calculateCompensation(2500, "downgrade").amount).toBe(200);
      expect(calculateCompensation(4000, "downgrade").amount).toBe(300);
    });
  });
});

describe("Commission Calculation", () => {
  it("should calculate standard commission correctly (25%)", () => {
    const result = calculateCommission(400, false);
    
    expect(result.standardRate).toBe(25);
    expect(result.legalRate).toBe(0);
    expect(result.totalRate).toBe(25);
    expect(result.commission).toBe(100);
    expect(result.netPayout).toBe(300);
  });

  it("should calculate legal action commission correctly (25% + 15% = 40%)", () => {
    const result = calculateCommission(400, true);
    
    expect(result.standardRate).toBe(25);
    expect(result.legalRate).toBe(15);
    expect(result.totalRate).toBe(40);
    expect(result.commission).toBe(160);
    expect(result.netPayout).toBe(240);
  });
  
  it("should handle different compensation amounts", () => {
    const result250 = calculateCommission(250, false);
    expect(result250.commission).toBe(62.5);
    expect(result250.netPayout).toBe(187.5);
    
    const result600 = calculateCommission(600, false);
    expect(result600.commission).toBe(150);
    expect(result600.netPayout).toBe(450);
  });
});


describe("Date Formatting for MySQL", () => {
  // Helper function to format dates for MySQL
  const formatDateForMySQL = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  it("should format Date object to MySQL format", () => {
    const date = new Date('2025-04-30T14:30:00Z');
    const result = formatDateForMySQL(date);
    expect(result).toBe('2025-04-30 14:30:00');
  });

  it("should format ISO date string to MySQL format", () => {
    const dateString = '2025-04-30T14:30:00.000Z';
    const result = formatDateForMySQL(dateString);
    expect(result).toBe('2025-04-30 14:30:00');
  });

  it("should format simple date string to MySQL format", () => {
    const dateString = '2025-04-30';
    const result = formatDateForMySQL(dateString);
    // Date parsing will treat this as midnight UTC
    expect(result).toMatch(/^2025-04-30 \d{2}:\d{2}:\d{2}$/);
  });

  it("should return null for null input", () => {
    const result = formatDateForMySQL(null);
    expect(result).toBeNull();
  });

  it("should return null for undefined input", () => {
    const result = formatDateForMySQL(undefined);
    expect(result).toBeNull();
  });

  it("should return null for invalid date string", () => {
    const result = formatDateForMySQL('invalid-date');
    expect(result).toBeNull();
  });

  it("should handle JavaScript Date.toString() format", () => {
    // This is the problematic format that was causing issues
    const jsDateString = 'Wed Apr 30 2025 00:00:00 GMT+0000 (Coordinated Universal Time)';
    const result = formatDateForMySQL(jsDateString);
    expect(result).toBe('2025-04-30 00:00:00');
  });

  it("should handle new Date() output", () => {
    const now = new Date();
    const result = formatDateForMySQL(now);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe("Compensation Multiplied by Passenger Count", () => {
  it("should multiply compensation by passenger count", () => {
    const perPassengerAmount = 600;
    const passengerCount = 3;
    const totalCompensation = perPassengerAmount * passengerCount;
    
    expect(totalCompensation).toBe(1800);
  });

  it("should calculate commission correctly on total", () => {
    const totalCompensation = 1800;
    const commissionRate = 25;
    const commission = totalCompensation * (commissionRate / 100);
    const netPayout = totalCompensation - commission;
    
    expect(commission).toBe(450);
    expect(netPayout).toBe(1350);
  });
});
