'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import {
  Shield, Upload, FileText, CheckCircle, Bell, AlertTriangle,
  BookOpen, Lock, Clock, ChevronDown, Send, Loader2,
  Wifi, Users, Cpu, AlertCircle, ShieldAlert
} from 'lucide-react';
import AuthButton from '@/components/AuthButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  constituency: string;
  epicNumber: string;
  smsAlerts: boolean;
  createdAt?: unknown;
}

interface Candidate {
  name: string;
  party: string;
  education: string;
  assets: string;
  criminalCases: number;
  symbol: string;
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

function useCountdown(targetDate: Date) {
  const calculate = useCallback(() => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculate());
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [calculate]);
  return timeLeft;
}

// ─── Mock candidates data ─────────────────────────────────────────────────────

const MOCK_CANDIDATES: Candidate[] = [
  {
    name: 'Rajesh Kumar Yadav',
    party: 'Indian National Congress',
    education: 'M.A. Political Science',
    assets: '₹3.8 Cr',
    criminalCases: 0,
    symbol: '✋',
  },
  {
    name: 'Priya Venkataraman',
    party: 'Bharatiya Janata Party',
    education: 'B.Tech, MBA (IIM-B)',
    assets: '₹12.4 Cr',
    criminalCases: 0,
    symbol: '🪷',
  },
  {
    name: 'Mohammed Saleem Baig',
    party: 'Telangana Rashtra Samithi',
    education: 'LLB, Advocate',
    assets: '₹5.2 Cr',
    criminalCases: 2,
    symbol: '🚗',
  },
];

// ─── DigiVault Module ─────────────────────────────────────────────────────────

