import { useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity, AlertCircle, ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays,
  Check, ChevronDown, ChevronRight, CircleHelp, Download, FileSearch, Fingerprint,
  Info, RadioTower, Search, ShieldCheck, Smartphone, Signal, SlidersHorizontal,
  UserRound, X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Subscriber = {
  id: string; callerLabel: string; phoneNumber: string; status: string; plan: string; region: string;
  activatedAt: string; imei: string; lastSeenAt: string;
};
type CallRecord = {
  id: string; fromNumber: string; toNumber: string; startedAt: string;
  durationSeconds: number; callType: 'Voice' | 'SMS'; status: 'Completed' | 'Missed';
  towerId: string;
};
type Tower = { id: string; name: string; area: string; latitude: number; longitude: number; technology: string };
type Device = { imei: string; model: string; manufacturer: string; phoneNumber: string };

const subscribers: Subscriber[] = [
  { id: 'sub-107', callerLabel: 'Demo caller 0107', phoneNumber: '+1-202-555-0107', status: 'Active', plan: 'Civic Connect · 12 GB', region: 'Washington, DC', activatedAt: '2022-08-14', imei: '359881074261508', lastSeenAt: '2025-03-18T14:42:00Z' },
  { id: 'sub-114', callerLabel: 'Demo caller 0114', phoneNumber: '+1-202-555-0114', status: 'Active', plan: 'Civic Connect · 8 GB', region: 'Washington, DC', activatedAt: '2023-02-03', imei: '356938035643809', lastSeenAt: '2025-03-18T13:17:00Z' },
  { id: 'sub-126', callerLabel: 'Demo caller 0126', phoneNumber: '+1-202-555-0126', status: 'Active', plan: 'Metro Flex · 20 GB', region: 'Washington, DC', activatedAt: '2021-11-29', imei: '351756051523999', lastSeenAt: '2025-03-18T11:08:00Z' },
  { id: 'sub-139', callerLabel: 'Demo caller 0139', phoneNumber: '+1-202-555-0139', status: 'Suspended', plan: 'Civic Connect · 4 GB', region: 'Washington, DC', activatedAt: '2024-05-07', imei: '353918061092817', lastSeenAt: '2025-03-17T20:31:00Z' },
  { id: 'sub-142', callerLabel: 'Demo caller 0142', phoneNumber: '+1-202-555-0142', status: 'Active', plan: 'Metro Flex · 20 GB', region: 'Washington, DC', activatedAt: '2020-09-21', imei: '354628104773651', lastSeenAt: '2025-03-18T09:58:00Z' },
];

const towers: Tower[] = [
  { id: 'TWR-DC-04', name: 'Pine & Ninth', area: 'North Quarter', latitude: 38.914, longitude: -77.024, technology: '5G NR' },
  { id: 'TWR-DC-08', name: 'Canal Steps', area: 'Market Basin', latitude: 38.901, longitude: -77.036, technology: 'LTE' },
  { id: 'TWR-DC-11', name: 'Cedar Exchange', area: 'Old Foundry', latitude: 38.907, longitude: -77.012, technology: '5G NR' },
  { id: 'TWR-DC-15', name: 'Museum Loop', area: 'East Commons', latitude: 38.916, longitude: -77.006, technology: 'LTE' },
];

const devices: Device[] = subscribers.map((sub, i) => ({
  imei: sub.imei,
  model: ['Aster 6', 'Morrow One', 'Aster 8 Pro', 'Lumen S', 'Morrow One Plus'][i],
  manufacturer: ['Northstar Mobile', 'Morrow Labs', 'Northstar Mobile', 'Lumen Devices', 'Morrow Labs'][i],
  phoneNumber: sub.phoneNumber,
}));

const calls: CallRecord[] = [
  { id: 'c-01', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0114', startedAt: '2025-03-18T14:32:00Z', durationSeconds: 428, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-04' },
  { id: 'c-02', fromNumber: '+1-202-555-0126', toNumber: '+1-202-555-0107', startedAt: '2025-03-18T12:18:00Z', durationSeconds: 183, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-08' },
  { id: 'c-03', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0142', startedAt: '2025-03-17T19:46:00Z', durationSeconds: 62, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-11' },
  { id: 'c-04', fromNumber: '+1-202-555-0139', toNumber: '+1-202-555-0107', startedAt: '2025-03-17T16:03:00Z', durationSeconds: 0, callType: 'Voice', status: 'Missed', towerId: 'TWR-DC-15' },
  { id: 'c-05', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0114', startedAt: '2025-03-16T10:21:00Z', durationSeconds: 314, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-08' },
  { id: 'c-06', fromNumber: '+1-202-555-0126', toNumber: '+1-202-555-0107', startedAt: '2025-03-15T08:15:00Z', durationSeconds: 97, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-04' },
  { id: 'c-07', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0142', startedAt: '2025-03-14T22:07:00Z', durationSeconds: 205, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-11' },
  { id: 'c-08', fromNumber: '+1-202-555-0114', toNumber: '+1-202-555-0107', startedAt: '2025-03-13T18:55:00Z', durationSeconds: 0, callType: 'Voice', status: 'Missed', towerId: 'TWR-DC-04' },
  { id: 'c-09', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0126', startedAt: '2025-03-12T11:36:00Z', durationSeconds: 48, callType: 'SMS', status: 'Completed', towerId: 'TWR-DC-15' },
  { id: 'c-10', fromNumber: '+1-202-555-0142', toNumber: '+1-202-555-0107', startedAt: '2025-03-11T15:42:00Z', durationSeconds: 521, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-08' },
  { id: 'c-11', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0139', startedAt: '2025-03-10T09:20:00Z', durationSeconds: 146, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-11' },
  { id: 'c-12', fromNumber: '+1-202-555-0114', toNumber: '+1-202-555-0126', startedAt: '2025-03-18T08:22:00Z', durationSeconds: 239, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-15' },
  { id: 'c-13', fromNumber: '+1-202-555-0142', toNumber: '+1-202-555-0114', startedAt: '2025-03-16T13:04:00Z', durationSeconds: 181, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-11' },
  { id: 'c-14', fromNumber: '+1-202-555-0126', toNumber: '+1-202-555-0139', startedAt: '2025-03-14T17:15:00Z', durationSeconds: 0, callType: 'Voice', status: 'Missed', towerId: 'TWR-DC-15' },
  { id: 'c-15', fromNumber: '+1-202-555-0139', toNumber: '+1-202-555-0142', startedAt: '2025-03-12T20:19:00Z', durationSeconds: 276, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-04' },
  { id: 'c-16', fromNumber: '+1-202-555-0114', toNumber: '+1-202-555-0142', startedAt: '2025-03-10T12:47:00Z', durationSeconds: 33, callType: 'SMS', status: 'Completed', towerId: 'TWR-DC-08' },
  { id: 'c-17', fromNumber: '+1-202-555-0107', toNumber: '+1-202-555-0139', startedAt: '2025-03-08T19:02:00Z', durationSeconds: 154, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-15' },
  { id: 'c-18', fromNumber: '+1-202-555-0142', toNumber: '+1-202-555-0107', startedAt: '2025-03-04T08:50:00Z', durationSeconds: 365, callType: 'Voice', status: 'Completed', towerId: 'TWR-DC-04' },
];

const queryClient = new QueryClient();
const defaultPhone = '+1-202-555-0107';
const defaultFrom = '2025-03-01';
const defaultTo = '2025-03-31';

function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(value)) + ' UTC';
}
function dateOnly(value: string) { return new Date(value).toISOString().slice(0, 10); }
function durationLabel(seconds: number) {
  if (!seconds) return '—';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m ${String(rest).padStart(2, '0')}s` : `${rest}s`;
}
function formatPhone(value: string) { return value.trim().replace(/[^\d+]/g, ''); }
function downloadCsv(filename: string, records: CallRecord[]) {
  const header = ['id', 'fromNumber', 'toNumber', 'startedAt', 'durationSeconds', 'callType', 'status', 'towerId'];
  const lines = [header.join(','), ...records.map((record) => header.map((key) => `"${String(record[key as keyof CallRecord]).replaceAll('"', '""')}"`).join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

function App() {
  const [activeView, setActiveView] = useState<'trace' | 'caller' | 'imei'>('trace');
  const [phoneInput, setPhoneInput] = useState(defaultPhone);
  const [selectedPhone, setSelectedPhone] = useState(defaultPhone);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [searchMessage, setSearchMessage] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [expandedNumber, setExpandedNumber] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const subscriber = subscribers.find((person) => person.phoneNumber === selectedPhone);
  const allForNumber = useMemo(() => calls.filter((call) => call.fromNumber === selectedPhone || call.toNumber === selectedPhone), [selectedPhone]);
  const filteredCalls = useMemo(() => allForNumber.filter((call) => {
    const date = dateOnly(call.startedAt);
    return date >= fromDate && date <= toDate && (!selectedTower || call.towerId === selectedTower);
  }).sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [allForNumber, fromDate, toDate, selectedTower]);
  const related = useMemo(() => {
    const map = new Map<string, CallRecord[]>();
    filteredCalls.forEach((call) => {
      const number = call.fromNumber === selectedPhone ? call.toNumber : call.fromNumber;
      if (!map.has(number)) map.set(number, []);
      map.get(number)?.push(call);
    });
    return [...map.entries()].map(([phone, records]) => ({
      phone, records: records.sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      count: records.length, last: records[0].startedAt,
      seconds: records.reduce((sum, record) => sum + record.durationSeconds, 0),
    })).sort((a, b) => b.count - a.count || b.last.localeCompare(a.last));
  }, [filteredCalls, selectedPhone]);
  const usedTowerIds = [...new Set(filteredCalls.map((call) => call.towerId))];
  const device = devices.find((item) => item.imei === subscriber?.imei);
  const queriedDevice = devices.find((item) => item.imei === imeiInput.replace(/\D/g, ''));

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }
  function runTrace(value = phoneInput) {
    const normalized = formatPhone(value);
    const match = subscribers.find((person) => formatPhone(person.phoneNumber) === normalized);
    if (!match) {
      setSearchMessage('No subscriber in this synthetic sample matches that number.');
      setSelectedPhone('');
      setSelectedTower(null);
      return;
    }
    setPhoneInput(match.phoneNumber);
    setSelectedPhone(match.phoneNumber);
    setSelectedTower(null);
    setExpandedNumber(null);
    setSearchMessage('');
    setActiveView('trace');
  }
  function runCallerSearch(value = phoneInput) {
    const normalized = formatPhone(value);
    const match = subscribers.find((person) => formatPhone(person.phoneNumber) === normalized);
    if (!match) {
      setSearchMessage('No caller information in this synthetic sample matches that number.');
      setSelectedPhone('');
      return;
    }
    setPhoneInput(match.phoneNumber);
    setSelectedPhone(match.phoneNumber);
    setSelectedTower(null);
    setExpandedNumber(null);
    setSearchMessage('');
    setActiveView('caller');
  }
  function openDeviceLookup(imei: string) {
    setImeiInput(imei);
    setActiveView('imei');
    setSearchMessage('');
  }
  function selectRelatedNumber(number: string) {
    setPhoneInput(number);
    runTrace(number);
  }
  const selectedTowerRecord = towers.find((tower) => tower.id === selectedTower);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark"><Signal size={19} strokeWidth={2.2} /></div>
          <div><div className="brand-name">Signal Desk</div><div className="brand-sub">Records workbench</div></div>
        </div>
        <nav>
          <div className="nav-caption">Workspace</div>
          <button data-testid="nav-number-trace" className={`nav-item ${activeView === 'trace' ? 'active' : ''}`} onClick={() => setActiveView('trace')}><FileSearch size={17} /><span>Number trace</span></button>
          <button data-testid="nav-caller-info" className={`nav-item ${activeView === 'caller' ? 'active' : ''}`} onClick={() => { setActiveView('caller'); setSearchMessage(''); if (selectedPhone) setPhoneInput(selectedPhone); }}><UserRound size={17} /><span>Caller information</span></button>
          <button data-testid="nav-imei-lookup" className={`nav-item ${activeView === 'imei' ? 'active' : ''}`} onClick={() => setActiveView('imei')}><Fingerprint size={17} /><span>IMEI lookup</span></button>
          <button data-testid="nav-tower-map" className="nav-item" onClick={() => { setActiveView('trace'); document.getElementById('tower-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><RadioTower size={17} /><span>Connected towers</span></button>
        </nav>
        <div className="side-spacer" />
        <div className="side-note"><strong>Demo environment</strong>Only synthetic sample records are loaded. No carrier systems or personal data are connected.</div>
        <div className="side-foot"><span className="signal-dot" /> LOCAL SAMPLE DATA <span style={{ marginLeft: 'auto' }}>v1.4.2</span></div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="crumb"><span>Workbench</span><ChevronRight size={13} /><strong>{activeView === 'trace' ? 'Number trace' : activeView === 'caller' ? 'Caller information' : 'IMEI lookup'}</strong></div>
          <div className="top-meta"><span>RECORDS SANDBOX</span><span className="top-pill"><span className="signal-dot" /> Synthetic data only</span><button aria-label="About this demo" title="About this demo" className="small-btn" style={{ padding: '6px' }} onClick={() => setShowHelp((v) => !v)}><CircleHelp size={14} /></button></div>
        </header>
        <main className="content">
          {activeView === 'trace' ? (
            <>
              <div className="page-heading">
                <div><div className="eyebrow">Telecom records · explore</div><h1>Number trace</h1><p>Review activity, connected numbers, and network touchpoints.</p></div>
                <div className="date-stamp">SAMPLE WINDOW<strong>March 2025 · Washington, DC</strong></div>
              </div>
              <section className="search-panel" aria-label="Trace a phone number">
                <div className="search-panel-head"><div className="section-label"><Search size={15} /> Look up a number</div><span className="micro-label">Phone number</span></div>
                <div className="search-grid">
                  <div className="field"><label htmlFor="trace-phone">NUMBER TO TRACE</label><div className="input-wrap"><Search size={15} /><input data-testid="input-trace-phone" id="trace-phone" className="with-icon" value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') runTrace(); }} placeholder="+1-202-555-0107" /></div></div>
                  <div className="field"><label htmlFor="from-date">FROM</label><input data-testid="input-date-from" id="from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></div>
                  <div className="field"><label htmlFor="to-date">TO</label><input data-testid="input-date-to" id="to-date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></div>
                  <button data-testid="button-run-trace" className="button button-primary" onClick={() => runTrace()}><Search size={15} /> Trace number</button>
                </div>
                <div className="sample-hint"><span>Try a sample:</span>{subscribers.slice(0, 4).map((person) => <button key={person.id} className="sample-chip" data-testid={`sample-number-${person.id}`} onClick={() => runTrace(person.phoneNumber)}>{person.phoneNumber}</button>)}</div>
                {searchMessage && <div className="status-line" role="status"><AlertCircle size={14} />{searchMessage}</div>}
              </section>
              {subscriber ? (
                <>
                  <div className="overview-grid">
                    <section className="panel subscriber-panel" aria-label="Subscriber profile">
                      <div className="panel-topline" />
                      <div className="panel-inner">
                        <div className="subscriber-head">
                          <div className="identity"><div className="identity-icon"><UserRound size={21} /></div><div><h2 className="number-title" data-testid="text-caller-name">{subscriber.callerLabel}</h2><div className="subscriber-meta"><span data-testid="text-subscriber-number">{subscriber.phoneNumber}</span> <span style={{ margin: '0 5px' }}>·</span> {subscriber.region} <span style={{ margin: '0 5px' }}>·</span> Subscriber ID {subscriber.id.toUpperCase()}</div></div></div>
                          <span className="active-badge"><span className="signal-dot" />{subscriber.status}</span>
                        </div>
                        <div className="subscriber-facts">
                          <div className="fact"><div className="fact-label">Plan</div><div className="fact-value">{subscriber.plan}</div></div>
                          <div className="fact"><div className="fact-label">Activated</div><div className="fact-value">{new Date(`${subscriber.activatedAt}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>
                          <div className="fact"><div className="fact-label">Device IMEI</div><button className="tower-link" data-testid="button-device-pivot" onClick={() => openDeviceLookup(subscriber.imei)}>{subscriber.imei}</button></div>
                          <div className="fact"><div className="fact-label">Last seen</div><div className="fact-value">{displayDate(subscriber.lastSeenAt).replace(', 2025', '')}</div></div>
                        </div>
                      </div>
                    </section>
                    <section className="panel metrics-panel" aria-label="Activity summary">
                      <div className="metrics-heading"><span>Selected window activity</span><Activity size={14} /></div>
                      <div className="metric-row"><div><div className="metric-number">{filteredCalls.length}</div><div className="metric-label">Call & message records</div></div><div className="metric-change">{allForNumber.length ? `${Math.round(filteredCalls.length / allForNumber.length * 100)}% in range` : 'No activity'}</div></div>
                      <div className="metric-row"><div><div className="metric-number">{related.length}</div><div className="metric-label">Related numbers</div></div><div className="metric-change">Unique peers</div></div>
                      <div className="metric-row"><div><div className="metric-number">{usedTowerIds.length}</div><div className="metric-label">Connected towers</div></div><div className="metric-change">Network touchpoints</div></div>
                    </section>
                  </div>

                  <div className="section-header">
                    <div className="section-title"><div><h2>Call records</h2><div className="section-sub">Inbound and outbound activity in the selected date range</div></div><span className="count-chip">{filteredCalls.length} records</span></div>
                    <div className="section-actions">
                      <button data-testid="button-export-calls" className="small-btn" disabled={!filteredCalls.length} onClick={() => { downloadCsv(`${subscriber.phoneNumber.slice(-4)}-call-records.csv`, filteredCalls); showToast(`Exported ${filteredCalls.length} call records.`); }}><Download size={13} /> Export CSV</button>
                    </div>
                  </div>
                  <div className="filter-row">
                    <div className="filter-title"><SlidersHorizontal size={13} /> DATE WINDOW</div>
                    <label className="compact-field">From <input aria-label="Call log start date" data-testid="filter-from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
                    <label className="compact-field">To <input aria-label="Call log end date" data-testid="filter-to-date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
                    {selectedTowerRecord && <button className="sample-chip" onClick={() => setSelectedTower(null)} aria-label="Clear tower filter">Tower {selectedTowerRecord.id} <X size={10} /></button>}
                    <span className="filter-summary">{filteredCalls.length} / {allForNumber.length} total in sample</span>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Direction</th><th>Other party</th><th>Date / time</th><th>Duration</th><th>Type</th><th>Status</th><th>Connected tower</th></tr></thead>
                      <tbody>
                        {filteredCalls.map((call) => {
                          const isOutgoing = call.fromNumber === subscriber.phoneNumber;
                          const other = isOutgoing ? call.toNumber : call.fromNumber;
                          return <tr key={call.id} data-testid={`row-call-${call.id}`}>
                            <td><span className="call-type">{isOutgoing ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}{isOutgoing ? 'Outgoing' : 'Incoming'}</span></td>
                            <td><button className="tower-link" onClick={() => selectRelatedNumber(other)}>{other}</button></td>
                            <td className="mono-text">{displayDate(call.startedAt)}</td><td className="mono-text">{durationLabel(call.durationSeconds)}</td>
                            <td>{call.callType}</td><td><span className={`status-tag ${call.status === 'Missed' ? 'missed' : ''}`}>{call.status}</span></td>
                            <td><button className="tower-link" data-testid={`pivot-tower-${call.towerId}`} onClick={() => { setSelectedTower(selectedTower === call.towerId ? null : call.towerId); document.getElementById('tower-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }}>{call.towerId}</button></td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                    {!filteredCalls.length && <div className="empty-state" style={{ margin: 12 }}><CalendarDays className="empty-icon" size={22} /><strong>No records in this window</strong><p>Choose a wider date range or clear the tower filter to review other sample activity.</p></div>}
                  </div>

                  <div className="section-header">
                    <div className="section-title"><div><h2>Related numbers</h2><div className="section-sub">Other synthetic numbers found in this trace window</div></div><span className="count-chip">{related.length} peers</span></div>
                    <div className="section-actions"><button data-testid="button-export-related" className="small-btn" disabled={!filteredCalls.length} onClick={() => { downloadCsv(`${subscriber.phoneNumber.slice(-4)}-related-activity.csv`, filteredCalls); showToast('Related-number activity exported.'); }}><Download size={13} /> Export activity</button></div>
                  </div>
                  {related.length ? <div className="related-list">
                    {related.map((item) => <article className="related-card" key={item.phone} data-testid={`card-related-${item.phone.slice(-4)}`}>
                      <div className="related-main">
                        <div><button className="tower-link related-number" onClick={() => selectRelatedNumber(item.phone)}>{item.phone}</button><div className="related-hint">Synthetic subscriber · click number to trace</div></div>
                        <div><span className="related-stat-label">Interactions</span><span className="related-stat">{item.count} records</span></div>
                        <div><span className="related-stat-label">Last activity</span><span className="related-stat">{displayDate(item.last).replace(', 2025', '')}</span></div>
                        <button aria-label={`${expandedNumber === item.phone ? 'Collapse' : 'Expand'} call logs for ${item.phone}`} data-testid={`button-expand-${item.phone.slice(-4)}`} className="expand-btn" onClick={() => setExpandedNumber(expandedNumber === item.phone ? null : item.phone)}>{expandedNumber === item.phone ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
                      </div>
                      {expandedNumber === item.phone && <div className="related-detail">
                        <div className="related-detail-head"><span>Activity with {item.phone}</span><span>{item.count} items · {durationLabel(item.seconds)} total voice time</span></div>
                        {item.records.map((record) => <div className="mini-row" key={record.id}><span>{displayDate(record.startedAt)}</span><span>{record.fromNumber === selectedPhone ? 'Outbound' : 'Inbound'} · {record.callType}</span><span>{durationLabel(record.durationSeconds)}</span><span>{record.towerId}</span></div>)}
                      </div>}
                    </article>)}
                  </div> : <div className="empty-state"><UserRound className="empty-icon" size={22} /><strong>No related numbers found</strong><p>There are no connected peers in the selected window. Widen the dates to include more sample records.</p></div>}

                  <div className="secondary-grid">
                    <section className="panel tower-panel" id="tower-panel">
                      <div className="panel-heading-row"><div><h3>Connected towers</h3><p>Touchpoints appearing in the current number trace</p></div><span className="count-chip">{usedTowerIds.length} towers</span></div>
                      {usedTowerIds.length ? <div className="tower-content">
                        <div className="schematic-map" role="img" aria-label="Schematic view of connected sample towers">
                          <div className="map-river" /><div className="map-road" />
                          {usedTowerIds.map((towerId, index) => {
                            const positions = [{ left: '24%', top: '19%' }, { left: '65%', top: '20%' }, { left: '46%', top: '55%' }, { left: '76%', top: '63%' }];
                            return <button title={towers.find((tower) => tower.id === towerId)?.name} aria-label={`Filter calls by ${towerId}`} key={towerId} className={`tower-pin ${selectedTower === towerId ? 'selected' : ''}`} style={positions[index % positions.length]} onClick={() => setSelectedTower(selectedTower === towerId ? null : towerId)}><RadioTower size={13} /></button>;
                          })}
                          <div className="map-legend">SCHEMATIC · NOT TO SCALE</div>
                        </div>
                        <div className="tower-list">{usedTowerIds.map((towerId) => {
                          const tower = towers.find((item) => item.id === towerId);
                          const count = filteredCalls.filter((call) => call.towerId === towerId).length;
                          return tower ? <div key={towerId} role="button" tabIndex={0} className={`tower-row ${selectedTower === towerId ? 'selected' : ''}`} onClick={() => setSelectedTower(selectedTower === towerId ? null : towerId)} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedTower(selectedTower === towerId ? null : towerId); }}>
                            <div className="tower-row-main"><div className="tower-marker"><RadioTower size={13} /></div><div><div className="tower-name">{tower.name}</div><div className="tower-area">{tower.area} · {count} records</div></div></div><span className="tower-tech">{tower.technology}</span>
                          </div> : null;
                        })}</div>
                      </div> : <div className="empty-state"><RadioTower className="empty-icon" size={20} /><strong>No tower touchpoints</strong><p>Adjust the date range to view connected sample sites.</p></div>}
                    </section>
                    <section className="panel device-panel">
                      <div className="panel-heading-row"><div><h3>Device record</h3><p>IMEI association from sample subscriber data</p></div><Smartphone size={16} color="#a76643" /></div>
                      {device ? <><div className="device-data">
                        <div><div className="device-label">Handset model</div><div className="device-model">{device.model}</div><div className="subscriber-meta">{device.manufacturer}</div></div>
                        <div className="device-field"><div className="device-label">IMEI</div><div className="device-value">{device.imei}</div></div>
                        <div className="device-field"><div className="device-label">Associated line</div><div className="device-value">{device.phoneNumber}</div></div>
                      </div><button data-testid="button-open-imei" className="button button-quiet device-action" onClick={() => openDeviceLookup(device.imei)}><Fingerprint size={14} /> Open IMEI lookup <ArrowRight size={13} /></button></> : <div className="empty-state"><Smartphone className="empty-icon" size={20} /><strong>No device record</strong><p>This number has no device association in the sample.</p></div>}
                    </section>
                  </div>
                </>
              ) : <div className="empty-state"><FileSearch className="empty-icon" size={23} /><strong>Number not in sample</strong><p>Use one of the listed sample numbers above. This workbench searches local synthetic records only.</p></div>}
              <div className="disclaimer"><ShieldCheck size={15} /><div><strong>Synthetic records for demonstration.</strong> All numbers are reserved fictional 202-555-01xx examples. Towers, subscriber profiles, device identifiers, and event logs are invented; this tool is not connected to a carrier network.</div></div>
            </>
          ) : activeView === 'imei' ? (
            <div className="lookup-view">
              <div className="page-heading"><div><div className="eyebrow">Device association · explore</div><h1>IMEI lookup</h1><p>Find a synthetic handset record and pivot back to its associated line.</p></div><div className="date-stamp">LOOKUP MODE<strong>Local sample index</strong></div></div>
              <section className="lookup-hero">
                <h2>Search a device identifier</h2><p>Enter one of the sample IMEIs to see the associated handset and reserved demo number.</p>
                <div className="lookup-form"><div className="field"><label htmlFor="imei-search">IMEI NUMBER</label><div className="input-wrap"><Fingerprint size={15} /><input data-testid="input-imei" id="imei-search" className="with-icon" inputMode="numeric" value={imeiInput} onChange={(event) => setImeiInput(event.target.value.replace(/[^\d]/g, '').slice(0, 15))} onKeyDown={(event) => { if (event.key === 'Enter') showToast(queriedDevice ? 'Device record found.' : 'No matching device in sample.'); }} placeholder="15-digit synthetic identifier" /></div></div><button data-testid="button-search-imei" className="button button-primary" onClick={() => showToast(queriedDevice ? 'Device record found.' : 'No matching device in sample.')}><Search size={15} /> Find device</button></div>
                <div className="sample-hint"><span>Sample IMEIs:</span>{devices.slice(0, 3).map((item) => <button key={item.imei} className="sample-chip" onClick={() => setImeiInput(item.imei)}>{item.imei}</button>)}</div>
              </section>
              <div className="section-header"><div className="section-title"><div><h2>Lookup result</h2><div className="section-sub">Matched against the local demonstration index</div></div></div></div>
              {queriedDevice ? <section className="pivot-card lookup-results" data-testid="card-imei-result">
                <div className="subscriber-head"><div className="identity"><div className="identity-icon"><Smartphone size={21} /></div><div><div className="device-model">{queriedDevice.model}</div><div className="subscriber-meta">{queriedDevice.manufacturer} · Synthetic handset record</div></div></div><span className="active-badge"><Check size={12} /> MATCHED</span></div>
                <div className="pivot-list"><div className="pivot-item"><span>IMEI</span><span>{queriedDevice.imei}</span></div><div className="pivot-item"><span>Associated number</span><span>{queriedDevice.phoneNumber}</span></div><div className="pivot-item"><span>Subscriber status</span><span>{subscribers.find((person) => person.phoneNumber === queriedDevice.phoneNumber)?.status}</span></div><div className="pivot-item"><span>Network region</span><span>{subscribers.find((person) => person.phoneNumber === queriedDevice.phoneNumber)?.region}</span></div></div>
                <button data-testid="button-pivot-to-number" className="button button-primary" style={{ marginTop: 17 }} onClick={() => { runTrace(queriedDevice.phoneNumber); setActiveView('trace'); }}>Trace associated number <ArrowRight size={14} /></button>
              </section> : <div className="empty-state lookup-results"><Fingerprint className="empty-icon" size={23} /><strong>{imeiInput.length ? 'No device match' : 'Ready for a device identifier'}</strong><p>{imeiInput.length ? 'That identifier is not in this fictional sample index. Try one of the sample IMEIs above.' : 'Enter a 15-digit synthetic IMEI or select one of the samples to begin.'}</p></div>}
              <div className="disclaimer"><ShieldCheck size={15} /><div><strong>Local synthetic sample index.</strong> These identifiers and handset associations are invented for this demo. No device registry or external service is queried.</div></div>
            </div>
          ) : (
            <div className="lookup-view">
              <div className="page-heading">
                <div><div className="eyebrow">Subscriber records · search</div><h1>Caller information</h1><p>Search by phone number to view a sample caller profile and line details.</p></div>
                <div className="date-stamp">DIRECTORY LOOKUP<strong>Local sample index</strong></div>
              </div>
              <section className="lookup-hero" aria-label="Search caller information">
                <h2>Search by phone number</h2>
                <p>Enter a reserved demo number to find its synthetic caller profile.</p>
                <div className="lookup-form">
                  <div className="field"><label htmlFor="caller-phone-search">PHONE NUMBER</label><div className="input-wrap"><UserRound size={15} /><input data-testid="input-caller-phone" id="caller-phone-search" className="with-icon" value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') runCallerSearch(); }} placeholder="+1-202-555-0107" /></div></div>
                  <button data-testid="button-search-caller" className="button button-primary" onClick={() => runCallerSearch()}><Search size={15} /> Search caller</button>
                </div>
                <div className="sample-hint"><span>Try a sample:</span>{subscribers.map((person) => <button key={person.id} className="sample-chip" data-testid={`caller-sample-${person.id}`} onClick={() => runCallerSearch(person.phoneNumber)}>{person.phoneNumber}</button>)}</div>
                {searchMessage && <div className="status-line" role="status"><AlertCircle size={14} />{searchMessage}</div>}
              </section>
              <div className="section-header"><div className="section-title"><div><h2>Caller profile</h2><div className="section-sub">Matched against the local synthetic sample index</div></div></div></div>
              {subscriber ? <section className="pivot-card lookup-results" data-testid="card-caller-result">
                <div className="subscriber-head">
                  <div className="identity"><div className="identity-icon"><UserRound size={21} /></div><div><h2 className="number-title" data-testid="text-caller-profile-name">{subscriber.callerLabel}</h2><div className="subscriber-meta">Synthetic caller label · {subscriber.region}</div></div></div>
                  <span className="active-badge"><span className="signal-dot" />{subscriber.status}</span>
                </div>
                <div className="pivot-list">
                  <div className="pivot-item"><span>Phone number</span><span data-testid="text-caller-profile-phone">{subscriber.phoneNumber}</span></div>
                  <div className="pivot-item"><span>Subscriber ID</span><span>{subscriber.id.toUpperCase()}</span></div>
                  <div className="pivot-item"><span>Service plan</span><span>{subscriber.plan}</span></div>
                  <div className="pivot-item"><span>Activated</span><span>{new Date(`${subscriber.activatedAt}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                  <div className="pivot-item"><span>Device IMEI</span><button className="tower-link" data-testid="button-caller-imei" onClick={() => openDeviceLookup(subscriber.imei)}>{subscriber.imei}</button></div>
                  <div className="pivot-item"><span>Last seen</span><span>{displayDate(subscriber.lastSeenAt)}</span></div>
                </div>
                <button data-testid="button-caller-open-trace" className="button button-primary" style={{ marginTop: 17 }} onClick={() => runTrace(subscriber.phoneNumber)}>Open number trace <ArrowRight size={14} /></button>
              </section> : <div className="empty-state lookup-results"><UserRound className="empty-icon" size={23} /><strong>{phoneInput ? 'No caller match' : 'Search for a caller'}</strong><p>{phoneInput ? 'That phone number is not in this fictional sample index. Try one of the reserved sample numbers above.' : 'Enter a synthetic phone number or choose a sample number to begin.'}</p></div>}
              <div className="disclaimer"><ShieldCheck size={15} /><div><strong>Synthetic caller data for demonstration.</strong> Caller labels and line details are invented; this search does not identify real people or connect to a carrier database.</div></div>
            </div>
          )}
        </main>
      </div>
      {showHelp && <div role="dialog" aria-modal="true" aria-label="About Signal Desk" className="toast-note" style={{ bottom: 70 }}><Info size={16} /><span>Signal Desk is a browser-only demo with fictional records.</span><button aria-label="Close information" onClick={() => setShowHelp(false)} style={{ border: 0, color: 'inherit', background: 'transparent', padding: 0, display: 'grid' }}><X size={14} /></button></div>}
      {toast && <div className="toast-note" role="status"><Check size={15} />{toast}</div>}
    </div>
  );
}

function Router() {
  return <Switch><Route path="/" component={App} /><Route component={NotFound} /></Switch>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Root() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default Root;
