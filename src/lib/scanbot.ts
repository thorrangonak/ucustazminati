import ScanbotSDK from 'scanbot-web-sdk'

const LICENSE_KEY =
  "ncq6ZneK2K37i8YIb4YQGyFM1mkuTh" +
  "lImEa6iVnTXR8O2nzHsCUNQHAdJDph" +
  "sueghzLlkmVO5cg66o3yLF+o/yTi3/" +
  "v5gP22Och/JE/20vN8pGPW+C9Ntlm+" +
  "Z4n9hWBT0xjXPchst2arpKwrLsy9Tb" +
  "4e98sViVbb1jkeCTF6lTbvY7dS8TYs" +
  "RUH/DYpMvDfJI220wnVsyooWS6KAOm" +
  "xZVXCN2R7ZALD+diHYLxsfXy0tFcZn" +
  "7jqSpyyD081qxgm/1LgzDrAZaMhz15" +
  "WKzQ5pyLmYZdo5j+HziYj3fF4PMfY6" +
  "Pcg9YsBi7euVtOQynId+V9TcJ5ALs1" +
  "Dqo3M0/68daw==\nU2NhbmJvdFNESw" +
  "psb2NhbGhvc3R8dWN1c3Rhem1pbmF0" +
  "LmNvbQoxNzcwNjgxNTk5CjgzODg2MD" +
  "cKOA==\n";

let scanbotSDK: ScanbotSDK | null = null

export async function initScanbotSDK(): Promise<ScanbotSDK> {
  if (scanbotSDK) {
    return scanbotSDK
  }

  console.log('Scanbot SDK initializing for domain:', window.location.hostname)

  try {
    scanbotSDK = await ScanbotSDK.initialize({
      licenseKey: LICENSE_KEY,
      enginePath: '/scanbot-sdk/',
    })

    const licenseInfo = await scanbotSDK.getLicenseInfo()
    console.log('Scanbot License Info:', licenseInfo)

    return scanbotSDK
  } catch (error) {
    console.error('Scanbot SDK initialization failed:', error)
    throw error
  }
}

export async function scanBarcodeFromImage(imageFile: File): Promise<string | null> {
  try {
    console.log('Starting barcode scan for file:', imageFile.name, 'size:', imageFile.size)

    const sdk = await initScanbotSDK()

    // Create data URL from file
    const imageUrl = URL.createObjectURL(imageFile)
    console.log('Image URL created:', imageUrl)

    // Access Config through ScanbotSDK static property
    const { BarcodeFormatCommonTwoDConfiguration } = ScanbotSDK.Config

    // Detect barcodes - use 2D barcode config which includes PDF417, Aztec, QR, DataMatrix
    console.log('Calling detectBarcodes...')
    const result = await sdk.detectBarcodes(imageUrl, {
      barcodeFormatConfigurations: [
        new BarcodeFormatCommonTwoDConfiguration({
          formats: ['PDF_417', 'AZTEC', 'QR_CODE', 'DATA_MATRIX'],
        }),
      ],
      returnBarcodeImage: false,
    })

    console.log('Scanbot result:', result)

    // Cleanup
    URL.revokeObjectURL(imageUrl)

    if (result && result.barcodes && result.barcodes.length > 0) {
      console.log('Barcode found:', result.barcodes[0])
      return result.barcodes[0].text || null
    }

    console.log('No barcodes found in image')
    return null
  } catch (error) {
    console.error('Scanbot scan error:', error)
    throw error // Re-throw to see the actual error
  }
}

export function isScanbotAvailable(): boolean {
  return typeof window !== 'undefined'
}
