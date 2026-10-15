import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { checkRateLimit, verifyTurnstileToken } from './src/server/guard';
import {
  createEnquiryRecord,
  deleteProductRecord,
  getCmsDatabase,
  resetCmsDatabaseToSeed,
  triggerVercelDeployHook,
  updateEnquiryStatus,
  upsertProductRecord,
  upsertTradeLaneRecord,
} from './src/server/store';
import { EnquiryPayloadInput, validateEnquiryPayload } from './src/server/validate';
import { CmsProduct, CmsTradeLane, QuoteStatus, SupplierStatus } from './src/data/cmsSeed';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 15MB limit to support 10MB attachments + metadata overhead
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // SEO: /robots.txt
  app.get('/robots.txt', (_req, res) => {
    const siteUrl = process.env.SITE_URL || 'https://commodex.id';
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /brand-guidelines',
      'Disallow: /cms',
      'Disallow: /404',
      'Disallow: /id/404',
      '',
      `Sitemap: ${siteUrl}/sitemap-index.xml`,
    ].join('\n');
    res.type('text/plain').send(robots);
  });

  // SEO: /sitemap-index.xml
  app.get('/sitemap-index.xml', (_req, res) => {
    const siteUrl = process.env.SITE_URL || 'https://commodex.id';
    const db = getCmsDatabase();
    const staticPairs = [
      { en: '/', id: '/id' },
      { en: '/products', id: '/id/produk' },
      { en: '/services', id: '/id/layanan' },
      { en: '/about', id: '/id/tentang' },
      { en: '/contact', id: '/id/kontak' },
      { en: '/privacy', id: '/id/privasi' },
      { en: '/terms', id: '/id/ketentuan' },
    ];
    const productPairs = db.products.map((p) => ({
      en: `/products/${p.slugEn}`,
      id: `/id/produk/${p.slugId}`,
    }));
    const allPairs = [...staticPairs, ...productPairs];

    const urlsXml = allPairs
      .map(
        (pair) => `
  <url>
    <loc>${siteUrl}${pair.en}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${pair.en}"/>
    <xhtml:link rel="alternate" hreflang="id" href="${siteUrl}${pair.id}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${pair.en}"/>
    <lastmod>${db.siteConfig.lastSyncedAt}</lastmod>
  </url>
  <url>
    <loc>${siteUrl}${pair.id}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${pair.en}"/>
    <xhtml:link rel="alternate" hreflang="id" href="${siteUrl}${pair.id}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${pair.en}"/>
    <lastmod>${db.siteConfig.lastSyncedAt}</lastmod>
  </url>`
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urlsXml}
</urlset>`;

    res.type('application/xml').send(xml);
  });

  // CMS Bootstrap: returns full Strapi content
  app.get('/api/cms/bootstrap', (_req, res) => {
    const db = getCmsDatabase();
    res.json(db);
  });

  // Direct Strapi Enquiry Endpoint
  const handleEnquirySubmit: express.RequestHandler = async (req, res) => {
    try {
      const payload = req.body as EnquiryPayloadInput & { turnstileToken?: string };

      // Honeypot check
      if (payload.website && payload.website.trim().length > 0) {
        res.status(200).json({
          ok: true,
          honeypotTriggered: true,
          referenceCode: 'CMDX-BOT-IGNORED',
          message: 'Submission received.',
        });
        return;
      }

      // Rate limit check
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';
      const rateStatus = checkRateLimit(clientIp);
      if (!rateStatus.allowed) {
        res.status(429).json({
          ok: false,
          error:
            payload.locale === 'id'
              ? `Terlalu banyak pengiriman (maks 5 per 10 menit). Coba lagi dalam ${rateStatus.resetInSeconds} detik.`
              : `Rate limit exceeded (max 5 submissions per 10 minutes). Try again in ${rateStatus.resetInSeconds}s.`,
        });
        return;
      }

      // Turnstile check
      const turnstileOk = await verifyTurnstileToken(payload.turnstileToken);
      if (!turnstileOk) {
        res.status(403).json({
          ok: false,
          error:
            payload.locale === 'id'
              ? 'Verifikasi anti-bot Cloudflare Turnstile gagal.'
              : 'Cloudflare Turnstile anti-bot verification failed.',
        });
        return;
      }

      // Field & Magic Bytes Validation
      const validation = validateEnquiryPayload(payload);
      if (!validation.valid) {
        res.status(422).json({
          ok: false,
          errors: validation.errors,
        });
        return;
      }

      const ipHash =
        'sha256:' + crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 10);
      const initialStatus: QuoteStatus | SupplierStatus =
        payload.kind === 'quote' ? 'new' : 'pending';

      const toEmail = process.env.ENQUIRY_TO || 'info@commodex.id';
      const fromEmail = process.env.ENQUIRY_FROM || 'notifications@commodex.id';

      const { enquiry, mail } = createEnquiryRecord(
        {
          kind: payload.kind,
          status: initialStatus,
          locale: payload.locale || 'en',
          companyName: payload.companyName.trim(),
          contactName: payload.contactName.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          country: payload.country.trim(),
          commodity: payload.commodity.trim(),
          volumeMt: payload.volumeMt.trim(),
          incoterm: payload.incoterm?.trim(),
          destinationPort: payload.destinationPort?.trim(),
          certificationsHeld: payload.certificationsHeld?.trim(),
          message: payload.message.trim(),
          attachment:
            payload.attachmentName && validation.magicResult
              ? {
                  fileName: payload.attachmentName,
                  mimeType: payload.attachmentMime || 'application/octet-stream',
                  sizeBytes: payload.attachmentSize || 0,
                  magicSignatureHex: validation.magicResult.magicSignatureHex,
                  verifiedFormat: validation.magicResult.detectedFormat,
                }
              : undefined,
          ipHash,
          turnstileVerified: true,
        },
        {
          to: toEmail,
          from: fromEmail,
          subject: `[Commodex ${payload.kind === 'quote' ? 'Quote' : 'Supplier'}] ${payload.companyName.trim()} (${payload.volumeMt.trim()})`,
          kind: payload.kind,
          provider: process.env.RESEND_API_KEY ? 'Resend API' : 'Strapi SMTP Fallback',
          status: process.env.RESEND_API_KEY ? 'delivered' : 'logged_local',
          previewText: `${payload.contactName} (${payload.email}) submitted a ${payload.kind} enquiry for ${payload.commodity} — Volume: ${payload.volumeMt}.`,
        }
      );

      res.status(201).json({
        ok: true,
        enquiry,
        mail,
        rateLimitRemaining: rateStatus.remaining,
      });
    } catch (err) {
      console.error('Enquiry submission error:', err);
      res.status(500).json({
        ok: false,
        error: 'Internal server error while processing enquiry.',
      });
    }
  };

  app.post('/api/enquiries/submit', handleEnquirySubmit);
  app.post('/api/enquiry', handleEnquirySubmit);

  // Update Status
  app.patch('/api/enquiries/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body as {
      status: QuoteStatus | SupplierStatus;
      notes?: string;
    };
    const updated = updateEnquiryStatus(id, status, notes);
    if (!updated) {
      res.status(404).json({ ok: false, error: 'Enquiry not found' });
      return;
    }
    res.json({ ok: true, enquiry: updated, db: getCmsDatabase() });
  });

  // Dynamic Products
  app.post('/api/cms/products', (req, res) => {
    const product = req.body as CmsProduct;
    if (!product.slugEn || !product.nameEn) {
      res.status(400).json({ ok: false, error: 'slugEn and nameEn are required.' });
      return;
    }
    const saved = upsertProductRecord(product);
    res.json({ ok: true, product: saved, db: getCmsDatabase() });
  });

  app.delete('/api/cms/products/:id', (req, res) => {
    const deleted = deleteProductRecord(req.params.id);
    res.json({ ok: deleted, db: getCmsDatabase() });
  });

  // Trade Lanes
  app.post('/api/cms/lanes', (req, res) => {
    const lane = req.body as CmsTradeLane;
    if (!lane.code || !lane.destinationCityEn) {
      res.status(400).json({ ok: false, error: 'code and destinationCityEn are required.' });
      return;
    }
    const saved = upsertTradeLaneRecord(lane);
    res.json({ ok: true, lane: saved, db: getCmsDatabase() });
  });

  // Deploy Webhook
  app.post('/api/cms/webhooks/deploy', (req, res) => {
    const { environment, triggerReason } = req.body as {
      environment?: 'production (main)' | 'staging';
      triggerReason?: string;
    };
    const log = triggerVercelDeployHook(
      environment || 'production (main)',
      triggerReason || 'Manual Publish from Strapi Admin Panel'
    );
    res.json({ ok: true, log, db: getCmsDatabase() });
  });

  // Reset to Seed
  app.post('/api/cms/seed', (_req, res) => {
    const db = resetCmsDatabaseToSeed();
    res.json({ ok: true, db });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Commodex Full-Stack Server & Strapi CMS API running on http://localhost:${PORT}`);
  });
}

startServer();
