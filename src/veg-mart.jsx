import React, { useState } from "react";
import "./veg-mart.css";

// ---- Data (from VegMart_Tableau_Data.xlsx) ----

const problemStatement =
  "How might we help fine-dining restaurants manage their daily bulk vegetable orders, from different wholesalers, and make cost-effective purchasing decisions without depending on time consuming calls or daily mandi visits?";

// Colour is assigned by what the number means, not by position:
//   var(--brand) = informational / positive
//   var(--ochre) = money left on the table / opportunity
//   var(--brick)  = concentration or quality risk
const solutionSteps = [
  {
    step: "Digitalise by location",
    outcome: "Cut cost",
    color: "var(--ochre)",
    how: "Replace daily calls and mandi visits with a location-based marketplace that shows live prices from nearby suppliers every morning.",
    fixes: "Fixes Insight 3 (₹1,571 lost to non-cheapest picks) and Insight 7 (Coriander, Ginger, Garlic price swings ₹26–35/kg between suppliers) — the cheapest quote becomes visible instead of a habit.",
  },
  {
    step: "Onboard local suppliers",
    outcome: "Cut dependency",
    color: "var(--brick)",
    how: "Actively recruit more verified local suppliers per category so no single vendor can dominate a restaurant's order book.",
    fixes: "Fixes Insight 2 and KPI 4 — Sri Sai Traders alone carries 54.49% of spend, more than the other three suppliers combined.",
  },
  {
    step: "Compare price & quality in one screen",
    outcome: "Cut rejection",
    color: "var(--brand)",
    how: "Show each supplier's live price next to their historical quality rating, so a restaurant can see the trade-off before it orders.",
    fixes: "Fixes Insight 4 — every rejected kg came from an order rated 2/5, and those low ratings were visible in just 7 of 112 orders. Screening on quality, not habit, stops the rejection before it happens.",
  },
];

// KPI1_2_3_5_Vegetable (all 18 rows) — used for insight lines
const vegetables = [
  { name: "Potato", category: "Root/Bulb", avgPrice: 30.1, variation: 2.29, saving: 262.1, rejectionRate: 0 },
  { name: "Tomato", category: "Fruit Veg", avgPrice: 31.09, variation: 7.43, saving: 261.1, rejectionRate: 0 },
  { name: "Capsicum (Green)", category: "Fruit Veg", avgPrice: 68.34, variation: 9.57, saving: 151.5, rejectionRate: 0 },
  { name: "Drumstick", category: "Fruit Veg", avgPrice: 76.13, variation: 10.14, saving: 115.6, rejectionRate: 0 },
  { name: "Brinjal", category: "Fruit Veg", avgPrice: 42.87, variation: 5.43, saving: 111.6, rejectionRate: 2.6 },
  { name: "Coriander", category: "Herb", avgPrice: 74.52, variation: 26.14, saving: 108, rejectionRate: 0 },
  { name: "Lemon", category: "Fruit Veg", avgPrice: 67.93, variation: 8, saving: 104.6, rejectionRate: 0 },
  { name: "French Beans", category: "Fruit Veg", avgPrice: 65.5, variation: 6.14, saving: 99.6, rejectionRate: 0 },
  { name: "Ginger", category: "Root/Bulb", avgPrice: 137.35, variation: 11, saving: 83.6, rejectionRate: 0 },
  { name: "Garlic", category: "Root/Bulb", avgPrice: 150.64, variation: 8.33, saving: 67.6, rejectionRate: 1.61 },
  { name: "Cauliflower", category: "Fruit Veg", avgPrice: 41.69, variation: 2.6, saving: 52.4, rejectionRate: 0 },
  { name: "Ladyfinger (Okra)", category: "Fruit Veg", avgPrice: 44.06, variation: 5.83, saving: 43.4, rejectionRate: 3.96 },
  { name: "Onion", category: "Root/Bulb", avgPrice: 34.64, variation: 1.86, saving: 30.5, rejectionRate: 0 },
  { name: "Cabbage", category: "Leafy", avgPrice: 27.92, variation: 3.2, saving: 28.8, rejectionRate: 3.24 },
  { name: "Mint", category: "Herb", avgPrice: 55.67, variation: 13.67, saving: 27.4, rejectionRate: 3.94 },
  { name: "Carrot", category: "Root/Bulb", avgPrice: 49.84, variation: 4.17, saving: 23.3, rejectionRate: 6.09 },
  { name: "Green Chilli", category: "Fruit Veg", avgPrice: 54.49, variation: 10.86, saving: 0, rejectionRate: 0 },
  { name: "Palak (Spinach)", category: "Leafy", avgPrice: 34.81, variation: 4, saving: 0, rejectionRate: 0 },
];

