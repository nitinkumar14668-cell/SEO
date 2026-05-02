import { useState } from 'react';
import { Search, Loader2, ArrowRight, ShieldAlert, BadgeCheck, Terminal, Link as LinkIcon, AlertTriangle, AlertCircle, Sparkles, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEOData, FetchState } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<SEOData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const analyzeWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setState('loading');
    setErrorMsg('');
    setData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze website');
      }

      setData(result);
      setState('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setState('error');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-rose-300 bg-rose-500/20 border-rose-500/30';
      case 'Medium': return 'text-amber-300 bg-amber-500/20 border-amber-500/30';
      case 'Low': return 'text-blue-300 bg-blue-500/20 border-blue-500/30';
      default: return 'text-slate-300 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 shadow-2xl">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg border border-blue-400">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">AI SEO Agent</h1>
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            Fix & Optimize
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Search Hero */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Analyze any website. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Get instant AI fix prompts.</span>
          </h2>
          <p className="text-lg text-slate-400">
            Submit a URL to perform a full SEO audit, discover live keywords, and generate ready-to-use AI Studio commands to fix errors.
          </p>
          
          <form onSubmit={analyzeWebsite} className="relative group max-w-2xl mx-auto flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 shadow-2xl">
            <div className="flex items-center pointer-events-none mr-2">
              <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-transparent border-none outline-none text-base w-full px-2 text-white placeholder:text-slate-500 focus:ring-0"
              required
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold rounded-full transition-all disabled:cursor-not-allowed border border-blue-400/50"
            >
              {state === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {state === 'error' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <p className="font-medium text-sm text-rose-300">{errorMsg}</p>
          </motion.div>
        )}

        {/* Results Container */}
        {state === 'success' && data && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Score & Keywords */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
                <p className="text-xs text-blue-300 uppercase font-bold tracking-tighter mb-6">Health Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="text-slate-800 stroke-current" strokeWidth="12" fill="none" />
                    <motion.circle 
                      cx="64" cy="64" r="56" 
                      className={cn("stroke-current drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]", data.analysis.score > 79 ? 'text-emerald-500' : data.analysis.score > 50 ? 'text-amber-500' : 'text-rose-500')} 
                      strokeWidth="12" 
                      fill="none" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 351, strokeDashoffset: 351 }}
                      animate={{ strokeDashoffset: 351 - (351 * data.analysis.score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{data.analysis.score}</span>
                  </div>
                </div>
                <p className="mt-6 text-xs text-slate-400 leading-relaxed">
                  {data.analysis.overview}
                </p>
              </div>

              {/* Live Keywords Card */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 flex-1">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Live Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.analysis.liveKeywords.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 text-slate-300 text-sm rounded-xl border border-white/5 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Fixes & Details */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center backdrop-blur-md">
                   <p className="text-emerald-400 text-2xl font-bold">{data.extractedData.h1Count}</p>
                   <p className="text-[10px] uppercase text-slate-400 mt-1">H1 Tags</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center backdrop-blur-md">
                   <p className="text-emerald-400 text-2xl font-bold">{data.extractedData.h2Count}</p>
                   <p className="text-[10px] uppercase text-slate-400 mt-1">H2 Tags</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center backdrop-blur-md">
                   <p className="text-blue-400 text-2xl font-bold">{data.extractedData.imagesCount}</p>
                   <p className="text-[10px] uppercase text-slate-400 mt-1">Total Images</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center backdrop-blur-md">
                   <p className={cn("text-2xl font-bold", data.extractedData.missingAltCount > 0 ? "text-rose-400" : "text-emerald-400")}>{data.extractedData.missingAltCount}</p>
                   <p className="text-[10px] uppercase text-slate-400 mt-1 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3"/> Missing Alt</p>
                </div>
              </div>

              {/* AI Prompts Section */}
              <div className="flex-1 bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-white/5 p-3 px-5 border-b border-white/10 flex justify-between items-center">
                  <p className="text-xs font-mono text-emerald-400">$ GOOGLE_AI_STUDIO_FIX_COMMAND</p>
                  <span className="text-[10px] text-slate-500">Auto-Generated Prompt</span>
                </div>
                
                <div className="flex-1 p-5 space-y-4 max-h-[600px] overflow-y-auto">
                  {data.analysis.errors.length === 0 ? (
                    <div className="text-center py-10">
                      <BadgeCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">No severe issues detected!</p>
                    </div>
                  ) : null}

                  {data.analysis.errors.map((error, idx) => (
                    <div key={idx} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <div className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(error.severity)}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", getSeverityColor(error.severity))}>
                                {error.severity} Risk
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{error.issue}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-black/20 p-5 border-t border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-mono text-slate-500">AI COMMAND PROMPT</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(error.fixCommand)}
                            className="bg-white text-slate-900 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                          >
                            📋 Copy Prompt
                          </button>
                        </div>
                        <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap break-words leading-relaxed selection:bg-emerald-400/20">
                          {error.fixCommand}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Successes */}
              {data.analysis.successes.length > 0 && (
                <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-emerald-300">What you're doing right</h3>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.analysis.successes.map((success, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-emerald-200">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></span>
                        <span className="font-medium">{success}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
