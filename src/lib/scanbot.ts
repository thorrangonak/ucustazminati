import ScanbotSDK from 'scanbot-web-sdk'

const LICENSE_KEY =
  "AVrHJmL2SDyq1lQfoR5wOm43QPsePA" +
  "d8k13H+zf6449eR0wc/ZIsOZClQk+L" +
  "nWs8lPp2QzklyLqd6xNE3/VUVUPcpn" +
  "kubWInx33iWw3MdjatAOVGEPw661jx" +
  "306/TBeCyaA8yUtO/ItvxoiKOULSYe" +
  "Bj1/lEacPEBrAujNZEj8ttdhQFWoBz" +
  "NifySPN+eAzyxOg/mAOda3rbuWpm/F" +
  "uOdOqh1rs3p98/IQTxhawtN4KNAP5G" +
  "+0P2H2UVJr+8EzP/wgFXi+Ggb0wW+o" +
  "bQOTjbZ/VTXeH66BBwOGcEjO8wGcX5" +
  "cVeYxPNBjhIBTN1IHT4v/KNATwUfCP" +
  "+maeiIPXxrdw==\nU2NhbmJvdFNESw" +
  "psb2NhbGhvc3R8d3d3LnVjdXN0YXpt" +
  "aW5hdC5jb20KMTc3MDY4MTU5OQo4Mz" +
  "g4NjA3Cjg=\n";

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