// KPI4_6_Supplier — sorted by dependency already (Sri Sai Traders is the concentration risk)
const suppliers = [
  { name: "Sri Sai Traders", avgQuality: 4.27, dependencyPct: 54.49, avgPrice: 48.56, rejectionRate: 1.08 },
  { name: "Gudimalkapur Fresh Supply", avgQuality: 4.26, dependencyPct: 22.27, avgPrice: 41.93, rejectionRate: 1.11 },
  { name: "Venkateswara Vegetables", avgQuality: 4.29, dependencyPct: 11.78, avgPrice: 53.21, rejectionRate: 0 },
  { name: "Monda Market Agro Agencies", avgQuality: 4.2, dependencyPct: 11.47, avgPrice: 46.57, rejectionRate: 0.34 },
];

// KPI7_Category — sorted by share already (Fruit Veg leads)
const categories = [
  { name: "Fruit Veg", pct: 49.23 },
  { name: "Root/Bulb", pct: 39.73 },
  { name: "Herb", pct: 5.8 },
  { name: "Leafy", pct: 5.24 },
];

// KPI8_DayOfWeek
const dayOfWeek = [
  { day: "Tuesday", pct: 13.82 },
  { day: "Wednesday", pct: 13.29 },
  { day: "Thursday", pct: 13.59 },
  { day: "Friday", pct: 14.61 },
  { day: "Saturday", pct: 15.46 },
  { day: "Sunday", pct: 15.8 },
  { day: "Monday", pct: 13.44 },
];

// ---- Derived, computed from the raw sheets (see analysis notes below each figure) ----

const overview = {
  totalSpend: 59508.1,
  totalSaving: 1571.1,
  savingPct: 2.64,
  weightedAvgPrice: 47.15, // total spend ÷ total qty ordered (1,262 kg)
  avgVariation: 8.05, // mean of Supplier_Price_Variation_INR across all 112 line items
  topCategory: "Fruit Veg",
  topCategoryPct: 49.23,
  rejectionRate: 0.89,
  rejectedKg: 11.2,
  orderedKg: 1262,
  avgQuality: 4.26,
};

const topByPrice = [...vegetables].sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 2);
const topBySaving = [...vegetables].sort((a, b) => b.saving - a.saving).slice(0, 2);
const topByVariation = [...vegetables].sort((a, b) => b.variation - a.variation)[0];
const topSupplier = [...suppliers].sort((a, b) => b.dependencyPct - a.dependencyPct)[0];
const bestQualitySupplier = [...suppliers].sort((a, b) => b.avgQuality - a.avgQuality)[0];
const worstRejection = [...vegetables].filter((v) => v.rejectionRate > 0).sort((a, b) => b.rejectionRate - a.rejectionRate)[0];
const secondCategory = [...categories].sort((a, b) => b.pct - a.pct)[1];
const peakDay = [...dayOfWeek].sort((a, b) => b.pct - a.pct)[0];

const k1Items = [...vegetables]
  .sort((a, b) => b.avgPrice - a.avgPrice)
  .slice(0, 5)
  .map((v) => ({ label: v.name, value: v.avgPrice, display: `₹${v.avgPrice.toFixed(2)}` }));

const k2Items = [...vegetables]
  .sort((a, b) => b.variation - a.variation)
  .slice(0, 5)
  .map((v) => ({ label: v.name, value: v.variation, display: `₹${v.variation.toFixed(2)}` }));

const k3Items = [...vegetables]
  .sort((a, b) => b.saving - a.saving)
  .slice(0, 5)
  .map((v) => ({ label: v.name, value: v.saving, display: `₹${v.saving.toFixed(0)}` }));

const k5Items = [...vegetables]
  .filter((v) => v.rejectionRate > 0)
  .sort((a, b) => b.rejectionRate - a.rejectionRate)
  .map((v) => ({ label: v.name, value: v.rejectionRate, display: `${v.rejectionRate.toFixed(2)}%` }));

const k6Items = [...suppliers]
  .sort((a, b) => b.avgQuality - a.avgQuality)
  .map((s) => ({ label: s.name, value: s.avgQuality, display: `${s.avgQuality.toFixed(2)}/5` }));