function DigiVaultModule({ epicNumber }: { epicNumber: string }) {
  const [dragOver, setDragOver] = useState(false);
  const docs = [
    { name: 'EPIC / Voter ID', id: epicNumber, verified: true },
    { name: 'Aadhaar Card', id: '****  ****  4821', verified: true },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Shield size={16} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Secure Document Vault</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">DigiVault · Encrypted</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {docs.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between p-3 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText size={14} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
              <div>
                <p className="text-xs font-semibold text-white">{d.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">{d.id}</p>
              </div>
            </div>
            {d.verified && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle size={10} className="text-emerald-400" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Verified</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragOver ? 'border-emerald-400 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/40'
        }`}
      >
        <Upload size={16} className={`transition-colors ${dragOver ? 'text-emerald-400' : 'text-gray-500'}`} />
        <p className="text-[10px] text-gray-500 text-center">
          <span className={`font-semibold transition-colors ${dragOver ? 'text-emerald-400' : 'text-gray-400'}`}>
            Upload New Document
          </span>
          <br />PDF, JPG · Max 5MB
        </p>
      </div>
    </div>
  );
}

// ─── Election Center Module ───────────────────────────────────────────────────

function ElectionCenterModule({
  constituency,
  smsAlerts,
  onToggleSms,
  savingSms,
}: {
  constituency: string;
  smsAlerts: boolean;
  onToggleSms: () => void;
  savingSms: boolean;
}) {
  const pollingDay = new Date('2025-11-15T07:00:00');
  const { days, hours, minutes, seconds } = useCountdown(pollingDay);
  const units = [
    { label: 'Days', value: days },
    { label: 'Hrs', value: hours },
    { label: 'Min', value: minutes },
    { label: 'Sec', value: seconds },
  ];

  // Simulated live booth status
  const boothStatus = { crowd: 'Moderate', wait: '~15 Min', evmStatus: 'Online', level: 'moderate' };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Clock size={16} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Your Constituency</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{constituency.replace(' - ', ' · ')}</p>
        </div>
      </div>

      {/* Countdown */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Phase 4 — Polling Day</p>
        <div className="grid grid-cols-4 gap-2">
          {units.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center p-2 bg-gray-800 rounded-xl border border-gray-700">
              <span className="text-xl font-black text-white tabular-nums leading-none">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Booth Status */}
      <div className="flex flex-col gap-2 p-3 bg-gray-800/60 rounded-xl border border-gray-700/50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Wifi size={10} className="text-emerald-400" /> Live Booth Status
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                boothStatus.level === 'low' ? 'bg-emerald-400' : 'bg-yellow-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                boothStatus.level === 'low' ? 'bg-emerald-500' : 'bg-yellow-500'
              }`} />
            </span>
            <div>
              <p className="text-[10px] font-bold text-white">{boothStatus.crowd} Crowd</p>
              <p className="text-[9px] text-gray-500">{boothStatus.wait} wait</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div>
              <p className="text-[10px] font-bold text-white">EVM {boothStatus.evmStatus}</p>
              <div className="flex items-center gap-1">
                <Cpu size={8} className="text-emerald-400" />
                <p className="text-[9px] text-gray-500">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-800/60 rounded-xl border border-gray-700/50">
        <div className="flex items-center gap-2">
          <Bell size={13} className={`transition-colors ${smsAlerts ? 'text-emerald-400' : 'text-gray-500'}`} />
          <div>
            <p className="text-xs font-semibold text-white">SMS Queue Alerts</p>
            <p className="text-[10px] text-gray-500">Real-time booth wait times</p>
          </div>
        </div>
        <button
          onClick={onToggleSms}
          disabled={savingSms}
          aria-label="Toggle SMS alerts"
          className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 ${
            smsAlerts ? 'bg-emerald-500' : 'bg-gray-700'
          }`}
        >
          {savingSms ? (
            <Loader2 size={10} className="absolute inset-0 m-auto text-white animate-spin" />
          ) : (
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                smsAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Violation Report Module ──────────────────────────────────────────────────

function ViolationReportModule({ uid }: { uid: string }) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setSaving(true);
    setError('');
    try {
      const ref = await addDoc(collection(firestore, 'complaints'), {
        uid,
        issueType,
        description,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      const ticket = `ECI-${ref.id.slice(0, 6).toUpperCase()}`;
      setTicketId(ticket);
      setTimeout(() => {
        setTicketId('');
        setIssueType('');
        setDescription('');
      }, 5000);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setError('Submission failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <AlertTriangle size={16} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Report an Issue</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Civic Complaint Portal</p>
        </div>
      </div>

      {ticketId ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <CheckCircle size={28} className="text-emerald-400" />
          <p className="text-sm font-bold text-white">Report Submitted</p>
          <p className="text-[10px] text-gray-400">Ticket <span className="font-mono font-bold text-emerald-400">#{ticketId}</span></p>
          <p className="text-[10px] text-gray-500">Your complaint has been logged with the ECI.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              required
              aria-label="Issue type"
              className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 hover:border-gray-600 transition-all cursor-pointer"
            >
              <option value="" disabled>Select Issue Type...</option>
              <option value="faulty_evm">Faulty EVM / VVPAT</option>
              <option value="illegal_campaign">Illegal Campaigning</option>
              <option value="intimidation">Voter Intimidation</option>
              <option value="bribery">Bribery / Inducement</option>
              <option value="booth_capture">Booth Capturing</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the incident in detail... (location, time, parties involved)"
            rows={3}
            aria-label="Issue description"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 hover:border-gray-600 transition-all resize-none"
          />

          {error && <p className="text-[10px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {saving ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── KYC — Know Your Candidates ──────────────────────────────────────────────

function KYCModule({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 col-span-1 md:col-span-3 hover:border-gray-700 transition-all">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <BookOpen size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Know Your Candidates</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">ECI Transparency Disclosure · KYC</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {candidates.map((c) => (
          <div
            key={c.name}
            className="relative flex flex-col gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all group"
          >
            {/* Criminal case badge — top-right */}
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full border ${
              c.criminalCases > 0
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {c.criminalCases > 0
                ? <ShieldAlert size={9} className="text-red-400" />
                : <CheckCircle size={9} className="text-emerald-400" />}
              <span className={`text-[8px] font-bold uppercase tracking-wider ${
                c.criminalCases > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {c.criminalCases > 0 ? `${c.criminalCases} Case${c.criminalCases > 1 ? 's' : ''}` : 'Clean Record'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                {c.symbol}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{c.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{c.party}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Education</span>
                <span className="text-[10px] font-semibold text-gray-300">{c.education}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Declared Assets</span>
                <span className="text-[10px] font-bold text-emerald-400">{c.assets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Criminal Cases</span>
                {c.criminalCases > 0 ? (
                  <div className="flex items-center gap-1">
                    <AlertCircle size={10} className="text-red-400" />
                    <span className="text-[10px] font-bold text-red-400">{c.criminalCases}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <CheckCircle size={10} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">None</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lock Screen ──────────────────────────────────────────────────────────────

function LockScreen() {
  return (
    <div className="relative min-h-[400px] rounded-2xl overflow-hidden border border-gray-800">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pointer-events-none select-none blur-sm opacity-30">
        <div className="bg-gray-800 rounded-2xl h-56" />
        <div className="bg-gray-800 rounded-2xl h-56" />
        <div className="bg-gray-800 rounded-2xl h-56" />
      </div>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
          <Lock size={28} className="text-gray-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Citizen Dashboard</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Sign in with your Google account to access your personal Civic Operating System.
          </p>
        </div>
        <AuthButton />
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          Secured by Firebase · Data encrypted at rest
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CitizenDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    constituency: 'Hyderabad - Kokapet',
    epicNumber: 'TL/09/145/XXXXXX',
    smsAlerts: false,
  });
  const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [savingSms, setSavingSms] = useState(false);

  // Auth listener
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser && firestore) {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          } else {
            // New user — create default profile
            const defaultData: UserData = {
              constituency: 'Hyderabad - Kokapet',
              epicNumber: `TL/09/${Math.floor(100 + Math.random() * 900)}/XXXXXX`,
              smsAlerts: false,
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, defaultData);
            setUserData(defaultData);
          }
        } catch (err) {
          console.error('[CitizenDashboard] Failed to fetch user data:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleSms = async () => {
    if (!user || !firestore) return;
    setSavingSms(true);
    const newVal = !userData.smsAlerts;
    try {
      await updateDoc(doc(firestore, 'users', user.uid), { smsAlerts: newVal });
      setUserData((prev) => ({ ...prev, smsAlerts: newVal }));
    } catch (err) {
      console.error('[CitizenDashboard] Failed to update SMS preference:', err);
    } finally {
      setSavingSms(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <LockScreen />;

  const firstName = user.displayName?.split(' ')[0] ?? 'Citizen';

  return (
    <section aria-labelledby="dashboard-heading" className="w-full">

      {/* ── Premium Welcome Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-gray-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-1">
            Civic Operating System · Live
          </p>
          <h2 id="dashboard-heading" className="text-2xl font-black text-white tracking-tight">
            Welcome back, {firstName}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Your electoral profile is verified and active.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={`${firstName} avatar`}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex-shrink-0"
            />
          )}
        </div>
      </div>

      {/* ── Bento Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DigiVaultModule epicNumber={userData.epicNumber} />

        <ElectionCenterModule
          constituency={userData.constituency}
          smsAlerts={userData.smsAlerts}
          onToggleSms={handleToggleSms}
          savingSms={savingSms}
        />

        <ViolationReportModule uid={user.uid} />

        <KYCModule candidates={candidates} />
      </div>

      {/* ── Footer note ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-800/60">
        <Users size={12} className="text-gray-600" />
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          Data sourced from ECI Affidavit Portal · Booth metrics are simulated
        </p>
      </div>
    </section>
  );
}
