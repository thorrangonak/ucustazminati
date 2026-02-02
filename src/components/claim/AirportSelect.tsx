'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin, Plane } from 'lucide-react'

interface Airport {
  id: string
  iataCode: string
  name: string
  city: string
  country: string
}

interface AirportSelectProps {
  value: string
  onChange: (value: string, airport?: Airport) => void
  placeholder?: string
  label?: string
  type?: 'departure' | 'arrival' | 'connection'
}

export function AirportSelect({
  value,
  onChange,
  placeholder = 'Havalimanı ara...',
  type = 'departure'
}: AirportSelectProps) {
  const [search, setSearch] = useState('')
  const [airports, setAirports] = useState<Airport[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load airports on mount
    fetchAirports()
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAirports = async (query?: string) => {
    setIsLoading(true)
    try {
      const url = query
        ? `/api/airports?search=${encodeURIComponent(query)}`
        : '/api/airports'
      const res = await fetch(url)
      const data = await res.json()
      setAirports(data.airports || [])
    } catch (error) {
      console.error('Error fetching airports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setIsOpen(true)
    if (val.length >= 1) {
      fetchAirports(val)
    } else {
      fetchAirports()
    }
  }

  const handleSelect = (airport: Airport) => {
    setSelectedAirport(airport)
    setSearch(`${airport.city} - ${airport.name} (${airport.iataCode})`)
    onChange(airport.iataCode, airport)
    setIsOpen(false)
  }

  const iconColor = type === 'departure' ? 'text-green-500' : type === 'arrival' ? 'text-red-500' : 'text-yellow-500'

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${iconColor}`} />
        <Input
          value={search || value}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && airports.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
          {airports.map((airport) => (
            <button
              key={airport.id}
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
              onClick={() => handleSelect(airport)}
            >
              <Plane className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">
                  {airport.city} ({airport.iataCode})
                </div>
                <div className="text-xs text-muted-foreground">
                  {airport.name} - {airport.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && airports.length === 0 && !isLoading && search.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-3 text-center text-sm text-muted-foreground shadow-lg">
          Havalimanı bulunamadı
        </div>
      )}
    </div>
  )
}
