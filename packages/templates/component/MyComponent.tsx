import React from 'react';

/**
 * MyComponent – starter template for Retool Custom Component Libraries.
 *
 * Retool passes data to custom components via the `model` prop and listens
 * for changes via the `modelUpdate` callback.
 *
 * Reference: https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl
 */
export interface MyComponentProps {
  /** Data passed in from Retool (the "model" object). */
  model: {
    label?: string;
    value?: string | number;
  };
  /** Call this to push state changes back to Retool. */
  modelUpdate: (patch: Partial<MyComponentProps['model']>) => void;
}

export default function MyComponent({ model, modelUpdate }: MyComponentProps) {
  const { label = 'My Component', value = '' } = model;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>{label}</h2>
      <input
        style={inputStyle}
        value={String(value)}
        onChange={(e) => modelUpdate({ value: e.target.value })}
        placeholder="Edit me…"
      />
      <p style={hintStyle}>Current value: {String(value)}</p>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '1rem',
  fontFamily: 'system-ui, sans-serif',
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  fontSize: '1.2rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '0.9rem',
  width: '100%',
  boxSizing: 'border-box',
};

const hintStyle: React.CSSProperties = {
  marginTop: '0.5rem',
  fontSize: '0.8rem',
  color: '#6b7280',
};
