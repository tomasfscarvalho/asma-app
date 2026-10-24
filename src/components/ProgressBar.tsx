import { useAsmaStore } from '../store/useAsmaStore'
import { calcularIdade, dentroDoAmbitoCronico } from '../domain/idade'
import { ECRA } from '../domain/fases'

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
  const { faseAtual, navegarPara, paciente, tipoConsulta, decisaoDiagnostica } = useAsmaStore()
  const idade = calcularIdade(paciente.dataNascimento)

  // Abaixo dos 6 anos só existe a avaliação de agudização: mostrar as fases
  // do percurso crónico como "feitas" seria falso.
  if (idade !== null && !dentroDoAmbitoCronico(idade)) {
    return (
      <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ color: '#9FE1CB', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginRight: 12, minWidth: 100 }}>AsthmaGuide</span>
        <span style={{ color: '#E1F5EE', fontSize: 12 }}>{`Doente com ${idade} anos — apenas avaliação de agudização`}</span>
      </div>
    )
  }

  // Numa primeira consulta sem decisão diagnóstica, só as Fases 1 a 3 estão
  // disponíveis: as seguintes pressupõem o diagnóstico confirmado. Sem este
  // limite, o ecrã da decisão (índice 9) ou a agudização aberta pelo atalho
  // deixariam saltar para a Fase 6 sem passar pela decisão.
  const semDecisao = tipoConsulta === 'primeira-consulta' && decisaoDiagnostica !== 'confirmado'
  const limite = semDecisao ? Math.min(faseAtual, ECRA.FASE_4_CONTROLO) : faseAtual
  const feita = (i: number) => i < limite
  const atual = (i: number) => i === faseAtual

  return (
    <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ color: '#9FE1CB', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginRight: 12, minWidth: 100 }}>
        AsthmaGuide
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflowX: 'auto' }}>
        {fases.map((fase, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && (
              <div style={{ width: 20, height: 1, background: i <= limite ? '#5DCAA5' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            )}
            <button
              type="button"
              onClick={() => navegarPara(i)}
              disabled={!feita(i)}
              aria-label={
                feita(i)
                  ? `Voltar à fase ${i + 1}: ${fase.label}`
                  : `Fase ${i + 1}: ${fase.label}${atual(i) ? ' (fase atual)' : ' (ainda não disponível)'}`
              }
              aria-current={atual(i) ? 'step' : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 56,
                background: 'none', border: 'none', padding: 0, font: 'inherit',
                cursor: feita(i) ? 'pointer' : 'default',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500,
                background: feita(i) ? '#5DCAA5' : atual(i) ? 'white' : 'rgba(255,255,255,0.15)',
                color: feita(i) ? '#04342C' : atual(i) ? '#0F6E56' : 'rgba(255,255,255,0.5)',
              }}>
                {feita(i) ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, color: atual(i) ? 'white' : 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.2 }}>
                {fase.label}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
