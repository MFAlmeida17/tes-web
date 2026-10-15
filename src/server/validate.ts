// Server-side validation & magic-byte inspection ported from src/server/validate.ts to Strapi/Full-Stack backend

export interface ValidationErrors {
  [field: string]: string;
}

export interface MagicByteInspectionResult {
  valid: boolean;
  detectedFormat: string;
  magicSignatureHex: string;
  error?: string;
}

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Inspects actual file header magic bytes (not just file extension or client MIME type).
 * - Request a Quote (`kind === 'quote'`): accepts PDF only (`25 50 44 46 2D` -> `%PDF-`)
 * - Become a Supplier (`kind === 'supplier'`): accepts PDF, JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), WebP (`52 49 46 46 .... 57 45 42 50`)
 */
export function verifyMagicBytes(
  bytes: Uint8Array,
  kind: 'quote' | 'supplier'
): MagicByteInspectionResult {
  if (!bytes || bytes.length < 12) {
    return {
      valid: false,
      detectedFormat: 'Unknown / Empty',
      magicSignatureHex: '',
      error: 'File is too small or corrupted to verify magic bytes.',
    };
  }

  const hexPreview = Array.from(bytes.slice(0, 12))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  // 1. Check PDF: %PDF- (25 50 44 46 2D)
  const isPdf =
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;

  if (isPdf) {
    return {
      valid: true,
      detectedFormat: 'PDF Document (%PDF-)',
      magicSignatureHex: hexPreview.slice(0, 14),
    };
  }

  if (kind === 'quote') {
    return {
      valid: false,
      detectedFormat: 'Non-PDF File',
      magicSignatureHex: hexPreview,
      error: 'Request a Quote only accepts valid PDF documents (verified via %PDF- magic bytes).',
    };
  }

  // 2. Check JPEG: FF D8 FF
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpeg) {
    return {
      valid: true,
      detectedFormat: 'JPEG Image (FF D8 FF)',
      magicSignatureHex: hexPreview.slice(0, 8),
    };
  }

  // 3. Check PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  if (isPng) {
    return {
      valid: true,
      detectedFormat: 'PNG Image (89 50 4E 47)',
      magicSignatureHex: hexPreview.slice(0, 23),
    };
  }

  // 4. Check WebP: RIFF....WEBP (52 49 46 46 xx xx xx xx 57 45 42 50)
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  if (isWebp) {
    return {
      valid: true,
      detectedFormat: 'WebP Image (RIFF...WEBP)',
      magicSignatureHex: hexPreview,
    };
  }

  return {
    valid: false,
    detectedFormat: 'Unsupported Binary Header',
    magicSignatureHex: hexPreview,
    error:
      'Supplier attachments must be valid PDF, JPEG, PNG, or WebP files (verified by binary magic signature).',
  };
}

export interface EnquiryPayloadInput {
  kind: 'quote' | 'supplier';
  locale: 'en' | 'id';
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  commodity: string;
  volumeMt: string;
  incoterm?: string;
  destinationPort?: string;
  certificationsHeld?: string;
  message: string;
  website?: string; // Honeypot field
  attachmentBase64?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMime?: string;
}

export function validateEnquiryPayload(input: EnquiryPayloadInput): {
  valid: boolean;
  errors: ValidationErrors;
  magicResult?: MagicByteInspectionResult;
} {
  const errors: ValidationErrors = {};
  const isId = input.locale === 'id';

  if (input.kind !== 'quote' && input.kind !== 'supplier') {
    errors.kind = isId ? 'Jenis formulir tidak valid.' : 'Invalid enquiry form kind.';
  }

  if (!input.companyName || input.companyName.trim().length < 2) {
    errors.companyName = isId
      ? 'Nama perusahaan wajib diisi (min. 2 karakter).'
      : 'Company legal name is required (min. 2 characters).';
  }

  if (!input.contactName || input.contactName.trim().length < 2) {
    errors.contactName = isId
      ? 'Nama lengkap penanggung jawab wajib diisi.'
      : 'Primary contact full name is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = isId
      ? 'Masukkan alamat email korporat yang valid.'
      : 'Please enter a valid corporate email address.';
  }

  const phoneClean = (input.phone || '').replace(/[\s\-()]/g, '');
  if (!phoneClean || phoneClean.length < 7) {
    errors.phone = isId
      ? 'Nomor telepon / WhatsApp wajib diisi (min. 7 digit).'
      : 'Valid phone or WhatsApp number is required (min. 7 digits).';
  }

  if (!input.country || input.country.trim().length < 2) {
    errors.country = isId ? 'Negara wajib dipilih.' : 'Country is required.';
  }

  if (!input.commodity || input.commodity.trim().length < 2) {
    errors.commodity = isId ? 'Pilih komoditas utama.' : 'Please select a target commodity.';
  }

  if (!input.volumeMt || input.volumeMt.trim().length < 1) {
    errors.volumeMt = isId
      ? 'Estimasi volume (MT / FCL) wajib diisi.'
      : 'Estimated volume in Metric Tons (MT) or FCL is required.';
  }

  if (!input.message || input.message.trim().length < 15) {
    errors.message = isId
      ? 'Jelaskan spesifikasi atau kebutuhan pengiriman (min. 15 karakter).'
      : 'Please provide technical specification or shipment details (min. 15 characters).';
  }

  let magicResult: MagicByteInspectionResult | undefined;

  if (input.attachmentBase64 && input.attachmentName) {
    const size = input.attachmentSize || 0;
    if (size > MAX_ATTACHMENT_BYTES) {
      errors.attachment = isId
        ? 'Ukuran lampiran melebihi batas maksimal 10 MB.'
        : 'Attachment exceeds the 10 MB maximum file size limit.';
    } else {
      try {
        const cleanBase64 = input.attachmentBase64.includes(',')
          ? input.attachmentBase64.split(',')[1]
          : input.attachmentBase64;
        const buf = Buffer.from(cleanBase64, 'base64');
        magicResult = verifyMagicBytes(new Uint8Array(buf), input.kind);
        if (!magicResult.valid) {
          errors.attachment = magicResult.error || 'Invalid file signature.';
        }
      } catch {
        errors.attachment = isId
          ? 'Gagal membaca isi biner file lampiran.'
          : 'Failed to decode binary attachment stream.';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    magicResult,
  };
}
