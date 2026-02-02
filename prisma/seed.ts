import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const airports = [
  { iataCode: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul', country: 'Türkiye', countryCode: 'TR', latitude: 41.2608, longitude: 28.7418 },
  { iataCode: 'SAW', name: 'Sabiha Gökçen Havalimanı', city: 'İstanbul', country: 'Türkiye', countryCode: 'TR', latitude: 40.8986, longitude: 29.3092 },
  { iataCode: 'ESB', name: 'Esenboğa Havalimanı', city: 'Ankara', country: 'Türkiye', countryCode: 'TR', latitude: 40.1281, longitude: 32.9951 },
  { iataCode: 'ADB', name: 'Adnan Menderes Havalimanı', city: 'İzmir', country: 'Türkiye', countryCode: 'TR', latitude: 38.2924, longitude: 27.1570 },
  { iataCode: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya', country: 'Türkiye', countryCode: 'TR', latitude: 36.8987, longitude: 30.8005 },
  { iataCode: 'DLM', name: 'Dalaman Havalimanı', city: 'Muğla', country: 'Türkiye', countryCode: 'TR', latitude: 36.7131, longitude: 28.7925 },
  { iataCode: 'BJV', name: 'Milas-Bodrum Havalimanı', city: 'Muğla', country: 'Türkiye', countryCode: 'TR', latitude: 37.2506, longitude: 27.6643 },
  { iataCode: 'TZX', name: 'Trabzon Havalimanı', city: 'Trabzon', country: 'Türkiye', countryCode: 'TR', latitude: 40.9950, longitude: 39.7897 },
  { iataCode: 'GZT', name: 'Gaziantep Havalimanı', city: 'Gaziantep', country: 'Türkiye', countryCode: 'TR', latitude: 36.9472, longitude: 37.4787 },
  { iataCode: 'VAN', name: 'Van Ferit Melen Havalimanı', city: 'Van', country: 'Türkiye', countryCode: 'TR', latitude: 38.4682, longitude: 43.3323 },
  { iataCode: 'LHR', name: 'Heathrow Airport', city: 'Londra', country: 'İngiltere', countryCode: 'GB', latitude: 51.4700, longitude: -0.4543 },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'Fransa', countryCode: 'FR', latitude: 49.0097, longitude: 2.5479 },
  { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Almanya', countryCode: 'DE', latitude: 50.0379, longitude: 8.5622 },
  { iataCode: 'AMS', name: 'Schiphol Airport', city: 'Amsterdam', country: 'Hollanda', countryCode: 'NL', latitude: 52.3105, longitude: 4.7683 },
  { iataCode: 'FCO', name: 'Fiumicino Airport', city: 'Roma', country: 'İtalya', countryCode: 'IT', latitude: 41.8003, longitude: 12.2389 },
  { iataCode: 'BCN', name: 'El Prat Airport', city: 'Barcelona', country: 'İspanya', countryCode: 'ES', latitude: 41.2971, longitude: 2.0785 },
  { iataCode: 'JFK', name: 'John F. Kennedy Airport', city: 'New York', country: 'ABD', countryCode: 'US', latitude: 40.6413, longitude: -73.7781 },
  { iataCode: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'BAE', countryCode: 'AE', latitude: 25.2532, longitude: 55.3657 },
]

const airlines = [
  { iataCode: 'TK', name: 'Türk Hava Yolları', country: 'Türkiye' },
  { iataCode: 'PC', name: 'Pegasus Airlines', country: 'Türkiye' },
  { iataCode: 'XQ', name: 'SunExpress', country: 'Türkiye' },
  { iataCode: 'XC', name: 'Corendon Airlines', country: 'Türkiye' },
  { iataCode: 'TJ', name: 'AnadoluJet', country: 'Türkiye' },
  { iataCode: 'LH', name: 'Lufthansa', country: 'Almanya' },
  { iataCode: 'BA', name: 'British Airways', country: 'İngiltere' },
  { iataCode: 'AF', name: 'Air France', country: 'Fransa' },
  { iataCode: 'KL', name: 'KLM', country: 'Hollanda' },
  { iataCode: 'EK', name: 'Emirates', country: 'BAE' },
]

async function main() {
  console.log('Seeding airports...')
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iataCode: airport.iataCode },
      update: {},
      create: airport,
    })
  }
  console.log(`Created ${airports.length} airports`)

  console.log('Seeding airlines...')
  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { iataCode: airline.iataCode },
      update: {},
      create: airline,
    })
  }
  console.log(`Created ${airlines.length} airlines`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
