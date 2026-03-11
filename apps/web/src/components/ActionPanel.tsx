import { useState } from 'react';
import { runnerApi } from '../api';
import type { SessionStatus } from '../api';

interface Props {
  session: SessionStatus;
  onDisconnect: () => void;
  onPreviewStarted: (url: string) => void;
}

interface ActionState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const defaultActionState = (): ActionState => ({ loading: false, error: null, success: null });

export function ActionPanel({ session, onDisconnect, onPreviewStarted }: Props) {
  const [componentName, setComponentName] = useState('');
  const [showComponentInput, setShowComponentInput] = useState(false);
  const [states, setStates] = useState<Record<string, ActionState>>({});

  const runAction = async (key: string, action: () => Promise<unknown>) => {
    setStates((prev) => ({ ...prev, [key]: { loading: true, error: null, success: null } }));
    try {
      await action();
      setStates((prev) => ({ ...prev, [key]: { loading: false, error: null, success: 'Done ✓' } }));
      setTimeout(() => {
        setStates((prev) => ({ ...prev, [key]: defaultActionState() }));
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStates((prev) => ({ ...prev, [key]: { loading: false, error: msg, success: null } }));
    }
  };

  const s = (key: string): ActionState => states[key] ?? defaultActionState();

  return (
    <div style={styles.container}>
      {/* Session info */}
      <div style={styles.sessionInfo}>
        <div style={styles.sessionRow}>
          <span style={styles.sessionLabel}>Org</span>
          <span style={styles.sessionValue}>{session.orgDomain}</span>
        </div>
        <div style={styles.sessionRow}>
          <span style={styles.sessionLabel}>Library</span>
          <span style={styles.sessionValue}>{session.libraryName}</span>
        </div>
        <div style={styles.sessionRow}>
          <span style={styles.sessionLabel}>Workspace</span>
          <span style={{ ...styles.sessionValue, fontSize: 10, wordBreak: 'break-all' }}>
            {session.workspacePath}
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Actions */}
      <div style={styles.actions}>
        <ActionButton
          label="Create Library"
          description="Scaffold the Retool CCL project in your workspace"
          state={s('createLibrary')}
          onClick={() => runAction('createLibrary', () => runnerApi.createLibrary())}
        />

        <div>
          {showComponentInput ? (
            <div style={styles.componentInputRow}>
              <input
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="ComponentName"
                style={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && componentName) {
                    runAction('createComponent', () => runnerApi.createComponent(componentName));
                    setShowComponentInput(false);
                    setComponentName('');
                  }
                  if (e.key === 'Escape') {
                    setShowComponentInput(false);
                    setComponentName('');
                  }
                }}
                autoFocus
              />
              <button
                style={styles.confirmBtn}
                disabled={!componentName}
                onClick={() => {
                  if (componentName) {
                    runAction('createComponent', () => runnerApi.createComponent(componentName));
                    setShowComponentInput(false);
                    setComponentName('');
                  }
                }}
              >
                Create
              </button>
            </div>
          ) : (
            <ActionButton
              label="Create Component"
              description="Scaffold a new React component from template"
              state={s('createComponent')}
              onClick={() => setShowComponentInput(true)}
            />
          )}
        </div>

        <ActionButton
          label="Start Preview"
          description="Launch local preview server"
          state={s('startPreview')}
          onClick={() =>
            runAction('startPreview', async () => {
              const result = await runnerApi.startPreview();
              onPreviewStarted(result.previewUrl);
            })
          }
        />

        <ActionButton
          label="Push Dev"
          description="Publish to dev channel (npx retool-ccl publish --dev)"
          state={s('pushDev')}
          variant="blue"
          onClick={() => runAction('pushDev', () => runnerApi.pushDev())}
        />

        <ActionButton
          label="Deploy"
          description="Release to production (npx retool-ccl publish)"
          state={s('deploy')}
          variant="green"
          onClick={() => runAction('deploy', () => runnerApi.deploy())}
        />
      </div>

      <div style={styles.divider} />

      {/* Disconnect */}
      <button onClick={onDisconnect} style={styles.disconnectBtn}>
        Disconnect &amp; Remove Key
      </button>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  description?: string;
  state: ActionState;
  onClick: () => void;
  variant?: 'default' | 'blue' | 'green';
}

function ActionButton({ label, description, state, onClick, variant = 'default' }: ActionButtonProps) {
  const bg =
    variant === 'blue' ? '#1d4ed8' : variant === 'green' ? '#15803d' : '#1e293b';
  const hoverBg =
    variant === 'blue' ? '#2563eb' : variant === 'green' ? '#16a34a' : '#253040';

  return (
    <div style={styles.actionWrapper}>
      <button
        style={{ ...styles.actionBtn, background: bg }}
        disabled={state.loading}
        onClick={onClick}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = bg;
        }}
      >
        {state.loading ? '⏳ ' : ''}{label}
      </button>
      {description && !state.error && !state.success && (
        <span style={styles.actionDesc}>{description}</span>
      )}
      {state.success && <span style={styles.successMsg}>{state.success}</span>}
      {state.error && <span style={styles.errorMsg}>{state.error}</span>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    padding: 12,
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: 8,
    height: '100%',
    overflowY: 'auto' as const,
  },
  sessionInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    marginBottom: 8,
  },
  sessionRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  sessionLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#4b5563',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  sessionValue: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  divider: {
    height: 1,
    background: '#1e293b',
    margin: '12px 0',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  actionWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
  },
  actionBtn: {
    border: 'none',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#f1f5f9',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.15s',
    width: '100%',
  },
  actionDesc: {
    fontSize: 11,
    color: '#4b5563',
    paddingLeft: 4,
  },
  successMsg: {
    fontSize: 11,
    color: '#4ade80',
    paddingLeft: 4,
  },
  errorMsg: {
    fontSize: 11,
    color: '#f87171',
    paddingLeft: 4,
  },
  componentInputRow: {
    display: 'flex',
    gap: 6,
  },
  input: {
    flex: 1,
    background: '#0f1117',
    border: '1px solid #374151',
    borderRadius: 6,
    padding: '8px 10px',
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
  },
  confirmBtn: {
    background: '#1e293b',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#f1f5f9',
    cursor: 'pointer',
  },
  disconnectBtn: {
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: 6,
    padding: '8px 14px',
    fontSize: 12,
    color: '#6b7280',
    cursor: 'pointer',
    marginTop: 'auto' as const,
  },
};
