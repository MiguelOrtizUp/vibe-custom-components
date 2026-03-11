
interface Props {
  previewUrl: string | null;
}

export function PreviewPane({ previewUrl }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Preview</span>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
            ↗ Open in new tab
          </a>
        )}
      </div>
      <div style={styles.body}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title="Component Preview"
            style={styles.iframe}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🔍</div>
            <p style={styles.emptyTitle}>No preview running</p>
            <p style={styles.emptyText}>
              Click <strong>Start Preview</strong> to launch the local preview server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#0f1117',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  title: {
    fontWeight: 600,
    fontSize: 13,
    color: '#e2e8f0',
  },
  link: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#60a5fa',
    textDecoration: 'none',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#fff',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    color: '#4b5563',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    margin: 0,
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center' as const,
    maxWidth: 260,
    lineHeight: 1.6,
  },
};
