import { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useOmegaState } from '../omega1_mvp/hooks/useOmegaState';
import CommandCenter from '../omega1_mvp/agent/CommandCenter';
import '../omega1_mvp/agent/ubuntu.css';

interface DemoPageProps {
  onBack: () => void;
}

export default function DemoPage({ onBack }: DemoPageProps) {
  const omega = useOmegaState();
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    const ok = omega.unlock(code);
    if (!ok) {
      setErr('ACCESS DENIED');
      return;
    }
    setErr(null);
  };

  return (
    <div className="min-h-screen warroom-ubuntu" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* top bar */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            <div className="text-sm font-semibold">OMEGA-1 WAR ROOM</div>
          </div>
          <div className="text-xs mono" style={{ color: 'var(--text-muted)' }}>
            ACCESS: {omega.isUnlocked ? 'OMEGA_99' : 'LOCKED'}
          </div>
        </div>
      </div>

      {/* content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {!omega.isUnlocked && (
          <div className="max-w-xl mx-auto mt-10 p-6 rounded-2xl glass-panel">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              <div className="text-lg font-semibold">Access Code Required</div>
            </div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Enter clearance code to open the Command Center.
            </div>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
                placeholder="omega-99"
                className="flex-1 px-3 py-2 rounded-lg bg-black/40 border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={submit}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ background: 'var(--gold)', color: '#0b0b0b' }}
              >
                Unlock
              </button>
            </div>
            {err && (
              <div className="mt-3 text-xs mono" style={{ color: '#ff6b6b' }}>
                {err}
              </div>
            )}
          </div>
        )}

        {omega.isUnlocked && <CommandCenter omega={omega} />}
      </div>
    </div>
  );
}
