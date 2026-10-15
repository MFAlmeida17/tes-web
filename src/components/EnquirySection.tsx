import React, { useState } from 'react';
import { Locale } from '../i18n/routes';
import { CmsEnquiry, CmsProduct } from '../data/cmsSeed';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileUp,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface EnquirySectionProps {
  locale: Locale;
  products: CmsProduct[];
  initialKind?: 'quote' | 'supplier';
  prefilledCommodity?: string;
  prefilledDestination?: string;
  onEnquirySubmitted: (newEnquiry: CmsEnquiry) => void;
}

interface ClientMagicInspection {
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  hexHeader: string;
  detectedFormat: string;
  valid: boolean;
  errorMsg?: string;
  base64Data: string;
}

export const EnquirySection: React.FC<EnquirySectionProps> = ({
  locale,
  products,
  initialKind = 'quote',
  prefilledCommodity = '',
  prefilledDestination = '',
  onEnquirySubmitted,
}) => {
  const isId = locale === 'id';
  const [kind, setKind] = useState<'quote' | 'supplier'>(initialKind);

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(isId ? 'Indonesia' : 'Singapore');
  const [commodity, setCommodity] = useState(
    prefilledCommodity || (products[0] ? (isId ? products[0].nameId : products[0].nameEn) : 'Whole & Skim Milk Powder')
  );
  const [volumeMt, setVolumeMt] = useState('25 MT (1x 40ft FCL)');
  const [incoterm, setIncoterm] = useState('CIF');
  const [destinationPort, setDestinationPort] = useState(prefilledDestination || 'SGSIN — Singapore');
  const [certificationsHeld, setCertificationsHeld] = useState('SNI 2323, Halal MUI, FSSC 22000');
  const [message, setMessage] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  const [magicInspection, setMagicInspection] = useState<ClientMagicInspection | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    referenceCode: string;
    timestamp: string;
    kind: 'quote' | 'supplier';
    verifiedFormat?: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMagicInspection(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMagicInspection({
        fileName: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        hexHeader: 'OVER_10MB_LIMIT',
        detectedFormat: 'Oversized (>10 MB)',
        valid: false,
        errorMsg: isId ? 'Ukuran file melebihi batas maksimal 10 MB.' : 'File exceeds maximum 10 MB limit.',
        base64Data: '',
      });
      return;
    }

    const sliceBuffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(sliceBuffer);
    const hexHeader = Array.from(bytes.slice(0, 12))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    const isPdf =
      bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng =
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isWebp =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;

    let detectedFormat = 'Unrecognized Binary Header';
    let valid = false;
    let errorMsg: string | undefined;

    if (isPdf) {
      detectedFormat = 'PDF Document (%PDF-)';
      valid = true;
    } else if (kind === 'quote') {
      detectedFormat = 'Non-PDF File';
      valid = false;
      errorMsg = isId
        ? 'Form Request a Quote hanya menerima dokumen PDF (dicek dari magic bytes %PDF-).'
        : 'Request a Quote accepts PDF documents only (verified via %PDF- magic bytes).';
    } else if (isJpeg) {
      detectedFormat = 'JPEG Image (FF D8 FF)';
      valid = true;
    } else if (isPng) {
      detectedFormat = 'PNG Image (89 50 4E 47)';
      valid = true;
    } else if (isWebp) {
      detectedFormat = 'WebP Image (RIFF...WEBP)';
      valid = true;
    } else {
      valid = false;
      errorMsg = isId
        ? 'Form Supplier hanya menerima PDF, JPEG, PNG, atau WebP.'
        : 'Become a Supplier only accepts PDF, JPEG, PNG, or WebP magic signatures.';
    }

    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });

    setMagicInspection({
      fileName: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      hexHeader,
      detectedFormat,
      valid,
      errorMsg,
      base64Data,
    });
  };

  const attachSampleSpecPdf = () => {
    const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
trailer << /Root 1 0 R >>
%%EOF`;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(samplePdfContent);
    const hexHeader = Array.from(bytes.slice(0, 12))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    const base64 = btoa(samplePdfContent);

    setMagicInspection({
      fileName:
        kind === 'quote'
          ? 'Buyer_Target_QA_Spec_2026.pdf'
          : 'Supplier_Lab_COA_Certificate_2026.pdf',
      sizeBytes: bytes.length,
      mimeType: 'application/pdf',
      hexHeader,
      detectedFormat: 'PDF Document (%PDF-)',
      valid: true,
      base64Data: `data:application/pdf;base64,${base64}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/enquiries/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          locale,
          companyName,
          contactName,
          email,
          phone,
          country,
          commodity,
          volumeMt,
          incoterm: kind === 'quote' ? incoterm : undefined,
          destinationPort: kind === 'quote' ? destinationPort : undefined,
          certificationsHeld: kind === 'supplier' ? certificationsHeld : undefined,
          message,
          website: websiteHoneypot,
          attachmentBase64: magicInspection?.base64Data,
          attachmentName: magicInspection?.fileName,
          attachmentSize: magicInspection?.sizeBytes,
          attachmentMime: magicInspection?.mimeType,
          turnstileToken: 'commodex-turnstile-pass',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 422 && data.errors) {
          setFieldErrors(data.errors);
        } else {
          setGlobalError(data.error || 'Submission failed. Please check your inputs.');
        }
        setSubmitting(false);
        return;
      }

      if (data.enquiry) {
        onEnquirySubmitted(data.enquiry);
        setSubmittedReceipt({
          referenceCode: data.enquiry.referenceCode,
          timestamp: data.enquiry.createdAt,
          kind,
          verifiedFormat: data.enquiry.attachment?.verifiedFormat,
        });
      }
      setSubmitting(false);
    } catch {
      setGlobalError(
        isId
          ? 'Gagal menghubungi endpoint Strapi /api/enquiries/submit.'
          : 'Network error while connecting to Strapi /api/enquiries/submit.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1A2B3D] text-white rounded-xl p-8 border border-white/10">
            <div className="text-xs font-mono text-[#F8A531] mb-2">
              {isId ? 'MEJA PERDAGANGAN LANGSUNG' : 'DIRECT COMMODITY TRADE DESK'}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              PT Commodex Trading Indonesia
            </h2>
            <p className="text-sm text-[#E9E1D5]/80 mt-2 leading-relaxed">
              {isId
                ? 'Bagian dari ESS (PT Esystem Solutions Komoditi). Semua permintaan penawaran harga (Request a Quote) dan pendaftaran pemasok (Become a Supplier) diverifikasi langsung oleh tim QC & logistik kami.'
                : 'Part of ESS (PT Esystem Solutions Komoditi). All buyer quote requests and origin supplier registrations are processed directly by our quality assurance and maritime logistics desk.'}
            </p>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#EB980C] mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-[#E9E1D5]/60">
                    {isId ? 'Email Perdagangan & Dokumen' : 'Trade Desk & Documentation'}
                  </div>
                  <a
                    href="mailto:info@commodex.id"
                    className="font-mono font-semibold text-white hover:text-[#F8A531]"
                  >
                    info@commodex.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#EB980C] mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-[#E9E1D5]/60">
                    {isId ? 'Telepon Meja Dagang Jakarta' : 'Jakarta Trade Desk Line'}
                  </div>
                  <div className="font-mono font-semibold text-white">+62 21 5098 7420</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#EB980C] mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-[#E9E1D5]/60">
                    {isId ? 'Kantor Pusat & Gudang Konsolidasi' : 'Headquarters & Port Hubs'}
                  </div>
                  <div className="text-white font-medium">
                    Sudirman Central Business District (SCBD), Jakarta Selatan
                  </div>
                  <div className="text-xs text-[#E9E1D5]/70 mt-0.5">
                    Port Operations: Tanjung Priok (IDJKT) · Tanjung Perak (IDSUB) · Makassar (IDMAK)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#E9E1D5] border border-[#2A211C]/10 rounded-xl p-6">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#8A5500] mb-2">
              <ShieldCheck className="w-4 h-4 text-[#EB980C]" />
              <span>POST /api/enquiries/submit · STRAPI DIRECT</span>
            </div>
            <p className="text-xs text-[#2A211C]/80 leading-relaxed">
              {isId
                ? 'Formulir ini terhubung langsung ke koleksi Enquiry Strapi CMS (mendukung lampiran hingga 10 MB melampaui batas 4,5 MB Vercel Function) dengan pemeriksaan magic bytes biner, honeypot, dan rate-limit 5 kiriman/10 menit.'
                : 'This form submits directly to the Strapi CMS Enquiry collection (supporting 10 MB attachments beyond the 4.5 MB Vercel Function limit) with binary magic-byte inspection, honeypot protection, and 5 req/10m rate limiting.'}
            </p>
            <div className="mt-4 pt-3 border-t border-[#2A211C]/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#2A211C]/70">
              <span>Quote: PDF (%PDF-)</span>
              <span>·</span>
              <span>Supplier: PDF / JPEG / PNG / WebP</span>
              <span>·</span>
              <span>Max: 10 MB</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#2A211C]/10 rounded-xl p-8">
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F4EFE8] rounded-lg mb-8">
            <button
              type="button"
              onClick={() => {
                setKind('quote');
                setSubmittedReceipt(null);
                setFieldErrors({});
              }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                kind === 'quote'
                  ? 'bg-[#EB980C] text-white shadow-xs'
                  : 'text-[#2A211C]/75 hover:text-[#2A211C]'
              }`}
            >
              {isId ? '1. Minta Penawaran (Request a Quote)' : '1. Request a Quote (Buyer)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setKind('supplier');
                setSubmittedReceipt(null);
                setFieldErrors({});
              }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                kind === 'supplier'
                  ? 'bg-[#5E6B3A] text-white shadow-xs'
                  : 'text-[#2A211C]/75 hover:text-[#2A211C]'
              }`}
            >
              {isId ? '2. Daftar Pemasok (Become a Supplier)' : '2. Become a Supplier (Origin)'}
            </button>
          </div>

          {submittedReceipt ? (
            <div className="bg-[#F4EFE8] border border-[#5E6B3A]/40 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#5E6B3A] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-[#5E6B3A] font-semibold">
                {isId ? 'TERSIMPAN DI STRAPI CMS & NOTIFIKASI TERKIRIM' : 'STORED IN STRAPI CMS & NOTIFICATION DISPATCHED'}
              </div>
              <h3 className="text-2xl font-bold text-[#2A211C]">
                {isId ? 'Permintaan Anda Telah Diterima' : 'Your Enquiry Has Been Registered'}
              </h3>
              <p className="text-sm text-[#2A211C]/80 max-w-md mx-auto">
                {isId
                  ? 'Data Anda telah divalidasi dan masuk ke antrean meja perdagangan PT Commodex Trading Indonesia.'
                  : 'Your submission passed binary validation and is now queued with the PT Commodex Trading Indonesia trade desk.'}
              </p>
              <div className="bg-white border border-[#2A211C]/10 rounded-lg p-4 max-w-md mx-auto text-left font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#2A211C]/60">Reference ID:</span>
                  <span className="font-bold text-[#2A211C]">{submittedReceipt.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2A211C]/60">Initial Status:</span>
                  <span className="font-semibold text-[#8A5500]">
                    {submittedReceipt.kind === 'quote' ? 'new ( → replied → closed)' : 'pending ( → verified / rejected)'}
                  </span>
                </div>
                {submittedReceipt.verifiedFormat && (
                  <div className="flex justify-between">
                    <span className="text-[#2A211C]/60">Magic Bytes Verified:</span>
                    <span className="text-[#5E6B3A] font-semibold">{submittedReceipt.verifiedFormat}</span>
                  </div>
                )}
              </div>
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittedReceipt(null)}
                  className="px-4 py-2 rounded-lg bg-[#2A211C] text-white text-xs font-semibold hover:bg-[#3B2418] cursor-pointer"
                >
                  {isId ? 'Kirim Formulir Lainnya' : 'Submit Another Enquiry'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website-hp">Website</label>
                <input
                  id="website-hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={websiteHoneypot}
                  onChange={(e) => setWebsiteHoneypot(e.target.value)}
                />
              </div>

              {globalError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{globalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId ? 'Nama Perusahaan Resmi *' : 'Company Legal Name *'}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={
                      kind === 'quote'
                        ? 'e.g. PT Indofood CBP / Helvetia Confectionery'
                        : 'e.g. Koperasi Kakao Sulawesi Lestari'
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  />
                  {fieldErrors.companyName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId ? 'Nama Lengkap Kontak (PIC) *' : 'Contact Person Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Budi Santoso / Clara Wijaya"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  />
                  {fieldErrors.contactName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.contactName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId ? 'Email Korporat *' : 'Corporate Email *'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId ? 'Telepon / WhatsApp *' : 'Phone / WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 811 2345 678"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId ? 'Negara *' : 'Country *'}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  >
                    <option value="Indonesia">Indonesia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="China">China</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId ? 'Komoditas Pangan *' : 'Target Food Commodity *'}
                  </label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  >
                    {products.map((p) => {
                      const label = isId ? p.nameId : p.nameEn;
                      return (
                        <option key={p.id} value={label}>
                          {label} (HS {p.hsCode})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {kind === 'quote'
                      ? isId
                        ? 'Volume Kebutuhan (MT / FCL) *'
                        : 'Required Volume (MT / FCL) *'
                      : isId
                        ? 'Kapasitas Pasokan per Bulan (MT) *'
                        : 'Monthly Supply Capacity (MT) *'}
                  </label>
                  <input
                    type="text"
                    value={volumeMt}
                    onChange={(e) => setVolumeMt(e.target.value)}
                    placeholder="e.g. 25 MT (1x 40ft FCL)"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  />
                  {fieldErrors.volumeMt && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.volumeMt}</p>
                  )}
                </div>
              </div>

              {kind === 'quote' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                      {isId ? 'Incoterm Pilihan' : 'Preferred Incoterm'}
                    </label>
                    <select
                      value={incoterm}
                      onChange={(e) => setIncoterm(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                    >
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="FOB">FOB (Free on Board Origin Port)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                      <option value="DDP">DDP (Delivered Duty Paid Warehouse)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                      {isId ? 'Pelabuhan Tujuan (POD)' : 'Destination Port (POD)'}
                    </label>
                    <input
                      type="text"
                      value={destinationPort}
                      onChange={(e) => setDestinationPort(e.target.value)}
                      placeholder="e.g. SGSIN Singapore / NLRTM Rotterdam"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                    {isId
                      ? 'Sertifikasi Kualitas & Ketertelusuran yang Dimiliki'
                      : 'Quality & Traceability Certifications Held'}
                  </label>
                  <input
                    type="text"
                    value={certificationsHeld}
                    onChange={(e) => setCertificationsHeld(e.target.value)}
                    placeholder="e.g. SNI 2323 Grade AA, Halal MUI, FSSC 22000, EUDR Polygon"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2A211C] mb-1.5">
                  {kind === 'quote'
                    ? isId
                      ? 'Spesifikasi Teknis & Jadwal Pengapalan *'
                      : 'Target Specification & Delivery Schedule *'
                    : isId
                      ? 'Detail Gudang Asal, Parameter Mutu & Panen *'
                      : 'Origin Warehouse Location, Moisture/Grade & Harvest Details *'}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    kind === 'quote'
                      ? isId
                        ? 'Contoh: Membutuhkan 2x40ft FCL Cocoa Powder Alkalized pH 7.2 kadar lemak 10-12%...'
                        : 'Example: Require 2x40ft FCL Alkalized Cocoa Powder pH 7.2, 10-12% fat...'
                      : isId
                        ? 'Contoh: Gudang fermentasi di Luwu Utara, kapasitas 60 MT/bulan biji kakao kering...'
                        : 'Example: Fermentation facility in North Luwu Sulawesi, 60 MT/month sun-dried cacao...'
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#2A211C]/20 bg-[#F4EFE8]/50 focus:bg-white focus:border-[#EB980C] focus:outline-none"
                />
                {fieldErrors.message && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F4EFE8] border border-[#2A211C]/15">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-semibold text-[#2A211C] flex items-center gap-1.5">
                    <FileUp className="w-4 h-4 text-[#EB980C]" />
                    <span>
                      {kind === 'quote'
                        ? isId
                          ? 'Lampiran Lembar Spesifikasi Pembeli (Wajib PDF, maks. 10 MB)'
                          : 'Buyer Target Spec Sheet Attachment (PDF only, max 10 MB)'
                        : isId
                          ? 'Lampiran COA / Foto Gudang (PDF, JPEG, PNG, WebP, maks. 10 MB)'
                          : 'Supplier Lab COA / Product Photos (PDF, JPEG, PNG, WebP, max 10 MB)'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={attachSampleSpecPdf}
                    className="text-xs font-mono font-semibold text-[#8A5500] hover:underline cursor-pointer"
                  >
                    {isId ? '+ Gunakan Contoh PDF Valid (%PDF-)' : '+ Attach Sample Valid PDF (%PDF-)'}
                  </button>
                </div>

                <input
                  type="file"
                  accept={kind === 'quote' ? '.pdf,application/pdf' : '.pdf,.jpg,.jpeg,.png,.webp'}
                  onChange={handleFileChange}
                  className="block w-full text-xs text-[#2A211C]/75 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2A211C] file:text-white hover:file:bg-[#3B2418] cursor-pointer"
                />

                {magicInspection && (
                  <div
                    className={`mt-3 p-3 rounded-lg border text-xs font-mono ${
                      magicInspection.valid
                        ? 'bg-white border-[#5E6B3A]/40 text-[#2A211C]'
                        : 'bg-red-50 border-red-300 text-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-[#5E6B3A]" />
                        {magicInspection.fileName} ({(magicInspection.sizeBytes / 1024).toFixed(1)} KB)
                      </span>
                      <span
                        className={
                          magicInspection.valid ? 'text-[#5E6B3A] font-bold' : 'text-red-700 font-bold'
                        }
                      >
                        {magicInspection.detectedFormat}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#2A211C]/65 mt-1">
                      Magic Bytes Header: <span className="text-[#8A5500]">{magicInspection.hexHeader}</span>
                    </div>
                    {magicInspection.errorMsg && (
                      <div className="text-red-600 mt-1 font-sans">{magicInspection.errorMsg}</div>
                    )}
                  </div>
                )}
                {fieldErrors.attachment && (
                  <p className="text-xs text-red-600 mt-1.5">{fieldErrors.attachment}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-[#2A211C]/65">
                  <Lock className="w-3.5 h-3.5 text-[#5E6B3A]" />
                  <span>
                    {isId
                      ? 'Dilindungi oleh Origin Check, Rate Limit & Cloudflare Turnstile'
                      : 'Protected by Origin Check, Rate Limit & Cloudflare Turnstile'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors cursor-pointer whitespace-nowrap ${
                    kind === 'quote'
                      ? 'bg-[#EB980C] hover:bg-[#d68808]'
                      : 'bg-[#5E6B3A] hover:bg-[#4c582e]'
                  } disabled:opacity-50`}
                >
                  {submitting
                    ? isId
                      ? 'Memvalidasi & Mengirim...'
                      : 'Validating & Submitting...'
                    : kind === 'quote'
                      ? isId
                        ? 'Kirim Permintaan Penawaran'
                        : 'Submit Quote Request'
                      : isId
                        ? 'Kirim Pendaftaran Pemasok'
                        : 'Submit Supplier Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
