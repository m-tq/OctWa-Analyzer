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
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300 font-mono">
      <Header isDark={isDark} setIsDark={setIsDark} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-1 md:p-2 mt-[56px] mb-[32px]">
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
    <header className="grid grid-cols-[auto_1fr_auto] items-center h-[56px] px-2 md:px-4 border-b border-border bg-transparent backdrop-blur-md z-10 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-2 md:gap-4 justify-start">
        <h1 
          onClick={() => navigate('/')}
          className="text-sm md:text-lg font-semibold flex items-center gap-1 md:gap-2 cursor-pointer tracking-tight glow-hover"
          style={{ color: '#3A4DFF' }}
        >
          <Cpu size={16} style={{ color: '#3A4DFF' }} />
          <span className="hidden sm:inline">OctWa Analyzer</span>
          <span className="sm:hidden">OctWa</span>
        </h1>
      </div>
      <div className="flex justify-center w-full">
        {!isHomePage && (
          <form onSubmit={performSearch} className="hidden md:flex items-center gap-2 w-full max-w-3xl">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search hash / addr / epoch"
              className="bg-transparent border-b border-input px-3 py-1 text-xs focus:outline-none focus:border-primary w-full text-foreground transition-colors"
            />
            <button type="submit" className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium hover:opacity-90 whitespace-nowrap transition-opacity">
              Analyze
            </button>
          </form>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 justify-end">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground transition-colors glow-hover"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a href="https://github.com/m-tq/OctWa" target="_blank" rel="noopener" className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground transition-colors glow-hover">
          <Github size={16} />
        </a>
      </div>
    </header>
  );
};

