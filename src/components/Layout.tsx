import { useAsmaStore } from '../store/useAsmaStore'
import ProgressBar from './ProgressBar'

interface LayoutProps {
  children: React.ReactNode
  faseNumero: number
  faseTitulo: string
  badge: string
  resumo?: { key: string; val: string }[]
}

export default function Layout({ children, faseNumero, faseTitulo, badge, resumo = [] }: LayoutProps) {
  const { paciente, ativarFase8 } = useAsmaStore()

  const resumoPadrao = [
    { key: 'Paciente', val: paciente.nome || '—' },
    { key: 'Fase atual', val: `${faseNumero} / 8` },
    ...resumo,
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <ProgressBar />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

          <div style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid #333', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Fase {faseNumero} — {faseTitulo}</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#0F6E5630', color: '#5DCAA5', border: '1px solid #1D9E7540' }}>
                {badge}
              </span>
            </div>
            {children}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Botão de emergência */}
            <button
              onClick={ativarFase8}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E24B4A50', background: '#E24B4A15', color: '#F09595', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              ⚠ Avaliar agudização
            </button>

            <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid #333', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', fontSize: 12, fontWeight: 500, color: '#888' }}>Resumo da sessão</div>
              <div style={{ padding: '10px 14px' }}>
                {resumoPadrao.map(r => (
                  <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid #2a2a2a' }}>
                    <span style={{ color: '#666' }}>{r.key}</span>
                    <span style={{ color: '#ccc', fontWeight: 500 }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid #333', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', fontSize: 12, fontWeight: 500, color: '#888' }}>Sessão atual</div>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: '#666' }}>Dados</span>
                  <span style={{ background: '#0F6E5630', color: '#5DCAA5', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>Só na RAM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: '#666' }}>Ao fechar</span>
                  <span style={{ color: '#555', fontSize: 11 }}>Apagado automaticamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}