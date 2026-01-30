import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation, useMatch } from 'react-router-dom';
import { 
  Search, Moon, Sun, Github, 
  Hash, Database, ArrowRight,
  Lock, Unlock, Shield, Terminal, Check, Copy,
  RefreshCw, AlertCircle, Cpu, ChevronRight, MessageSquare, Fingerprint, Eye, EyeOff
} from 'lucide-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MAIN_RPC_PROXY = '/api/main';
const SECOND_RPC_PROXY = '/api/scan';

const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

const MainLayout = () => {
  const [isDark, setIsDark] = useState(true);
  const [currentBlock, setCurrentBlock] = useState<number>(44444);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const fetchEpochMetrics = async () => {
      try {
        const response = await fetch(`${SECOND_RPC_PROXY}/epochs/metrics`);
        if (!response.ok) throw new Error('Failed to fetch epoch metrics');
        const data = await response.json();
        const latestEpoch = Number(data?.latest_epoch);
        if (!Number.isNaN(latestEpoch)) {
          setCurrentBlock(latestEpoch);
        }
      } catch (err) {
        return;
      }
    };
    fetchEpochMetrics();
    const interval = setInterval(fetchEpochMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 font-mono">
      <Header isDark={isDark} setIsDark={setIsDark} />
      <main className="flex-1 overflow-hidden p-1 md:p-2">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/tx/:hash" element={<TxView />} />
          <Route path="/address/:address" element={<AddressView />} />
          <Route path="/epoch/:epoch" element={<EpochView />} />
        </Routes>
      </main>
      <Footer currentBlock={currentBlock} />
    </div>
  );
};

const Header = ({ isDark, setIsDark }: { isDark: boolean, setIsDark: (v: boolean) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const isHomePage = useMatch('/');

  const performSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.trim();
    if (query.length === 64) {
      navigate(`/tx/${query}`);
    } else if (query.startsWith('oct') && query.length > 40) {
      navigate(`/address/${query}`);
    } else if (!isNaN(Number(query))) {
      navigate(`/epoch/${query}`);
    } else {
      alert('Invalid search query');
    }
  };

  return (
    <header className="grid grid-cols-3 items-center h-[56px] px-4 border-b border-[var(--border)] bg-[var(--background)] backdrop-blur-md z-10 sticky top-0">
      <div className="flex items-center gap-4 justify-start">
        <h1 
          onClick={() => navigate('/')}
          className="text-lg font-semibold flex items-center gap-2 text-[var(--foreground)] cursor-pointer"
        >
          <Cpu className="text-[var(--primary)]" size={20} />
          <span>OctWa Analyzer</span>
        </h1>
      </div>
      <div className="flex justify-center">
        {!isHomePage && (
          <form onSubmit={performSearch} className="hidden md:flex items-center gap-2 w-full max-w-2xl">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search hash / addr / epoch"
              className="bg-[var(--muted)] border border-[var(--border)] px-3 py-1 text-xs focus:outline-none focus:border-[var(--primary)] w-full rounded-sm text-[var(--foreground)]"
            />
            <button type="submit" className="bg-[var(--primary)] text-white px-3 py-1 text-xs font-medium rounded-sm hover:opacity-90 whitespace-nowrap">
              Analyze
            </button>
          </form>
        )}
      </div>

      <div className="flex items-center gap-4 justify-end">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a href="https://github.com/m-tq/OctWa" target="_blank" rel="noopener" className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <Github size={18} />
        </a>
      </div>
    </header>
  );
};

const Footer = ({ currentBlock }: { currentBlock: number }) => (
  <footer className="flex items-center justify-between p-1 border-t border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--muted-foreground)]">
    <div className="w-1/3 text-left">
       <span>Version: v.0.0.1</span>
    </div>
    <div className="w-1/3 text-center flex justify-center items-center gap-2">
      <span className="text-[var(--muted-foreground)]">Network:</span>
      <span className="text-[var(--foreground)]">Octra Mainnet</span>
    </div>
    <div className="w-1/3 flex justify-end items-center gap-2">
      <span className="text-[var(--muted-foreground)]">Current Block:</span>
      <span className="text-[var(--primary)]">#{currentBlock}</span>
    </div>
  </footer>
);