const Footer = ({ currentBlock }: { currentBlock: number }) => (
  <footer className="flex items-center justify-between py-1 px-2 md:px-4 border-t border-border bg-transparent text-[10px] md:text-xs font-medium text-muted-foreground fixed bottom-0 left-0 right-0">
    <div className="w-1/3 text-left">
       <span className="hidden sm:inline">Version: v.0.0.1</span>
       <span className="sm:hidden">v.0.0.1</span>
    </div>
    <div className="w-1/3 text-center flex justify-center items-center gap-1 md:gap-2">
      <span className="text-muted-foreground hidden sm:inline">Network:</span>
      <span className="text-foreground">Mainnet</span>
    </div>
    <div className="w-1/3 flex justify-end items-center gap-1 md:gap-2">
      <span className="text-muted-foreground hidden sm:inline">Epoch:</span>
      <span className="text-primary">#{currentBlock}</span>
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
    <div className="flex flex-col items-center justify-center h-full w-full text-center px-6 md:px-10">
      <form onSubmit={performSearch} className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3 max-w-none flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="tx hash / address / epoch"
            className="w-full bg-background border-b border-border p-4 focus:outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
          />
        </div>
        <button 
          type="submit"
          className="bg-primary text-primary-foreground px-8 font-medium border border-primary hover:opacity-90 transition-opacity"
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
    standard: { color: 'text-muted-foreground', bg: 'bg-muted', icon: <ArrowRight size={18} />, label: 'Public Transfer' },
    private: { color: 'text-[hsl(var(--private-primary))]', bg: 'bg-[hsl(var(--private-primary)/0.1)]', icon: <Lock size={18} />, label: 'Private Transfer' },
    decrypt: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <Unlock size={18} />, label: 'Balance Decrypt' },
    encrypt: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: <Shield size={18} />, label: 'Balance Encrypt' },
    call: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <Terminal size={18} />, label: 'Contract Call' }
  }[data.op_type as string] || { color: 'text-muted-foreground', bg: 'bg-muted', icon: <ArrowRight size={18} />, label: 'Transaction' };

  const gasFee = (parseInt(data.ou || '0') * 0.000001).toFixed(6);
  const decodedMsg = decodeHex(data.message);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-2 md:space-y-3 p-1 md:p-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] md:text-[12px] font-medium bg-muted text-muted-foreground px-1.5 md:px-2 py-0.5 hover:text-foreground transition-colors glow-hover"
          >
            Back
          </button>
          <ChevronRight size={10} className="text-muted-foreground md:hidden" />
          <ChevronRight size={12} className="text-muted-foreground hidden md:block" />
          <span className="text-[10px] md:text-[12px] font-medium text-primary">Transaction Details</span>
        </div>
        {data.from === data.to && (
          <span className="text-[9px] md:text-[12px] font-bold text-amber-500 uppercase bg-amber-500/10 px-1 border border-amber-500/20">Self</span>
        )}
      </div>

      {/* HEADER CARD */}
      <div className="p-2 md:p-4 border-b border-dashed border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className={cn("p-2 md:p-3", config.bg, config.color)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <h1 className={cn("text-sm md:text-xl font-semibold tracking-tight", config.color)}>{config.label}</h1>
                <span className="bg-primary/10 text-primary text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 font-bold uppercase border border-primary/20">
                  {data.status}
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-muted-foreground mt-1">
                <Hash size={10} className="md:hidden flex-shrink-0" />
                <Hash size={12} className="hidden md:block flex-shrink-0" />
                <span className="text-[10px] md:text-[12px] font-bold truncate">{data.tx_hash}</span>
                <button onClick={() => handleCopy(data.tx_hash, 'hash')} className="hover:text-foreground transition-colors glow-hover flex-shrink-0">
                  {copied === 'hash' ? <Check size={10} className="text-emerald-500 md:w-3 md:h-3"/> : <Copy size={10} className="md:w-3 md:h-3"/>}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 md:border-l border-dashed border-border pt-2 md:pt-0 md:pl-6">
            <p className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase">Confirmed Epoch</p>
            <button
              onClick={() => navigate(`/epoch/${data.epoch}`)}
              className="text-base md:text-lg font-bold text-primary hover:underline glow-hover"
            >
              #{data.epoch.toLocaleString()}
            </button>
            <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 md:mt-1">{resolveTimestamp()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-3">
        {/* LEFT COLUMN: FLOW + MEMO */}
        <div className="lg:col-span-8 flex flex-col gap-2 md:gap-3">
          {/* FLOW & VALUES */}
          <div className="flex flex-col justify-center">
            <div>
              <div className="relative py-2 md:py-3">
                <span className="text-[10px] md:text-[12px] font-medium uppercase text-muted-foreground mb-2 block tracking-widest">From / Origin</span>
                <div className="p-2 md:p-3 flex items-center justify-between group">
                  <button 
                    onClick={() => navigate(`/address/${data.from}`)}
                    className="text-[10px] md:text-xs font-bold truncate pr-2 md:pr-4 text-foreground hover:text-primary transition-colors glow-hover text-left flex-1"
                  >
                    {data.from}
                  </button>
                  <button onClick={() => handleCopy(data.from, 'from')} className="opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground glow-hover flex-shrink-0">
                    {copied === 'from' ? <Check size={10} className="md:w-3 md:h-3"/> : <Copy size={10} className="md:w-3 md:h-3"/>}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 py-3 md:py-4">
                <div className="h-[1px] flex-1 border-t border-dashed border-muted-foreground opacity-30"></div>
                <div className={cn("p-1 md:p-1.5", config.color)}>
                  {config.icon}
                </div>
                <div className="h-[1px] flex-1 border-t border-dashed border-muted-foreground opacity-30"></div>
              </div>

              <div className="relative py-2 md:py-3">
                <span className="text-[10px] md:text-[12px] font-medium uppercase text-muted-foreground mb-2 block tracking-widest">To / Destination</span>
                <div className="p-2 md:p-3 flex items-center justify-between group">
                  <button 
                    onClick={() => navigate(`/address/${data.to}`)}
                    className={cn(
                      "text-[10px] md:text-xs font-bold truncate pr-2 md:pr-4 transition-colors glow-hover text-left flex-1",
                      data.from === data.to ? "text-muted-foreground italic hover:text-foreground" : "text-foreground hover:text-primary"
                    )}
                  >
                    {data.to}
                  </button>
                  <button onClick={() => handleCopy(data.to, 'to')} className="opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground glow-hover flex-shrink-0">
                    {copied === 'to' ? <Check size={10} className="md:w-3 md:h-3"/> : <Copy size={10} className="md:w-3 md:h-3"/>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* MEMO BOX */}
          <div className="p-2 md:p-4 border-t border-dashed border-border flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2">
              <div className="flex items-center gap-1 md:gap-2">
                <MessageSquare size={12} className="text-muted-foreground md:w-3.5 md:h-3.5" />
                <h3 className="text-[10px] md:text-[12px] font-bold uppercase tracking-tight">Memo & Decoded Data</h3>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-background p-2 md:p-3 flex flex-col border-b border-dashed border-border">
                <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase block mb-1">Parsed Message</span>
                {decodedMsg && decodedMsg !== "[]" ? (
                  <p className="text-[9px] md:text-[10px] font-bold text-foreground break-all">{decodedMsg}</p>
                ) : (
                  <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase italic">Null Reference</p>
                )}
              </div>
              <div className="bg-background p-2 flex flex-col">
                <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase block mb-1">Raw Message (Hex/Buffer)</span>
                <p className="text-[8px] md:text-[9px] font-mono break-all">{data.message || "null"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIALS + INTERNAL LOGIC */}
        <div className="lg:col-span-4 flex flex-col gap-2 md:gap-3 lg:border-l lg:border-dashed lg:border-border lg:pl-4">
          {/* FINANCIALS (Settled Amount) */}
          <div className="text-foreground p-2 md:p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] md:text-[12px] font-medium text-muted-foreground uppercase block mb-1">Settled Amount</span>
              <div className="flex items-baseline gap-1 md:gap-2">
                <h2 className={cn("text-2xl md:text-3xl font-bold tracking-tighter", config.color)}>{data.amount}</h2>
                <span className={cn("text-2xl md:text-3xl font-bold opacity-60", config.color)}>OCT</span>
              </div>
              <p className="text-[10px] md:text-[11px] text-muted-foreground font-bold mt-1 border-l-2 border-dashed border-border pl-2 uppercase tracking-tighter">Raw Units: {data.amount_raw}</p>
            </div>

            <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2 pt-3 md:pt-4 border-t border-dashed border-border">
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase">Computed Gas Fee</span>
                <div className="text-right">
                  <span className="text-[10px] md:text-xs font-bold block">{gasFee} OCT</span>
                  <span className="text-[9px] md:text-[11px] text-muted-foreground font-bold">OU: {data.ou}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase">Transaction Nonce</span>
                <span className="text-[10px] md:text-xs font-bold border-b border-dashed border-border pb-0.5">{data.nonce}</span>
              </div>
            </div>
          </div>

          {/* INTERNAL LOGIC DATA */}
          <div className="p-2 md:p-4 flex flex-col border-t border-dashed border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] md:text-[12px] font-bold uppercase flex items-center gap-1 md:gap-2 tracking-tight">
                <Fingerprint size={12} className="md:w-3.5 md:h-3.5" />
                Internal Logic Data
              </h3>
              <button 
                onClick={() => setRevealData(!revealData)}
                className="text-[9px] md:text-[10px] font-medium text-primary hover:underline flex items-center gap-1 glow-hover"
              >
                {revealData ? <><EyeOff size={9} className="md:w-2.5 md:h-2.5"/> Hide</> : <><Eye size={9} className="md:w-2.5 md:h-2.5"/> Reveal</>}
              </button>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div>
                <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase block">Public Key</span>
                <div className="text-[9px] md:text-[10px] font-mono truncate bg-background p-1.5 mt-1">{innerData.public_key || "N/A"}</div>
              </div>

              <div>
                <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase block mb-1">Transaction Signature</span>
                <div className="text-[8px] md:text-[9px] font-mono break-all text-muted-foreground bg-background p-2">
                   {innerData.signature || "N/A"}
                </div>
              </div>

              <div>
                <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase block mb-1">Encrypted Payload / Script</span>
                <div className={cn(
                  "p-2 transition-all duration-300",
                  revealData ? "bg-background text-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {innerData.encrypted_data ? (
                    <p className={cn(
                      "text-[8px] md:text-[10px] font-mono break-all",
                      revealData ? "opacity-100" : "opacity-40 select-none blur-[2px]"
                    )}>
                      {typeof innerData.encrypted_data === 'string' ? innerData.encrypted_data : JSON.stringify(innerData.encrypted_data)}
                    </p>
                  ) : (
                    <p className="text-[8px] md:text-[9px] font-bold text-center py-1 uppercase opacity-40">No Payload Data</p>
                  )}
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
    <div className="flex flex-col h-full overflow-y-auto md:overflow-hidden max-w-7xl mx-auto p-2">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/')} className="text-xs font-medium bg-muted px-3 py-1 glow-hover hover:text-foreground transition-colors">Back</button>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-primary">Address Details</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 flex-1 min-h-0 md:min-h-0">
        <div className="flex flex-col min-h-0 md:min-h-0">
          <div className="bg-card p-4 flex-1 min-h-0 md:min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold tracking-tight">Wallet Information</h3>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Overview</span>
            </div>
            <div className="py-3 border-b border-dashed border-border">
              <DataRow label="Address" value={data.address} copyable onCopy={() => handleCopy(data.address, 'addr')} copied={copied === 'addr'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 pt-3 flex-1 auto-rows-fr sm:gap-0">
              <div className="flex flex-col items-center justify-center text-center h-full sm:border-r sm:border-dashed sm:border-border sm:pr-3">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Balance</div>
                <div className="text-2xl font-bold mt-2">{balance ?? data.balance_oct} OCT</div>
              </div>
              <div className="flex flex-col items-center justify-center text-center h-full sm:pl-3">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Nonce</div>
                <div className="text-2xl font-bold mt-2">{data.nonce}</div>
              </div>
              <div className="flex flex-col items-center justify-center text-center h-full sm:border-r sm:border-dashed sm:border-border sm:pr-3 sm:border-t sm:border-dashed sm:border-border sm:pt-3">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Tx Count</div>
                <div className="text-2xl font-bold mt-2">{data.transactions}</div>
              </div>
              <div className="flex flex-col items-center justify-center text-center h-full sm:border-t sm:border-dashed sm:border-border sm:pt-3 sm:pl-3">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Has Public Key</div>
                <div className="text-2xl font-bold mt-2">{data.has_public_key ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col min-h-0 md:min-h-0">
          <div className="bg-card p-4 flex-1 min-h-0 md:min-h-0 flex flex-col">
            <h3 className="text-sm font-semibold mb-4 tracking-tight">Recent Transactions</h3>
            <ScrollArea.Root className="flex-1 overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full pr-3">
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
                    <div key={`${tx.hash}-${i}`} className={cn(
                      "grid grid-cols-[40px_1fr_70px_90px_auto] items-start gap-2 py-2 text-xs font-medium hover:bg-muted transition-colors min-w-0",
                      i < recentTxs.length - 1 && "border-b border-dashed border-border"
                    )}>
                      <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
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
                        "text-primary text-right",
                        finalDirection === 'out' && "text-rose-500",
                        finalDirection === 'in' && "text-emerald-500"
                      )}>
                        {amountLabel} OCT
                      </span>
                      <button 
                        onClick={() => navigate(`/tx/${tx.hash}`)}
                        className="text-primary hover:underline glow-hover"
                      >
                        View
                      </button>
                    </div>
                  )})}
                  {!recentLoading && recentTxs.length === 0 && !recentError && (
                    <div className="text-[9px] text-muted-foreground uppercase text-center py-2">No Transactions</div>
                  )}
                  {recentError && (
                    <div className="text-[9px] text-rose-500 text-center py-2">{recentError}</div>
                  )}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex select-none touch-none w-2 bg-muted/30 hover:bg-muted/50 transition-colors rounded-full" orientation="vertical">
                <ScrollArea.Thumb className="flex-1 bg-border hover:bg-muted-foreground transition-colors rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[8px] before:min-h-[40px]" />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner className="bg-transparent" />
            </ScrollArea.Root>
            <div className="pt-3 flex justify-center">
              <button
                onClick={() => setRecentPage(prev => prev + 1)}
                disabled={!hasMore || recentLoading}
                className={cn(
                  "text-xs font-medium px-4 py-1.5 border border-muted",
                  !hasMore || recentLoading ? "opacity-40 cursor-not-allowed text-muted-foreground" : "hover:bg-muted text-foreground transition-colors"
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [transactionsPageSize] = useState(20);
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

  useEffect(() => {
    if (!epoch) return;
    setTransactions([]);
    setTransactionsError(null);
    setTransactionsPage(1);
    setHasMoreTransactions(true);
  }, [epoch]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!epoch) return;
      if (!hasMoreTransactions) return;
      setTransactionsLoading(true);
      setTransactionsError(null);
      try {
        const txResponse = await fetch(`${SECOND_RPC_PROXY}/epochs/${epoch}/transactions?page=${transactionsPage}&page_size=${transactionsPageSize}`);
        if (!txResponse.ok) throw new Error('Failed to fetch transactions');
        const txJson = await txResponse.json();
        const items = Array.isArray(txJson?.items)
          ? txJson.items
          : Array.isArray(txJson?.transactions)
            ? txJson.transactions
            : Array.isArray(txJson)
              ? txJson
              : [];
        setTransactions(prev => {
          const next = transactionsPage === 1 ? items : [...prev, ...items];
          const seen = new Set<string>();
          return next.filter((item: any) => {
            const hash =
              typeof item === 'string'
                ? item
                : item?.hash ?? item?.tx_hash ?? item?.transaction_hash ?? item?.id ?? '';
            if (!hash) return true;
            if (seen.has(hash)) return false;
            seen.add(hash);
            return true;
          });
        });
        setHasMoreTransactions(items.length === transactionsPageSize);
      } catch (txErr: any) {
        setTransactionsError(txErr.message);
        setHasMoreTransactions(false);
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchTransactions();
  }, [epoch, transactionsPage, transactionsPageSize, hasMoreTransactions]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return null;

  const transactionList = transactions.length > 0
    ? transactions
    : Array.isArray(data.transactions)
      ? data.transactions
      : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.txs)
          ? data.txs
          : Array.isArray(data.transaction_hashes)
            ? data.transaction_hashes
            : Array.isArray(data.transaction_hash_list)
              ? data.transaction_hash_list
              : [];

  const totalTransactions =
    typeof data.transactions === 'number'
      ? data.transactions
      : Array.isArray(data.transactions)
        ? data.transactions.length
        : undefined;

  const transactionCountValue = totalTransactions !== undefined
    ? `${transactions.length > 0 ? transactions.length : transactionList.length} / ${totalTransactions}`
    : Array.isArray(transactionList) && transactionList.length > 0
      ? transactionList.length
      : data.transactions;
  const hasTransactionItems = transactionList.length > 0;
  const showTransactionsPanel = hasTransactionItems || transactionsLoading || !!transactionsError;

  return (
    <div className="h-full flex items-center justify-center p-2 overflow-hidden">
      <div className="w-full max-w-xl max-h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate('/')} className="text-xs font-medium bg-muted px-3 py-1 glow-hover hover:text-foreground transition-colors">Back</button>
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-primary">Epoch Details</span>
        </div>
        <div className="bg-card p-4 md:p-6 w-full shadow-md">
          <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center tracking-tight">Epoch #{data.epoch_number}</h3>
          <div>
            <div className="py-2 md:py-3 border-b border-dashed border-border">
              <DataRow label="Finalized At" value={new Date(data.finalized_at).toLocaleString()} />
            </div>
            <div className="py-2 md:py-3 border-b border-dashed border-border">
              <DataRow label="Validator" value={data.validator_address} truncate />
            </div>
            <div className="py-2 md:py-3 border-b border-dashed border-border">
              <DataRow label="Transactions" value={transactionCountValue} />
              <div className="mt-2 pt-2 border-t border-dashed border-border space-y-2">
                {showTransactionsPanel ? (
                  <>
                    <ScrollArea.Root className={cn(
                      "w-full overflow-hidden",
                      hasTransactionItems ? "h-[120px]" : "h-10"
                    )}>
                      <ScrollArea.Viewport className="h-full w-full pr-3">
                        <div className="space-y-2">
                          {hasTransactionItems && (
                            <>
                              {transactionList.map((item: any, index: number) => {
                                const hash =
                                  typeof item === 'string'
                                    ? item
                                    : item?.hash ?? item?.tx_hash ?? item?.transaction_hash ?? item?.id ?? '';
                                return (
                                  <div key={`${hash}-${index}`} className={cn(
                                    "flex items-center gap-2 text-xs font-medium py-1",
                                    index < transactionList.length - 1 && "border-b border-dashed border-border pb-2"
                                  )}>
                                    <span className="text-[10px] font-bold text-muted-foreground flex-shrink-0 w-6">#{index + 1}</span>
                                    <span className="truncate min-w-0 flex-1 text-[11px]">{hash || `Transaction ${index + 1}`}</span>
                                    {hash ? (
                                      <button
                                        onClick={() => navigate(`/tx/${hash}`)}
                                        className="text-primary hover:underline whitespace-nowrap glow-hover flex-shrink-0 text-[11px]"
                                      >
                                        View
                                      </button>
                                    ) : (
                                      <span className="text-muted-foreground whitespace-nowrap flex-shrink-0 text-[11px]">N/A</span>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}
                          {transactionsLoading && (
                            <div className="text-[9px] text-muted-foreground uppercase">Loading Transactions...</div>
                          )}
                          {!transactionsLoading && transactionsError && (
                            <div className="text-[9px] text-rose-500">{transactionsError}</div>
                          )}
                        </div>
                      </ScrollArea.Viewport>
                      {hasTransactionItems && (
                        <>
                          <ScrollArea.Scrollbar className="flex select-none touch-none w-2 bg-muted/30 hover:bg-muted/50 transition-colors rounded-full" orientation="vertical">
                            <ScrollArea.Thumb className="flex-1 bg-border hover:bg-muted-foreground transition-colors rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[8px] before:min-h-[40px]" />
                          </ScrollArea.Scrollbar>
                          <ScrollArea.Corner className="bg-transparent" />
                        </>
                      )}
                    </ScrollArea.Root>
                    {hasMoreTransactions && (
                      <button
                        onClick={() => setTransactionsPage(prev => prev + 1)}
                        disabled={transactionsLoading}
                        className={cn(
                          "w-full text-xs font-medium px-3 py-1 border border-border",
                          transactionsLoading ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
                        )}
                      >
                        {transactionsLoading ? "Loading..." : "Load More"}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-[9px] text-muted-foreground uppercase">No Transactions</div>
                )}
              </div>
            </div>
            <div className="py-2 md:py-3 border-b border-dashed border-border">
              <DataRow label="Nodes" value={data.nodes} />
            </div>
            <div className="pt-2 md:pt-3">
              <DataRow label="Tree Hash" value={data.tree_hash} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <RefreshCw className="animate-spin text-primary" size={48} />
    <p className="font-medium text-xs tracking-widest animate-pulse text-muted-foreground">Fetching Data...</p>
  </div>
);

const ErrorState = ({ error }: { error: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center max-w-md mx-auto">
      <div className="bg-rose-500/10 p-4 border border-rose-500/50 text-rose-500 shadow-md">
        <AlertCircle size={32} className="mx-auto mb-2" />
        <p className="font-semibold text-sm mb-2 tracking-tight">Error</p>
        <p className="text-xs">{error}</p>
      </div>
      <button 
        onClick={() => navigate('/')}
        className="text-xs font-medium text-primary hover:underline glow-hover"
      >
        Go Back
      </button>
    </div>
  );
};

const DataRow = ({ label, value, copyable, onCopy, copied, truncate, compact }: any) => (
  <div className="space-y-1">
    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{label}</div>
    <div className="flex items-center justify-between gap-4 group">
      <div className={cn(
        "font-normal break-all text-foreground",
        compact ? "text-[10px] md:text-xs" : "text-sm",
        truncate && "truncate"
      )}>
        {value}
      </div>
      {copyable && (
        <button 
          onClick={onCopy}
          className="text-muted-foreground hover:text-foreground transition-colors glow-hover"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      )}
    </div>
  </div>
);

export default App;