// Donut colours carry meaning: the standout slice is highlighted, the rest sit in
// quiet tints of the same hue, so the eye lands on the thing worth noticing.
const tintRamp = ["", "var(--brand-t1)", "var(--brand-t2)", "var(--brand-t3)"];
const k4Data = suppliers.map((s, i) => ({
  label: s.name,
  value: s.dependencyPct,
  color: i === 0 ? "var(--brick)" : tintRamp[i], // Sri Sai Traders is the concentration risk
}));
const k7Data = categories.map((c, i) => ({
  label: c.name,
  value: c.pct,
  color: i === 0 ? "var(--brand)" : tintRamp[i], // Fruit Veg leads demand
}));

// Supplier Value Proposition score = Quality Rating ÷ Avg Purchase Price × (1 − Rejection Rate)
const suppliersByValue = [...suppliers]
  .map((s) => ({ ...s, valueScore: (s.avgQuality / s.avgPrice) * (1 - s.rejectionRate / 100) }))
  .sort((a, b) => b.valueScore - a.valueScore);
const bestValueSupplier = suppliersByValue[0];
const valueItems = suppliersByValue.map((s) => ({ label: s.name, value: s.valueScore, display: s.valueScore.toFixed(3) }));

const team = [
  { name: "Sanjana Venkatesan", id: "2026204012" },
  { name: "Vinit Jain", id: "2025204028" },
  { name: "Paila Tejeswara Rao", id: "2025204022" },
];

const keyInsights = [
  {
    stat: "90%",
    statLabel: "of spend, two categories",
    color: "var(--brand)",
    headline: "Two vegetable types make up most of the spending.",
    body: "Fruit Veg (49.23%) and Root/Bulb (39.73%) together are almost 90% of total spend. Herb and Leafy are small by comparison.",
  },
  {
    stat: "54.5%",
    statLabel: "of spend, one supplier",
    color: "var(--brick)",
    headline: "One supplier is doing more than half the business.",
    body: "Sri Sai Traders supplies 54.5% of total value and handles more orders (60 line items) than the other three suppliers combined (52). If something goes wrong with them, it affects a lot.",
  },
  {
    stat: "₹1,571",
    statLabel: "left on the table, 2.6% of spend",
    color: "var(--ochre)",
    headline: "Orders don't always go to the cheapest supplier — and it's mostly Sri Sai Traders' fault.",
    body: "Every purchase gets quotes from a few suppliers, and ideally the order goes to whoever's cheapest that day. The other three suppliers won an order only when they were genuinely the cheapest — 100% of the time. Sri Sai Traders won orders even when they weren't cheapest — they were only actually the lowest-price option in 47% of the orders they won. They're being picked out of habit as the “default” supplier, not because they're consistently the best deal. Adding up all those missed cheaper options comes to ₹1,571 (2.6% of total spend) that could have been saved.",
  },
  {
    stat: "7 / 112",
    statLabel: "low-rated orders = 100% of rejections",
    color: "var(--brick)",
    headline: "Low quality ratings almost always mean rejected produce.",
    body: "Every kilogram that got rejected came from orders rated 2 out of 5 for quality. Those low-rated orders were rare — just 7 out of 112. A rating of 2 is basically a warning sign that the produce will be bad.",
  },
  {
    stat: "31.3%",
    statLabel: "of spend, 2 of 7 days",
    color: "var(--brand)",
    headline: "Weekends bring in more business than their fair share of days.",
    body: "Saturday and Sunday made up 31.3% of the week's spending, even though they're only 2 of the 7 days. Sunday alone (15.8%) was the single biggest spending day.",
  },
  {
    stat: "~40%",
    statLabel: "of spend on 7-day credit",
    color: "var(--brick)",
    headline: "A big chunk of purchases are made on credit, not paid upfront.",
    body: "Almost 40% of spend is on 7-day credit terms, compared to about half (50.6%) on UPI and only 9.76% cash. That's money owed, not money already collected.",
  },
  {
    stat: "₹26.14",
    statLabel: "Coriander's supplier price gap",
    color: "var(--ochre)",
    headline: "Prices for herbs and a couple of root items swing a lot between suppliers.",
    body: "Coriander has the biggest price gap between suppliers — ₹26.14, about 35% of its own average price. Ginger and Garlic are also pricey items (₹137–151/kg) with noticeably different quotes from different suppliers, even though not much of them is bought.",
  },
];

// ---- Small building blocks ----

