import { Html5Qrcode } from 'html5-qrcode'

/**
 * Scan barcode from an image file
 * First tries Scanbot SDK, then falls back to html5-qrcode
 */
export async function scanBarcodeFromImage(file: File): Promise<string | null> {
  // Try Scanbot first (better PDF417 support)
  try {
    const scanbotResult = await scanWithScanbot(file)
    if (scanbotResult) {
      console.log('Scanbot SDK scan successful')
      return scanbotResult
    }
  } catch (error) {
    console.log('Scanbot SDK failed, trying html5-qrcode...', error)
  }

  // Fall back to html5-qrcode
  try {
    const html5Result = await scanWithHtml5Qrcode(file)
    if (html5Result) {
      console.log('html5-qrcode scan successful')
      return html5Result
    }
  } catch (error) {
    console.log('html5-qrcode also failed', error)
  }

  return null
}

/**
 * Scan using Scanbot SDK
 */
async function scanWithScanbot(file: File): Promise<string | null> {
  try {
    const { scanBarcodeFromImage: scanbotScan } = await import('@/lib/scanbot')
    return await scanbotScan(file)
  } catch (error) {
    console.error('Scanbot error:', error)
    return null
  }
}

/**
 * Scan using html5-qrcode
 */
async function scanWithHtml5Qrcode(file: File): Promise<string | null> {
  try {
    // Create a temporary container for the scanner
    const scannerId = 'html5qr-scanner-' + Date.now()
    const container = document.createElement('div')
    container.id = scannerId
    container.style.display = 'none'
    document.body.appendChild(container)

    const html5QrCode = new Html5Qrcode(scannerId)

    try {
      const result = await html5QrCode.scanFile(file, /* showImage */ false)

      // Clean up
      await html5QrCode.clear()
      container.remove()

      return result
    } catch (scanError) {
      // Clean up on error too
      try {
        await html5QrCode.clear()
      } catch {
        // Ignore cleanup errors
      }
      container.remove()

      console.log('html5-qrcode direct scan failed, trying with preprocessing...', scanError)

      // Try with image preprocessing
      return await scanWithCanvasPreprocessing(file)
    }
  } catch (error) {
    console.error('html5-qrcode error:', error)
    return null
  }
}

/**
 * Alternative scanning method with image preprocessing
 */
async function scanWithCanvasPreprocessing(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      const img = new Image()

      img.onload = async () => {
        // Create canvas with different sizes for better detection
        const sizes = [1, 1.5, 2, 0.75, 0.5]

        for (const scale of sizes) {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) continue

          canvas.width = img.width * scale
          canvas.height = img.height * scale

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Try to increase contrast for better barcode detection
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Convert to grayscale and increase contrast
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
              // Increase contrast with threshold
              const contrasted = gray < 128 ? Math.max(0, gray * 0.3) : Math.min(255, 128 + (gray - 128) * 1.5)
              data[i] = contrasted
              data[i + 1] = contrasted
              data[i + 2] = contrasted
            }

            ctx.putImageData(imageData, 0, 0)
          } catch {
            // Skip preprocessing if it fails
          }

          // Convert to blob and try scanning
          const blob = await new Promise<Blob | null>((res) => {
            canvas.toBlob((b) => res(b), 'image/png')
          })

          if (blob) {
            const processedFile = new File([blob], 'processed.png', { type: 'image/png' })

            const scannerId = 'html5qr-scanner-retry-' + Date.now() + '-' + scale
            const container = document.createElement('div')
            container.id = scannerId
            container.style.display = 'none'
            document.body.appendChild(container)

            const html5QrCode = new Html5Qrcode(scannerId)

            try {
              const result = await html5QrCode.scanFile(processedFile, false)
              await html5QrCode.clear()
              container.remove()

              if (result) {
                resolve(result)
                return
              }
            } catch {
              try {
                await html5QrCode.clear()
              } catch {
                // Ignore
              }
              container.remove()
            }
          }
        }

        resolve(null)
      }

      img.onerror = () => resolve(null)
      img.src = e.target?.result as string
    }

    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

/**
 * Initialize camera scanner for continuous scanning
 */
export async function startCameraScanner(
  elementId: string,
  onScanSuccess: (decodedText: string) => void,
  onScanError?: (error: string) => void
): Promise<Html5Qrcode> {
  const html5QrCode = new Html5Qrcode(elementId)

  await html5QrCode.start(
    { facingMode: 'environment' },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.777778, // 16:9
    },
    onScanSuccess,
    (errorMessage) => {
      // Only report actual errors, not "no code found" messages
      if (!errorMessage.includes('No MultiFormat Readers') && onScanError) {
        onScanError(errorMessage)
      }
    }
  )

  return html5QrCode
}

/**
 * Stop camera scanner
 */
export async function stopCameraScanner(scanner: Html5Qrcode): Promise<void> {
  try {
    await scanner.stop()
    await scanner.clear()
  } catch (error) {
    console.error('Error stopping scanner:', error)
  }
}