const Welcome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const performSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    if (query.length === 64) {
      navigate(`/tx/${query}`);
    } else if (query.startsWith('oct') && query.length > 40) {
      navigate(`/address/${query}`);
    } else if (!isNaN(Number(query))) {
      navigate(`/epoch/${query}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center px-4">
      <form onSubmit={performSearch} className="w-full flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="tx hash / address / epoch"
            className="w-full bg-[var(--background)] border border-[var(--border)] p-4 focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)] transition-colors"
          />
        </div>
        <button 
          type="submit"
          className="bg-[var(--primary)] text-white px-8 font-medium border border-[var(--primary)] hover:opacity-90 transition-opacity"
        >
          Analyze
        </button>
      </form>
    </div>
  );
};

const TxView = () => {
  const { hash } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [revealData, setRevealData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${MAIN_RPC_PROXY}/tx/${hash}`);
        if (!response.ok) throw new Error('Transaction not found');
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (hash) fetchData();
  }, [hash]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const decodeHex = (hex: string) => {
    if (!hex || hex === "[]") return hex;
    try {
      if (/^[0-9A-F]+$/i.test(hex)) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      }
    } catch (e) { return hex; }
    return hex;
  };

  const resolveTimestamp = () => {
    const candidates = [
      data?.timestamp,
      data?.parsed_tx?.timestamp,
      innerData?.timestamp,
      data?.time,
      data?.date
    ];
    for (const value of candidates) {
      if (value === undefined || value === null) continue;
      const num = typeof value === 'string' ? Number(value) : value;
      if (!Number.isFinite(num)) continue;
      const ms = num > 1e12 ? num : num * 1000;
      return new Date(ms).toLocaleString();
    }
    return '';
  };

  const innerData = useMemo(() => {
    if (!data?.data) return {};
    try {
      return typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
    } catch (e) {
      return {};
    }
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return null;

  const config = {
    standard: { color: 'text-[var(--muted-foreground)]', bg: 'bg-[var(--muted)]', icon: <ArrowRight size={18} />, label: 'Public Transfer' },
    private: { color: 'text-[#0000db]', bg: 'bg-[#0000db]/10', icon: <Lock size={18} />, label: 'Private Transfer' },
    decrypt: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <Unlock size={18} />, label: 'Balance Decrypt' },
    encrypt: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: <Shield size={18} />, label: 'Balance Encrypt' },
    call: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <Terminal size={18} />, label: 'Contract Call' }
  }[data.op_type as string] || { color: 'text-[var(--muted-foreground)]', bg: 'bg-[var(--muted)]', icon: <ArrowRight size={18} />, label: 'Transaction' };

  const gasFee = (parseInt(data.ou || '0') * 0.000001).toFixed(6);
  const decodedMsg = decodeHex(data.message);

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-3 overflow-hidden p-2">
      <div className="flex items-center gap-2 mb-1">
        <button 
          onClick={() => navigate('/')}
          className="text-[12px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 hover:text-[var(--foreground)] transition-colors rounded-sm"
        >
          Back
        </button>
        <ChevronRight size={12} className="text-[var(--muted-foreground)]" />
        <span className="text-[12px] font-medium text-[var(--primary)]">Transaction Details</span>
      </div>

      {/* HEADER CARD */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-md", config.bg, config.color)}>
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={cn("text-xl font-semibold", config.color)}>{config.label}</h1>
                <span className="bg-[#0000db]/10 text-[#0000db] text-[10px] px-2 py-0.5 font-bold uppercase border border-[#0000db]/20">
                  {data.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)] mt-1">
                <Hash size={12} />
                <span className="text-[12px] font-bold truncate max-w-[150px] md:max-w-md">{data.tx_hash}</span>
                <button onClick={() => handleCopy(data.tx_hash, 'hash')} className="hover:text-[var(--foreground)] transition-colors">
                  {copied === 'hash' ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto text-right border-l-0 md:border-l border-[var(--border)] md:pl-6">
            <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Confirmed Epoch</p>
            <button
              onClick={() => navigate(`/epoch/${data.epoch}`)}
              className="text-lg font-bold text-[var(--primary)] hover:underline"
            >
              #{data.epoch.toLocaleString()}
            </button>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{resolveTimestamp()}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* LEFT COLUMN: FLOW + MEMO */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-h-0">
          {/* FLOW & VALUES */}
          <div className="bg-[var(--background)] border border-[var(--border)] p-4 flex flex-col justify-center rounded-none flex-shrink-0 h-auto lg:h-[220px]">
            <div className="space-y-4">
              <div className="relative">
                <span className="text-[10px] font-medium uppercase text-[var(--muted-foreground)] mb-1 block tracking-widest">From / Origin</span>
                <div className="bg-[var(--card)] border border-[var(--border)] p-3 flex items-center justify-between group">
                  <span className="text-xs font-bold truncate pr-4 text-[var(--foreground)]">{data.from}</span>
                  <button onClick={() => handleCopy(data.from, 'from')} className="opacity-40 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    {copied === 'from' ? <Check size={12}/> : <Copy size={12}/>}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-[var(--border)] border-t border-dashed border-[var(--muted-foreground)] opacity-30"></div>
                <div className={cn("p-1.5 border border-[var(--border)] bg-[var(--card)] shadow-sm", config.color)}>
                  {config.icon}
                </div>
                <div className="h-[1px] flex-1 bg-[var(--border)] border-t border-dashed border-[var(--muted-foreground)] opacity-30"></div>
              </div>

              <div className="relative">
                <span className="text-[10px] font-medium uppercase text-[var(--muted-foreground)] mb-1 block tracking-widest">To / Destination</span>
                <div className="bg-[var(--card)] border border-[var(--border)] p-3 flex items-center justify-between group">
                <span className={cn(
                  "text-xs font-bold truncate pr-4",
                  data.from === data.to ? "text-[var(--muted-foreground)] italic" : "text-[var(--foreground)]"
                )}>
                    {data.to}
                  </span>
                  <button onClick={() => handleCopy(data.to, 'to')} className="opacity-40 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    {copied === 'to' ? <Check size={12}/> : <Copy size={12}/>}
                  </button>
                </div>
                {data.from === data.to && (
                  <span className="text-[9px] absolute right-0 -bottom-4 font-bold text-amber-500 uppercase bg-amber-500/10 px-1 border border-amber-500/20">Self-Operation</span>
                )}
              </div>
            </div>
          </div>
          
          {/* MEMO BOX */}
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-none flex-1 min-h-0 flex flex-col h-auto lg:h-[320px]">
            <div className="flex items-center justify-between mb-2 border-b border-[var(--border)] pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-[var(--muted-foreground)]" />
                <h3 className="text-[10px] font-bold uppercase">Memo & Decoded Data</h3>
              </div>
            </div>
            <div className="flex-1 grid grid-rows-2 gap-2 min-h-0">
              <div className="bg-[var(--background)] p-3 border border-[var(--border)] h-full flex flex-col">
                <span className="text-[9px] font-medium text-[var(--muted-foreground)] uppercase block mb-1 underline">Parsed Message</span>
                {decodedMsg && decodedMsg !== "[]" ? (
                  <p className="text-[10px] font-bold text-[var(--foreground)] break-all flex-1">{decodedMsg}</p>
                ) : (
                  <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase italic flex-1">Null Reference</p>
                )}
              </div>
              <div className="bg-[var(--background)] p-2 border border-[var(--border)] h-full flex flex-col">
                <span className="text-[9px] font-medium text-[var(--muted-foreground)] uppercase block mb-1 underline">Raw Message (Hex/Buffer)</span>
                <p className="text-[9px] font-mono text-[var(--muted-foreground)] break-all flex-1">{data.message || "null"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIALS + INTERNAL LOGIC */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
          {/* FINANCIALS (Settled Amount) */}
          <div className="bg-[var(--card)] text-[var(--foreground)] p-4 border border-[var(--border)] flex flex-col justify-between rounded-none flex-shrink-0 h-auto lg:h-[220px]">
            <div>
              <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase block mb-1">Settled Amount</span>
              <div className="flex items-baseline gap-2">
                <h2 className={cn("text-3xl font-bold tracking-tighter", config.color)}>{data.amount}</h2>
                <span className={cn("text-3xl font-bold opacity-60", config.color)}>OCT</span>
              </div>
              <p className="text-[9px] text-[var(--muted-foreground)] font-bold mt-1 border-l-2 border-[var(--border)] pl-2 uppercase tracking-tighter">Raw Units: {data.amount_raw}</p>
            </div>

            <div className="mt-4 space-y-2 pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Computed Gas Fee</span>
                <div className="text-right">
                  <span className="text-xs font-bold block">{gasFee} OCT</span>
                  <span className="text-[11px] text-[var(--muted-foreground)] font-bold">OU: {data.ou}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Transaction Nonce</span>
                <span className="text-xs font-bold border-b border-[var(--border)] pb-0.5">{data.nonce}</span>
              </div>
            </div>
          </div>

          {/* INTERNAL LOGIC DATA */}
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col min-h-0 h-auto lg:h-[320px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold uppercase flex items-center gap-2">
                <Fingerprint size={14} />
                Internal Logic Data
              </h3>
              <button 
                onClick={() => setRevealData(!revealData)}
                className="text-[10px] font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                {revealData ? <><EyeOff size={10}/> Hide Secrets</> : <><Eye size={10}/> Reveal Data</>}
              </button>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 scrollbar-hide">
              <div className="grid grid-rows-[auto_auto_1fr] gap-3 min-h-0">
                <div>
                  <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase block">Public Key</span>
                  <div className="text-[10px] font-mono truncate bg-[var(--background)] p-1.5 border border-[var(--border)] mt-1">{innerData.public_key || "N/A"}</div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase block mb-1">Transaction Signature</span>
                  <div className="text-[9px] font-mono break-all text-[var(--muted-foreground)] bg-[var(--background)] p-2 border border-[var(--border)]">
                     {innerData.signature || "N/A"}
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-2 flex flex-col min-h-0">
                  <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase block mb-1">Encrypted Payload / Script</span>
                  <div className={cn(
                    "p-2 border border-[var(--border)] transition-all duration-300 flex-1",
                    revealData ? "bg-[var(--background)] text-[var(--foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}>
                    {innerData.encrypted_data ? (
                      <p className={cn(
                        "text-[10px] font-mono break-all",
                        revealData ? "opacity-100" : "opacity-40 select-none blur-[2px]"
                      )}>
                        {typeof innerData.encrypted_data === 'string' ? innerData.encrypted_data : JSON.stringify(innerData.encrypted_data)}
                      </p>
                    ) : (
                      <p className="text-[9px] font-bold text-center py-1 uppercase opacity-40">No Payload Data</p>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

const AddressView = () => {
  const { address } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [recentPage, setRecentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(10);
  const [balance, setBalance] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SECOND_RPC_PROXY}/addresses/${address}`);
        if (!response.ok) throw new Error('Address not found');
        setData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (address) fetchData();
  }, [address]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        const response = await fetch(`${MAIN_RPC_PROXY}/address/${address}`);
        if (!response.ok) throw new Error('Balance not found');
        const json = await response.json();
        setBalance(json.balance ?? null);
      } catch (err: any) {
        setBalance(null);
      }
    };
    fetchBalance();
  }, [address]);

  useEffect(() => {
    setRecentPage(1);
    setRecentTxs([]);
    setRecentError(null);
    setHasMore(true);
  }, [address]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!address) return;
      setRecentLoading(true);
      setRecentError(null);
      try {
        const response = await fetch(`${SECOND_RPC_PROXY}/addresses/${address}/transactions?status=recent&page=${recentPage}&page_size=${pageSize}`);
        if (!response.ok) throw new Error('Failed to fetch recent transactions');
        const json = await response.json();
        const items = Array.isArray(json.items) ? json.items : [];
        setRecentTxs(prev => recentPage === 1 ? items : [...prev, ...items]);
        setHasMore(items.length === pageSize);
      } catch (err: any) {
        setRecentError(err.message);
        setHasMore(false);
      } finally {
        setRecentLoading(false);
      }
    };
    fetchRecent();
  }, [address, recentPage, pageSize]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden max-w-7xl mx-auto p-2">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/')} className="text-xs font-medium bg-[var(--muted)] px-3 py-1 rounded-sm">Back</button>
        <ChevronRight size={14} className="text-[var(--muted-foreground)]" />
        <span className="text-xs font-medium text-[var(--primary)]">Address Details</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 flex-1 min-h-0">
        <div className="flex flex-col min-h-0">
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Wallet Information</h3>
              <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)]">Overview</span>
            </div>
            <div className="bg-[var(--background)] border border-[var(--border)] p-3 mb-4">
              <DataRow label="Address" value={data.address} copyable onCopy={() => handleCopy(data.address, 'addr')} copied={copied === 'addr'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              <div className="bg-[var(--background)] border border-[var(--border)] p-3 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Balance</div>
                <div className="text-2xl font-bold mt-2">{balance ?? data.balance_oct} OCT</div>
              </div>
              <div className="bg-[var(--background)] border border-[var(--border)] p-3 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Nonce</div>
                <div className="text-2xl font-bold mt-2">{data.nonce}</div>
              </div>
              <div className="bg-[var(--background)] border border-[var(--border)] p-3 sm:col-span-2 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Tx Count / Has Public Key</div>
                <div className="text-2xl font-bold mt-2">{data.transactions} / {data.has_public_key ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col min-h-0">
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 flex-1 min-h-0 flex flex-col">
            <h3 className="text-sm font-semibold mb-4">Recent Transactions</h3>
            <ScrollArea.Root className="flex-1 overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full pr-2">
                <div className="space-y-2">
                  {recentTxs.map((tx: any, i: number) => {
                    const amountRaw = tx.amount_raw ?? tx.amount ?? tx.value ?? tx.amount_oct;
                    const amountNumber = amountRaw !== undefined && amountRaw !== null ? Number(amountRaw) / 1_000_000 : null;
                    const amountLabel = amountNumber !== null && Number.isFinite(amountNumber)
                      ? amountNumber.toLocaleString(undefined, { maximumFractionDigits: 6 })
                      : '-';
                    const rawDirection = typeof tx.direction === 'string' ? tx.direction : typeof tx.in_out === 'string' ? tx.in_out : typeof tx.side === 'string' ? tx.side : typeof tx.type === 'string' ? tx.type : '';
                    const normalizedDirection = rawDirection ? rawDirection.toLowerCase() : '';
                    let direction = '';
                    if (/in|receive|incoming|credit/.test(normalizedDirection)) {
                      direction = 'in';
                    } else if (/out|send|sent|outgoing|debit/.test(normalizedDirection)) {
                      direction = 'out';
                    } else if (tx.from && address && tx.from === address) {
                      direction = 'out';
                    } else if (tx.to && address && tx.to === address) {
                      direction = 'in';
                    } else if (tx.from_address && address && tx.from_address === address) {
                      direction = 'out';
                    } else if (tx.to_address && address && tx.to_address === address) {
                      direction = 'in';
                    } else if (typeof amountRaw === 'string' && amountRaw.startsWith('-')) {
                      direction = 'out';
                    }
                    const finalDirection = direction || 'out';
                    return (
                    <div key={`${tx.hash}-${i}`} className="grid grid-cols-[40px_1fr_70px_90px_auto] items-start gap-2 p-2 border border-[var(--border)] text-xs font-medium rounded-md hover:bg-[var(--muted)] transition-colors min-w-0">
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)]">#{i + 1}</span>
                      <span className="truncate min-w-0">{tx.hash}</span>
                      <span className={cn(
                        "inline-flex items-center justify-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase border whitespace-nowrap",
                        finalDirection === 'out' && "text-rose-500 border-rose-500/40 bg-rose-500/10",
                        finalDirection === 'in' && "text-emerald-500 border-emerald-500/40 bg-emerald-500/10"
                      )}>
                        <ArrowRight size={10} className={cn(finalDirection === 'in' && "rotate-180")} />
                        {finalDirection}
                      </span>
                      <span className={cn(
                        "text-[var(--primary)] text-right",
                        finalDirection === 'out' && "text-rose-500",
                        finalDirection === 'in' && "text-emerald-500"
                      )}>
                        {amountLabel} OCT
                      </span>
                      <button 
                        onClick={() => navigate(`/tx/${tx.hash}`)}
                        className="text-[var(--primary)] hover:underline"
                      >
                        View
                      </button>
                    </div>
                  )})}
                  {!recentLoading && recentTxs.length === 0 && !recentError && (
                    <div className="text-[9px] text-[var(--muted-foreground)] uppercase text-center py-2">No Transactions</div>
                  )}
                  {recentError && (
                    <div className="text-[9px] text-rose-500 text-center py-2">{recentError}</div>
                  )}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex select-none touch-none p-[1px] bg-transparent hover:bg-[var(--muted)] transition-colors" orientation="vertical">
                <ScrollArea.Thumb className="flex-1 bg-[var(--border)] rounded-full" />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner className="bg-transparent" />
            </ScrollArea.Root>
            <div className="pt-3">
              <button
                onClick={() => setRecentPage(prev => prev + 1)}
                disabled={!hasMore || recentLoading}
                className={cn(
                  "w-full text-xs font-medium px-3 py-1 border border-[var(--border)]",
                  !hasMore || recentLoading ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--muted)]"
                )}
              >
                {recentLoading ? "Loading..." : hasMore ? "Load More" : "No More Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EpochView = () => {
  const { epoch } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SECOND_RPC_PROXY}/epochs/${epoch}`);
        if (!response.ok) throw new Error('Epoch not found');
        setData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (epoch) fetchData();
  }, [epoch]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/')} className="text-xs font-medium bg-[var(--muted)] px-3 py-1 rounded-sm">Back</button>
        <ChevronRight size={14} className="text-[var(--muted-foreground)]" />
        <span className="text-xs font-medium text-[var(--primary)]">Epoch Details</span>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 w-full max-w-xl">
          <h3 className="text-xl font-semibold mb-6 text-center">Epoch #{data.epoch_number}</h3>
          <div className="space-y-4">
            <DataRow label="Finalized At" value={new Date(data.finalized_at).toLocaleString()} />
            <DataRow label="Validator" value={data.validator_address} truncate />
            <DataRow label="Transactions" value={data.transactions} />
            <DataRow label="Nodes" value={data.nodes} />
            <DataRow label="Tree Hash" value={data.tree_hash} truncate />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <RefreshCw className="animate-spin text-[var(--primary)]" size={48} />
    <p className="font-medium text-xs tracking-widest animate-pulse text-[var(--muted-foreground)]">Fetching Data...</p>
  </div>
);

const ErrorState = ({ error }: { error: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center max-w-md mx-auto">
      <div className="bg-rose-500/10 p-4 border border-rose-500/50 text-rose-500 rounded-md">
        <AlertCircle size={32} className="mx-auto mb-2" />
        <p className="font-semibold text-sm mb-2">Error</p>
        <p className="text-xs">{error}</p>
      </div>
      <button 
        onClick={() => navigate('/')}
        className="text-xs font-medium text-[var(--primary)] hover:underline"
      >
        Go Back
      </button>
    </div>
  );
};

const DataRow = ({ label, value, copyable, onCopy, copied, truncate }: any) => (
  <div className="space-y-1">
    <div className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">{label}</div>
    <div className="flex items-center justify-between gap-4 group">
      <div className={cn(
        "font-normal text-sm break-all text-[var(--foreground)]",
        truncate && "truncate"
      )}>
        {value}
      </div>
      {copyable && (
        <button 
          onClick={onCopy}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      )}
    </div>
  </div>
);

export default App;
