import React, { useState } from 'react';

/**
 * Preview Harness – simulates a minimal Retool Custom Component environment.
 *
 * Left panel: prop/state controls (JSON editor + key inputs).
 * Center: the component render area (loaded via iframe from the dev server, or inline for Phase 1).
 * Right/Bottom: "Retool state" inspector showing current model output.
 */

interface Model {
  value: string;
  [key: string]: unknown;
}

const DEFAULT_MODEL: Model = { value: 'Hello, Retool!' };
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;

export default function App() {
  const [model, setModel] = useState<Model>(DEFAULT_MODEL);
  const [modelJson, setModelJson] = useState(JSON.stringify(DEFAULT_MODEL, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  const handleModelJsonChange = (raw: string) => {
    setModelJson(raw);
    try {
      setModel(JSON.parse(raw) as Model);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const modelUpdate = (patch: Partial<Model>) => {
    const next = { ...model, ...patch };
    setModel(next);
    setModelJson(JSON.stringify(next, null, 2));
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>⚡ Component Preview Harness</span>
        <span style={styles.headerSub}>Simulates the Retool Custom Component environment</span>
      </div>

      <div style={styles.body}>
        {/* Controls panel */}
        <div style={styles.controls}>
          <Section title="Dimensions">
            <LabeledInput
              label="Width (px)"
              type="number"
              value={String(width)}
              onChange={(v) => setWidth(parseInt(v, 10) || DEFAULT_WIDTH)}
            />
            <LabeledInput
              label="Height (px)"
              type="number"
              value={String(height)}
              onChange={(v) => setHeight(parseInt(v, 10) || DEFAULT_HEIGHT)}
            />
          </Section>

          <Section title="Model (props from Retool)">
            <LabeledInput
              label="value"
              value={model.value as string}
              onChange={(v) => modelUpdate({ value: v })}
            />
          </Section>

          <Section title="Raw JSON editor">
            <textarea
              value={modelJson}
              onChange={(e) => handleModelJsonChange(e.target.value)}
              style={{
                ...styles.textarea,
                borderColor: jsonError ? '#dc2626' : '#374151',
              }}
              rows={6}
            />
            {jsonError && <span style={styles.jsonError}>{jsonError}</span>}
          </Section>
        </div>

        {/* Component render area */}
        <div style={styles.preview}>
          <div style={styles.previewLabel}>Component</div>
          <div style={styles.previewCanvas}>
            <div
              style={{
                width,
                height,
                border: '1px dashed #d1d5db',
                overflow: 'hidden',
                position: 'relative',
                background: '#fff',
                borderRadius: 6,
              }}
            >
              <ComponentRenderer
                model={model}
                modelUpdate={modelUpdate}
                width={width}
                height={height}
              />
            </div>
          </div>
        </div>

        {/* State inspector */}
        <div style={styles.inspector}>
          <Section title="Current model state">
            <pre style={styles.pre}>{JSON.stringify(model, null, 2)}</pre>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline component renderer – in Phase 1 this renders a placeholder.
// Replace with your actual component import when integrating.
// ---------------------------------------------------------------------------
interface RendererProps {
  model: Model;
  modelUpdate: (patch: Partial<Model>) => void;
  width: number;
  height: number;
}

function ComponentRenderer({ model, modelUpdate, width, height }: RendererProps) {
  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        gap: 12,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
        Current value: <strong>{String(model.value)}</strong>
      </p>
      <input
        value={String(model.value)}
        onChange={(e) => modelUpdate({ value: e.target.value })}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 14,
          width: '100%',
          maxWidth: 280,
          boxSizing: 'border-box',
        }}
        placeholder="Type something…"
      />
      <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
        Replace <code>ComponentRenderer</code> in{' '}
        <code>packages/templates/preview-harness/src/App.tsx</code> with your component.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label style={styles.fieldLabel}>
      <span style={styles.fieldName}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.fieldInput}
      />
    </label>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f9fafb',
    color: '#111827',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    background: '#1f2937',
    color: '#f9fafb',
    flexShrink: 0,
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: '#60a5fa',
  },
  headerSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    gap: 0,
  },
  controls: {
    width: 240,
    flexShrink: 0,
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto' as const,
    padding: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    background: '#fff',
  },
  preview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    padding: 16,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 12,
  },
  previewCanvas: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    borderRadius: 8,
    overflow: 'auto',
  },
  inspector: {
    width: 220,
    flexShrink: 0,
    borderLeft: '1px solid #e5e7eb',
    overflowY: 'auto' as const,
    padding: 12,
    background: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6b7280',
    marginBottom: 8,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    marginBottom: 10,
  },
  fieldName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 500,
  },
  fieldInput: {
    border: '1px solid #d1d5db',
    borderRadius: 5,
    padding: '6px 8px',
    fontSize: 13,
    outline: 'none',
    color: '#111827',
  },
  textarea: {
    width: '100%',
    border: '1px solid #374151',
    borderRadius: 5,
    padding: '6px 8px',
    fontSize: 12,
    fontFamily: 'monospace',
    background: '#f9fafb',
    color: '#111827',
    resize: 'vertical' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  jsonError: {
    fontSize: 11,
    color: '#dc2626',
  },
  pre: {
    margin: 0,
    fontSize: 11,
    fontFamily: 'monospace',
    background: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    overflowX: 'auto' as const,
    color: '#374151',
  },
};
