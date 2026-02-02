'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, FileText, Image, AlertCircle } from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepDocumentsProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

const documentTypes = [
  {
    type: 'boarding_pass',
    title: 'Biniş Kartı',
    description: 'Uçuştaki biniş kartınızın fotoğrafı veya PDF\'i',
    icon: FileText,
    required: true,
  },
  {
    type: 'ticket',
    title: 'Bilet / Rezervasyon',
    description: 'E-bilet veya rezervasyon onayı',
    icon: FileText,
    required: true,
  },
  {
    type: 'id',
    title: 'Kimlik Belgesi',
    description: 'TC Kimlik veya Pasaport',
    icon: Image,
    required: false,
  },
  {
    type: 'delay_certificate',
    title: 'Gecikme Belgesi',
    description: 'Havayolundan alınan gecikme/iptal belgesi (varsa)',
    icon: FileText,
    required: false,
  },
]

export function StepDocuments({ formData, updateFormData }: StepDocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    updateFormData({ documents: [...formData.documents, ...files] })
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeDocument = (index: number) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index)
    updateFormData({ documents: newDocuments })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Belge Yükleme</h3>
        <p className="mt-2 text-muted-foreground">
          Talebinizi destekleyecek belgeleri yükleyin
        </p>
      </div>

      {/* Required Documents Info */}
      <div className="grid gap-3 sm:grid-cols-2">
        {documentTypes.map((doc) => (
          <Card key={doc.type} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <doc.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {doc.title}
                    {doc.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Area */}
      <div
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 font-medium">Dosya yüklemek için tıklayın</p>
        <p className="mt-1 text-sm text-muted-foreground">
          veya dosyaları buraya sürükleyin
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          PDF, JPG, PNG - Maksimum 10MB
        </p>
      </div>

      {/* Uploaded Files */}
      {formData.documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Yüklenen Belgeler</p>
          <div className="space-y-2">
            {formData.documents.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.documents.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span>
            Henüz belge yüklemediniz. Belge olmadan da devam edebilirsiniz,
            ancak talebinizin hızlı işlenmesi için belge yüklemenizi öneririz.
          </span>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <strong>İpucu:</strong> Biniş kartınızı kaybettiyseniz, havayolunun
        mobil uygulamasından veya email onayından da yükleyebilirsiniz.
      </div>
    </div>
  )
}