// Ranked magnitude, one series, 4-5 rows: a lollipop (dot plot) reads the same
// position-on-a-common-scale as a bar, with a fraction of the ink — the stem is a
// 2px rule, and the eye lands on the dot rather than on a block of colour.
function MiniDotPlot({ items, color }) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div className="mini-dots">
      {items.map((i) => {
        const pct = Math.max((i.value / max) * 100, 1.5);
        return (
          <div className="mini-dot-row" key={i.label} title={`${i.label}: ${i.display}`}>
            <span className="mini-dot-label">{i.label}</span>
            <div className="mini-dot-track">
              <div className="mini-dot-plot">
                <div className="mini-dot-stem" style={{ width: `${pct}%`, background: color }} />
                <span className="mini-dot-mark" style={{ left: `${pct}%`, background: color }} />
              </div>
            </div>
            <span className="mini-dot-value">{i.display}</span>
          </div>
        );
      })}
    </div>
  );
}

function CircleChart({ data, hole = true, size = 100 }) {
  let cum = 0;
  const stops = data.map((d) => {
    const start = cum;
    cum += d.value;
    return `${d.color} ${start}% ${cum}%`;
  });
  return (
    <div className="circle-chart" style={{ width: size, height: size, background: `conic-gradient(${stops.join(", ")})` }}>
      {hole && <div className="circle-hole" />}
    </div>
  );
}

function ChartLegend({ data }) {
  return (
    <ul className="chart-legend">
      {data.map((d) => (
        <li key={d.label}>
          <span className="legend-dot" style={{ background: d.color }} />
          <span className="legend-label" title={d.label}>{d.label}</span>
          <span className="legend-pct">{d.value.toFixed(2)}%</span>
        </li>
      ))}
    </ul>
  );
}

function Sparkline({ data, color }) {
  const w = 240;
  const h = 68;
  const pad = 8;
  const values = data.map((d) => d.pct);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((d, i) => [pad + i * stepX, pad + (1 - (d.pct - min) / range) * (h - pad * 2)]);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" preserveAspectRatio="none">
        <path d={areaPath} fill={color} opacity="0.15" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={data[i].day} cx={p[0]} cy={p[1]} r={data[i].pct === max ? 4 : 2.5} fill={color} />
        ))}
      </svg>
      <div className="sparkline-labels">
        {data.map((d) => (
          <span key={d.day}>{d.day.slice(0, 3)}</span>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ n, insight, isOpen, onToggle }) {
  return (
    <div className={`insight-tile${isOpen ? " is-open" : ""}`} style={{ "--kpi-color": insight.color }}>
      <button type="button" className="insight-header" onClick={onToggle} aria-expanded={isOpen}>
        <div className="insight-stat-block">
          <span className="insight-stat">{insight.stat}</span>
          <span className="insight-stat-label">{insight.statLabel}</span>
        </div>
        <div className="insight-header-text">
          <p className="insight-headline">
            <span className="insight-index">{n}.</span> {insight.headline}
          </p>
        </div>
        <svg className="insight-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="insight-body-wrap">
          <p className="insight-body">{insight.body}</p>
        </div>
      )}
    </div>
  );
}

function SolutionStepCard({ n, step, isOpen, onToggle }) {
  return (
    <div className={`solution-step${isOpen ? " is-open" : ""}`} style={{ "--kpi-color": step.color }}>
      <button type="button" className="solution-step-header" onClick={onToggle} aria-expanded={isOpen}>
        <span className="solution-step-num">{n}</span>
        <span className="solution-step-label">{step.step}</span>
        <svg className="insight-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="solution-step-outcome">{step.outcome}</span>
      {isOpen && (
        <div className="solution-step-body">
          <p className="solution-step-how"><strong>How:</strong> {step.how}</p>
          <p className="solution-step-fixes">{step.fixes}</p>
        </div>
      )}
    </div>
  );
}

function KpiTile({ n, color, title, value, unit, insight, children }) {
  return (
    <div className="kpi-tile" style={{ "--kpi-color": color }}>
      <div className="kpi-heading">
        <span className="kpi-index">{n}.</span>
        <span className="kpi-title">{title}</span>
      </div>
      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        <span className="kpi-unit">{unit}</span>
      </div>
      <div className="kpi-chart">{children}</div>
      <p className="kpi-insight">{insight}</p>
    </div>
  );
}

