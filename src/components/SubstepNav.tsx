interface SubstepNavProps {
  steps: string[]
  atual: number
  onChange: (i: number) => void
}

export default function SubstepNav({ steps, atual, onChange }: SubstepNavProps) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '12px 20px', borderBottom: '1px solid #333' }}>
      {steps.map((s, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            border: i === atual ? '1px solid #5DCAA5' : '1px solid #444',
            background: i === atual ? '#0F6E5630' : 'transparent',
            color: i === atual ? '#5DCAA5' : i < atual ? '#888' : '#666',
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )
}