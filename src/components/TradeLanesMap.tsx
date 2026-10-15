import React, { useState } from 'react';
import { CmsTradeLane } from '../data/cmsSeed';
import { Locale } from '../i18n/routes';
import { ArrowUpRight, PackageCheck, Ship } from 'lucide-react';

interface TradeLanesMapProps {
  lanes: CmsTradeLane[];
  locale: Locale;
  onRequestQuoteForLane: (lane: CmsTradeLane) => void;
}

function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const minLng = -15;
  const maxLng = 165;
  const minLat = -45;
  const maxLat = 65;

  const x = ((lng - minLng) / (maxLng - minLng)) * 780 + 50;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 390 + 35;
  return {
    x: Math.max(40, Math.min(840, x)),
    y: Math.max(30, Math.min(430, y)),
  };
}

const LAND_CLUSTERS: Array<{ latMin: number; latMax: number; lngMin: number; lngMax: number }> = [
  { latMin: 38, latMax: 58, lngMin: -8, lngMax: 28 },
  { latMin: 15, latMax: 36, lngMin: 35, lngMax: 60 },
  { latMin: 8, latMax: 32, lngMin: 68, lngMax: 90 },
  { latMin: 20, latMax: 48, lngMin: 95, lngMax: 123 },
  { latMin: 31, latMax: 43, lngMin: 130, lngMax: 142 },
  { latMin: 1, latMax: 21, lngMin: 97, lngMax: 109 },
  { latMin: -9, latMax: 5, lngMin: 95, lngMax: 141 },
  { latMin: 6, latMax: 18, lngMin: 120, lngMax: 126 },
  { latMin: -39, latMax: -13, lngMin: 114, lngMax: 153 },
  { latMin: -43, latMax: -35, lngMin: 168, lngMax: 176 },
  { latMin: -5, latMax: 32, lngMin: 10, lngMax: 48 },
];

function generateDottedLandPoints(): Array<{ x: number; y: number; isIndonesia: boolean }> {
  const points: Array<{ x: number; y: number; isIndonesia: boolean }> = [];
  for (let lat = -42; lat <= 60; lat += 3) {
    for (let lng = -10; lng <= 162; lng += 3) {
      const inLand = LAND_CLUSTERS.some(
        (c) => lat >= c.latMin && lat <= c.latMax && lng >= c.lngMin && lng <= c.lngMax
      );
      if (inLand) {
        const isIndonesia = lat >= -9 && lat <= 6 && lng >= 95 && lng <= 141;
        const { x, y } = projectLatLng(lat, lng);
        points.push({ x, y, isIndonesia });
      }
    }
  }
  return points;
}

const DOTTED_POINTS = generateDottedLandPoints();
const ORIGIN_INDONESIA = projectLatLng(-5.14, 112.5);

