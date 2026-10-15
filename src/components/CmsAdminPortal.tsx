import React, { useState } from 'react';
import {
  CmsDatabase,
  CmsEnquiry,
  CmsProduct,
  QuoteStatus,
  SupplierStatus,
} from '../data/cmsSeed';
import {
  CheckCircle2,
  Database,
  FileText,
  Globe,
  Layers,
  MailCheck,
  PackagePlus,
  RefreshCw,
  Rocket,
  Server,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

interface CmsAdminPortalProps {
  db: CmsDatabase;
  onRefreshDb: (updatedDb: CmsDatabase) => void;
  onNavigateToProduct: (slugEn: string) => void;
}

export const CmsAdminPortal: React.FC<CmsAdminPortalProps> = ({
  db,
  onRefreshDb,
  onNavigateToProduct,
}) => {
  const [activeTab, setActiveTab] = useState<
    'enquiries' | 'products' | 'outbox' | 'infrastructure'
  >('enquiries');
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'quote' | 'supplier'>('all');
  const [statusNoteMap, setStatusNoteMap] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  // New Dynamic CMS Product Form State (`feat/strapi-content` dynamic route editor)
  const [newSlugEn, setNewSlugEn] = useState('butter-liquor');
  const [newSlugId, setNewSlugId] = useState('mentega-kakao');
  const [newCategory, setNewCategory] = useState('COCOA DERIVATIVES');
  const [newHsCode, setNewHsCode] = useState('1804.00.00');
  const [newNameEn, setNewNameEn] = useState('Deodorized Pure Prime Pressed Cocoa Butter');
  const [newNameId, setNewNameId] = useState('Mentega Kakao Murni Deodorized (PPP Cocoa Butter)');
  const [newSubtitleEn, setNewSubtitleEn] = useState(
    'Golden-yellow deodorized cocoa butter blocks (25 kg cartons) with sharp melting profile for premium chocolate.'
  );
  const [newSubtitleId, setNewSubtitleId] = useState(
    'Mentega kakao deodorized kuning keemasan (karton 25 kg) dengan titik leleh presisi untuk cokelat premium.'
  );
  const [newOriginEn, setNewOriginEn] = useState('Bandung & Tangerang Pressing Facilities, Indonesia');
  const [newFcl20, setNewFcl20] = useState('16.0 MT (640 Cartons x 25 kg)');
  const [newFcl40, setNewFcl40] = useState('25.0 MT (1,000 Cartons Reefer/Dry)');
  const [productSaveSuccess, setProductSaveSuccess] = useState<string | null>(null);

  const filteredEnquiries = db.enquiries.filter((e) =>
    enquiryFilter === 'all' ? true : e.kind === enquiryFilter
  );

  const handleStatusChange = async (
    enquiry: CmsEnquiry,
    nextStatus: QuoteStatus | SupplierStatus
  ) => {
    setBusyId(enquiry.id);
    try {
      const res = await fetch(`/api/enquiries/${enquiry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          notes: statusNoteMap[enquiry.id] ?? enquiry.notes,
        }),
      });
      const data = await res.json();
      if (data.ok && data.db) {
        onRefreshDb(data.db);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('create-product');
    setProductSaveSuccess(null);

    const newProd: CmsProduct = {
      id: `prod-${newSlugEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      slugEn: newSlugEn.toLowerCase().trim(),
      slugId: newSlugId.toLowerCase().trim(),
      order: db.products.length + 1,
      categoryCode: newCategory,
      hsCode: newHsCode,
      image: '/src/assets/images/commodex_cocoa_powder_1792069846956.jpg',
      originEn: newOriginEn,
      originId: newOriginEn,
      nameEn: newNameEn,
      nameId: newNameId,
      subtitleEn: newSubtitleEn,
      subtitleId: newSubtitleId,
      summaryEn:
        'Published dynamically from Strapi 5 Content Manager (feat/strapi-content). Available for immediate container allocation with full COA, Halal, and FSSC 22000 documentation.',
      summaryId:
        'Dipublikasikan secara dinamis dari Strapi 5 Content Manager (feat/strapi-content). Tersedia untuk alokasi kontainer dengan dokumen COA, Halal, dan FSSC 22000 lengkap.',
      packagingEn: '25 kg food-grade corrugated cartons with PE inner liner',
      packagingId: 'Karton bergelombang food-grade 25 kg dengan inner liner PE',
      shelfLifeEn: '24 months from production date below 20°C',
      shelfLifeId: '24 bulan sejak tanggal produksi di bawah suhu 20°C',
      fcl20Mt: newFcl20,
      fcl40Mt: newFcl40,
      leadTimeDays: '12–16 Days ex-Jakarta / Surabaya',
      incoterms: ['FOB Jakarta', 'CIF Singapore', 'CIF Rotterdam'],
      certifications: ['FSSC 22000', 'Halal MUI / BPJPH', 'Kosher Pareve'],
      documentsEn: [
        'Batch Certificate of Analysis (FFA, Iodine Value, Slip Melting Point)',
        'Halal Certificate (BPJPH / MUI)',
        'Certificate of Origin (Form D / Form E)',
        'Full Clean on Board Bill of Lading',
      ],
      documentsId: [
        'Certificate of Analysis per Batch (FFA, Bilangan Iod, Titik Leleh)',
        'Sertifikat Halal (BPJPH / MUI)',
        'Surat Keterangan Asal (Form D / Form E)',
        'Bill of Lading Clean on Board',
      ],
      specs: [
        {
          parameterEn: 'Free Fatty Acids (as Oleic Acid)',
          parameterId: 'Asam Lemak Bebas (sebagai Asam Oleat)',
          valueEn: 'Max. 1.75%',
          valueId: 'Maks. 1,75%',
          method: 'IOCCC 42',
        },
        {
          parameterEn: 'Moisture & Volatile Matter',
          parameterId: 'Kadar Air & Zat Menguap',
          valueEn: 'Max. 0.15%',
          valueId: 'Maks. 0,15%',
          method: 'ISO 662',
        },
        {
          parameterEn: 'Slip Melting Point',
          parameterId: 'Titik Leleh (Slip Melting Point)',
          valueEn: '31.0°C – 35.0°C',
          valueId: '31,0°C – 35,0°C',
          method: 'AOCS Cc 3-25',
        },
        {
          parameterEn: 'Saponification Value',
          parameterId: 'Bilangan Penyabunan',
          valueEn: '188 – 198 mg KOH/g',
          valueId: '188 – 198 mg KOH/g',
          method: 'ISO 3657',
        },
      ],
      publishedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/cms/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
      const data = await res.json();
      if (data.ok && data.db) {
        onRefreshDb(data.db);
        setProductSaveSuccess(
          `Published /products/${newProd.slugEn} and /id/produk/${newProd.slugId} to live routes!`
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cms/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.db) {
        onRefreshDb(data.db);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleTriggerDeployWebhook = async (env: 'production (main)' | 'staging') => {
    setBusyId(`deploy-${env}`);
    try {
      const res = await fetch('/api/cms/webhooks/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment: env,
          triggerReason: `Strapi 5 Publish Webhook → Vercel Deploy Hook (${env})`,
        }),
      });
      const data = await res.json();
      if (data.ok && data.db) {
        onRefreshDb(data.db);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE8] text-[#2A211C] py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Admin Studio Header */}
        <div className="bg-[#1A2B3D] text-white rounded-xl p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-[#F8A531]">
              STRAPI {db.siteConfig.strapiVersion} HEADLESS CMS · FEAT/STRAPI-CONTENT MERGED
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              Commodex Content Manager & Enquiry Console
            </h1>
            <p className="text-xs text-[#E9E1D5]/75 mt-1">
              Manage incoming Quote & Supplier enquiries, publish dynamic bilingual products (`/products/[slug]` & `/id/produk/[slug]`), and trigger debounced Vercel Deploy Hooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleTriggerDeployWebhook('staging')}
              disabled={busyId === 'deploy-staging'}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F8A531]" />
              <span>Webhook → Staging</span>
            </button>
            <button
              type="button"
              onClick={() => handleTriggerDeployWebhook('production (main)')}
              disabled={busyId === 'deploy-production (main)'}
              className="px-4 py-2 rounded-lg bg-[#EB980C] hover:bg-[#d68808] text-xs font-mono font-semibold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Trigger Vercel Deploy Hook (main)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#2A211C]/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-[#2A211C] text-white'
                : 'bg-white text-[#2A211C]/75 hover:text-[#2A211C]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Enquiry Collection ({db.enquiries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#2A211C] text-white'
                : 'bg-white text-[#2A211C]/75 hover:text-[#2A211C]'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Dynamic Products EN/ID ({db.products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outbox')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === 'outbox'
                ? 'bg-[#2A211C] text-white'
                : 'bg-white text-[#2A211C]/75 hover:text-[#2A211C]'
            }`}
          >
            <MailCheck className="w-4 h-4" />
            <span>Resend / SMTP Email Outbox ({db.outbox.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === 'infrastructure'
                ? 'bg-[#2A211C] text-white'
                : 'bg-white text-[#2A211C]/75 hover:text-[#2A211C]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Deploy Hooks & Stack Checklist</span>
          </button>
        </div>

        {/* TAB 1: ENQUIRY COLLECTION MANAGER */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Strapi Collection: Enquiry (`api::enquiry.enquiry`)
                </h2>
                <p className="text-xs text-[#2A211C]/70">
                  Workflow state transitions: Quote (`new` → `replied` → `closed`) · Supplier (`pending` → `verified` / `rejected`)
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#E9E1D5] p-1 rounded-lg">
                {(['all', 'quote', 'supplier'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setEnquiryFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                      enquiryFilter === f
                        ? 'bg-white text-[#2A211C] shadow-xs'
                        : 'text-[#2A211C]/70 hover:text-[#2A211C]'
                    }`}
                  >
                    {f === 'all'
                      ? `All (${db.enquiries.length})`
                      : f === 'quote'
                        ? `Buyer Quotes (${db.enquiries.filter((e) => e.kind === 'quote').length})`
                        : `Suppliers (${db.enquiries.filter((e) => e.kind === 'supplier').length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredEnquiries.map((enq) => {
                const statusOptions: Array<QuoteStatus | SupplierStatus> =
                  enq.kind === 'quote'
                    ? ['new', 'replied', 'closed']
                    : ['pending', 'verified', 'rejected'];

                return (
                  <div
                    key={enq.id}
                    className="bg-white border border-[#2A211C]/10 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2A211C]/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#8A5500]">
                          <span className="font-bold">{enq.referenceCode}</span>
                          <span>·</span>
                          <span>{enq.kind === 'quote' ? 'REQUEST A QUOTE' : 'BECOME A SUPPLIER'}</span>
                          <span>·</span>
                          <span>Locale: {enq.locale.toUpperCase()}</span>
                          <span>·</span>
                          <span>{new Date(enq.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#2A211C] mt-1">
                          {enq.companyName} — {enq.contactName}
                        </h3>
                        <div className="text-xs text-[#2A211C]/70 mt-0.5">
                          {enq.email} · {enq.phone} · {enq.country}
                        </div>
                      </div>

                      {/* Status State Machine Controls */}
                      <div className="flex items-center gap-1.5 bg-[#F4EFE8] p-1 rounded-lg">
                        {statusOptions.map((st) => {
                          const active = enq.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={busyId === enq.id}
                              onClick={() => handleStatusChange(enq, st)}
                              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                                active
                                  ? st === 'verified' || st === 'replied'
                                    ? 'bg-[#5E6B3A] text-white'
                                    : st === 'rejected'
                                      ? 'bg-red-700 text-white'
                                      : 'bg-[#EB980C] text-white'
                                  : 'text-[#2A211C]/70 hover:bg-white'
                              }`}
                            >
                              {st.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-[#F4EFE8] p-3.5 rounded-lg">
                        <div className="text-[#2A211C]/60">Target Commodity</div>
                        <div className="font-semibold text-[#2A211C] mt-0.5">{enq.commodity}</div>
                      </div>
                      <div className="bg-[#F4EFE8] p-3.5 rounded-lg">
                        <div className="text-[#2A211C]/60">Volume Allocation</div>
                        <div className="font-mono font-semibold text-[#2A211C] mt-0.5 tabular-nums">
                          {enq.volumeMt}
                        </div>
                      </div>
                      <div className="bg-[#F4EFE8] p-3.5 rounded-lg">
                        <div className="text-[#2A211C]/60">
                          {enq.kind === 'quote' ? 'Incoterm & Port' : 'Certifications Held'}
                        </div>
                        <div className="font-semibold text-[#2A211C] mt-0.5">
                          {enq.kind === 'quote'
                            ? `${enq.incoterm || 'CIF'} · ${enq.destinationPort || 'POD'}`
                            : enq.certificationsHeld || 'SNI / Halal'}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-[#2A211C]/85 bg-[#F4EFE8]/50 p-4 rounded-lg border border-[#2A211C]/10">
                      {enq.message}
                    </div>

                    {enq.attachment && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[#1A2B3D] text-white text-xs font-mono">
                        <span>
                          Attachment: <strong>{enq.attachment.fileName}</strong> (
                          {(enq.attachment.sizeBytes / 1024).toFixed(1)} KB)
                        </span>
                        <span className="text-[#F8A531]">
                          Magic Hex [{enq.attachment.magicSignatureHex}] → {enq.attachment.verifiedFormat}
                        </span>
                      </div>
                    )}

                    {/* Internal Trade Desk Notes */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <input
                        type="text"
                        value={statusNoteMap[enq.id] ?? enq.notes ?? ''}
                        onChange={(e) =>
                          setStatusNoteMap((prev) => ({ ...prev, [enq.id]: e.target.value }))
                        }
                        placeholder="Add internal trade desk / QC note..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#2A211C]/20 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleStatusChange(enq, enq.status)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2A211C] text-white text-xs font-semibold hover:bg-[#3B2418] cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC PRODUCTS MANAGER (feat/strapi-content) */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl font-bold">
                Published Bilingual Products (`/products/[slug]` & `/id/produk/[slug]`)
              </h2>
              {db.products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-[#2A211C]/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-mono text-[#8A5500]">
                      {prod.categoryCode} · HS {prod.hsCode}
                    </div>
                    <h3 className="text-base font-bold text-[#2A211C] mt-0.5">{prod.nameEn}</h3>
                    <div className="text-xs text-[#2A211C]/70">{prod.nameId}</div>
                    <div className="text-xs font-mono text-[#5E6B3A] mt-1.5">
                      EN: /products/{prod.slugEn} · ID: /id/produk/{prod.slugId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigateToProduct(prod.slugEn)}
                      className="px-3 py-1.5 rounded-lg bg-[#EB980C] text-white text-xs font-semibold hover:bg-[#d68808] cursor-pointer"
                    >
                      View Live Page
                    </button>
                    {db.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id)}
                        disabled={busyId === prod.id}
                        className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 bg-white border border-[#2A211C]/10 rounded-xl p-6">
              <div className="text-xs font-mono text-[#8A5500] mb-1">
                STRAPI COLLECTION · API::PRODUCT.PRODUCT
              </div>
              <h3 className="text-lg font-bold mb-4">Add New Commodity Product (EN & ID)</h3>

              {productSaveSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-[#5E6B3A]/15 border border-[#5E6B3A] text-xs font-semibold text-[#2A211C]">
                  {productSaveSuccess}
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">EN Slug (`/products/...`)</label>
                    <input
                      type="text"
                      value={newSlugEn}
                      onChange={(e) => setNewSlugEn(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#2A211C]/20 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">ID Slug (`/id/produk/...`)</label>
                    <input
                      type="text"
                      value={newSlugId}
                      onChange={(e) => setNewSlugId(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#2A211C]/20 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category Label</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">HS Code</label>
                    <input
                      type="text"
                      value={newHsCode}
                      onChange={(e) => setNewHsCode(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#2A211C]/20 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Product Name (English)</label>
                  <input
                    type="text"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Nama Produk (Bahasa Indonesia)</label>
                  <input
                    type="text"
                    value={newNameId}
                    onChange={(e) => setNewNameId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subtitle (English)</label>
                  <textarea
                    rows={2}
                    value={newSubtitleEn}
                    onChange={(e) => setNewSubtitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subjudul (Bahasa Indonesia)</label>
                  <textarea
                    rows={2}
                    value={newSubtitleId}
                    onChange={(e) => setNewSubtitleId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">20&apos; FCL Load</label>
                    <input
                      type="text"
                      value={newFcl20}
                      onChange={(e) => setNewFcl20(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">40&apos; FCL Load</label>
                    <input
                      type="text"
                      value={newFcl40}
                      onChange={(e) => setNewFcl40(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#2A211C]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busyId === 'create-product'}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#EB980C] hover:bg-[#d68808] text-white font-semibold cursor-pointer"
                >
                  Publish Bilingual Product to Site
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL NOTIFICATION OUTBOX */}
        {activeTab === 'outbox' && (
          <div className="bg-white border border-[#2A211C]/10 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">Resend / Strapi SMTP Notification Outbox</h2>
              <p className="text-xs text-[#2A211C]/70">
                Real-time log of all notification emails generated when a visitor submits an enquiry or when an editor updates an enquiry status.
              </p>
            </div>

            <div className="divide-y divide-[#2A211C]/10">
              {db.outbox.map((mail) => (
                <div key={mail.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8A5500]">
                      <span>{mail.enquiryRef}</span>
                      <span>·</span>
                      <span>To: {mail.to}</span>
                      <span>·</span>
                      <span>From: {mail.from}</span>
                    </div>
                    <div className="text-sm font-bold text-[#2A211C]">{mail.subject}</div>
                    <div className="text-xs text-[#2A211C]/75">{mail.previewText}</div>
                  </div>
                  <div className="text-right font-mono text-xs shrink-0">
                    <div className="text-[#5E6B3A] font-semibold">
                      {mail.provider} · {mail.status.toUpperCase()}
                    </div>
                    <div className="text-[#2A211C]/60 mt-0.5">
                      {new Date(mail.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INFRASTRUCTURE & DEPLOY HOOKS */}
        {activeTab === 'infrastructure' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-[#2A211C]/10 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Completed Architecture Items (15 Oct 2026)</h3>
              <ul className="space-y-3 text-xs text-[#2A211C]/85">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#5E6B3A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct Strapi Enquiry Route (`POST /api/enquiries/submit`):</strong> Eliminated the 4.5 MB Vercel Function limit & 503 production error. Full 10 MB PDF/JPEG/PNG/WebP magic-byte verification active.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#5E6B3A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Merged `feat/strapi-content` with Brand Logo v2:</strong> Dynamic `/products/[slug]` and `/id/produk/[slug]` routing synced with the traced Canva vector badge logo (`src/assets/brand/logo.tsx`).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#5E6B3A] shrink-0 mt-0.5" />
                  <span>
                    <strong>SEO Completion (`robots.txt`, `sitemap-index.xml`, Schema.org JSON-LD):</strong> Both `Organization` (`PT Commodex Trading Indonesia` / `ESS`) and `Product` structured data schemas embedded.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[#2A211C]/10 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Debounced Vercel Deploy Hook Log</h3>
              <div className="space-y-3">
                {db.deployLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg bg-[#F4EFE8] border border-[#2A211C]/10 text-xs font-mono space-y-1"
                  >
                    <div className="flex justify-between font-bold text-[#2A211C]">
                      <span>{log.environment.toUpperCase()}</span>
                      <span className="text-[#5E6B3A]">{log.status.toUpperCase()}</span>
                    </div>
                    <div className="font-sans text-[#2A211C]/80">{log.triggerReason}</div>
                    <div className="text-[11px] text-[#2A211C]/60">
                      Debounce: {log.debounceWindowSec}s · Token: {log.commitOrToken} ·{' '}
                      {new Date(log.triggeredAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
