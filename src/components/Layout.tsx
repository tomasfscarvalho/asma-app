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

  const idade = paciente.dataNascimento
    ? Math.floor((Date.now() - new Date(paciente.dataNascimento).getTime()) / 31557600000)
    : null

  const resumoPadrao = [
    { key: 'Paciente', val: paciente.nome || '\u2014' },
    { key: 'Idade', val: idade !== null && !Number.isNaN(idade) ? `${idade} anos` : '\u2014' },
    { key: 'Fase atual', val: `${faseNumero} / 8` },
    ...resumo,
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '1.5rem' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <ProgressBar />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 16 }}>
          <div style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid #333', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{`Fase ${faseNumero} \u2014 ${faseTitulo}`}</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#0F6E5630', color: '#5DCAA5', border: '1px solid #1D9E7540' }}>
                {badge}
              </span>
            </div>
            {children}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={ativarFase8}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E24B4A50', background: '#E24B4A15', color: '#F09595', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              {'\u26a0 Avaliar agudiza\u00e7\u00e3o'}
            </button>

            <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid #333', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', fontSize: 12, fontWeight: 500, color: '#888' }}>{'Resumo da sess\u00e3o'}</div>
              <div style={{ padding: '10px 14px' }}>
                {resumoPadrao.map(r => (
                  <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '4px 0', fontSize: 12, borderBottom: '1px solid #2a2a2a' }}>
                    <span style={{ color: '#666', flexShrink: 0 }}>{r.key}</span>
                    <span style={{ color: '#ccc', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
