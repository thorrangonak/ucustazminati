import { Metadata } from 'next'
import { ClaimWizard } from '@/components/claim/ClaimWizard'

export const metadata: Metadata = {
  title: 'Yeni Talep - UçuşTazminat',
  description: 'Yeni tazminat talebi oluşturun',
}

export default function NewClaimPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Yeni Tazminat Talebi</h1>
        <p className="mt-1 text-muted-foreground">
          Uçuş bilgilerinizi girerek tazminat talebinizi oluşturun
        </p>
      </div>
      <ClaimWizard />
    </div>
  )
}
