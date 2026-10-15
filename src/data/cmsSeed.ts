export interface ProductSpec {
  parameterEn: string;
  parameterId: string;
  valueEn: string;
  valueId: string;
  method: string;
}

export interface CmsProduct {
  id: string;
  slugEn: string;
  slugId: string;
  order: number;
  categoryCode: string;
  hsCode: string;
  image: string;
  originEn: string;
  originId: string;
  nameEn: string;
  nameId: string;
  subtitleEn: string;
  subtitleId: string;
  summaryEn: string;
  summaryId: string;
  packagingEn: string;
  packagingId: string;
  shelfLifeEn: string;
  shelfLifeId: string;
  fcl20Mt: string;
  fcl40Mt: string;
  leadTimeDays: string;
  incoterms: string[];
  certifications: string[];
  documentsEn: string[];
  documentsId: string[];
  specs: ProductSpec[];
  publishedAt: string;
}

export interface CmsTradeLane {
  id: string;
  code: string;
  originPort: string;
  destinationCityEn: string;
  destinationCityId: string;
  countryEn: string;
  countryId: string;
  portCode: string;
  lat: number;
  lng: number;
  transitDays: string;
  frequencyEn: string;
  frequencyId: string;
  primaryCommodities: string[];
  annualVolumeMt: number;
}

export interface CmsHeroSlide {
  id: string;
  order: number;
  kickerEn: string;
  kickerId: string;
  titleLinesEn: string[];
  titleLinesId: string[];
  descriptionEn: string;
  descriptionId: string;
  ctaLabelEn: string;
  ctaLabelId: string;
  ctaHrefEn: string;
  ctaHrefId: string;
  image: string;
  metricLabelEn: string;
  metricLabelId: string;
  metricValue: string;
}

export type QuoteStatus = 'new' | 'replied' | 'closed';
export type SupplierStatus = 'pending' | 'verified' | 'rejected';

export interface CmsEnquiry {
  id: string;
  referenceCode: string;
  kind: 'quote' | 'supplier';
  status: QuoteStatus | SupplierStatus;
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
  attachment?: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    magicSignatureHex: string;
    verifiedFormat: string;
  };
  ipHash: string;
  turnstileVerified: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface EmailOutboxEntry {
  id: string;
  to: string;
  from: string;
  subject: string;
  enquiryRef: string;
  kind: 'quote' | 'supplier' | 'status_update';
  provider: 'Resend API' | 'Strapi SMTP Fallback';
  status: 'delivered' | 'logged_local';
  sentAt: string;
  previewText: string;
}

export interface WebhookDeployLog {
  id: string;
  environment: 'production (main)' | 'staging';
  triggerReason: string;
  debounceWindowSec: number;
  status: 'completed' | 'debounced_queued';
  triggeredAt: string;
  commitOrToken: string;
}

export interface CmsDatabase {
  heroSlides: CmsHeroSlide[];
  products: CmsProduct[];
  tradeLanes: CmsTradeLane[];
  enquiries: CmsEnquiry[];
  outbox: EmailOutboxEntry[];
  deployLogs: WebhookDeployLog[];
  siteConfig: {
    siteUrl: string;
    strapiVersion: string;
    astroVersion: string;
    parentEntity: string;
    legalName: string;
    directEmail: string;
    jakartaPhone: string;
    lastSyncedAt: string;
  };
}

