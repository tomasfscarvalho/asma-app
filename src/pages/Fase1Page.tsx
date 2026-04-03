import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import ProgressBar from '../components/ProgressBar'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'

const steps = ['Sintomas', 'Fatores', 'História', 'Exame físico']

export default function Fase1Page() {
  const { fase1, setFase1, navegarPara, paciente } = useAsmaStore()
  const [step, setStep] = useState(0)

  function handleAnterior() {
    if (step > 0) setStep(step - 1)
    else navegarPara(-1)
  }

  function handleProximo() {
    if (step < steps.length - 1) setStep(step + 1)
    else navegarPara(1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <ProgressBar />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

          {/* Card principal */}
          <div style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid #333', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Fase 1 — Avaliação clínica inicial</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#0F6E5630', color: '#5DCAA5', border: '1px solid #1D9E7540' }}>
                Apresentação ao médico
              </span>
            </div>

            <SubstepNav steps={steps} atual={step} onChange={setStep} />

            {/* Conteúdo */}
            <div style={{ padding: 20, minHeight: 280 }}>

              {step === 0 && (
                <>
                  <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Sintomas respiratórios típicos
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CheckItem label="Sibilância (pieira)" checked={fase1.sibilancia} onChange={v => setFase1({ sibilancia: v })} />
                    <CheckItem label="Dispneia" checked={fase1.dispneia} onChange={v => setFase1({ dispneia: v })} />
                    <CheckItem label="Tosse" checked={fase1.tosse} onChange={v => setFase1({ tosse: v })} />
                    <CheckItem label="Opressão torácica" checked={fase1.opressaoToracica} onChange={v => setFase1({ opressaoToracica: v })} />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Fatores que aumentam probabilidade de asma
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                    <CheckItem label="Mais do que 1 tipo de sintoma" checked={fase1.maisDe1Sintoma} onChange={v => setFase1({ maisDe1Sintoma: v })} />
                    <CheckItem label="Sintomas variáveis ao longo do tempo" checked={fase1.sintomasVariaveis} onChange={v => setFase1({ sintomasVariaveis: v })} />
                    <CheckItem label="Agravam com exercício / alergénios" checked={fase1.agravamComExposicao} onChange={v => setFase1({ agravamComExposicao: v })} />
                    <CheckItem label="Sintomas > 1x por semana" checked={fase1.sintomasMaisde1xSemana} onChange={v => setFase1({ sintomasMaisde1xSemana: v })} />
                    <CheckItem label="Aparecem ou pioram à noite / manhã" checked={fase1.sintomasNoturnosOuManha} onChange={v => setFase1({ sintomasNoturnosOuManha: v })} />
                  </div>
                  <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Fatores que diminuem probabilidade de asma
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CheckItem label="Tosse isolada sem outros sintomas" checked={fase1.tosseIsolada} onChange={v => setFase1({ tosseIsolada: v })} />
                    <CheckItem label="Tosse produtiva crónica" checked={fase1.tosseProdutivaCronica} onChange={v => setFase1({ tosseProdutivaCronica: v })} />
                    <CheckItem label="Dor torácica" checked={fase1.dorToracica} onChange={v => setFase1({ dorToracica: v })} />
                    <CheckItem label="Dispneia com inspiração ruidosa" checked={fase1.dispneiaPorExercicioComInspiracao} onChange={v => setFase1({ dispneiaPorExercicioComInspiracao: v })} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    História clínica e familiar
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CheckItem label="Início de sintomas na infância" checked={fase1.inicioNaInfancia} onChange={v => setFase1({ inicioNaInfancia: v })} />
                    <CheckItem label="Rinite alérgica ou eczema" checked={fase1.riniteOuEczema} onChange={v => setFase1({ riniteOuEczema: v })} />
                    <CheckItem label="História familiar de asma / atopia" checked={fase1.familiarAsmaAtopia} onChange={v => setFase1({ familiarAsmaAtopia: v })} />
                    <CheckItem label="Sensibilização alergénica conhecida" checked={fase1.sensibilizacaoAlergenica} onChange={v => setFase1({ sensibilizacaoAlergenica: v })} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Exame físico
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <CheckItem label="Sibilos na expiração" checked={fase1.sibilosNaExpiracao} onChange={v => setFase1({ sibilosNaExpiracao: v })} />
                    <CheckItem label="Exame físico normal" checked={fase1.exameFisicoNormal} onChange={v => setFase1({ exameFisicoNormal: v })} />
                    <CheckItem
                      label="Silêncio respiratório — sinal de obstrução grave"
                      checked={fase1.silencioRespiratorio}
                      onChange={v => setFase1({ silencioRespiratorio: v })}
                      alerta
                    />
                  </div>
                  {fase1.silencioRespiratorio && (
                    <div style={{ marginTop: 16, background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '10px 12px' }}>
                      <p style={{ color: '#F09595', fontSize: 13, margin: 0 }}>
                        ⚠ Silêncio respiratório — sinal de obstrução brônquica muito grave. Sinalizar imediatamente.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <NavFooter
              stepAtual={step}
              totalSteps={steps.length}
              onAnterior={handleAnterior}
              onProximo={handleProximo}
              labelProximo={step === steps.length - 1 ? 'Fase 2 →' : 'Próximo →'}
            />
          </div>

          {/* Painel lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#1e1e1e', borderRadius: 10, border: '1px solid #333', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', fontSize: 12, fontWeight: 500, color: '#888' }}>Resumo da sessão</div>
              <div style={{ padding: '10px 14px' }}>
                {[
                  { key: 'Paciente', val: paciente.nome || '—' },
                  { key: 'Fase atual', val: '1 / 8' },
                  { key: 'Sintomas', val: [fase1.sibilancia, fase1.dispneia, fase1.tosse, fase1.opressaoToracica].filter(Boolean).length > 0 ? `${[fase1.sibilancia, fase1.dispneia, fase1.tosse, fase1.opressaoToracica].filter(Boolean).length} assinalados` : '—' },
                  { key: 'Controlo', val: '—' },
                  { key: 'Risco', val: '—' },
                ].map(r => (
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