interface FlightDistance {
  km: number
  miles: number
}

interface CompensationResult {
  eligible: boolean
  amount: number
  currency: string
  reason: string
  regulation: string
  exceptions: string[]
}

export class EU261Calculator {
  private readonly REGULATION = 'EU 261/2004'

  calculateCompensation(
    delayMinutes: number,
    distance: FlightDistance,
    isCancelled: boolean,
    isDeniedBoarding: boolean,
    departureFromEU: boolean,
    arrivalToEU: boolean,
    airlineEU: boolean,
    isExtraordinaryCircumstance: boolean = false
  ): CompensationResult {
    if (this.isEligible(
      delayMinutes,
      distance,
      isCancelled,
      isDeniedBoarding,
      departureFromEU,
      arrivalToEU,
      airlineEU,
      isExtraordinaryCircumstance
    )) {
      const amount = this.calculateAmount(delayMinutes, distance)
      return {
        eligible: true,
        amount,
        currency: 'EUR',
        reason: this.getReason(delayMinutes, isCancelled, isDeniedBoarding),
        regulation: this.REGULATION,
        exceptions: []
      }
    }

    return {
      eligible: false,
      amount: 0,
      currency: 'EUR',
      reason: this.getIneligibilityReason(delayMinutes, isExtraordinaryCircumstance),
      regulation: this.REGULATION,
      exceptions: this.getExceptions(isExtraordinaryCircumstance)
    }
  }

  private isEligible(
    delayMinutes: number,
    distance: FlightDistance,
    isCancelled: boolean,
    isDeniedBoarding: boolean,
    departureFromEU: boolean,
    arrivalToEU: boolean,
    airlineEU: boolean,
    isExtraordinaryCircumstance: boolean
  ): boolean {
    if (isExtraordinaryCircumstance) {
      return false
    }

    const euFlight = departureFromEU || (arrivalToEU && airlineEU)

    if (!euFlight) {
      return false
    }

    if (isDeniedBoarding) {
      return true
    }

    if (isCancelled) {
      return true
    }

    if (delayMinutes >= 180) {
      return true
    }

    return false
  }

  private calculateAmount(delayMinutes: number, distance: FlightDistance): number {
    if (distance.km <= 1500) {
      return 250
    }

    if (distance.km <= 3500) {
      return 400
    }

    return 600
  }

  private getReason(delayMinutes: number, isCancelled: boolean, isDeniedBoarding: boolean): string {
    if (isDeniedBoarding) {
      return 'Giriş reddedildiği için tazminat hakkınız bulunmaktadır.'
    }

    if (isCancelled) {
      return 'Uçuş iptal edildiği için tazminat hakkınız bulunmaktadır.'
    }

    if (delayMinutes >= 180) {
      return `${Math.floor(delayMinutes / 60)} saat gecikme yaşandığı için tazminat hakkınız bulunmaktadır.`
    }

    return 'Tazminat hakkınız bulunmaktadır.'
  }

  private getIneligibilityReason(delayMinutes: number, isExtraordinaryCircumstance: boolean): string {
    if (isExtraordinaryCircumstance) {
      return 'Olağanüstü durumlar (hava koşulları, grev, güvenlik vb.) nedeniyle tazminat hakkı bulunmamaktadır.'
    }

    if (delayMinutes < 180) {
      return 'Gecikme süresi 3 saatten az olduğu için tazminat hakkı bulunmamaktadır.'
    }

    return 'Bu uçuş için tazminat hakkınız bulunmamaktadır.'
  }

  private getExceptions(isExtraordinaryCircumstance: boolean): string[] {
    if (isExtraordinaryCircumstance) {
      return [
        'Kötü hava koşulları',
        'Hava trafiği kontrolü grevleri',
        'Güvenlik riskleri',
        'Yeni havacılık güvenliği kuralları',
        'Havaalanı operasyonel sorunları'
      ]
    }

    return []
  }

  estimateDistance(departureAirport: string, arrivalAirport: string): FlightDistance {
    const airportCoordinates: Record<string, { lat: number; lon: number }> = {
      IST: { lat: 40.976, lon: 28.815 },
      LHR: { lat: 51.477, lon: -0.461 },
      FRA: { lat: 50.037, lon: 8.562 },
      CDG: { lat: 49.009, lon: 2.548 },
      JFK: { lat: 40.641, lon: -73.777 }
    }

    const dep = airportCoordinates[departureAirport.toUpperCase()]
    const arr = airportCoordinates[arrivalAirport.toUpperCase()]

    if (!dep || !arr) {
      return { km: 2500, miles: 1553 }
    }

    const R = 6371
    const dLat = this.deg2rad(arr.lat - dep.lat)
    const dLon = this.deg2rad(arr.lon - dep.lon)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(dep.lat)) * Math.cos(this.deg2rad(arr.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const km = R * c
    const miles = km * 0.621371

    return { km, miles }
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

export const eu261Calculator = new EU261Calculator()
