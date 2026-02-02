/**
 * Flight Compensation Calculation Service
 * Based on SHY-YOLCU (Turkish Passenger Rights Regulation) and EU261
 */

export interface CompensationResult {
  amount: number
  currency: string
  commission: number
  netPayout: number
  eligible: boolean
  reason: string
  distanceCategory: string
}

export interface CompensationParams {
  distanceKm: number
  isDomestic: boolean
  disruptionType: 'DELAY' | 'CANCELLATION' | 'DENIED_BOARDING' | 'DOWNGRADE'
  delayDuration?: number // in minutes
}

const COMMISSION_RATE = 0.25 // 25% commission

/**
 * Calculate compensation based on SHY-YOLCU regulations
 *
 * Distance Categories:
 * - Domestic (Turkey): 100€
 * - ≤1500 km: 250€
 * - 1500-3500 km: 400€
 * - >3500 km: 600€
 */
export function calculateCompensation(params: CompensationParams): CompensationResult {
  const { distanceKm, isDomestic, disruptionType, delayDuration } = params

  // Check eligibility for delays
  if (disruptionType === 'DELAY') {
    if (!delayDuration || delayDuration < 180) {
      return {
        amount: 0,
        currency: 'EUR',
        commission: 0,
        netPayout: 0,
        eligible: false,
        reason: 'Gecikme süresi 3 saatten az olduğu için tazminat hakkı bulunmamaktadır.',
        distanceCategory: getDistanceCategory(distanceKm, isDomestic),
      }
    }
  }

  // Calculate base compensation
  let amount: number
  let distanceCategory: string

  if (isDomestic) {
    amount = 100
    distanceCategory = 'İç hat'
  } else if (distanceKm <= 1500) {
    amount = 250
    distanceCategory = '1500 km ve altı'
  } else if (distanceKm <= 3500) {
    amount = 400
    distanceCategory = '1500-3500 km arası'
  } else {
    amount = 600
    distanceCategory = '3500 km üzeri'
  }

  // Apply 50% reduction for delays between 3-4 hours on long-haul flights
  if (disruptionType === 'DELAY' && delayDuration && delayDuration < 240) {
    if (distanceKm > 3500 || (!isDomestic && distanceKm > 1500)) {
      amount = amount * 0.5
    }
  }

  // Calculate commission and net payout
  const commission = amount * COMMISSION_RATE
  const netPayout = amount - commission

  return {
    amount,
    currency: 'EUR',
    commission,
    netPayout,
    eligible: true,
    reason: getEligibilityReason(disruptionType, delayDuration),
    distanceCategory,
  }
}

function getDistanceCategory(distanceKm: number, isDomestic: boolean): string {
  if (isDomestic) return 'İç hat'
  if (distanceKm <= 1500) return '1500 km ve altı'
  if (distanceKm <= 3500) return '1500-3500 km arası'
  return '3500 km üzeri'
}

function getEligibilityReason(disruptionType: string, delayDuration?: number): string {
  switch (disruptionType) {
    case 'DELAY':
      return `Uçuşunuz ${Math.floor((delayDuration || 0) / 60)} saat ${(delayDuration || 0) % 60} dakika gecikti. Tazminat hakkınız bulunmaktadır.`
    case 'CANCELLATION':
      return 'Uçuşunuz iptal edildi. Tazminat hakkınız bulunmaktadır.'
    case 'DENIED_BOARDING':
      return 'Uçuşa kabul edilmediniz. Tazminat hakkınız bulunmaktadır.'
    case 'DOWNGRADE':
      return 'Daha düşük bir sınıfa alındınız. Tazminat hakkınız bulunmaktadır.'
    default:
      return 'Tazminat hakkınız değerlendiriliyor.'
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Check if a flight is domestic (within Turkey)
 */
export function isDomesticFlight(
  departureCountry: string,
  arrivalCountry: string
): boolean {
  return departureCountry === 'TR' && arrivalCountry === 'TR'
}
