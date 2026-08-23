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
    <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ color: '#9FE1CB', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginRight: 12, minWidth: 100 }}>
        AsthmaGuide
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflowX: 'auto' }}>
        {fases.map((fase, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && (
              <div style={{ width: 20, height: 1, background: i <= faseAtual ? '#5DCAA5' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            )}
            <button
              type="button"
              onClick={() => navegarPara(i)}
              disabled={i >= faseAtual}
              aria-label={
                i < faseAtual
                  ? `Voltar à fase ${i + 1}: ${fase.label}`
                  : `Fase ${i + 1}: ${fase.label}${i === faseAtual ? ' (fase atual)' : ' (ainda não disponível)'}`
              }
              aria-current={i === faseAtual ? 'step' : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 56,
                background: 'none', border: 'none', padding: 0, font: 'inherit',
                cursor: i < faseAtual ? 'pointer' : 'default',
              }}
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
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
