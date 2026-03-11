interface Props {
  previewUrl: string | null;
}

export default function PreviewPanel({ previewUrl }: Props) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>🔍 Preview</div>
      <div style={styles.body}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title="Component Preview"
            style={styles.iframe}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div style={styles.placeholder}>
            <p style={styles.placeholderText}>No preview running.</p>
            <p style={styles.hint}>Click <strong>Start Preview</strong> to launch the dev server.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#0f1117',
  },
  header: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #2a2d3e',
    color: '#e2e8f0',
    fontWeight: 600,
    fontSize: '0.9rem',
    background: '#1a1d27',
  },
  body: {
    flex: 1,
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '0.5rem',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: '1rem',
    margin: 0,
  },
  hint: {
    color: '#475569',
    fontSize: '0.85rem',
    margin: 0,
  },
};
