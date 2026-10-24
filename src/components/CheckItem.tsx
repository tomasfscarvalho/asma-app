interface CheckItemProps {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
  alerta?: boolean
  /** Valor calculado a partir de outra fase: mostra-se, mas não se edita aqui. */
  bloqueado?: boolean
}

export default function CheckItem({ label, checked, onChange, alerta, bloqueado }: CheckItemProps) {
  return (
    <div
      onClick={() => { if (!bloqueado) onChange(!checked) }}
      aria-disabled={bloqueado || undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
        border: `1px solid ${alerta && checked ? '#E24B4A' : checked ? '#5DCAA5' : '#333'}`,
        borderRadius: 6, cursor: bloqueado ? 'default' : 'pointer', opacity: bloqueado ? 0.85 : 1,
        background: alerta && checked ? '#E24B4A15' : checked ? '#0F6E5620' : 'transparent',
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: 3, border: `1px solid ${checked ? '#1D9E75' : '#555'}`,
        background: checked ? '#1D9E75' : 'transparent', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: alerta && checked ? '#F09595' : checked ? '#5DCAA5' : '#ccc' }}>{label}</span>
    </div>
  )
}