function SectionBand({ label, detail, hint }) {
  return (
    <div className="section-band">
      <span className="section-band-label">{label}</span>
      {detail && <span className="section-band-detail">{detail}</span>}
      {hint && <span className="section-band-hint">{hint}</span>}
    </div>
  );
}

// ---- Main component ----

export default function VegMartDashboard() {
  const [openInsights, setOpenInsights] = useState(() => new Set([0]));
  const [openSteps, setOpenSteps] = useState(() => new Set([0]));

  function toggleInsight(i) {
    setOpenInsights((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function toggleStep(i) {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="veg-dash">
      <div className="dash-shell">
        <div className="dash-topline" />

        <header className="dash-masthead">
          <div className="masthead-brand">
            <span className="masthead-mark">VM</span>
            <div>
              <h1 className="masthead-title">Veg-Mart</h1>
              <p className="masthead-sub">Procurement intelligence &amp; go-to-market dashboard</p>
            </div>
          </div>
        </header>

        <SectionBand label="Problem statement" />
        <section className="statement-panel">
          <p className="problem-text">{problemStatement}</p>
          <p className="team-row team-row--top">
            <span className="team-label">Prepared by </span>
            {team.map((member, i) => (
              <span key={member.id}>
                {member.name} <span className="team-id">({member.id})</span>
                {i < team.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </section>

        <SectionBand label="Marketing metrics" />
        <div className="metrics-grid">
          <div className="metric-tile" style={{ "--kpi-color": "var(--brand)" }}>
            <div className="kpi-eyebrow">Category demand share</div>
            <p className="metric-question">What should we market?</p>
            <p className="metric-formula">Category Spend ÷ Total Spend × 100</p>
            <div className="chart-row">
              <CircleChart data={k7Data} hole={false} size={92} />
              <ChartLegend data={k7Data} />
            </div>
            <p className="metric-answer">
              <strong>Fruit Veg</strong> leads demand at {overview.topCategoryPct}% of spend — the category to lead
              marketing and stocking around. {secondCategory.name} follows at {secondCategory.pct}%; Herb and Leafy
              together stay under 12%.
            </p>
          </div>

          <div className="metric-tile" style={{ "--kpi-color": "var(--ochre)" }}>
            <div className="kpi-eyebrow">Supplier value proposition</div>
            <p className="metric-question">Which suppliers offer the most attractive value?</p>
            <p className="metric-formula">Quality Rating ÷ Avg Purchase Price × (1 − Rejection Rate)</p>
            <MiniDotPlot items={valueItems} color="var(--ochre)" />
            <p className="metric-answer">
              <strong>{bestValueSupplier.name}</strong> scores highest ({bestValueSupplier.valueScore.toFixed(3)}) —
              a lower price (₹{bestValueSupplier.avgPrice.toFixed(2)}/kg) at solid quality (
              {bestValueSupplier.avgQuality.toFixed(2)}/5) outweighs {topSupplier.name}&rsquo;s scale. {topSupplier.name}{" "}
              carries {topSupplier.dependencyPct.toFixed(1)}% of spend but a higher price (₹
              {topSupplier.avgPrice.toFixed(2)}/kg) and more rejections ({topSupplier.rejectionRate.toFixed(2)}%) —
              worth renegotiating or diversifying away from.
            </p>
          </div>
        </div>

        <SectionBand
          label="Operational KPIs"
          detail="Paradise Gachibowli, week of 1–7 Sep 2026 · 112 line items, 18 vegetables, 7 orders"
        />

        <div className="kpi-grid">
          <KpiTile
            n={1}
            color="var(--brand)"
            title="Avg Purchase Price"
            value={`₹${overview.weightedAvgPrice.toFixed(2)}`}
            unit="/kg (wtd avg)"
            insight={`${topByPrice[0].name} priciest at ₹${topByPrice[0].avgPrice.toFixed(2)}/kg, ${topByPrice[1].name} next at ₹${topByPrice[1].avgPrice.toFixed(2)}/kg.`}
          >
            <MiniDotPlot items={k1Items} color="var(--brand)" />
          </KpiTile>

          <KpiTile
            n={2}
            color="var(--ochre)"
            title="Supplier Price Variation"
            value={`₹${overview.avgVariation.toFixed(2)}`}
            unit="avg spread"
            insight={`${topByVariation.name} widest at ₹${topByVariation.variation.toFixed(2)} — most worth quote-shopping.`}
          >
            <MiniDotPlot items={k2Items} color="var(--ochre)" />
          </KpiTile>

          <KpiTile
            n={3}
            color="var(--ochre)"
            title="Potential Cost Saving"
            value={`₹${overview.totalSaving.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            unit={`${overview.savingPct}% of spend`}
            insight={`${topBySaving[0].name} (₹${Math.round(topBySaving[0].saving)}) and ${topBySaving[1].name} (₹${Math.round(topBySaving[1].saving)}) carry the biggest absolute savings left on the table.`}
          >
            <MiniDotPlot items={k3Items} color="var(--ochre)" />
          </KpiTile>

          <KpiTile
            n={4}
            color="var(--brick)"
            title="Supplier Dependency"
            value={`${topSupplier.dependencyPct.toFixed(2)}%`}
            unit={topSupplier.name}
            insight="Largest supplier carries over half of weekly spend — a concentration risk. (Donut: share of spend per supplier)"
          >
            <div className="chart-row">
              <CircleChart data={k4Data} hole />
              <ChartLegend data={k4Data} />
            </div>
          </KpiTile>

          <KpiTile
            n={5}
            color="var(--brick)"
            title="Quality Rejection Rate"
            value={`${overview.rejectionRate}%`}
            unit={`${overview.rejectedKg} of ${overview.orderedKg.toLocaleString("en-IN")} kg`}
            insight={`${worstRejection.name} is the outlier at ${worstRejection.rejectionRate.toFixed(2)}% — ${(worstRejection.rejectionRate / overview.rejectionRate).toFixed(0)}x the weekly average.`}
          >
            <MiniDotPlot items={k5Items} color="var(--brick)" />
          </KpiTile>

          <KpiTile
            n={6}
            color="var(--brand)"
            title="Avg Quality Rating"
            value={overview.avgQuality.toFixed(2)}
            unit="/5 across suppliers"
            insight={`${bestQualitySupplier.name} tops at ${bestQualitySupplier.avgQuality.toFixed(2)}; ${topSupplier.name} (${topSupplier.dependencyPct.toFixed(1)}% of spend) rates only ${topSupplier.avgQuality.toFixed(2)} — no quality edge for the dependency.`}
          >
            <MiniDotPlot items={k6Items} color="var(--brand)" />
          </KpiTile>

          <KpiTile
            n={7}
            color="var(--brand)"
            title="Day-of-Week Spend"
            value={`${peakDay.pct}%`}
            unit={`${peakDay.day} (peak)`}
            insight="Weekend (Sat–Sun) runs 15.5–15.8% of spend vs. ~13.3–13.8% on weekdays. (Line: % of spend, Tue → Mon)"
          >
            <Sparkline data={dayOfWeek} color="var(--brand)" />
          </KpiTile>
        </div>

        <SectionBand label="Key insights" hint="click a card to expand" />
        <div className="insights-grid">
          {keyInsights.map((insight, i) => (
            <InsightCard
              key={insight.headline}
              n={i + 1}
              insight={insight}
              isOpen={openInsights.has(i)}
              onToggle={() => toggleInsight(i)}
            />
          ))}
        </div>

        <SectionBand label="Proposed solution" hint="click a step to see how &amp; what it fixes" />
        <section className="solution-panel">
          <div className="solution-statement">
            <p className="solution-statement-text">
              <strong style={{ color: "var(--ochre)" }}>Digitalise by location</strong>,{" "}
              <strong style={{ color: "var(--brick)" }}>onboard local suppliers</strong>, let restaurants{" "}
              <strong style={{ color: "var(--brand)" }}>compare price and quality in one screen</strong>
              <span className="solution-statement-sep"> — to </span>
              <strong style={{ color: "var(--ochre)" }}>cut cost</strong>,{" "}
              <strong style={{ color: "var(--brick)" }}>cut dependency</strong>, and{" "}
              <strong style={{ color: "var(--brand)" }}>cut rejection</strong>.
            </p>
          </div>
          <div className="solution-steps">
            {solutionSteps.map((step, i) => (
              <React.Fragment key={step.step}>
                <SolutionStepCard n={i + 1} step={step} isOpen={openSteps.has(i)} onToggle={() => toggleStep(i)} />
                {i < solutionSteps.length - 1 && (
                  <svg className="solution-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        <footer className="dash-footer">
          <span>Source: Veg-Mart Paradise (Gachibowli) weekly procurement log, 1&ndash;7 Sep 2026. Interviews with Brand Manager, Branch Manager &amp; Cooks.</span>
        </footer>
      </div>
    </div>
  );
}