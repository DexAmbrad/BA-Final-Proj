
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Activity, Boxes, Users, PhilippinePeso, ShoppingBag,
  AlertTriangle, RefreshCw, TrendingUp, Menu, X,
  ChartNoAxesCombined, Megaphone, Package,
} from 'lucide-react'
import './App.css'

const formatMoney = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className="stat-icon"><Icon size={20} /></span>
      </div>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

// FIX: Allow each panel to receive its own HTML ID.
function Panel({ title, subtitle, children, className = '', id }) {
  return (
    <section id={id} className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  async function loadAnalytics() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      setData(await response.json())
    } catch (err) {
      setError(err.message || 'Unable to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  // Scroll to a section and close the mobile menu.
  function handleNavigation(event, sectionId) {
    event.preventDefault()
    setMenuOpen(false)

    if (window.location.hash !== `#${sectionId}`) {
      window.history.pushState(null, '', `#${sectionId}`)
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  // Support opening a URL directly with a hash, such as #marketing.
  useEffect(() => {
    function scrollToHash() {
      const sectionId = window.location.hash.slice(1)
      if (!sectionId) return

      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)

    return () => {
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [data])

  const summary = data?.summary

  const monthlySales = (data?.monthly_sales || []).map((item) => ({
    ...item,
    month: new Date(`${item.month}-01T00:00:00`).toLocaleDateString(
      'en-US',
      { month: 'short', year: '2-digit' },
    ),
    revenue: Number(item.revenue),
  }))

  const topProducts = (data?.top_products || []).map((item) => ({
    ...item,
    revenue: Number(item.revenue),
    units_sold: Number(item.units_sold),
  }))

  const categories = (data?.sales_by_category || []).map((item) => ({
    ...item,
    revenue: Number(item.revenue),
  }))

  const marketing = (data?.marketing_by_platform || []).map((item) => ({
    ...item,
    conversions: Number(item.conversions),
    clicks: Number(item.clicks),
    total_spend: Number(item.total_spend),
  }))

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-logo">
            <ChartNoAxesCombined size={23} />
          </div>
          <div>
            <strong>SalesInsight</strong>
            <span>Business Analytics</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <a
          className="nav-link active"
          href="#overview"
          onClick={(event) => handleNavigation(event, 'overview')}
        >
          <Activity size={18} /> Overview
        </a>

        <a
          className="nav-link"
          href="#sales"
          onClick={(event) => handleNavigation(event, 'sales')}
        >
          <TrendingUp size={18} /> Sales analytics
        </a>

        <a
          className="nav-link"
          href="#products"
          onClick={(event) => handleNavigation(event, 'products')}
        >
          <Package size={18} /> Products
        </a>

        <a
          className="nav-link"
          href="#marketing"
          onClick={(event) => handleNavigation(event, 'marketing')}
        >
          <Megaphone size={18} /> Marketing
        </a>

        <a
          className="nav-link"
          href="#inventory"
          onClick={(event) => handleNavigation(event, 'inventory')}
        >
          <Boxes size={18} /> Inventory
        </a>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>System online</strong>
            <span>Laravel + MySQL</span>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="main-content" id="overview">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
            <h1>Analytics Overview</h1>
          </div>

          <button
            className="refresh-button"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? 'spinning' : ''}
            />
            <span>{loading ? 'Loading...' : 'Refresh data'}</span>
          </button>
        </header>

        {error && (
          <div className="error-box">
            <AlertTriangle size={20} />
            <div>
              <strong>Could not load analytics</strong>
              <p>{error}. Check that Laravel is running at port 8000.</p>
              <button onClick={loadAnalytics}>Try again</button>
            </div>
          </div>
        )}

        {loading && !data ? (
          <div className="loading-box">Loading your business data...</div>
        ) : data && (
          <>
            <div className="welcome-row">
              <div>
                <h2>Business performance</h2>
                <p>Here is what's happening across your store.</p>
              </div>
              <span className="live-badge">
                <span /> Connected to database
              </span>
            </div>

            <div className="stats-grid">
              <StatCard
                title="Total revenue"
                value={formatMoney(summary.total_revenue)}
                subtitle="All recorded transactions"
                icon={PhilippinePeso}
              />
              <StatCard
                title="Sales transactions"
                value={Number(summary.total_sales).toLocaleString()}
                subtitle="Recorded orders"
                icon={ShoppingBag}
              />
              <StatCard
                title="Customers"
                value={Number(summary.total_customers).toLocaleString()}
                subtitle="Registered customers"
                icon={Users}
              />
              <StatCard
                title="Products"
                value={Number(summary.total_products).toLocaleString()}
                subtitle="Products in catalog"
                icon={Boxes}
              />
            </div>

            <div className="chart-grid" id="sales">
              <Panel
                title="Revenue over time"
                subtitle="Monthly sales revenue"
              >
                {monthlySales.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={monthlySales}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="revenueFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e9edf4"
                      />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#7b8498', fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(v) => `₱${Math.round(v / 1000)}k`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#7b8498', fontSize: 12 }}
                        width={55}
                      />
                      <Tooltip formatter={(v) => formatMoney(v)} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#revenueFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-state">No monthly sales data yet.</p>
                )}
              </Panel>

              <Panel
                title="Revenue by category"
                subtitle="Which categories earn the most?"
              >
                {categories.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="48%"
                        innerRadius={62}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {categories.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={colors[index % colors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatMoney(v)} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-state">No category data yet.</p>
                )}
              </Panel>
            </div>

            <div className="chart-grid" id="products">
              <Panel
                title="Top-performing products"
                subtitle="Top 5 products by revenue"
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e9edf4"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `₱${Math.round(v / 1000)}k`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={115}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#6366f1"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              {/* FIX: The Marketing panel now has the matching ID. */}
              <Panel
                id="marketing"
                title="Marketing performance"
                subtitle="Campaign results by platform"
                className="marketing-panel"
              >
                {marketing.length ? (
                  <div className="marketing-list">
                    {marketing.map((item, index) => (
                      <div className="marketing-item" key={item.platform}>
                        <div
                          className="marketing-rank"
                          style={{
                            background: `${colors[index % colors.length]}18`,
                            color: colors[index % colors.length],
                          }}
                        >
                          {index + 1}
                        </div>

                        <div className="marketing-info">
                          <div className="marketing-title">
                            <strong>{item.platform}</strong>
                            <span>{item.conversions} conversions</span>
                          </div>

                          <div className="progress-track">
                            <div
                              style={{
                                width: `${
                                  Math.min(
                                    100,
                                    item.conversions /
                                      Math.max(
                                        ...marketing.map((m) => m.conversions),
                                        1,
                                      ) *
                                      100,
                                  )
                                }%`,
                                background: colors[index % colors.length],
                              }}
                            />
                          </div>

                          <small>
                            {item.clicks.toLocaleString()} clicks · Spend{' '}
                            {formatMoney(item.total_spend)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No marketing data yet.</p>
                )}
              </Panel>
            </div>

            <div className="bottom-grid" id="inventory">
              <Panel
                title="Inventory alerts"
                subtitle="Products at or below their reorder level"
              >
                <div className="inventory-summary">
                  <div className="inventory-alert-icon">
                    <AlertTriangle size={21} />
                  </div>
                  <div>
                    <strong>{summary.low_stock_products}</strong>
                    <span>Products need attention</span>
                  </div>
                </div>

                {data.inventory_alerts?.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Stock</th>
                          <th>Reorder at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.inventory_alerts.map((item, index) => (
                          <tr key={`${item.name}-${index}`}>
                            <td>{item.name}</td>
                            <td>{item.category}</td>
                            <td>
                              <span className="stock-pill">
                                {item.stock_quantity}
                              </span>
                            </td>
                            <td>{item.reorder_level}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-state">
                    No inventory alerts. Stock looks good!
                  </p>
                )}
              </Panel>

              <Panel
                title="Revenue forecast"
                subtitle="Simple baseline estimate"
              >
                <div className="forecast-card">
                  <div className="forecast-icon">
                    <TrendingUp size={22} />
                  </div>
                  <p>Estimated monthly revenue</p>
                  <h2>
                    {formatMoney(data.forecast?.estimated_monthly_revenue)}
                  </h2>
                  <span>
                    Based on the average of the last 3 recorded months
                  </span>
                </div>

                <div className="forecast-note">
                  <Activity size={17} />
                  <p>
                    This is a basic reference estimate, not a guaranteed
                    prediction. More historical data can improve forecasting.
                  </p>
                </div>
              </Panel>
            </div>
          </>
        )}

        <footer>
          SalesInsight · Business Intelligence Dashboard · Laravel + React
        </footer>
      </main>
    </div>
  )
}
