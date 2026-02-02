import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { jsPDF } from 'jspdf'

interface ContractPDFParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: ContractPDFParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params

    const claim = await prisma.claim.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        passengers: {
          where: { isPrimary: true },
          take: 1,
        },
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
    }

    const primaryPassenger = claim.passengers[0]
    const today = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let y = 20

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, contentWidth)
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.text(line, margin, y)
        y += fontSize * 0.4
      })
      y += 2
    }

    const addLine = () => {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 5
    }

    // Header
    doc.setFillColor(0, 212, 141) // Primary green
    doc.rect(0, 0, pageWidth, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('ALACAK TEMLIK SOZLESMESI', pageWidth / 2, 15, { align: 'center' })
    doc.setFontSize(12)
    doc.text('CLAIM ASSIGNMENT AGREEMENT', pageWidth / 2, 23, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Basvuru No: ${claim.claimNumber}`, pageWidth / 2, 30, { align: 'center' })

    y = 45
    doc.setTextColor(0, 0, 0)

    // Warning Box
    doc.setFillColor(255, 243, 205) // Yellow background
    doc.rect(margin, y, contentWidth, 25, 'F')
    doc.setDrawColor(255, 193, 7)
    doc.rect(margin, y, contentWidth, 25, 'S')
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('ONEMLI / IMPORTANT', margin + 5, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Bu sozlesme ile tazminat alacaginizin TAM MULKIYETINI Sirkete devrediyorsunuz.', margin + 5, y)
    y += 4
    doc.text('By signing this agreement, you transfer FULL OWNERSHIP of your compensation claim.', margin + 5, y)
    y += 4
    doc.setTextColor(0, 128, 0)
    doc.text('Basarisiz olursa hicbir ucret odemezsiniz (No Win = No Fee)', margin + 5, y)
    doc.setTextColor(0, 0, 0)
    y += 15

    // Section 1: Parties
    addText('1. TARAFLAR / PARTIES', 12, true)
    addText('1.1. MUSTERI / CLIENT ("Temlik Eden" / "Assignor")', 10, true)
    addText(`    Ad Soyad: ${primaryPassenger?.firstName || ''} ${primaryPassenger?.lastName || ''}`)
    addText(`    Email: ${primaryPassenger?.email || '-'}`)
    addText(`    Telefon: ${primaryPassenger?.phone || '-'}`)
    y += 3
    addText('1.2. SIRKET / COMPANY ("Temlik Alan" / "Assignee")', 10, true)
    addText('    Ticaret Unvani: UcusTazminat')
    addText('    Web: www.ucustazminat.com')
    y += 3
    addLine()

    // Section 2: Flight Details
    addText('2. UCUS BILGILERI / FLIGHT DETAILS', 12, true)
    addText(`    Ucus No / Flight Number: ${claim.flightNumber}`)
    addText(`    Guzergah / Route: ${claim.departureAirport?.iataCode} -> ${claim.arrivalAirport?.iataCode}`)
    addText(`    Tarih / Date: ${new Date(claim.flightDate).toLocaleDateString('tr-TR')}`)
    addText(`    Havayolu / Airline: ${claim.airline?.name || '-'}`)
    const disruptionTypes: Record<string, string> = {
      'DELAY': 'Rotar / Delay',
      'CANCELLATION': 'Iptal / Cancellation',
      'DENIED_BOARDING': 'Ucusa Alinmama / Denied Boarding',
      'DOWNGRADE': 'Alt Sinif / Downgrade',
    }
    addText(`    Aksaklik / Issue: ${disruptionTypes[claim.disruptionType] || claim.disruptionType}`)
    y += 3
    addLine()

    // Section 3: Assignment
    addText('3. TEMLIK / ASSIGNMENT', 12, true)
    addText('3.1. TAM MULKIYET DEVRI / FULL OWNERSHIP TRANSFER', 10, true)
    addText('Musteri, yukarda belirtilen ucus aksakligindan kaynaklanan tazminat alacaginin tam mulkiyetini ve yasal hakkini Sirkete devretmektedir.')
    addText('• Turkiye\'de: SHY-YOLCU Yonetmeligi (100-600 EUR)')
    addText('• AB\'de: EC 261/2004 Yonetmeligi (250-600 EUR)')
    addText('• Tum ek haklar ve faizler')
    y += 2
    addText('3.2. YASAL DAYANAK: 6098 Sayili Turk Borclar Kanunu Madde 183')
    y += 3
    addLine()

    // Section 4: Company Rights
    addText('4. SIRKET YETKILERI / COMPANY RIGHTS', 12, true)
    addText('Temlik ile Sirket tek yetkili olarak:')
    addText('• Havayoluna dogrudan basvurma')
    addText('• SHGM\'ye basvurma')
    addText('• Muzakere yapma')
    addText('• Uzlasma tekliflerini kabul/red etme')
    addText('• Gerekirse dava acma')
    addText('• Tazminat odemesini tahsil etme')
    y += 3
    addLine()

    // Section 5: Client Undertakings
    addText('5. MUSTERI TAAHHUTLERI / CLIENT UNDERTAKINGS', 12, true)
    addText('5.1. ILETISIM YASAGI: Musteri, temlik sonrasi havayolu veya SHGM ile DOGRUDAN ILETISIME GECMEYECEGINI taahhut eder.')
    addText('5.2. BILGILENDIRME YUKUMLULUGU: Havayolu/SHGM\'den dogrudan odeme alirsa derhal Sirketi bilgilendirecektir.')
    y += 3
    addLine()

    // Section 6: Service Fee
    doc.setFillColor(209, 250, 229) // Green background
    doc.rect(margin, y, contentWidth, 20, 'F')
    y += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 100, 0)
    doc.text('NO WIN = NO FEE', pageWidth / 2, y, { align: 'center' })
    y += 5
    doc.setFontSize(9)
    doc.text('Basarili Olursak: %25 Hizmet Bedeli | Basarisiz Olursak: 0 TL', pageWidth / 2, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 15
    addText('6. HIZMET BEDELI / SERVICE FEE', 12, true)
    addText('• Tahsil edilen tutarin %25\'i Sirket hizmet bedeli olarak alinir')
    addText('• Kalan %75 tutar, Musteriye en gec 14 is gunu icinde odenir')
    addText('• Basarisiz olunmasi halinde Musteriden hicbir ucret talep edilmez')
    y += 3
    addLine()

    // Section 7-10
    addText('7. KISISEL VERILER / DATA PROTECTION', 12, true)
    addText('Musteri, kisisel verilerinin havayoluna, SHGM\'ye iletilmesini ve tazminat takibi amaciyla islenmesini 6698 sayili KVKK kapsaminda kabul eder.')
    y += 3

    addText('8. SURE VE FESIH / TERM & TERMINATION', 12, true)
    addText('Bu sozlesme, alacak tahsil edilene veya tahsil edilemeyecegi kesinlesene kadar gecerlidir.')
    y += 3

    addText('9. YEDEKLILIK HUKMU / FALLBACK PROVISION', 12, true)
    addText('Bu temlikin herhangi bir sebeple gecersiz sayilmasi halinde, bu sozlesme otomatik olarak VEKALETNAME\'ye donusur.')
    y += 3

    addText('10. DIGER HUKUMLER / OTHER PROVISIONS', 12, true)
    addText('• Bu sozlesme Turk hukukuna tabidir')
    addText('• Ihtilaflar Istanbul mahkemelerinde cozulur')
    addText('• Elektronik imza, islak imza ile esdegerdir')
    y += 5
    addLine()

    // Signature Section
    if (y > 220) {
      doc.addPage()
      y = 20
    }

    addText('11. KABUL VE ONAY / ACCEPTANCE', 12, true)
    y += 3
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, y, contentWidth, 35, 'F')
    y += 8
    doc.setFontSize(9)
    doc.text('Bu sozlesmeyi okudum, anladim ve kabul ediyorum.', margin + 5, y)
    y += 4
    doc.text('I have read, understood and accept this agreement.', margin + 5, y)
    y += 8
    doc.text(`Tarih / Date: ${today}`, margin + 5, y)
    y += 8

    // Add signature if exists
    if (claim.consentSignature) {
      doc.text('Imza / Signature:', margin + 5, y)
      try {
        doc.addImage(claim.consentSignature, 'PNG', margin + 35, y - 5, 50, 20)
      } catch {
        doc.text('[Elektronik Imza Mevcut]', margin + 35, y)
      }
    }

    y += 25

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('UcusTazminat | info@ucustazminat.com | www.ucustazminat.com', pageWidth / 2, 285, { align: 'center' })
    doc.text('Bu sozlesme TBK m.183 uyarinca noter tasdiki gerektirmez.', pageWidth / 2, 290, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sozlesme_${claim.claimNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'PDF olusturulamadi' },
      { status: 500 }
    )
  }
}