export const INITIAL_CMS_SEED: CmsDatabase = {
  siteConfig: {
    siteUrl: 'https://commodex.id',
    strapiVersion: '5.57.0',
    astroVersion: '7.3.5',
    parentEntity: 'PT Esystem Solutions Komoditi (ESS)',
    legalName: 'PT Commodex Trading Indonesia',
    directEmail: 'info@commodex.id',
    jakartaPhone: '+62 21 5098 7420',
    lastSyncedAt: '2026-10-15T06:00:00Z',
  },
  heroSlides: [
    {
      id: 'slide-1',
      order: 1,
      kickerEn: 'PT Commodex Trading Indonesia · Part of ESS',
      kickerId: 'PT Commodex Trading Indonesia · Bagian dari ESS',
      titleLinesEn: ['Specification-Grade', 'Food Commodities,', 'Shipped on Schedule.'],
      titleLinesId: ['Komoditas Pangan', 'Sesuai Spesifikasi,', 'Dikirim Tepat Jadwal.'],
      descriptionEn:
        'Direct supply of Whole & Skim Milk Powder, Alkalized Cocoa Powder, and Fermented Indonesian Cacao Beans backed by lot-level Certificate of Analysis (COA) and container-load trade execution.',
      descriptionId:
        'Pasokan langsung Susu Bubuk Full Cream & Skim, Cokelat Bubuk Alkalized, dan Biji Kakao Fermentasi Indonesia dengan jaminan Certificate of Analysis (COA) per lot serta eksekusi pengiriman kontainer.',
      ctaLabelEn: 'Request a Quote',
      ctaLabelId: 'Minta Penawaran Harga',
      ctaHrefEn: '/contact?kind=quote',
      ctaHrefId: '/id/kontak?kind=quote',
      image: '/src/assets/images/commodex_dairy_milk_powder_1792069844578.jpg',
      metricLabelEn: 'Standard Container Allocation',
      metricLabelId: 'Alokasi Kontainer Standar',
      metricValue: '16–25 MT / FCL',
    },
    {
      id: 'slide-2',
      order: 2,
      kickerEn: 'Industrial Cocoa Processing · HS 1805 / 1806',
      kickerId: 'Olahan Kakao Industri · HS 1805 / 1806',
      titleLinesEn: ['Dutch-Processed &', 'Natural Cocoa Solids', 'for Confectionery & Dairy.'],
      titleLinesId: ['Cokelat Bubuk Alkalized', '& Natural untuk Industri', 'Konfeksioneri & Susu.'],
      descriptionEn:
        'Consistent fat content (10–12% or 22–24%), controlled pH ranges (5.4 to 8.0), and 99.5% fineness through 200-mesh sieves for beverage, bakery, and compound chocolate manufacturers.',
      descriptionId:
        'Kadar lemak presisi (10–12% atau 22–24%), rentang pH terkontrol (5,4 hingga 8,0), serta kehalusan 99,5% lolos saringan 200-mesh untuk pabrik minuman, roti, dan cokelat compound.',
      ctaLabelEn: 'Inspect Cocoa Specs',
      ctaLabelId: 'Lihat Spesifikasi Cocoa',
      ctaHrefEn: '/products/cocoa',
      ctaHrefId: '/id/produk/cocoa',
      image: '/src/assets/images/commodex_cocoa_powder_1792069846956.jpg',
      metricLabelEn: 'Fineness Mesh Standard',
      metricLabelId: 'Standar Kehalusan Mesh',
      metricValue: '99.5% < 75μm',
    },
    {
      id: 'slide-3',
      order: 3,
      kickerEn: 'Direct Origin Sulawesi & Sumatra · HS 1801.00',
      kickerId: 'Asal Langsung Sulawesi & Sumatera · HS 1801.00',
      titleLinesEn: ['Sun-Dried, Fully', 'Fermented Indonesian', 'Cacao Beans.'],
      titleLinesId: ['Biji Kakao Fermentasi', 'Pilihan dari Sentra', 'Sulawesi & Sumatera.'],
      descriptionEn:
        'SNI 2323 Grade AA & Grade A fermented beans with moisture strictly under 7.5%, cut-test verified at origin warehouses prior to phytosanitary fumigation and export stuffing.',
      descriptionId:
        'Biji kakao fermentasi standar SNI 2323 Grade AA & Grade A dengan kadar air di bawah 7,5%, terverifikasi uji belah (cut-test) di gudang asal sebelum fumigasi fitosanitari dan muat ekspor.',
      ctaLabelEn: 'Explore Cacao Origin',
      ctaLabelId: 'Telusuri Biji Cacao',
      ctaHrefEn: '/products/cacao',
      ctaHrefId: '/id/produk/cacao',
      image: '/src/assets/images/commodex_cacao_beans_1792069847495.jpg',
      metricLabelEn: 'Max Moisture Threshold',
      metricLabelId: 'Batas Maksimum Kadar Air',
      metricValue: '≤ 7.5% SNI AA',
    },
    {
      id: 'slide-4',
      order: 4,
      kickerEn: 'End-to-End Maritime Execution · 6 Active Lanes',
      kickerId: 'Eksekusi Maritim Terpadu · 6 Jalur Dagang Aktif',
      titleLinesEn: ['Transparent Trade', 'Documentation from', 'Warehouse to Port.'],
      titleLinesId: ['Dokumentasi Perdagangan', 'Transparan dari Gudang', 'Hingga Pelabuhan Tujuan.'],
      descriptionEn:
        'Full synchronization of Bill of Lading, Certificate of Origin (Form D / E / AANZ), Halal Assurance, BPOM / Health Certificates, and pre-shipment SGS / Sucofindo inspection.',
      descriptionId:
        'Sinkronisasi lengkap Bill of Lading, Surat Keterangan Asal (Form D / E / AANZ), Sertifikat Halal, BPOM / Health Certificate, serta inspeksi pra-pengapalan SGS / Sucofindo.',
      ctaLabelEn: 'View Trade Services',
      ctaLabelId: 'Lihat Layanan Dagang',
      ctaHrefEn: '/services',
      ctaHrefId: '/id/layanan',
      image: '/src/assets/images/commodex_container_port_1792069848217.jpg',
      metricLabelEn: 'On-Time Document Release',
      metricLabelId: 'Ketepatan Rilis Dokumen',
      metricValue: '99.2% Verified',
    },
  ],
  products: [
    {
      id: 'prod-milk',
      slugEn: 'milk',
      slugId: 'susu',
      order: 1,
      categoryCode: 'DAIRY SOLIDS',
      hsCode: '0402.10 / 0402.21',
      image: '/src/assets/images/commodex_dairy_milk_powder_1792069844578.jpg',
      originEn: 'New Zealand, Australia & European Union (Imported & Distributed via Indonesia Hub)',
      originId: 'Selandia Baru, Australia & Uni Eropa (Impor & Distribusi melalui Hub Indonesia)',
      nameEn: 'Whole & Skim Milk Powder (WMP / SMP)',
      nameId: 'Susu Bubuk Full Cream & Skim (WMP / SMP)',
      subtitleEn: 'Spray-dried instant & regular dairy solids for industrial food, beverage, and bakery formulations.',
      subtitleId: 'Padatan susu spray-dried instan & reguler untuk formulasi industri makanan, minuman, dan bakery.',
      summaryEn:
        'Supplied in 25 kg multi-wall kraft bags with inner polyethylene food-grade liners. Every production batch is verified for solubility index, titratable acidity, scorched particles (ADPI Disc A), and microbiological compliance.',
      summaryId:
        'Dikemas dalam karung kertas kraft berlapis 25 kg dengan inner liner polietilena food-grade. Setiap batch produksi diverifikasi indeks kelarutan, keasaman tertitrasi, partikel hangus (ADPI Disc A), dan kepatuhan mikrobiologi.',
      packagingEn: '25 kg multi-wall kraft paper bag with 75-micron food-grade PE inner liner',
      packagingId: 'Karung kertas kraft multi-lapis 25 kg dengan inner liner PE food-grade 75 mikron',
      shelfLifeEn: '18–24 months from production date when stored below 25°C and <65% RH',
      shelfLifeId: '18–24 bulan sejak tanggal produksi pada penyimpanan di bawah 25°C dan kelembapan <65% RH',
      fcl20Mt: '16.0 – 17.5 MT (Palletized / Unpalletized)',
      fcl40Mt: '25.0 MT (High Cube Dry Container)',
      leadTimeDays: '14–21 Days ex-Port Loading',
      incoterms: ['FOB', 'CIF', 'CFR', 'DDP Jakarta/Surabaya'],
      certifications: ['ISO 22000 / FSSC 22000', 'Halal Recognized (MUI / IFANCA / NZIDT)', 'BPOM RI ML Registered', 'Veterinary Health Certificate'],
      documentsEn: [
        'Batch Certificate of Analysis (COA)',
        'Veterinary Health & Free Sale Certificate',
        'Halal Certificate (MUI Recognized)',
        'Certificate of Origin (AANZFTA / Form AANZ)',
        'Full Clean on Board Bill of Lading & Packing List',
      ],
      documentsId: [
        'Certificate of Analysis (COA) per Batch',
        'Sertifikat Kesehatan Veteriner & Free Sale',
        'Sertifikat Halal (Diakui BPJPH / MUI)',
        'Surat Keterangan Asal (AANZFTA / Form AANZ)',
        'Bill of Lading Clean on Board & Packing List',
      ],
      specs: [
        { parameterEn: 'Milk Fat (WMP / SMP)', parameterId: 'Lemak Susu (WMP / SMP)', valueEn: 'Min. 26.0% (WMP) / Max. 1.25% (SMP)', valueId: 'Min. 26,0% (WMP) / Maks. 1,25% (SMP)', method: 'ISO 1736' },
        { parameterEn: 'Protein (on SNF basis)', parameterId: 'Protein (basis SNF)', valueEn: 'Min. 34.0%', valueId: 'Min. 34,0%', method: 'ISO 8968-1' },
        { parameterEn: 'Moisture Content', parameterId: 'Kadar Air', valueEn: 'Max. 3.5% (WMP) / Max. 4.0% (SMP)', valueId: 'Maks. 3,5% (WMP) / Maks. 4,0% (SMP)', method: 'IDF 26A' },
        { parameterEn: 'Titratable Acidity', parameterId: 'Keasaman Tertitrasi', valueEn: 'Max. 0.15% (as lactic acid)', valueId: 'Maks. 0,15% (sebagai asam laktat)', method: 'ADPI Standard' },
        { parameterEn: 'Scorched Particles', parameterId: 'Partikel Hangus (Scorched)', valueEn: 'Disc A (7.5 mg max)', valueId: 'Disc A (maks. 7,5 mg)', method: 'ADPI 916' },
        { parameterEn: 'Total Plate Count (TPC)', parameterId: 'Angka Lempeng Total (ALT)', valueEn: '< 10,000 CFU/g', valueId: '< 10.000 CFU/g', method: 'ISO 4833' },
        { parameterEn: 'Salmonella / Cronobacter', parameterId: 'Salmonella / Cronobacter', valueEn: 'Absent in 25g / 375g', valueId: 'Negatif per 25g / 375g', method: 'ISO 6579' },
      ],
      publishedAt: '2026-10-15T00:00:00Z',
    },
    {
      id: 'prod-cocoa',
      slugEn: 'cocoa',
      slugId: 'cocoa',
      order: 2,
      categoryCode: 'PROCESSED COCOA',
      hsCode: '1805.00.00',
      image: '/src/assets/images/commodex_cocoa_powder_1792069846956.jpg',
      originEn: 'Indonesia (Java & Sulawesi Grinding Facilities)',
      originId: 'Indonesia (Fasilitas Grinding Jawa & Sulawesi)',
      nameEn: 'Alkalized & Natural Cocoa Powder',
      nameId: 'Cokelat Bubuk Alkalized & Natural',
      subtitleEn: 'High-fat (22–24%) and standard-fat (10–12%) cocoa powders engineered for color stability and rich flavor release.',
      subtitleId: 'Bubuk kakao lemak tinggi (22–24%) dan standar (10–12%) dengan stabilitas warna dan profil rasa pekat.',
      summaryEn:
        'Milled from selected Indonesian and blended West African cocoa cake under FSSC 22000 protocols. Available in Natural (pH 5.2–5.8), Light/Medium Alkalized (pH 6.8–7.4), and Dark/Red Dutch-processed grades (pH 7.4–8.2).',
      summaryId:
        'Digiling dari bungkil kakao (cocoa cake) pilihan Indonesia dan campuran Afrika Barat dengan standar FSSC 22000. Tersedia dalam varian Natural (pH 5,2–5,8), Light/Medium Alkalized (pH 6,8–7,4), dan Dark/Red Dutch-processed (pH 7,4–8,2).',
      packagingEn: '25 kg 4-ply kraft bag with heat-sealed PE inner bag, palletized 40 bags/pallet',
      packagingId: 'Karung kraft 4-lapis 25 kg dengan inner bag PE heat-sealed, 40 karung/palet',
      shelfLifeEn: '24 months from manufacture date in cool, dry storage (18–24°C)',
      shelfLifeId: '24 bulan dari tanggal produksi di gudang sejuk dan kering (18–24°C)',
      fcl20Mt: '15.0 MT (Palletized) / 18.0 MT (Floor Loaded)',
      fcl40Mt: '25.0 MT (Palletized) / 26.5 MT (Floor Loaded)',
      leadTimeDays: '10–14 Days ex-Tanjung Priok / Tanjung Perak',
      incoterms: ['FOB Jakarta/Surabaya', 'CIF', 'CFR', 'FCA Warehouse'],
      certifications: ['FSSC 22000', 'MUI Halal Certified', 'Kosher Pareve', 'Rainforest Alliance (Optional MB)', 'SNI 3747'],
      documentsEn: [
        'Lot-Specific Certificate of Analysis (COA)',
        'Halal Certificate (BPJPH / MUI)',
        'Phytosanitary / Fumigation Certificate (Methyl Bromide / Phosphine)',
        'Certificate of Origin (Form D / Form E / EUR.1)',
        'Heavy Metals & Ochratoxin A Lab Report',
      ],
      documentsId: [
        'Certificate of Analysis (COA) Spesifik per Lot',
        'Sertifikat Halal (BPJPH / MUI)',
        'Sertifikat Fitosanitari & Fumigasi (Methyl Bromide / Phosphine)',
        'Surat Keterangan Asal (Form D / Form E / EUR.1)',
        'Laporan Uji Logam Berat & Ochratoxin A',
      ],
      specs: [
        { parameterEn: 'Cocoa Butter Content', parameterId: 'Kadar Lemak Kakao', valueEn: '10.0 – 12.0% (Standard) / 22.0 – 24.0% (High Fat)', valueId: '10,0 – 12,0% (Standar) / 22,0 – 24,0% (High Fat)', method: 'IOCCC 37' },
        { parameterEn: 'pH Value (10% Suspension)', parameterId: 'Nilai pH (Suspensi 10%)', valueEn: '5.2–5.8 (Nat) / 6.8–7.4 (Med) / 7.5–8.2 (Dark)', valueId: '5,2–5,8 (Nat) / 6,8–7,4 (Med) / 7,5–8,2 (Dark)', method: 'IOCCC 15' },
        { parameterEn: 'Fineness (200 Mesh / 75μm)', parameterId: 'Kehalusan (200 Mesh / 75μm)', valueEn: 'Min. 99.5% passing through', valueId: 'Min. 99,5% lolos ayakan', method: 'IOCCC 38' },
        { parameterEn: 'Moisture Content', parameterId: 'Kadar Air', valueEn: 'Max. 5.0%', valueId: 'Maks. 5,0%', method: 'IOCCC 26' },
        { parameterEn: 'Ash Content (on fat-free dry)', parameterId: 'Kadar Abu (bebas lemak kering)', valueEn: 'Max. 8.0% (Nat) / Max. 12.0% (Alkalized)', valueId: 'Maks. 8,0% (Nat) / Maks. 12,0% (Alkalized)', method: 'AOAC 972.15' },
        { parameterEn: 'Total Plate Count', parameterId: 'Angka Lempeng Total', valueEn: 'Max. 5,000 CFU/g', valueId: 'Maks. 5.000 CFU/g', method: 'BAM Ch. 3' },
        { parameterEn: 'Cadmium (Cd) Level', parameterId: 'Kadar Kadmium (Cd)', valueEn: '< 0.60 mg/kg (EU Regulation Compliant)', valueId: '< 0,60 mg/kg (Sesuai Regulasi Eropa)', method: 'ICP-MS' },
      ],
      publishedAt: '2026-10-15T00:00:00Z',
    },
    {
      id: 'prod-cacao',
      slugEn: 'cacao',
      slugId: 'cacao',
      order: 3,
      categoryCode: 'RAW ORIGIN BEANS',
      hsCode: '1801.00.10',
      image: '/src/assets/images/commodex_cacao_beans_1792069847495.jpg',
      originEn: 'Sulawesi (Luwu, Kolaka), West Sumatra & Bali, Indonesia',
      originId: 'Sulawesi (Luwu, Kolaka), Sumatera Barat & Bali, Indonesia',
      nameEn: 'Fermented Indonesian Cacao Beans (SNI Grade AA / A)',
      nameId: 'Biji Kakao Fermentasi Indonesia (SNI Grade AA / A)',
      subtitleEn: 'Traceable wooden-box fermented whole cacao beans for specialty chocolatiers, cocoa liquor pressers, and global grinders.',
      subtitleId: 'Biji kakao utuh fermentasi kotak kayu terlacak untuk produsen cokelat spesialti, cocoa liquor, dan grinder global.',
      summaryEn:
        'Sourced directly from cooperative fermentation stations in Sulawesi and Sumatra. Cured for 5–6 days in tiered hardwood boxes and sun-dried to ≤7.5% moisture for low astringency, high cocoa butter yield, and clean flavor precursors.',
      summaryId:
        'Bersumber langsung dari stasiun fermentasi koperasi di Sulawesi dan Sumatera. Difermentasi selama 5–6 hari di kotak kayu bertingkat dan dijemur matahari hingga kadar air ≤7,5% untuk menghasilkan lemak kakao tinggi dan aroma bersih.',
      packagingEn: '62.5 kg food-grade Hydrocarbon-Free Jute Bags (votado) with Craft Paper container lining',
      packagingId: 'Karung goni food-grade bebas hidrokarbon 62,5 kg dengan pelapis kertas kraft di kontainer',
      shelfLifeEn: '12–18 months in ventilated ambient dry warehouse (<70% RH)',
      shelfLifeId: '12–18 bulan di gudang kering berventilasi baik (kelembapan <70% RH)',
      fcl20Mt: '12.5 – 15.0 MT (200–240 Jute Bags in Ventilated/Dry Container)',
      fcl40Mt: '25.0 MT (400 Jute Bags with Kraft Paper & Desiccant Dry Bags)',
      leadTimeDays: '14–18 Days ex-Makassar / Surabaya Port',
      incoterms: ['FOB Makassar', 'FOB Surabaya', 'CIF Rotterdam / Singapore / Tokyo'],
      certifications: ['SNI 2323:2008 Grade AA / A', 'Indonesian Quarantine Barantin Phytosanitary', 'EUDR Polygon Geolocation Traceable', 'Rainforest Alliance (Selected Lots)'],
      documentsEn: [
        'Cut-Test & Bean Count Grading Certificate (SNI 2323)',
        'Phytosanitary Certificate (Indonesian Agricultural Quarantine)',
        'Fumigation Certificate (24–48h Phosphine Exposure)',
        'EUDR Farm Polygon GeoJSON Traceability Dossier',
        'Weight & Quality Certificate by Independent Surveyor (Sucofindo / SGS)',
      ],
      documentsId: [
        'Sertifikat Uji Belah (Cut-Test) & Hitung Biji (SNI 2323)',
        'Sertifikat Fitosanitari (Badan Karantina Indonesia / Barantin)',
        'Sertifikat Fumigasi (Paparan Fosfin 24–48 Jam)',
        'Dokumen ketertelusuran poligon kebun EUDR (GeoJSON)',
        'Sertifikat Berat & Mutu Surveyor Independen (Sucofindo / SGS)',
      ],
      specs: [
        { parameterEn: 'Bean Count per 100g', parameterId: 'Jumlah Biji per 100g', valueEn: 'Max. 85 beans (Grade AA) / 86–100 beans (Grade A)', valueId: 'Maks. 85 biji (Grade AA) / 86–100 biji (Grade A)', method: 'SNI 2323 / ISO 2451' },
        { parameterEn: 'Moisture Content', parameterId: 'Kadar Air', valueEn: 'Max. 7.5% at stuffing', valueId: 'Maks. 7,5% saat pemuatan', method: 'ISO 2291' },
        { parameterEn: 'Fermentation Index (Cut Test)', parameterId: 'Tingkat Fermentasi (Uji Belah)', valueEn: 'Min. 82% fully brown fissured cotyledons', valueId: 'Min. 82% kotiledon cokelat berongga penuh', method: 'ISO 1114' },
        { parameterEn: 'Slaty / Unfermented Beans', parameterId: 'Biji Slaty (Tidak Terfermentasi)', valueEn: 'Max. 3.0% by count', valueId: 'Maks. 3,0% berdasarkan jumlah', method: 'SNI 2323' },
        { parameterEn: 'Moldy / Insect Damaged Beans', parameterId: 'Biji Berjamur / Berserangga', valueEn: 'Max. 1.5% moldy / Max. 1.0% insect', valueId: 'Maks. 1,5% berjamur / Maks. 1,0% serangga', method: 'SNI 2323' },
        { parameterEn: 'Waste & Foreign Matter', parameterId: 'Kadar Sampah & Benda Asing', valueEn: 'Max. 1.5% by weight', valueId: 'Maks. 1,5% berdasarkan berat', method: 'FCC Rules' },
        { parameterEn: 'Free Fatty Acids (FFA)', parameterId: 'Asam Lemak Bebas (FFA)', valueEn: 'Max. 1.25% (as oleic acid in cocoa butter)', valueId: 'Maks. 1,25% (sebagai asam oleat)', method: 'IOCCC 42' },
      ],
      publishedAt: '2026-10-15T00:00:00Z',
    },
  ],
  tradeLanes: [
    {
      id: 'lane-sg',
      code: 'SGSIN',
      originPort: 'IDJKT (Tanjung Priok) / IDSUB (Surabaya)',
      destinationCityEn: 'Singapore',
      destinationCityId: 'Singapura',
      countryEn: 'Singapore',
      countryId: 'Singapura',
      portCode: 'SGSIN — Tuas / Pasir Panjang',
      lat: 1.29,
      lng: 103.85,
      transitDays: '2–4 Days',
      frequencyEn: 'Daily Feeder Vessels',
      frequencyId: 'Kapal Feeder Harian',
      primaryCommodities: ['Alkalized Cocoa Powder', 'Whole Milk Powder', 'Fermented Cacao'],
      annualVolumeMt: 3400,
    },
    {
      id: 'lane-nl',
      code: 'NLRTM',
      originPort: 'IDMAK (Makassar) / IDSUB (Surabaya)',
      destinationCityEn: 'Rotterdam',
      destinationCityId: 'Rotterdam',
      countryEn: 'Netherlands (EU Hub)',
      countryId: 'Belanda (Hub Eropa)',
      portCode: 'NLRTM — Port of Rotterdam',
      lat: 51.92,
      lng: 4.47,
      transitDays: '24–28 Days',
      frequencyEn: 'Weekly Mainline Service',
      frequencyId: 'Pelayaran Mainline Mingguan',
      primaryCommodities: ['SNI AA Fermented Cacao Beans', 'High-Fat Cocoa Powder'],
      annualVolumeMt: 2850,
    },
    {
      id: 'lane-cn',
      code: 'CNSHA',
      originPort: 'IDSUB (Surabaya) / IDJKT (Jakarta)',
      destinationCityEn: 'Shanghai',
      destinationCityId: 'Shanghai',
      countryEn: 'China',
      countryId: 'Tiongkok',
      portCode: 'CNSHA — Yangshan Deepwater',
      lat: 31.23,
      lng: 121.47,
      transitDays: '9–12 Days',
      frequencyEn: 'Twice Weekly Direct',
      frequencyId: '2x Seminggu Pelayaran Langsung',
      primaryCommodities: ['Dark Alkalized Cocoa Powder', 'Natural Cocoa Solids'],
      annualVolumeMt: 4100,
    },
    {
      id: 'lane-ae',
      code: 'AEJEA',
      originPort: 'IDJKT (Jakarta) / IDSUB (Surabaya)',
      destinationCityEn: 'Dubai (Jebel Ali)',
      destinationCityId: 'Dubai (Jebel Ali)',
      countryEn: 'United Arab Emirates',
      countryId: 'Uni Emirat Arab',
      portCode: 'AEJEA — Jebel Ali Port',
      lat: 25.01,
      lng: 55.06,
      transitDays: '13–16 Days',
      frequencyEn: 'Weekly Gulf Express',
      frequencyId: 'Ekspres Teluk Mingguan',
      primaryCommodities: ['Halal Certified Cocoa Powder', 'Skim Milk Powder'],
      annualVolumeMt: 1950,
    },
    {
      id: 'lane-au',
      code: 'AUMEL',
      originPort: 'AUMEL / NZAKL ↔ IDJKT / IDSUB',
      destinationCityEn: 'Melbourne & Auckland',
      destinationCityId: 'Melbourne & Auckland',
      countryEn: 'Australia & New Zealand',
      countryId: 'Australia & Selandia Baru',
      transitDays: '10–14 Days',
      portCode: 'AUMEL / NZAKL Bidirectional',
      lat: -37.81,
      lng: 144.96,
      frequencyEn: 'Bi-Weekly Oceania Loop',
      frequencyId: 'Rute Oseania Dua Mingguan',
      primaryCommodities: ['Origin Dairy WMP/SMP Import', 'Indonesian Cacao Export'],
      annualVolumeMt: 3200,
    },
    {
      id: 'lane-jp',
      code: 'JPTYO',
      originPort: 'IDMAK (Makassar) / IDSUB (Surabaya)',
      destinationCityEn: 'Tokyo & Yokohama',
      destinationCityId: 'Tokyo & Yokohama',
      countryEn: 'Japan',
      countryId: 'Jepang',
      portCode: 'JPTYO / JPYOK',
      lat: 35.67,
      lng: 139.65,
      transitDays: '11–14 Days',
      frequencyEn: 'Weekly North Asia Direct',
      frequencyId: 'Langsung Asia Utara Mingguan',
      primaryCommodities: ['Specialty Sulawesi Fermented Cacao', 'Low-Cadmium Cocoa'],
      annualVolumeMt: 1620,
    },
  ],
  enquiries: [
    {
      id: 'enq-2026-001',
      referenceCode: 'CMDX-Q-261014-882',
      kind: 'quote',
      status: 'new',
      locale: 'en',
      companyName: 'Helvetia Confectionery Manufacturing Pte Ltd',
      contactName: 'Marcus Vance',
      email: 'm.vance@helvetiaconfect.sg',
      phone: '+65 6812 4490',
      country: 'Singapore',
      commodity: 'Alkalized & Natural Cocoa Powder (10–12% Fat, pH 7.2)',
      volumeMt: '50 MT (2x 40ft FCL per month)',
      incoterm: 'CIF Singapore (SGSIN)',
      destinationPort: 'SGSIN — Pasir Panjang',
      message: 'We require 2x40FCL monthly allocation of Medium Alkalized Cocoa Powder starting Q4 2026. Attached is our QA raw material specification sheet (PDF) requiring <0.5 mg/kg Cadmium and MUI/MUIS Halal compliance.',
      attachment: {
        fileName: 'Helvetia_QA_Spec_Cocoa_2026.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 428190,
        magicSignatureHex: '25 50 44 46 2D',
        verifiedFormat: 'PDF Document (%PDF-)',
      },
      ipHash: 'sha256:9f2c...8a1b',
      turnstileVerified: true,
      createdAt: '2026-10-14T09:24:00Z',
      updatedAt: '2026-10-14T09:24:00Z',
      notes: 'Spec sheet matches Surabaya grinding line Grade D-11. Ready for CIF quote.',
    },
    {
      id: 'enq-2026-002',
      referenceCode: 'CMDX-S-261013-519',
      kind: 'supplier',
      status: 'pending',
      locale: 'id',
      companyName: 'Koperasi Kakao Lestari Luwu Utara',
      contactName: 'H. Andi Makkasau',
      email: 'pengurus@kakaolestariluwu.co.id',
      phone: '+62 811 4429 810',
      country: 'Indonesia',
      commodity: 'Fermented Indonesian Cacao Beans (SNI 2323 Grade AA)',
      volumeMt: '75 MT / Bulan (Panen Raya)',
      certificationsHeld: 'SNI 2323:2008, Poligon EUDR 420 Kebun, Barantin Ready',
      message: 'Kami memiliki 3 unit rumah fermentasi kotak kayu di Masamba dengan kapasitas 75 MT per bulan biji kakao kering kadar air 7,0%. Melampirkan hasil uji lab Sucofindo Makassar (PDF).',
      attachment: {
        fileName: 'COA_Sucofindo_LuwuUtara_Oct2026.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 892400,
        magicSignatureHex: '25 50 44 46 2D',
        verifiedFormat: 'PDF Document (%PDF-)',
      },
      ipHash: 'sha256:3c11...e409',
      turnstileVerified: true,
      createdAt: '2026-10-13T14:15:00Z',
      updatedAt: '2026-10-13T14:15:00Z',
      notes: 'Jadwalkan audit gudang Makassar minggu depan oleh tim QC ESS.',
    },
    {
      id: 'enq-2026-003',
      referenceCode: 'CMDX-Q-261010-304',
      kind: 'quote',
      status: 'replied',
      locale: 'id',
      companyName: 'PT Tirta Pangan Nusantara Tbk',
      contactName: 'Ratna Pramudita',
      email: 'procurement@tirtapangan.co.id',
      phone: '+62 21 8901 2388',
      country: 'Indonesia',
      commodity: 'Whole & Skim Milk Powder (WMP 26% Fat)',
      volumeMt: '34 MT (2x 20ft FCL)',
      incoterm: 'DDP Cikarang Plant',
      destinationPort: 'IDJKT — Tanjung Priok',
      message: 'Mohon penawaran kontrak kuartalan untuk WMP asal New Zealand dengan sertifikat Halal dan BPOM ML aktif untuk pabrik minuman RTD kami di Cikarang.',
      ipHash: 'sha256:7d8a...110f',
      turnstileVerified: true,
      createdAt: '2026-10-10T04:50:00Z',
      updatedAt: '2026-10-11T08:12:00Z',
      notes: 'Penawaran resmi dikirim via email oleh meja dagang Jakarta.',
    },
  ],
  outbox: [
    {
      id: 'mail-101',
      to: 'info@commodex.id',
      from: 'notifications@commodex.id',
      subject: '[Commodex Quote] CMDX-Q-261014-882 — Helvetia Confectionery Manufacturing Pte Ltd (50 MT)',
      enquiryRef: 'CMDX-Q-261014-882',
      kind: 'quote',
      provider: 'Resend API',
      status: 'delivered',
      sentAt: '2026-10-14T09:24:02Z',
      previewText: 'New buyer quote request for Alkalized & Natural Cocoa Powder (50 MT CIF Singapore). Magic-byte verified PDF attached.',
    },
    {
      id: 'mail-102',
      to: 'info@commodex.id',
      from: 'notifications@commodex.id',
      subject: '[Commodex Supplier] CMDX-S-261013-519 — Koperasi Kakao Lestari Luwu Utara (75 MT/Bulan)',
      enquiryRef: 'CMDX-S-261013-519',
      kind: 'supplier',
      provider: 'Resend API',
      status: 'delivered',
      sentAt: '2026-10-13T14:15:03Z',
      previewText: 'Aplikasi supplier baru untuk Biji Kakao Fermentasi SNI Grade AA (Sulawesi). Lampiran COA Sucofindo terverifikasi.',
    },
  ],
  deployLogs: [
    {
      id: 'dep-01',
      environment: 'production (main)',
      triggerReason: 'Strapi Webhook: Published Product specs & Trade Lanes (EN/ID)',
      debounceWindowSec: 180,
      status: 'completed',
      triggeredAt: '2026-10-15T05:45:00Z',
      commitOrToken: 'hook_vercel_prod_9a81f',
    },
  ],
};
