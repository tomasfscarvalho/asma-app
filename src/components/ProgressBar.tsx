import { useAsmaStore } from '../store/useAsmaStore'

const fases = [
  { label: 'Avaliação' },
  { label: 'Diferenciais' },
  { label: 'Provas func.' },
  { label: 'Controlo' },
  { label: 'Risco futuro' },
  { label: 'Terapêutica' },
  { label: 'Referenciação' },
  { label: 'Agudização' },
]

export default function ProgressBar() {
  const { faseAtual, navegarPara } = useAsmaStore()

  return (
    <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ color: '#9FE1CB', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', marginRight: 8 }}>Sistema ASMA</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflowX: 'auto' }}>
        {fases.map((fase, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && (
              <div style={{ width: 20, height: 1, background: i <= faseAtual ? '#5DCAA5' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            )}
            <div
              onClick={() => i < faseAtual && navegarPara(i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: i < faseAtual ? 'pointer' : 'default', minWidth: 56 }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500,
                background: i < faseAtual ? '#5DCAA5' : i === faseAtual ? 'white' : 'rgba(255,255,255,0.15)',
                color: i < faseAtual ? '#04342C' : i === faseAtual ? '#0F6E56' : 'rgba(255,255,255,0.5)',
              }}>
                {i < faseAtual ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, color: i === faseAtual ? 'white' : 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.2 }}>
                {fase.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}