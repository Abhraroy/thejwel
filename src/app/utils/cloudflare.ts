/**
 * Cloudflare R2 Upload Utility (S3-compatible)
 *
 * Required Environment Variables:
 * - CLOUDFLARE_R2_ACCESS_KEY_ID: Your R2 Access Key ID
 * - CLOUDFLARE_R2_SECRET_ACCESS_KEY: Your R2 Secret Access Key
 * - CLOUDFLARE_R2_ENDPOINT: Your R2 endpoint URL
 * - CLOUDFLARE_R2_BUCKET_NAME: Your R2 bucket name
 * - CLOUDFLARE_R2_PUBLIC_URL: Public URL for accessing uploaded files (optional, for custom domain)
 *
 * Note: This uses R2 (S3-compatible storage) instead of Cloudflare Images API
 */

import * as crypto from 'crypto';


interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Generates AWS Signature Version 4 for S3-compatible requests
 */
function generateSignature(
  secretKey: string,
  date: string,
  region: string,
  service: string,
  stringToSign: string
): string {
  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(date).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

/**
 * Uploads an image file to Cloudflare R2 and returns the public URL
 * @param file - The image file to upload
 * @param options - Optional configuration
 * @returns Promise with upload result containing public URL
 */
export async function uploadImageToCloudflare(
  file: File,
  options: {
    folder?: string;
    metadata?: Record<string, string>;
  } = {}
): Promise<UploadResult> {
  try {
    // Get environment variables
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    console.log('accessKeyId', accessKeyId);
    console.log('secretAccessKey', secretAccessKey);
    console.log('endpoint', endpoint);
    console.log('bucketName', bucketName);
    console.log('publicUrl', publicUrl);


    if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
      throw new Error('R2 environment variables are not properly configured');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (R2 limit is typically 5GB, but we'll set a reasonable limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const folder = options.folder || 'categories';
    const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Prepare S3-compatible request
    const region = 'auto'; // R2 uses 'auto' as region
    const service = 's3';
    const now = new Date();
    // Format: YYYYMMDD
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    // Format: YYYYMMDDTHHMMSSZ (ISO 8601 without milliseconds)
    const datetime = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, -1) + 'Z';

    // Ensure datetime is exactly 16 characters (YYYYMMDDTHHMMSSZ)
    if (datetime.length !== 16) {
      throw new Error(`Invalid datetime format: ${datetime} (length: ${datetime.length})`);
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For S3/R2, the canonical URI should have the path as-is (no encoding needed for simple paths)
    // But we need to ensure proper formatting
    const canonicalUri = `/${bucketName}/${key}`;
    const canonicalQueryString = '';
    
    // Headers must be sorted alphabetically and lowercase
    const host = endpoint.replace('https://', '').replace('http://', '');
    const payloadHash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Headers in alphabetical order
    const headers = {
      'host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': datetime,
    };
    
    // Build canonical headers (sorted alphabetically)
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key}:${headers[key as keyof typeof headers]}`)
      .join('\n') + '\n';
    
    const signedHeaders = Object.keys(headers).sort().join(';');

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      datetime,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    // Generate signature
    const signature = generateSignature(secretAccessKey, date, region, service, stringToSign);

    // Create authorization header
    const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Upload to R2 (URL encode the full path for the fetch URL)
    const uploadUrl = `${endpoint}/${bucketName}/${key.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Host': host,
        'x-amz-date': datetime,
        'x-amz-content-sha256': payloadHash,
        'Content-Type': file.type,
        'Authorization': authorization,
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`R2 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Generate public URL
    let fileUrl: string;
    if (publicUrl) {
      // Use custom domain if provided
      fileUrl = `${publicUrl}/${key}`;
    } else {
      // Use R2 public URL format
      // Note: This requires the bucket to be public or have a public URL configured
      fileUrl = `${endpoint}/${bucketName}/${key}`;
    }

    return {
      success: true,
      url: fileUrl,
      key: key,
    };

  } catch (error) {
    console.error('Cloudflare R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Deletes an image from Cloudflare R2
 * @param key - The key (path) of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImageFromCloudflare(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
      throw new Error('R2 environment variables are not properly configured');
    }

    const region = 'auto';
    const service = 's3';
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const datetime = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, -1) + 'Z';

    // Create canonical request for DELETE
    const host = endpoint.replace('https://', '').replace('http://', '');
    const payloadHash = crypto.createHash('sha256').update('').digest('hex');
    
    const canonicalUri = `/${bucketName}/${key}`;
    const canonicalQueryString = '';
    
    // Headers in alphabetical order
    const headers = {
      'host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': datetime,
    };
    
    // Build canonical headers (sorted alphabetically)
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key}:${headers[key as keyof typeof headers]}`)
      .join('\n') + '\n';
    
    const signedHeaders = Object.keys(headers).sort().join(';');

    const canonicalRequest = [
      'DELETE',
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      datetime,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    // Generate signature
    const signature = generateSignature(secretAccessKey, date, region, service, stringToSign);

    // Create authorization header
    const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Delete from R2
    const deleteUrl = `${endpoint}/${bucketName}/${key.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Host': host,
        'x-amz-date': datetime,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authorization,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`R2 delete failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Cloudflare R2 delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Gets image details from Cloudflare R2 (basic implementation)
 * @param key - The key (path) of the image
 * @returns Promise with image details
 */
export async function getImageDetails(key: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!endpoint || !bucketName) {
      throw new Error('R2 environment variables are not properly configured');
    }

    // Generate public URL
    let fileUrl: string;
    if (publicUrl) {
      fileUrl = `${publicUrl}/${key}`;
    } else {
      fileUrl = `${endpoint}/${bucketName}/${key}`;
    }

    return {
      success: true,
      data: {
        url: fileUrl,
        key: key,
      },
    };

  } catch (error) {
    console.error('Cloudflare R2 get image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
