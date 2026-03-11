import React from 'react';

/**
 * MyComponent – Retool Custom Component starter template.
 *
 * Retool passes `modelUpdate`, `triggerQuery` and other utilities via the
 * Retool Custom Component SDK.  The `model` prop holds the component's state
 * that Retool can read and write.
 *
 * Replace "MyComponent" with your component name when scaffolding.
 */

export interface MyComponentModel {
  value: string;
}

export interface MyComponentProps {
  /** Current model values provided by Retool */
  model: MyComponentModel;
  /** Call this to update the model (Retool will receive the change) */
  modelUpdate: (patch: Partial<MyComponentModel>) => void;
  /** Width allocated by Retool */
  width: number;
  /** Height allocated by Retool */
  height: number;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  model,
  modelUpdate,
  width,
  height,
}) => {
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
        Current value: <strong>{model.value}</strong>
      </p>
      <input
        value={model.value}
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
    </div>
  );
};

export default MyComponent;
