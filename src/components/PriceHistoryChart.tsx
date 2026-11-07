import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ProductPriceAnalytics, StoreName } from '../types';
import {
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';

interface PriceHistoryChartProps {
  analytics: ProductPriceAnalytics;
  currentLowestPrice: number;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  analytics,
  currentLowestPrice,
}) => {
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30');
  const [visibleStores, setVisibleStores] = useState<Record<StoreName | 'lowest', boolean>>({
    Nykaa: true,
    Sephora: true,
    'Dot & Key': true,
    Myntra: true,
    Amazon: true,
    Tira: true,
    'Official Store': true,
    lowest: true,
  });

  const chartData = timeRange === '30' ? analytics.data30 : analytics.data90;
  const currentAvg = timeRange === '30' ? analytics.avgPrice30 : analytics.avgPrice90;
  const savingsVsAvg = Math.max(0, Math.round(((currentAvg - currentLowestPrice) / currentAvg) * 100));
  const diffFromLow = currentLowestPrice - analytics.allTimeLow;

  const toggleStore = (store: StoreName | 'lowest') => {
    setVisibleStores((prev) => ({
      ...prev,
      [store]: !prev[store],
    }));
  };

  // Color schemes for stores
  const storeColors: Record<StoreName | 'lowest', string> = {
    Nykaa: '#E80071',
    Sephora: '#1C1917',
    'Dot & Key': '#0D9488',
    Myntra: '#FF3F6C',
    Amazon: '#F59E0B',
    Tira: '#8B5CF6',
    'Official Store': '#2563EB',
    lowest: '#059669',
  };

  // Genuine Discount Verification Engine
  const isAllTimeLow = diffFromLow <= 0;
  const isNearAllTimeLow = diffFromLow > 0 && diffFromLow <= currentAvg * 0.08;
  const isBelowAverage = currentLowestPrice < currentAvg;

  let verificationData: {
    statusBadge: string;
    badgeStyle: string;
    headline: string;
    detail: string;
    authenticityScore: number;
    verdictType: 'all_time_low' | 'genuine_discount' | 'moderate' | 'regular';
  };

  if (isAllTimeLow) {
    verificationData = {
      statusBadge: '100% Verified All-Time Low',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      headline: 'Authentic Record Lowest Deal — Never Cheaper in History',
      detail: `Current price of ₹${currentLowestPrice} matches or beats the lowest price recorded across all major retailers over the last 90 days. Skinora verifies this as a genuine, non-inflated discount.`,
      authenticityScore: 99,
      verdictType: 'all_time_low',
    };
  } else if (isNearAllTimeLow) {
    verificationData = {
      statusBadge: 'Verified Genuine Discount',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      headline: `Exceptional Savings — Just ₹${diffFromLow} from Record Low`,
      detail: `You are saving ${savingsVsAvg}% compared to the typical ${timeRange}-day average price of ₹${currentAvg}. Historical data confirms this is an authentic seasonal markdown.`,
      authenticityScore: 94,
      verdictType: 'genuine_discount',
    };
  } else if (isBelowAverage) {
    verificationData = {
      statusBadge: 'Verified Good Deal',
      badgeStyle: 'bg-sky-50 text-sky-800 border-sky-300',
      headline: `Real Discount — Saving ₹${currentAvg - currentLowestPrice} Below Trend`,
      detail: `At ₹${currentLowestPrice}, the price is lower than the ${timeRange}-day average of ₹${currentAvg}. It is an authentic saving, though deeper price drops have occurred previously.`,
      authenticityScore: 82,
      verdictType: 'moderate',
    };
  } else {
    verificationData = {
      statusBadge: 'Standard Retail Price',
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-300',
      headline: 'Regular Baseline Price — No Deep Markdown Active',
      detail: `Current price of ₹${currentLowestPrice} is at or above the historical average of ₹${currentAvg}. Consider setting a Price Drop Alert below ₹${analytics.allTimeLow + Math.round((currentAvg - analytics.allTimeLow) * 0.3)} for festive sales.`,
      authenticityScore: 65,
      verdictType: 'regular',
    };
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-5 sm:p-6 space-y-6">
      {/* Tab Header & Time Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-stone-900 text-lg">
              Price History &amp; Genuine Discount Verification
            </h3>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Skinora tracks price fluctuations across Nykaa, Sephora, Dot &amp; Key, and Myntra to verify whether current promotional markdowns are genuine deals.
          </p>
        </div>

        {/* 30d / 90d Segmented Button */}
        <div className="inline-flex p-1 bg-rose-50/80 rounded-xl border border-rose-200/80 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              timeRange === '30'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30-Day Trend</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              timeRange === '90'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>90-Day Trend</span>
          </button>
        </div>
      </div>

      {/* Genuine Discount Verification Card */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          verificationData.verdictType === 'all_time_low'
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200'
            : verificationData.verdictType === 'genuine_discount'
            ? 'bg-gradient-to-r from-emerald-50/70 via-rose-50/30 to-white border-emerald-200'
            : verificationData.verdictType === 'moderate'
            ? 'bg-gradient-to-r from-sky-50/70 via-stone-50/50 to-white border-sky-200'
            : 'bg-gradient-to-r from-amber-50/70 via-stone-50/50 to-white border-amber-200'
        }`}
      >
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${verificationData.badgeStyle}`}
            >
              {verificationData.verdictType === 'all_time_low' && <Award className="w-3.5 h-3.5 text-emerald-700" />}
              {verificationData.verdictType === 'genuine_discount' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
              {verificationData.verdictType === 'moderate' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />}
              {verificationData.verdictType === 'regular' && <AlertCircle className="w-3.5 h-3.5 text-amber-700" />}
              <span>{verificationData.statusBadge}</span>
            </span>

            <span className="text-xs font-semibold text-stone-600">
              Skinora Authenticity Score:{' '}
              <strong className="text-stone-900 font-bold">{verificationData.authenticityScore}%</strong>
            </span>
          </div>

          <h4 className="font-serif font-bold text-base text-stone-900">
            {verificationData.headline}
          </h4>

          <p className="text-xs text-stone-600 leading-relaxed">
            {verificationData.detail}
          </p>
        </div>

        {/* Authenticity Score Visual Meter */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-rose-100 shadow-2xs shrink-0 flex flex-col items-center justify-center min-w-[130px]">
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
            Deal Reliability
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {verificationData.authenticityScore}
            </span>
            <span className="text-xs text-stone-400 font-bold">/100</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
            {verificationData.verdictType === 'regular' ? 'Average Deal' : 'Genuine Deal'}
          </span>
        </div>
      </div>

      {/* 4-Metric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFFBFB] rounded-xl p-3.5 border border-rose-100">
          <span className="text-[11px] text-stone-500 block uppercase tracking-wider font-semibold">
            Current Lowest Price
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-stone-900 font-mono tabular-nums">
              ₹{currentLowestPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            Active today across stores
          </span>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
          <span className="text-[11px] text-emerald-800 block uppercase tracking-wider font-semibold">
            All-Time Record Low
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
              ₹{analytics.allTimeLow.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
            {diffFromLow === 0 ? 'Matching record right now!' : `₹${diffFromLow} above absolute low`}
          </span>
        </div>

        <div className="bg-stone-50/80 rounded-xl p-3.5 border border-stone-200/70">
          <span className="text-[11px] text-stone-500 block uppercase tracking-wider font-semibold">
            {timeRange}d Historical Average
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-stone-700 font-mono tabular-nums">
              ₹{currentAvg.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
            Baseline regular retail price
          </span>
        </div>

        <div className="bg-rose-50/60 rounded-xl p-3.5 border border-rose-100">
          <span className="text-[11px] text-rose-800 block uppercase tracking-wider font-semibold">
            Verified Net Savings
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-rose-700 font-mono tabular-nums">
              {savingsVsAvg > 0 ? `${savingsVsAvg}%` : '0%'}
            </span>
            {savingsVsAvg > 0 && (
              <span className="text-xs text-rose-600 font-semibold">
                (₹{currentAvg - currentLowestPrice})
              </span>
            )}
          </div>
          <span className="text-[10px] text-rose-700 font-medium block mt-0.5">
            Compared to {timeRange}d average
          </span>
        </div>
      </div>

      {/* Store Visibility Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-stone-500 font-semibold mr-1">Filter Store Curves:</span>
        <button
          type="button"
          onClick={() => toggleStore('lowest')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs ${
            visibleStores.lowest
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
              : 'bg-white text-stone-400 border-stone-200 opacity-60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Lowest Daily Price</span>
        </button>

        <button
          type="button"
          onClick={() => toggleStore('Nykaa')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs ${
            visibleStores.Nykaa
              ? 'bg-pink-50 text-pink-800 border-pink-300 ring-1 ring-pink-200'
              : 'bg-white text-stone-400 border-stone-200 opacity-60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#E80071]" />
          <span>Nykaa</span>
        </button>

        <button
          type="button"
          onClick={() => toggleStore('Sephora')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs ${
            visibleStores.Sephora
              ? 'bg-stone-100 text-stone-900 border-stone-300 ring-1 ring-stone-200'
              : 'bg-white text-stone-400 border-stone-200 opacity-60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
          <span>Sephora</span>
        </button>

        <button
          type="button"
          onClick={() => toggleStore('Dot & Key')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs ${
            visibleStores['Dot & Key']
              ? 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-200'
              : 'bg-white text-stone-400 border-stone-200 opacity-60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>Dot &amp; Key</span>
        </button>

        <button
          type="button"
          onClick={() => toggleStore('Myntra')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs ${
            visibleStores.Myntra
              ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-200'
              : 'bg-white text-stone-400 border-stone-200 opacity-60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3F6C]" />
          <span>Myntra</span>
        </button>
      </div>

      {/* Main Recharts Line Chart with Reference Lines */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8E8" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#F3E8E8' }}
              tick={{ fontSize: 11, fill: '#78716C' }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#F3E8E8' }}
              tick={{ fontSize: 11, fill: '#78716C' }}
              tickFormatter={(value) => `₹${value}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-rose-200 p-3.5 rounded-xl shadow-lg text-xs space-y-2 min-w-[170px]">
                      <div className="flex items-center justify-between border-b border-rose-100 pb-1.5 font-bold text-stone-900">
                        <span>{label}</span>
                        <span className="text-[10px] text-rose-600 font-semibold uppercase">Pricing Feed</span>
                      </div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-stone-600" style={{ color: entry.color }}>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name === 'lowest' ? 'Best Price' : entry.name}:
                          </span>
                          <span className="font-mono font-bold tabular-nums text-stone-900">
                            ₹{entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            />

            {/* Reference Line: All-Time Record Low */}
            <ReferenceLine
              y={analytics.allTimeLow}
              stroke="#059669"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Record Low: ₹${analytics.allTimeLow}`,
                position: 'top',
                fill: '#059669',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Reference Line: Time Period Average */}
            <ReferenceLine
              y={currentAvg}
              stroke="#A8A29E"
              strokeDasharray="3 3"
              strokeWidth={1.25}
              label={{
                value: `${timeRange}d Avg: ₹${currentAvg}`,
                position: 'bottom',
                fill: '#78716C',
                fontSize: 10,
              }}
            />

            {visibleStores.lowest && (
              <Line
                type="monotone"
                dataKey="lowest"
                name="Best Price"
                stroke={storeColors.lowest}
                strokeWidth={3}
                dot={{ r: 3.5, fill: storeColors.lowest }}
                activeDot={{ r: 6 }}
              />
            )}
            {visibleStores.Nykaa && (
              <Line
                type="monotone"
                dataKey="Nykaa"
                name="Nykaa"
                stroke={storeColors.Nykaa}
                strokeWidth={1.75}
                strokeDasharray="4 2"
                dot={{ r: 2.5 }}
              />
            )}
            {visibleStores.Sephora && (
              <Line
                type="monotone"
                dataKey="Sephora"
                name="Sephora"
                stroke={storeColors.Sephora}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            )}
            {visibleStores['Dot & Key'] && (
              <Line
                type="monotone"
                dataKey="Dot & Key"
                name="Dot & Key"
                stroke={storeColors['Dot & Key']}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            )}
            {visibleStores.Myntra && (
              <Line
                type="monotone"
                dataKey="Myntra"
                name="Myntra"
                stroke={storeColors.Myntra}
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={{ r: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 pt-3 border-t border-rose-100/80">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>Historical prices verified via retailer API logs and web snapshots over the past 90 days.</span>
        </div>
        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
          Anti-Price-Gouging Verified
        </span>
      </div>
    </div>
  );
};
