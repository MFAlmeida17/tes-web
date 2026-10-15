import React, { useEffect, useMemo, useState } from 'react';
import { CommodexLogo, EssGroupEmblem } from './assets/brand/logo';
import {
  CmsDatabase,
  CmsEnquiry,
  CmsProduct,
  CmsTradeLane,
  INITIAL_CMS_SEED,
} from './data/cmsSeed';
import { detectLocaleFromPath, Locale, translatePath } from './i18n/routes';
import { TradeLanesMap } from './components/TradeLanesMap';
import { EnquirySection } from './components/EnquirySection';
import { CmsAdminPortal } from './components/CmsAdminPortal';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Download,
  FileCheck,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return p === '' ? '/' : p;
  });
  const [db, setDb] = useState<CmsDatabase>(INITIAL_CMS_SEED);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [activeHowStep, setActiveHowStep] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [enquiryPrefill, setEnquiryPrefill] = useState<{
    kind: 'quote' | 'supplier';
    commodity?: string;
    destination?: string;
  }>({ kind: 'quote' });

  const locale: Locale = useMemo(() => detectLocaleFromPath(currentPath), [currentPath]);
  const isId = locale === 'id';

  useEffect(() => {
    fetch('/api/cms/bootstrap')
      .then((r) => r.json())
      .then((data: CmsDatabase) => {
        if (data && Array.isArray(data.products)) {
          setDb(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (toPath: string) => {
    window.history.pushState({}, '', toPath);
    setCurrentPath(toPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchLanguage = (targetLocale: Locale) => {
    document.cookie = `lang=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
    const slugs = db.products.map((p) => ({ slugEn: p.slugEn, slugId: p.slugId }));
    const nextPath = translatePath(currentPath, targetLocale, slugs);
    navigate(nextPath);
  };

  const routeView = useMemo(() => {
    const p = currentPath.split('?')[0];
    if (p === '/' || p === '/id') return { page: 'home' as const };
    if (p === '/products' || p === '/id/produk') return { page: 'products' as const };
    if (p.startsWith('/products/')) {
      const slug = p.replace('/products/', '');
      const prod = db.products.find((item) => item.slugEn === slug || item.slugId === slug);
      return prod
        ? { page: 'product-detail' as const, product: prod }
        : { page: '404' as const };
    }
    if (p.startsWith('/id/produk/')) {
      const slug = p.replace('/id/produk/', '');
      const prod = db.products.find((item) => item.slugId === slug || item.slugEn === slug);
      return prod
        ? { page: 'product-detail' as const, product: prod }
        : { page: '404' as const };
    }
    if (p === '/services' || p === '/id/layanan') return { page: 'services' as const };
    if (p === '/about' || p === '/id/tentang') return { page: 'about' as const };
    if (p === '/contact' || p === '/id/kontak') return { page: 'contact' as const };
    if (p === '/privacy' || p === '/id/privasi') return { page: 'privacy' as const };
    if (p === '/terms' || p === '/id/ketentuan') return { page: 'terms' as const };
    if (p === '/brand-guidelines') return { page: 'brand-guidelines' as const };
    if (p === '/cms') return { page: 'cms' as const };
    return { page: '404' as const };
  }, [currentPath, db.products]);

  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.lang = locale;

    const existingProductSchema = document.getElementById('schema-product-jsonld');
    if (existingProductSchema) {
      existingProductSchema.remove();
    }

    if (routeView.page === 'product-detail' && routeView.product) {
      const prod = routeView.product;
      const title = isId
        ? `${prod.nameId} — Spesifikasi & Pengapalan | Commodex`
        : `${prod.nameEn} — Specifications & Export | Commodex`;
      document.title = title;

      const script = document.createElement('script');
      script.id = 'schema-product-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: isId ? prod.nameId : prod.nameEn,
        description: isId ? prod.summaryId : prod.summaryEn,
        sku: prod.id,
        mpn: prod.hsCode,
        category: prod.categoryCode,
        brand: {
          '@type': 'Brand',
          name: 'Commodex (PT Commodex Trading Indonesia)',
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'PT Commodex Trading Indonesia — Part of ESS',
        },
      });
      document.head.appendChild(script);
    } else {
      document.title = isId
        ? 'Commodex — Perdagangan Komoditas Pangan Global (Susu, Cocoa & Cacao)'
        : 'Commodex — Global Food Commodity Trading (Dairy, Cocoa & Cacao)';
    }
  }, [routeView, locale, isId]);

  const handleDownloadSpecSheet = (prod: CmsProduct) => {
    const lines = [
      `====================================================================`,
      `PT COMMODEX TRADING INDONESIA (PART OF ESS — PT ESYSTEM SOLUTIONS KOMODITI)`,
      `TECHNICAL SPECIFICATION SHEET · ${prod.categoryCode} · HS CODE: ${prod.hsCode}`,
      `====================================================================`,
      ``,
      `Product (EN): ${prod.nameEn}`,
      `Produk (ID) : ${prod.nameId}`,
      `Origin      : ${isId ? prod.originId : prod.originEn}`,
      `Packaging   : ${isId ? prod.packagingId : prod.packagingEn}`,
      `Shelf Life  : ${isId ? prod.shelfLifeId : prod.shelfLifeEn}`,
      `20' FCL     : ${prod.fcl20Mt}`,
      `40' FCL     : ${prod.fcl40Mt}`,
      `Incoterms   : ${prod.incoterms.join(', ')}`,
      ``,
      `--------------------------------------------------------------------`,
      `ANALYTICAL & MICROBIOLOGICAL PARAMETERS`,
      `--------------------------------------------------------------------`,
      ...prod.specs.map(
        (s) =>
          `- ${(isId ? s.parameterId : s.parameterEn).padEnd(34, ' ')} : ${(isId ? s.valueId : s.valueEn).padEnd(38, ' ')} [${s.method}]`
      ),
      ``,
      `--------------------------------------------------------------------`,
      `STANDARD EXPORT DOCUMENTATION INCLUDED`,
      `--------------------------------------------------------------------`,
      ...(isId ? prod.documentsId : prod.documentsEn).map((d, i) => `${i + 1}. ${d}`),
      ``,
      `Direct Trade Desk: info@commodex.id | https://commodex.id`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Commodex_SpecSheet_${prod.slugEn.toUpperCase()}_2026.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const slides = db.heroSlides;
  const currentSlide = slides[activeSlideIdx] || slides[0];

  const howSteps = [
    {
      num: '01',
      titleEn: '01. Specification Alignment & Lab Sampling',
      titleId: '01. Penyelarasan Spesifikasi & Sampel Lab',
      bodyEn:
        'We match your QA parameters—fat percentage, pH, mesh fineness, scorched particle disc, and microbiological limits—and dispatch 500g–1kg pre-shipment counter-samples accompanied by a lot-specific Certificate of Analysis (COA).',
      bodyId:
        'Kami mencocokkan parameter QA pabrik Anda—kadar lemak, pH, kehalusan mesh, partikel hangus, serta batas mikrobiologi—lalu mengirimkan sampel 500g–1kg beserta Certificate of Analysis (COA) spesifik per lot.',
      deliverableEn: 'Batch COA + 1kg Sealed Counter-Sample via DHL/FedEx',
      deliverableId: 'COA per Batch + 1kg Sampel Tersegel via Kurir Ekspres',
    },
    {
      num: '02',
      titleEn: '02. Origin Allocation & Independent Audit',
      titleId: '02. Alokasi Gudang Asal & Inspeksi Independen',
      bodyEn:
        'Once the sample is approved, we lock production or origin warehouse lots in Sulawesi, Java, or Oceania. Independent surveyors (SGS / Sucofindo) verify moisture, bean count, and net weight prior to container stuffing.',
      bodyId:
        'Setelah sampel disetujui, kami mengunci alokasi lot produksi di Sulawesi, Jawa, atau Oseania. Surveyor independen (SGS / Sucofindo) memverifikasi kadar air, jumlah biji, dan berat bersih sebelum pemuatan kontainer.',
      deliverableEn: 'SGS / Sucofindo Pre-Shipment Weight & Quality Report',
      deliverableId: 'Laporan Mutu & Berat Pra-Pengapalan SGS / Sucofindo',
    },
    {
      num: '03',
      titleEn: '03. Trade Structuring & Regulatory Clearance',
      titleId: '03. Penataan Pembiayaan & Dokumen Regulasi',
      bodyEn:
        'Backed by PT Esystem Solutions Komoditi (ESS), we execute contracts under irrevocable LC at sight, CAD, or TT terms while compiling Halal (MUI/BPJPH), Phytosanitary, Veterinary Health, and Form D/E/AANZ Certificates of Origin.',
      bodyId:
        'Didukung penuh oleh PT Esystem Solutions Komoditi (ESS), kami mengeksekusi kontrak dengan skema LC, CAD, atau TT sembari melengkapi Sertifikat Halal, Fitosanitari, Kesehatan Veteriner, dan SKA Form D/E/AANZ.',
      deliverableEn: 'Complete Export Dossier + EUDR GeoJSON Traceability',
      deliverableId: 'Berkas Ekspor Lengkap + Poligon Ketertelusuran EUDR',
    },
    {
      num: '04',
      titleEn: '04. Container Stuffing & Scheduled Port Delivery',
      titleId: '04. Pemuatan Kontainer & Pengiriman Tepat Jadwal',
      bodyEn:
        'Food-grade containers are lined with kraft paper and fitted with calcium chloride desiccant poles before sealing. Original Clean on Board Bills of Lading are released promptly for zero-demurrage customs clearance at your destination port.',
      bodyId:
        'Kontainer food-grade dilapisi kertas kraft dan dipasang desikan pengering sebelum disegel. Bill of Lading Clean on Board dirilis tepat waktu guna mencegah biaya demurrage di pelabuhan tujuan Anda.',
      deliverableEn: 'Full Clean on Board B/L + Container Seal Photo Report',
      deliverableId: 'Bill of Lading Clean on Board + Foto Segel Kontainer',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE8] text-[#2A211C]">
      <header className="sticky top-0 z-50 bg-[#26160E]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href={isId ? '/id' : '/'}
            onClick={(e) => {
              e.preventDefault();
              navigate(isId ? '/id' : '/');
            }}
            className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Commod<span className="text-[#E6930F]">Ex</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#E9E1D5]/85">
            <a
              href={isId ? '/id/produk' : '/products'}
              onClick={(e) => {
                e.preventDefault();
                navigate(isId ? '/id/produk' : '/products');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                routeView.page === 'products' || routeView.page === 'product-detail'
                  ? 'border-[#EB980C] text-white'
                  : 'border-transparent'
              }`}
            >
              {isId ? 'Produk' : 'Products'}
            </a>
            <a
              href={isId ? '/id/layanan' : '/services'}
              onClick={(e) => {
                e.preventDefault();
                navigate(isId ? '/id/layanan' : '/services');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                routeView.page === 'services'
                  ? 'border-[#EB980C] text-white'
                  : 'border-transparent'
              }`}
            >
              {isId ? 'Layanan' : 'Services'}
            </a>
            <a
              href={isId ? '/id/tentang' : '/about'}
              onClick={(e) => {
                e.preventDefault();
                navigate(isId ? '/id/tentang' : '/about');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                routeView.page === 'about'
                  ? 'border-[#EB980C] text-white'
                  : 'border-transparent'
              }`}
            >
              {isId ? 'Tentang' : 'About'}
            </a>
            <a
              href={isId ? '/id/kontak' : '/contact'}
              onClick={(e) => {
                e.preventDefault();
                navigate(isId ? '/id/kontak' : '/contact');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                routeView.page === 'contact'
                  ? 'border-[#EB980C] text-white'
                  : 'border-transparent'
              }`}
            >
              {isId ? 'Kontak' : 'Contact'}
            </a>
            <a
              href="/cms"
              onClick={(e) => {
                e.preventDefault();
                navigate('/cms');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                routeView.page === 'cms'
                  ? 'border-[#F8A531] text-[#F8A531]'
                  : 'border-transparent text-[#F8A531]/90'
              }`}
            >
              CMS Studio
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setEnquiryPrefill({ kind: 'quote' });
                navigate(isId ? '/id/kontak' : '/contact');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#EB980C] hover:bg-[#d68808] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isId ? 'Minta Penawaran' : 'Request Quote'}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#3B2418] text-[#E9E1D5] border-b border-white/10 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#E9E1D5]/80">
            <span className="font-semibold text-white">PT Commodex Trading Indonesia</span>
            <span aria-hidden="true">·</span>
            <span>Part of ESS (PT Esystem Solutions Komoditi)</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span className="hidden sm:inline font-mono text-[#F8A531]">
              HS 0402 Dairy · HS 1805 Cocoa · HS 1801 Cacao
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex md:hidden items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => navigate(isId ? '/id/produk' : '/products')}
                className="hover:text-white cursor-pointer"
              >
                {isId ? 'Produk' : 'Products'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cms')}
                className="text-[#F8A531] font-semibold cursor-pointer"
              >
                CMS ({db.enquiries.length})
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#26160E] p-0.5 rounded-md border border-white/10">
              <button
                type="button"
                onClick={() => switchLanguage('en')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  locale === 'en'
                    ? 'bg-[#EB980C] text-white'
                    : 'text-[#E9E1D5]/70 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => switchLanguage('id')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  locale === 'id'
                    ? 'bg-[#EB980C] text-white'
                    : 'text-[#E9E1D5]/70 hover:text-white'
                }`}
              >
                ID
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {routeView.page === 'home' && (
          <div>
            <section className="bg-[#26160E] text-white pt-10 pb-16 px-6 border-b border-white/10">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between py-2">
                    <div>
                      <div className="text-xs font-mono text-[#F8A531] tracking-wide mb-4">
                        {isId ? currentSlide.kickerId : currentSlide.kickerEn}
                      </div>

                      <h1
                        className="font-bold tracking-tight text-white headline-balance leading-[1.08]"
                        style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)' }}
                      >
                        {(isId ? currentSlide.titleLinesId : currentSlide.titleLinesEn).map(
                          (line, idx) => (
                            <span key={idx} className="block">
                              {line}
                            </span>
                          )
                        )}
                      </h1>

                      <p className="mt-6 text-base md:text-lg text-[#E9E1D5]/85 leading-relaxed max-w-2xl">
                        {isId ? currentSlide.descriptionId : currentSlide.descriptionEn}
                      </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const target = isId
                              ? currentSlide.ctaHrefId
                              : currentSlide.ctaHrefEn;
                            if (target.includes('kontak') || target.includes('contact')) {
                              setEnquiryPrefill({ kind: 'quote' });
                              navigate(isId ? '/id/kontak' : '/contact');
                            } else {
                              navigate(target);
                            }
                          }}
                          className="px-6 py-3.5 bg-[#EB980C] hover:bg-[#d68808] text-white font-semibold text-sm rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                          <span>{isId ? currentSlide.ctaLabelId : currentSlide.ctaLabelEn}</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(isId ? '/id/produk' : '/products')}
                          className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isId ? 'Katalog & Lembar Spesifikasi' : 'Browse Spec Sheets'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {slides.map((s, idx) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveSlideIdx(idx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              idx === activeSlideIdx
                                ? 'w-8 bg-[#EB980C]'
                                : 'w-2.5 bg-white/25 hover:bg-white/50'
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col">
                    <div className="relative rounded-xl overflow-hidden border border-white/15 bg-[#3B2418] flex-1 min-h-[320px]">
                      <img
                        src={currentSlide.image}
                        alt={
                          isId
                            ? currentSlide.titleLinesId.join(' ')
                            : currentSlide.titleLinesEn.join(' ')
                        }
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono text-[#F8A531]">
                            {isId ? currentSlide.metricLabelId : currentSlide.metricLabelEn}
                          </div>
                          <div className="text-2xl font-mono font-bold text-white tabular-nums mt-0.5">
                            {currentSlide.metricValue}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSlideIdx(
                                (prev) => (prev - 1 + slides.length) % slides.length
                              )
                            }
                            className="p-2 rounded-lg bg-black/50 hover:bg-black/75 text-white border border-white/15 cursor-pointer"
                            aria-label="Previous slide"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSlideIdx((prev) => (prev + 1) % slides.length)
                            }
                            className="p-2 rounded-lg bg-black/50 hover:bg-black/75 text-white border border-white/15 cursor-pointer"
                            aria-label="Next slide"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Komoditas Inti Terverifikasi' : 'Core Verified Commodities'}
                    </div>
                    <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">
                      {db.products.length} {isId ? 'Lini Komoditas' : 'Active Lines'}
                    </div>
                    <div className="text-xs text-[#F8A531] mt-0.5">
                      WMP/SMP · Cocoa Powder · Fermented Cacao
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Jalur Pengapalan Reguler' : 'Scheduled Maritime Lanes'}
                    </div>
                    <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">
                      6 {isId ? 'Koridor Global' : 'Global Corridors'}
                    </div>
                    <div className="text-xs text-[#E9E1D5]/70 mt-0.5">
                      SGSIN · NLRTM · CNSHA · AEJEA · AUMEL · JPTYO
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Kepatuhan Mutu & Pangan' : 'Quality & Food Safety'}
                    </div>
                    <div className="text-xl font-mono font-bold text-white mt-1">
                      ISO 22000 · SNI · Halal
                    </div>
                    <div className="text-xs text-[#E9E1D5]/70 mt-0.5">
                      {isId ? 'Verifikasi SGS / Sucofindo per Lot' : 'Lot-level SGS / Sucofindo COA'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Afiliasi Grup Korporat' : 'Corporate Group Backing'}
                    </div>
                    <div className="text-xl font-mono font-bold text-[#F8A531] mt-1">
                      Part of ESS
                    </div>
                    <div className="text-xs text-[#E9E1D5]/70 mt-0.5">
                      PT Esystem Solutions Komoditi
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 px-6 bg-[#F4EFE8] border-b border-[#2A211C]/10">
              <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl mb-12">
                  <div className="text-xs font-mono font-semibold text-[#8A5500] mb-2">
                    {isId
                      ? '01. TANTANGAN PENGADAAN KOMODITAS PANGAN'
                      : '01. WHY TRADITIONAL COMMODITY SOURCING BREAKS'}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2A211C] headline-balance">
                    {isId
                      ? 'Menghilangkan Ketidaksesuaian Spesifikasi dan Keterlambatan Dokumen Pelabuhan'
                      : 'Eliminating Specification Drift and Port Documentation Bottlenecks'}
                  </h2>
                  <p className="text-base text-[#2A211C]/80 mt-3 leading-relaxed">
                    {isId
                      ? 'Pabrik pengolahan makanan dan minuman sering menghadapi perbedaan antara sampel awal dan barang yang tiba di pelabuhan. Commodex menutup celah tersebut dengan pengawasan mutu di titik asal.'
                      : 'Industrial food and beverage manufacturers frequently suffer from variance between pre-shipment samples and actual container arrivals. Commodex bridges origin grading and port execution.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#2A211C]/10 rounded-xl p-7 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#8A5500] font-semibold">
                        01. SPECIFICATION CONSISTENCY
                      </div>
                      <h3 className="text-xl font-bold text-[#2A211C] mt-2">
                        {isId
                          ? 'Kesesuaian Sampel vs Pengiriman Kontainer'
                          : 'Zero Drift Between Sample and FCL Arrival'}
                      </h3>
                      <p className="text-sm text-[#2A211C]/80 mt-3 leading-relaxed">
                        {isId
                          ? 'Setiap lot susu bubuk, cokelat bubuk, dan biji kakao dikunci berdasarkan parameter laboratorium (lemak, pH, kadar air, mikrobiologi) sebelum kontainer disegel.'
                          : 'Every dairy, cocoa powder, and cacao bean lot is locked against laboratory parameters prior to container sealing.'}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#2A211C]/10 text-xs font-mono text-[#5E6B3A] font-semibold">
                      {isId ? 'Standar: Uji SGS / Sucofindo Pra-Muat' : 'Standard: Pre-Stuffing SGS / Sucofindo Audit'}
                    </div>
                  </div>

                  <div className="bg-white border border-[#2A211C]/10 rounded-xl p-7 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#8A5500] font-semibold">
                        02. REGULATORY & CUSTOMS PRECISION
                      </div>
                      <h3 className="text-xl font-bold text-[#2A211C] mt-2">
                        {isId
                          ? 'Sinkronisasi Dokumen Karantina, Halal & Bea Cukai'
                          : 'Synchronized Quarantine, Halal & Customs Dossiers'}
                      </h3>
                      <p className="text-sm text-[#2A211C]/80 mt-3 leading-relaxed">
                        {isId
                          ? 'Kesalahan kecil pada HS Code, SKA Form D/E/AANZ, atau sertifikat Fitosanitari dapat menahan kontainer berminggu-minggu. Tim kami memvalidasi draf dokumen sebelum kapal berangkat.'
                          : 'Minor discrepancies in HS Codes, Form D/E/AANZ Certificates of Origin, or Phytosanitary papers trigger costly port detention. We pre-clear every document draft before vessel departure.'}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#2A211C]/10 text-xs font-mono text-[#5E6B3A] font-semibold">
                      {isId ? '99,2% Dokumen Rilis Sebelum ETA' : '99.2% Document Release Prior to Vessel ETA'}
                    </div>
                  </div>

                  <div className="bg-white border border-[#2A211C]/10 rounded-xl p-7 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#8A5500] font-semibold">
                        03. DIRECT ORIGIN TRACEABILITY
                      </div>
                      <h3 className="text-xl font-bold text-[#2A211C] mt-2">
                        {isId
                          ? 'Rantai Pasok Terlacak dari Sentra Produksi'
                          : 'Traceable Allocation from Grinding & Fermentation Hubs'}
                      </h3>
                      <p className="text-sm text-[#2A211C]/80 mt-3 leading-relaxed">
                        {isId
                          ? 'Dengan akses langsung ke unit fermentasi di Sulawesi/Sumatera dan pabrik olahan kakao di Jawa, kami menyediakan visibilitas penuh termasuk poligon kebun EUDR.'
                          : 'With direct operational links to Sulawesi/Sumatra fermentation stations and Java grinding plants, we provide complete lot traceability including EUDR farm polygon data.'}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#2A211C]/10 text-xs font-mono text-[#5E6B3A] font-semibold">
                      {isId ? 'Siap Regulasi EUDR & FSSC 22000' : 'EUDR Polygon & FSSC 22000 Compliant'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <TradeLanesMap
              lanes={db.tradeLanes}
              locale={locale}
              onRequestQuoteForLane={(lane: CmsTradeLane) => {
                setEnquiryPrefill({
                  kind: 'quote',
                  commodity: lane.primaryCommodities[0] || '',
                  destination: `${lane.code} — ${isId ? lane.destinationCityId : lane.destinationCityEn}`,
                });
                navigate(isId ? '/id/kontak' : '/contact');
              }}
            />
          </div>
        )}

        {routeView.page === 'products' && (
          <div>
            <section className="bg-[#26160E] text-white py-16 px-6 border-b border-white/10">
              <div className="max-w-7xl mx-auto">
                <div className="text-xs font-mono text-[#F8A531] mb-2">
                  {isId ? 'KATALOG KOMODITAS & LEMBAR SPESIFIKASI' : 'COMMODITY CATALOG & TECHNICAL SPEC SHEETS'}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white headline-balance">
                  {isId
                    ? 'Bahan Baku Pangan Industri dengan Parameter Mutu Terverifikasi'
                    : 'Specification-Grade Food Commodities Backed by Batch COA'}
                </h1>
              </div>
            </section>

            <section className="py-16 px-6 max-w-7xl mx-auto space-y-10">
              {db.products.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="bg-white border border-[#2A211C]/10 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                >
                  <div className="lg:col-span-5 relative min-h-[260px] bg-[#3B2418]">
                    <img
                      src={prod.image}
                      alt={isId ? prod.nameId : prod.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#26160E]/90 text-[#F8A531] px-3 py-1 rounded text-xs font-mono font-semibold">
                      0{idx + 1} · {prod.categoryCode} · HS {prod.hsCode}
                    </div>
                  </div>

                  <div className="lg:col-span-7 p-8 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#8A5500]">
                        {isId ? 'Asal: ' : 'Origin: '}
                        {isId ? prod.originId : prod.originEn}
                      </div>
                      <h2 className="text-2xl font-bold text-[#2A211C] mt-1">
                        {isId ? prod.nameId : prod.nameEn}
                      </h2>
                      <p className="text-sm text-[#2A211C]/80 mt-2 leading-relaxed">
                        {isId ? prod.summaryId : prod.summaryEn}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#2A211C]/10 text-xs">
                        <div>
                          <div className="text-[#2A211C]/60">{isId ? 'Muatan 20ft FCL' : '20ft FCL Load'}</div>
                          <div className="font-mono font-semibold text-[#2A211C] mt-0.5 tabular-nums">
                            {prod.fcl20Mt}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#2A211C]/60">{isId ? 'Muatan 40ft FCL' : '40ft FCL Load'}</div>
                          <div className="font-mono font-semibold text-[#2A211C] mt-0.5 tabular-nums">
                            {prod.fcl40Mt}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#2A211C]/60">Incoterms</div>
                          <div className="font-mono font-semibold text-[#8A5500] mt-0.5">
                            {prod.incoterms.join(' · ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-5 border-t border-[#2A211C]/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(isId ? `/id/produk/${prod.slugId}` : `/products/${prod.slugEn}`)
                          }
                          className="px-5 py-2.5 rounded-lg bg-[#EB980C] hover:bg-[#d68808] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>{isId ? 'Buka Tabel Spesifikasi Lengkap' : 'View Full Technical Spec'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSpecSheet(prod)}
                          className="px-4 py-2.5 rounded-lg bg-[#F4EFE8] hover:bg-[#E9E1D5] text-[#2A211C] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-[#8A5500]" />
                          <span>{isId ? 'Unduh Spec Sheet' : 'Download Spec Sheet'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEnquiryPrefill({
                            kind: 'quote',
                            commodity: isId ? prod.nameId : prod.nameEn,
                          });
                          navigate(isId ? '/id/kontak' : '/contact');
                        }}
                        className="text-xs font-semibold text-[#8A5500] hover:underline cursor-pointer"
                      >
                        {isId ? 'Minta Penawaran Komoditas Ini →' : 'Request Quote for This Line →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {routeView.page === 'product-detail' && routeView.product && (
          <div>
            <section className="bg-[#26160E] text-white py-14 px-6 border-b border-white/10">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-xs font-mono text-[#E9E1D5]/70 mb-4">
                  <button
                    type="button"
                    onClick={() => navigate(isId ? '/id/produk' : '/products')}
                    className="hover:text-white cursor-pointer"
                  >
                    {isId ? '← Katalog Produk' : '← All Commodities'}
                  </button>
                  <span>/</span>
                  <span className="text-[#F8A531]">{routeView.product.categoryCode}</span>
                  <span>·</span>
                  <span>HS {routeView.product.hsCode}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white headline-balance">
                        {isId ? routeView.product.nameId : routeView.product.nameEn}
                      </h1>
                      <p className="text-base text-[#E9E1D5]/85 mt-4 leading-relaxed">
                        {isId ? routeView.product.summaryId : routeView.product.summaryEn}
                      </p>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#3B2418] p-5 rounded-xl border border-white/10">
                        <div>
                          <div className="text-[#E9E1D5]/60">{isId ? 'Sentra Asal (Origin)' : 'Origin & Processing Hub'}</div>
                          <div className="font-semibold text-white mt-1">
                            {isId ? routeView.product.originId : routeView.product.originEn}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#E9E1D5]/60">{isId ? 'Kemasan Ekspor' : 'Export Packaging Standard'}</div>
                          <div className="font-semibold text-white mt-1">
                            {isId ? routeView.product.packagingId : routeView.product.packagingEn}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#E9E1D5]/60">{isId ? 'Umur Simpan (Shelf Life)' : 'Shelf Life & Storage'}</div>
                          <div className="font-semibold text-white mt-1">
                            {isId ? routeView.product.shelfLifeId : routeView.product.shelfLifeEn}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#E9E1D5]/60">{isId ? 'Waktu Tunggu Pengapalan' : 'Standard Lead Time'}</div>
                          <div className="font-mono font-semibold text-[#F8A531] mt-1">
                            {routeView.product.leadTimeDays}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEnquiryPrefill({
                            kind: 'quote',
                            commodity: isId ? routeView.product.nameId : routeView.product.nameEn,
                          });
                          navigate(isId ? '/id/kontak' : '/contact');
                        }}
                        className="px-6 py-3 bg-[#EB980C] hover:bg-[#d68808] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>{isId ? 'Minta Penawaran & Sampel Lot' : 'Request Quote & Counter-Sample'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSpecSheet(routeView.product)}
                        className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#F8A531]" />
                        <span>{isId ? 'Unduh Lembar Spesifikasi' : 'Download Spec Sheet'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-xl overflow-hidden border border-white/15 h-full min-h-[280px] bg-[#3B2418]">
                      <img
                        src={routeView.product.image}
                        alt={isId ? routeView.product.nameId : routeView.product.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-16 px-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white border border-[#2A211C]/10 rounded-xl p-8">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="text-xs font-mono text-[#8A5500] font-semibold">
                        CERTIFICATE OF ANALYSIS (COA) STANDARD
                      </div>
                      <h2 className="text-2xl font-bold text-[#2A211C]">
                        {isId
                          ? 'Parameter Fisik, Kimia & Mikrobiologi'
                          : 'Physical, Chemical & Microbiological Specifications'}
                      </h2>
                    </div>
                    <FileSpreadsheet className="w-6 h-6 text-[#EB980C] shrink-0" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#2A211C]/15 text-xs font-mono text-[#2A211C]/65">
                          <th className="py-3 pr-4">{isId ? 'PARAMETER UJI' : 'ANALYTICAL PARAMETER'}</th>
                          <th className="py-3 px-4">{isId ? 'SPESIFIKASI STANDAR' : 'SPECIFICATION LIMIT'}</th>
                          <th className="py-3 pl-4 text-right">{isId ? 'METODE UJI' : 'TEST METHOD'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A211C]/10">
                        {routeView.product.specs.map((spec, idx) => (
                          <tr key={idx} className="hover:bg-[#F4EFE8]/60">
                            <td className="py-3.5 pr-4 font-semibold text-[#2A211C]">
                              {isId ? spec.parameterId : spec.parameterEn}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-[#2A211C] tabular-nums">
                              {isId ? spec.valueId : spec.valueEn}
                            </td>
                            <td className="py-3.5 pl-4 text-right font-mono text-xs text-[#8A5500]">
                              {spec.method}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#1A2B3D] text-white rounded-xl p-6 border border-white/10">
                    <div className="text-xs font-mono text-[#F8A531] mb-1">CONTAINER LOADING & LOGISTICS</div>
                    <h3 className="text-lg font-bold">{isId ? 'Kapasitas Muat Kontainer' : 'FCL Stuffing Configuration'}</h3>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-[#E9E1D5]/65">20&apos; Dry Container (FCL)</div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5 tabular-nums">
                          {routeView.product.fcl20Mt}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-[#E9E1D5]/65">40&apos; High Cube Container (FCL)</div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5 tabular-nums">
                          {routeView.product.fcl40Mt}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#2A211C]/10 rounded-xl p-6">
                    <div className="text-xs font-mono text-[#8A5500] font-semibold mb-1">SHIPPING DOSSIER</div>
                    <h3 className="text-lg font-bold text-[#2A211C]">{isId ? 'Dokumen Pengapalan Standar' : 'Included Export Documentation'}</h3>
                    <ul className="mt-4 space-y-2.5 text-xs text-[#2A211C]/85">
                      {(isId ? routeView.product.documentsId : routeView.product.documentsEn).map((doc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-[#5E6B3A] shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {routeView.page === 'services' && (
          <div>
            <section className="bg-[#26160E] text-white py-16 px-6 border-b border-white/10">
              <div className="max-w-7xl mx-auto">
                <div className="text-xs font-mono text-[#F8A531] mb-2">{isId ? 'LAYANAN PERDAGANGAN' : 'TRADE EXECUTION SERVICES'}</div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white headline-balance">
                  {isId ? 'Pengadaan, Kendali Mutu & Logistik Maritim Terpadu' : 'Origin Sourcing, Quality Control & Maritime Execution'}
                </h1>
              </div>
            </section>

            <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-[#2A211C]/10 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-[#2A211C]">01. Origin Sourcing & Grading</h3>
                  <p className="text-sm text-[#2A211C]/80 mt-2 leading-relaxed">
                    Direct allocation of dairy solids, cocoa powder, and fermented cacao from processing facilities in Java, Sulawesi, and Oceania.
                  </p>
                </div>
                <div className="bg-white border border-[#2A211C]/10 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-[#2A211C]">02. Surveyor Lab Inspection</h3>
                  <p className="text-sm text-[#2A211C]/80 mt-2 leading-relaxed">
                    Pre-shipment verification of chemical, physical, and microbiological limits by independent surveyors (SGS / Sucofindo).
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {routeView.page === 'about' && (
          <div>
            <section className="bg-[#26160E] text-white py-16 px-6 border-b border-white/10">
              <div className="max-w-7xl mx-auto">
                <div className="text-xs font-mono text-[#F8A531] mb-2">{isId ? 'PROFIL KORPORAT' : 'CORPORATE PROFILE'}</div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white headline-balance">
                  PT Commodex Trading Indonesia
                </h1>
              </div>
            </section>

            <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
              <div className="bg-white border border-[#2A211C]/10 rounded-xl p-8">
                <EssGroupEmblem />
                <p className="text-sm text-[#2A211C]/85 mt-6 leading-relaxed">
                  PT Commodex Trading Indonesia is the specialized food commodity trading arm of ESS (PT Esystem Solutions Komoditi). We bridge Indonesian origin processing hubs and global industrial food manufacturers with laboratory verification and structured trade execution.
                </p>
              </div>
            </section>
          </div>
        )}

        {routeView.page === 'contact' && (
          <div>
            <section className="bg-[#26160E] text-white py-14 px-6 border-b border-white/10">
              <div className="max-w-7xl mx-auto">
                <div className="text-xs font-mono text-[#F8A531] mb-2">{isId ? 'HUBUNGI MEJA PERDAGANGAN' : 'CONTACT TRADE DESK'}</div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white headline-balance">
                  {isId ? 'Minta Penawaran Harga atau Daftar Sebagai Pemasok' : 'Request a Container Quote or Register as an Origin Supplier'}
                </h1>
              </div>
            </section>

            <EnquirySection
              locale={locale}
              products={db.products}
              initialKind={enquiryPrefill.kind}
              prefilledCommodity={enquiryPrefill.commodity}
              prefilledDestination={enquiryPrefill.destination}
              onEnquirySubmitted={(newEnquiry: CmsEnquiry) => {
                setDb((prev) => ({
                  ...prev,
                  enquiries: [newEnquiry, ...prev.enquiries],
                }));
              }}
            />
          </div>
        )}

        {routeView.page === 'brand-guidelines' && (
          <div className="py-16 px-6 max-w-7xl mx-auto space-y-12">
            <div className="bg-[#1A2B3D] text-white rounded-xl p-8 border border-white/10">
              <div className="text-xs font-mono text-[#F8A531] mb-2">INTERNAL BRAND GUIDELINES</div>
              <h1 className="text-3xl font-bold">Commodex Visual Identity & Design Token System</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#26160E] text-white rounded-xl p-8 border border-white/10 space-y-4">
                <div className="text-xs font-mono text-[#F8A531]">VARIANT 1: FULL BADGE</div>
                <div className="py-6 flex items-center justify-center bg-[#1A2B3D]/60 rounded-lg border border-white/10">
                  <CommodexLogo variant="full" />
                </div>
              </div>

              <div className="bg-white text-[#2A211C] rounded-xl p-8 border border-[#2A211C]/10 space-y-4">
                <div className="text-xs font-mono text-[#8A5500]">VARIANT 2: WORDMARK</div>
                <div className="py-6 flex items-center justify-center bg-[#F4EFE8] rounded-lg border border-[#2A211C]/10">
                  <CommodexLogo variant="word" theme="light" className="text-3xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {routeView.page === 'cms' && (
          <CmsAdminPortal
            db={db}
            onRefreshDb={(updatedDb) => setDb(updatedDb)}
            onNavigateToProduct={(slugEn) => navigate(`/products/${slugEn}`)}
          />
        )}

        {routeView.page === '404' && (
          <div className="py-24 px-6 max-w-2xl mx-auto text-center space-y-5">
            <div className="text-xs font-mono text-[#8A5500]">HTTP 404 · ROUTE NOT FOUND</div>
            <h1 className="text-4xl font-bold text-[#2A211C]">
              {isId ? 'Halaman Tidak Ditemukan' : 'Page Not Found'}
            </h1>
            <button
              type="button"
              onClick={() => navigate(isId ? '/id' : '/')}
              className="px-5 py-2.5 rounded-lg bg-[#EB980C] text-white text-xs font-semibold cursor-pointer"
            >
              {isId ? 'Kembali ke Beranda' : 'Return to Home'}
            </button>
          </div>
        )}
      </main>

      <footer className="bg-[#26160E] text-[#E9E1D5] border-t border-white/10 py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <CommodexLogo variant="full" />
            <p className="text-xs text-[#E9E1D5]/75 max-w-sm leading-relaxed">
              PT Commodex Trading Indonesia · Part of ESS (PT Esystem Solutions Komoditi).
            </p>
            <div className="text-xs font-mono text-[#F8A531]">info@commodex.id</div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs">
            <div className="font-mono font-semibold text-white uppercase">{isId ? 'Komoditas' : 'Commodities'}</div>
            <ul className="space-y-2 text-[#E9E1D5]/75">
              {db.products.map((prod) => (
                <li key={prod.id}>
                  <a
                    href={isId ? `/id/produk/${prod.slugId}` : `/products/${prod.slugEn}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(isId ? `/id/produk/${prod.slugId}` : `/products/${prod.slugEn}`);
                    }}
                    className="hover:text-white"
                  >
                    {isId ? prod.nameId : prod.nameEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-xs">
            <div className="font-mono font-semibold text-white uppercase">{isId ? 'Navigasi' : 'Navigation'}</div>
            <div className="grid grid-cols-2 gap-2 text-[#E9E1D5]/75">
              <a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-white font-mono text-[#F8A531]">
                robots.txt
              </a>
              <a href="/sitemap-index.xml" target="_blank" rel="noreferrer" className="hover:text-white font-mono text-[#F8A531]">
                sitemap-index.xml
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#E9E1D5]/60">
          <div>© {new Date().getFullYear()} PT Commodex Trading Indonesia · Part of ESS. All rights reserved.</div>
          <button type="button" onClick={() => switchLanguage(isId ? 'en' : 'id')} className="hover:text-white cursor-pointer">
            {isId ? 'Switch to English (EN)' : 'Ganti ke Bahasa Indonesia (ID)'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
