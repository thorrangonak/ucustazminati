import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import { getSettings } from '@/lib/services/settings'

// Lazy S3 client initialization
let s3Client: S3Client | null = null
let lastConfig: string | null = null

interface StorageConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  cdnUrl?: string
}

async function getStorageConfig(): Promise<StorageConfig> {
  const settings = await getSettings([
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
    'AWS_CDN_URL',
  ])

  return {
    region: settings.AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
    accessKeyId: settings.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: settings.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    bucket: settings.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET || 'ucustazminat-documents',
    cdnUrl: settings.AWS_CDN_URL || process.env.AWS_CDN_URL,
  }
}

async function getS3Client(): Promise<{ client: S3Client; config: StorageConfig }> {
  const config = await getStorageConfig()
  const configKey = `${config.region}:${config.accessKeyId}:${config.bucket}`

  // Reinitialize if config changed
  if (!s3Client || lastConfig !== configKey) {
    if (!config.accessKeyId || !config.secretAccessKey) {
      throw new Error('AWS credentials not configured. Please set them in Admin Settings.')
    }

    s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
    lastConfig = configKey
  }

  return { client: s3Client, config }
}

interface UploadResult {
  fileKey: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

// Generate a unique file key
function generateFileKey(claimId: string, originalFileName: string): string {
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'bin'
  const uniqueId = uuidv4().slice(0, 8)
  const timestamp = Date.now()
  return `claims/${claimId}/${timestamp}-${uniqueId}.${extension}`
}

// Upload file to S3
export async function uploadFile(
  file: Buffer,
  originalFileName: string,
  mimeType: string,
  claimId: string
): Promise<UploadResult> {
  const { client, config } = await getS3Client()
  const fileKey = generateFileKey(claimId, originalFileName)

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: fileKey,
    Body: file,
    ContentType: mimeType,
    Metadata: {
      originalFileName,
      claimId,
      uploadedAt: new Date().toISOString(),
    },
  })

  await client.send(command)

  // Generate URL
  const fileUrl = config.cdnUrl
    ? `${config.cdnUrl}/${fileKey}`
    : `https://${config.bucket}.s3.${config.region}.amazonaws.com/${fileKey}`

  return {
    fileKey,
    fileUrl,
    fileName: originalFileName,
    fileSize: file.length,
    mimeType,
  }
}

// Upload from base64
export async function uploadBase64(
  base64Data: string,
  originalFileName: string,
  mimeType: string,
  claimId: string
): Promise<UploadResult> {
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '')
  const buffer = Buffer.from(base64Content, 'base64')
  return uploadFile(buffer, originalFileName, mimeType, claimId)
}

// Delete file from S3
export async function deleteFile(fileKey: string): Promise<void> {
  const { client, config } = await getS3Client()

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: fileKey,
  })

  await client.send(command)
}

// Generate a presigned URL for temporary access
export async function getPresignedUrl(
  fileKey: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const { client, config } = await getS3Client()

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: fileKey,
  })

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

// Generate presigned URL for direct upload from client
export async function getUploadPresignedUrl(
  claimId: string,
  fileName: string,
  mimeType: string,
  expiresInSeconds: number = 300
): Promise<{ uploadUrl: string; fileKey: string }> {
  const { client, config } = await getS3Client()
  const fileKey = generateFileKey(claimId, fileName)

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: fileKey,
    ContentType: mimeType,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds })

  return { uploadUrl, fileKey }
}

// Get file URL (use CDN if available, otherwise presigned)
export async function getFileUrl(fileKey: string, usePresigned: boolean = false): Promise<string> {
  if (usePresigned) {
    return getPresignedUrl(fileKey)
  }

  const config = await getStorageConfig()

  if (config.cdnUrl) {
    return `${config.cdnUrl}/${fileKey}`
  }

  // Return direct S3 URL (requires public access or presigned URL)
  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${fileKey}`
}

// Validate file type
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
    'application/pdf',
  ]
  return allowedTypes.includes(mimeType.toLowerCase())
}

// Validate file size (max 10MB)
export function isAllowedFileSize(sizeInBytes: number): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return sizeInBytes <= maxSize
}

// Get file extension from mime type
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'application/pdf': 'pdf',
  }
  return mimeToExt[mimeType.toLowerCase()] || 'bin'
}