export const TradeLanesMap: React.FC<TradeLanesMapProps> = ({
  lanes,
  locale,
  onRequestQuoteForLane,
}) => {
  const [selectedLaneId, setSelectedLaneId] = useState<string>(lanes[0]?.id || 'lane-sg');
  const activeLane = lanes.find((l) => l.id === selectedLaneId) || lanes[0];
  const isId = locale === 'id';
  const totalAnnualVolume = lanes.reduce((acc, l) => acc + (Number(l.annualVolumeMt) || 0), 0);

  return (
    <section className="bg-[#1A2B3D] text-white py-20 px-6 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-mono text-[#F8A531] tracking-wide mb-3">
              {isId
                ? '04. JALUR PERDAGANGAN MARITIM · DOTTED MAP INTERAKTIF'
                : '04. MARITIME TRADE LANES · INTERACTIVE DOTTED MAP'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white headline-balance">
              {isId
                ? 'Pengapalan Terjadwal dari Pelabuhan Utama Indonesia ke 6 Hub Dunia'
                : 'Scheduled Container Departures from Indonesian Origin Ports to 6 Global Hubs'}
            </h2>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#E9E1D5]/80 shrink-0">
            <div>
              <div className="text-xs text-[#E9E1D5]/60">
                {isId ? 'Pelabuhan Muat (POL)' : 'Ports of Loading (POL)'}
              </div>
              <div className="font-mono font-semibold text-white">IDJKT · IDSUB · IDMAK</div>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <div className="text-xs text-[#E9E1D5]/60">
                {isId ? 'Kapasitas Tahunan Jalur' : 'Annual Contracted Volume'}
              </div>
              <div className="font-mono font-semibold text-[#F8A531] tabular-nums">
                {totalAnnualVolume.toLocaleString()} MT / yr
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 bg-[#13202E] border border-white/10 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3 z-10">
              <div className="flex items-center gap-4 text-xs text-[#E9E1D5]/75">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EB980C] inline-block" />
                  <span>{isId ? 'Hub Asal Indonesia (POL)' : 'Indonesia Origin Hub (POL)'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F8A531] inline-block" />
                  <span>{isId ? 'Pelabuhan Tujuan Aktif (POD)' : 'Active Destination Port (POD)'}</span>
                </span>
              </div>
              <div className="text-xs font-mono text-[#E9E1D5]/60">
                {isId ? 'Klik titik pelabuhan untuk jadwal & HS Code' : 'Select a port node to inspect transit & commodities'}
              </div>
            </div>

            <div className="relative w-full aspect-[16/9] min-h-[300px]">
              <svg
                viewBox="0 0 880 460"
                className="w-full h-full select-none"
                role="img"
                aria-label="Commodex Global Maritime Trade Lanes Dotted Map"
              >
                {[90, 180, 270, 360].map((y) => (
                  <line
                    key={`lat-${y}`}
                    x1="20"
                    y1={y}
                    x2="860"
                    y2={y}
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="3 3"
                  />
                ))}
                {[160, 320, 480, 640, 800].map((x) => (
                  <line
                    key={`lng-${x}`}
                    x1={x}
                    y1="20"
                    x2={x}
                    y2="440"
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="3 3"
                  />
                ))}

                {DOTTED_POINTS.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.isIndonesia ? 2.4 : 1.75}
                    fill={pt.isIndonesia ? 'rgba(235, 152, 12, 0.55)' : 'rgba(233, 225, 213, 0.22)'}
                  />
                ))}

                {lanes.map((lane) => {
                  const dest = projectLatLng(lane.lat, lane.lng);
                  const isSelected = activeLane?.id === lane.id;
                  const midX = (ORIGIN_INDONESIA.x + dest.x) / 2;
                  const midY = Math.min(ORIGIN_INDONESIA.y, dest.y) - (Math.abs(ORIGIN_INDONESIA.x - dest.x) * 0.16 + 22);
                  const pathD = `M ${ORIGIN_INDONESIA.x} ${ORIGIN_INDONESIA.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`;

                  return (
                    <g key={`arc-${lane.id}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isSelected ? '#F8A531' : 'rgba(248, 165, 49, 0.28)'}
                        strokeWidth={isSelected ? 2.5 : 1.25}
                        strokeDasharray={isSelected ? 'none' : '4 4'}
                      />
                    </g>
                  );
                })}

                <g transform={`translate(${ORIGIN_INDONESIA.x}, ${ORIGIN_INDONESIA.y})`}>
                  <circle r="11" fill="rgba(235, 152, 12, 0.22)" />
                  <circle r="5.5" fill="#EB980C" stroke="#FFFFFF" strokeWidth="1.5" />
                  <rect
                    x="-62"
                    y="10"
                    width="124"
                    height="20"
                    rx="4"
                    fill="#26160E"
                    stroke="#EB980C"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="23.5"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    ORIGIN: INDONESIA
                  </text>
                </g>

                {lanes.map((lane) => {
                  const dest = projectLatLng(lane.lat, lane.lng);
                  const isSelected = activeLane?.id === lane.id;
                  const label = isId ? lane.destinationCityId : lane.destinationCityEn;

                  return (
                    <g
                      key={lane.id}
                      transform={`translate(${dest.x}, ${dest.y})`}
                      onClick={() => setSelectedLaneId(lane.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={isSelected ? 13 : 8}
                        fill={isSelected ? 'rgba(248, 165, 49, 0.28)' : 'rgba(255,255,255,0.08)'}
                      />
                      <circle
                        r={isSelected ? 6 : 4}
                        fill={isSelected ? '#F8A531' : '#E9E1D5'}
                        stroke="#1A2B3D"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="-12"
                        textAnchor="middle"
                        fill={isSelected ? '#F8A531' : '#E9E1D5'}
                        fontSize={isSelected ? '11.5' : '10'}
                        fontWeight={isSelected ? '700' : '500'}
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        {label} ({lane.code})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/10">
              {lanes.map((lane) => {
                const active = activeLane?.id === lane.id;
                return (
                  <button
                    key={lane.id}
                    type="button"
                    onClick={() => setSelectedLaneId(lane.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#EB980C] text-white font-semibold'
                        : 'bg-white/5 text-[#E9E1D5]/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {lane.code} · {isId ? lane.destinationCityId : lane.destinationCityEn}
                  </button>
                );
              })}
            </div>
          </div>

          {activeLane && (
            <div className="lg:col-span-4 bg-[#13202E] border border-white/10 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                  <div>
                    <div className="text-xs font-mono text-[#F8A531]">{activeLane.portCode}</div>
                    <h3 className="text-2xl font-bold text-white mt-0.5">
                      {isId ? activeLane.destinationCityId : activeLane.destinationCityEn}
                    </h3>
                    <div className="text-xs text-[#E9E1D5]/70">
                      {isId ? activeLane.countryId : activeLane.countryEn}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#1A2B3D] border border-white/10 flex items-center justify-center text-[#F8A531] shrink-0">
                    <Ship className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-5 border-b border-white/10">
                  <div>
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Estimasi Transit Laut' : 'Estimated Sea Transit'}
                    </div>
                    <div className="text-lg font-mono font-bold text-white mt-1 tabular-nums">
                      {activeLane.transitDays}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Volume Kontrak Tahunan' : 'Annual Lane Volume'}
                    </div>
                    <div className="text-lg font-mono font-bold text-[#F8A531] mt-1 tabular-nums">
                      {activeLane.annualVolumeMt.toLocaleString()} MT
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Pelabuhan Muat (POL)' : 'Port of Loading (POL)'}
                    </div>
                    <div className="text-xs font-mono text-white mt-1">{activeLane.originPort}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-[#E9E1D5]/60">
                      {isId ? 'Frekuensi Kapal' : 'Sailing Cadence'}
                    </div>
                    <div className="text-sm font-medium text-white mt-0.5">
                      {isId ? activeLane.frequencyId : activeLane.frequencyEn}
                    </div>
                  </div>
                </div>

                <div className="py-5">
                  <div className="text-xs text-[#E9E1D5]/60 mb-2.5">
                    {isId ? 'Komoditas Utama di Jalur Ini' : 'Primary Commodities Shipped on Lane'}
                  </div>
                  <ul className="space-y-2 text-sm text-[#E9E1D5]">
                    {activeLane.primaryCommodities.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-[#EB980C] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => onRequestQuoteForLane(activeLane)}
                  className="w-full py-3 px-4 bg-[#EB980C] hover:bg-[#d88a08] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>
                    {isId
                      ? `Minta Penawaran CIF/FOB ke ${activeLane.destinationCityId}`
                      : `Request CIF/FOB Quote to ${activeLane.destinationCityEn}`}
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
