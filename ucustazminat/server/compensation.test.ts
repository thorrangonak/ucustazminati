import { describe, it, expect } from 'vitest';
import { 
  isDomesticFlight, 
  calculateCompensation, 
  calculateCompensationSHY, 
  isTurkishAirport 
} from './utils/compensation';

describe('Compensation Calculation', () => {
  describe('isTurkishAirport', () => {
    it('should return true for Turkish airports', () => {
      expect(isTurkishAirport('IST')).toBe(true);
      expect(isTurkishAirport('ESB')).toBe(true);
      expect(isTurkishAirport('AYT')).toBe(true);
      expect(isTurkishAirport('SAW')).toBe(true);
      expect(isTurkishAirport('ADB')).toBe(true);
    });

    it('should return false for non-Turkish airports', () => {
      expect(isTurkishAirport('FRA')).toBe(false);
      expect(isTurkishAirport('CDG')).toBe(false);
      expect(isTurkishAirport('LHR')).toBe(false);
      expect(isTurkishAirport('AMS')).toBe(false);
    });
  });

  describe('isDomesticFlight', () => {
    it('should return true for domestic flights (both airports in Turkey)', () => {
      expect(isDomesticFlight('IST', 'ESB')).toBe(true);
      expect(isDomesticFlight('IST', 'AYT')).toBe(true);
      expect(isDomesticFlight('SAW', 'ADB')).toBe(true);
      expect(isDomesticFlight('ESB', 'AYT')).toBe(true);
    });

    it('should return false for international flights', () => {
      expect(isDomesticFlight('IST', 'FRA')).toBe(false);
      expect(isDomesticFlight('IST', 'CDG')).toBe(false);
      expect(isDomesticFlight('FRA', 'IST')).toBe(false);
      expect(isDomesticFlight('LHR', 'CDG')).toBe(false);
    });
  });

  describe('calculateCompensationSHY', () => {
    it('should return 100 EUR for domestic flights', () => {
      const result = calculateCompensationSHY(350, 'delay', true);
      expect(result.amount).toBe(100);
      expect(result.tier).toBe('domestic');
      expect(result.category).toBe('Yurtiçi uçuş');
    });

    it('should return 250 EUR for international flights under 1500km', () => {
      const result = calculateCompensationSHY(1000, 'delay', false);
      expect(result.amount).toBe(250);
      expect(result.tier).toBe('short');
      expect(result.category).toBe("Yurtdışı 1500 km'ye kadar");
    });

    it('should return 400 EUR for international flights 1500-3500km', () => {
      const result = calculateCompensationSHY(2500, 'delay', false);
      expect(result.amount).toBe(400);
      expect(result.tier).toBe('medium');
      expect(result.category).toBe('Yurtdışı 1500-3500 km');
    });

    it('should return 600 EUR for international flights over 3500km', () => {
      const result = calculateCompensationSHY(4000, 'delay', false);
      expect(result.amount).toBe(600);
      expect(result.tier).toBe('long');
      expect(result.category).toBe('Yurtdışı 3500 km üzeri');
    });
  });

  describe('calculateCompensation', () => {
    it('should return 100 EUR for domestic Turkish flights (IST-ESB)', () => {
      const result = calculateCompensation(350, 'delay', 'IST', 'ESB');
      expect(result.amount).toBe(100);
      expect(result.category).toBe('Yurtiçi uçuş');
      expect(result.regulation).toBe('SHY-YOLCU');
    });

    it('should return 100 EUR for domestic Turkish flights (IST-AYT)', () => {
      const result = calculateCompensation(450, 'delay', 'IST', 'AYT');
      expect(result.amount).toBe(100);
      expect(result.category).toBe('Yurtiçi uçuş');
    });

    it('should return 400 EUR for international flights (IST-FRA)', () => {
      const result = calculateCompensation(1800, 'delay', 'IST', 'FRA');
      expect(result.amount).toBe(400);
      expect(result.category).toBe('Yurtdışı 1500-3500 km');
    });

    it('should return 250 EUR for short international flights (IST-ATH)', () => {
      const result = calculateCompensation(500, 'delay', 'IST', 'ATH');
      expect(result.amount).toBe(250);
      expect(result.category).toBe("Yurtdışı 1500 km'ye kadar");
    });
  });
});
