interface ResultBoxProps {
  label: string
  valor: string
  tipo?: 'ok' | 'alerta' | 'neutro'
}

export default function ResultBox({ label, valor, tipo = 'neutro' }: ResultBoxProps) {
  const cores = {
    ok: { border: '#5DCAA5', bg: '#0F6E5620', labelColor: '#5DCAA5', valorColor: '#9FE1CB' },
    alerta: { border: '#E24B4A', bg: '#E24B4A15', labelColor: '#F09595', valorColor: '#F7C1C1' },
    neutro: { border: '#333', bg: 'transparent', labelColor: '#888', valorColor: '#ccc' },
  }[tipo]

  return (
    <div style={{ border: `1px solid ${cores.border}`, borderRadius: 6, padding: '10px 14px', background: cores.bg }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: cores.labelColor, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: cores.valorColor }}>{valor}</div>
    </div>
  )
}