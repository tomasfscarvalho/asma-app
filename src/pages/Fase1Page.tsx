import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'

const steps = ['Sintomas', 'Fatores', 'História', 'Exame físico']

export default function Fase1Page() {
  const { fase1, setFase1, navegarPara } = useAsmaStore()
  const [step, setStep] = useState(0)

  const sintomasCount = [fase1.sibilancia, fase1.dispneia, fase1.tosse, fase1.opressaoToracica].filter(Boolean).length
  const fatoresAumentamCount = [
    fase1.maisDe1Sintoma, fase1.sintomasVariaveis,
    fase1.agravamComExercicio, fase1.agravamComFrio,
    fase1.agravamComAlergenios, fase1.agravamComInfecoes,
    fase1.sintomasMaisde1xSemana, fase1.sintomasNoturnosOuManha
  ].filter(Boolean).length
  const fatoresDiminuemCount = [
    fase1.tosseIsolada, fase1.tosseProdutivaCronica,
    fase1.dispneiaTonturasParestesias, fase1.dorToracica,
    fase1.dispneiaPorExercicioComInspiracao
  ].filter(Boolean).length

  function handleAnterior() {
    if (step > 0) setStep(step - 1)
    else navegarPara(-1)
  }

  function handleProximo() {
    if (step < steps.length - 1) setStep(step + 1)
    else navegarPara(1)
  }

  return (
    <Layout
      faseNumero={1}
      faseTitulo="Avaliação clínica inicial"
      badge="Apresentação ao médico"
      resumo={[
        { key: 'Sintomas típicos', val: sintomasCount > 0 ? `${sintomasCount} assinalados` : '—' },
        { key: 'Fatores ↑', val: fatoresAumentamCount > 0 ? `${fatoresAumentamCount} presentes` : '—' },
        { key: 'Fatores ↓', val: fatoresDiminuemCount > 0 ? `${fatoresDiminuemCount} presentes` : '—' },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 320 }}>

        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              O diagnóstico da asma é essencialmente clínico. Regista os sintomas respiratórios típicos presentes. A ferramenta organiza e apresenta — a decisão diagnóstica é do médico.
            </p>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Sintomas respiratórios típicos
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <CheckItem label="Sibilância (pieira)" checked={fase1.sibilancia} onChange={v => setFase1({ sibilancia: v })} />
              <CheckItem label="Dispneia (falta de ar)" checked={fase1.dispneia} onChange={v => setFase1({ dispneia: v })} />
              <CheckItem label="Tosse" checked={fase1.tosse} onChange={v => setFase1({ tosse: v })} />
              <CheckItem label="Opressão torácica" checked={fase1.opressaoToracica} onChange={v => setFase1({ opressaoToracica: v })} />
            </div>

            {sintomasCount >= 1 && (
              <div style={{ marginTop: 16, background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
                  {sintomasCount >= 2
                    ? `${sintomasCount} sintomas típicos presentes — aumenta a probabilidade de asma.`
                    : '1 sintoma típico presente — probabilidade aumenta com mais sintomas associados.'}
                </p>
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              Regista os fatores que modificam a probabilidade diagnóstica segundo o GRESP/GINA 2022.
            </p>

            <p style={{ fontSize: 11, color: '#5DCAA5', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Fatores que aumentam a probabilidade de asma
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <CheckItem
                label="Normalmente ocorre mais do que um tipo de sintoma"
                checked={fase1.maisDe1Sintoma}
                onChange={v => setFase1({ maisDe1Sintoma: v })}
              />
              <CheckItem
                label="Sintomas surgem de forma e intensidade variável ao longo do tempo"
                checked={fase1.sintomasVariaveis}
                onChange={v => setFase1({ sintomasVariaveis: v })}
              />
              <p style={{ fontSize: 11, color: '#666', margin: '4px 0 4px 0' }}>Sintomas agravam-se com:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingLeft: 8 }}>
                <CheckItem
                  label="Exercício físico"
                  checked={fase1.agravamComExercicio}
                  onChange={v => setFase1({ agravamComExercicio: v })}
                />
                <CheckItem
                  label="Exposição ao frio"
                  checked={fase1.agravamComFrio}
                  onChange={v => setFase1({ agravamComFrio: v })}
                />
                <CheckItem
                  label="Alergénios ou irritantes"
                  checked={fase1.agravamComAlergenios}
                  onChange={v => setFase1({ agravamComAlergenios: v })}
                />
                <CheckItem
                  label="Infeções respiratórias virais"
                  checked={fase1.agravamComInfecoes}
                  onChange={v => setFase1({ agravamComInfecoes: v })}
                />
              </div>
              <CheckItem
                label="Sintomas ocorrem mais do que uma vez por semana"
                checked={fase1.sintomasMaisde1xSemana}
                onChange={v => setFase1({ sintomasMaisde1xSemana: v })}
              />
              <CheckItem
                label="Sintomas aparecem ou pioram à noite ou de manhã"
                checked={fase1.sintomasNoturnosOuManha}
                onChange={v => setFase1({ sintomasNoturnosOuManha: v })}
              />
            </div>

            {fatoresAumentamCount > 0 && (
              <div style={{ background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
                <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
                  {fatoresAumentamCount} fator(es) que aumentam a probabilidade de asma presentes.
                </p>
              </div>
            )}

            <p style={{ fontSize: 11, color: '#F09595', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Fatores que diminuem a probabilidade de asma
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckItem
                label="Tosse isolada sem outros sintomas associados"
                checked={fase1.tosseIsolada}
                onChange={v => setFase1({ tosseIsolada: v })}
                alerta
              />
              <CheckItem
                label="Tosse produtiva crónica"
                checked={fase1.tosseProdutivaCronica}
                onChange={v => setFase1({ tosseProdutivaCronica: v })}
                alerta
              />
              <CheckItem
                label="Dispneia associada a tonturas ou parestesias"
                checked={fase1.dispneiaTonturasParestesias}
                onChange={v => setFase1({ dispneiaTonturasParestesias: v })}
                alerta
              />
              <CheckItem
                label="Dor torácica"
                checked={fase1.dorToracica}
                onChange={v => setFase1({ dorToracica: v })}
                alerta
              />
              <CheckItem
                label="Dispneia provocada por exercício com inspiração ruidosa"
                checked={fase1.dispneiaPorExercicioComInspiracao}
                onChange={v => setFase1({ dispneiaPorExercicioComInspiracao: v })}
                alerta
              />
            </div>

            {fatoresDiminuemCount > 0 && (
              <div style={{ marginTop: 12, background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '8px 12px' }}>
                <p style={{ color: '#F09595', fontSize: 12, margin: 0 }}>
                  {fatoresDiminuemCount} fator(es) que diminuem a probabilidade de asma presentes — considerar diagnósticos diferenciais.
                </p>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              A história clínica e familiar aumenta a probabilidade de diagnóstico de asma quando presente, apesar de não estar presente na totalidade dos doentes.
            </p>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              História clínica e familiar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckItem
                label="Início de sintomas na infância"
                checked={fase1.inicioNaInfancia}
                onChange={v => setFase1({ inicioNaInfancia: v })}
              />
              <CheckItem
                label="História de rinite alérgica ou eczema"
                checked={fase1.riniteOuEczema}
                onChange={v => setFase1({ riniteOuEczema: v })}
              />
              <CheckItem
                label="História familiar de asma ou atopia"
                checked={fase1.familiarAsmaAtopia}
                onChange={v => setFase1({ familiarAsmaAtopia: v })}
              />
              <CheckItem
                label="Sensibilização alergénica conhecida"
                checked={fase1.sensibilizacaoAlergenica}
                onChange={v => setFase1({ sensibilizacaoAlergenica: v })}
              />
            </div>

            {[fase1.inicioNaInfancia, fase1.riniteOuEczema, fase1.familiarAsmaAtopia, fase1.sensibilizacaoAlergenica].filter(Boolean).length > 0 && (
              <div style={{ marginTop: 16, background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
                  História clínica/familiar positiva — aumenta a probabilidade de diagnóstico de asma.
                </p>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              O exame físico em pessoas com asma é habitualmente normal. A presença de sibilos na expiração é a alteração mais frequente mas não é específica de asma.
            </p>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Exame físico
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckItem
                label="Sibilos na expiração (alteração mais frequente, não específica)"
                checked={fase1.sibilosNaExpiracao}
                onChange={v => setFase1({ sibilosNaExpiracao: v })}
              />
              <CheckItem
                label="Exame físico normal (frequente na asma fora de agudização)"
                checked={fase1.exameFisicoNormal}
                onChange={v => setFase1({ exameFisicoNormal: v })}
              />
              <CheckItem
                label="Silêncio respiratório — sinal de obstrução brônquica muito grave"
                checked={fase1.silencioRespiratorio}
                onChange={v => setFase1({ silencioRespiratorio: v })}
                alerta
              />
            </div>

            {fase1.silencioRespiratorio && (
              <div style={{ marginTop: 16, background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '12px' }}>
                <p style={{ color: '#F09595', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>⚠ Alerta clínico</p>
                <p style={{ color: '#F09595', fontSize: 12, margin: 0 }}>
                  Silêncio respiratório — sinal de obstrução brônquica muito grave. Nas agudizações os sibilos podem estar ausentes. Sinalizar imediatamente.
                </p>
              </div>
            )}

            <div style={{ marginTop: 20, background: '#1a1a1a', borderRadius: 8, padding: 14, border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Perfil de probabilidade — resumo
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#888' }}>Sintomas típicos presentes</span>
                  <span style={{ color: sintomasCount > 0 ? '#5DCAA5' : '#555' }}>{sintomasCount} / 4</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#888' }}>Fatores que aumentam probabilidade</span>
                  <span style={{ color: fatoresAumentamCount > 0 ? '#5DCAA5' : '#555' }}>{fatoresAumentamCount} / 8</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#888' }}>Fatores que diminuem probabilidade</span>
                  <span style={{ color: fatoresDiminuemCount > 0 ? '#F09595' : '#555' }}>{fatoresDiminuemCount} / 5</span>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: '8px 0 0', borderTop: '1px solid #333' }}>
                <p style={{ fontSize: 11, color: '#555', margin: 0 }}>
                  A decisão de avançar para confirmação funcional (Fase 3) é do médico.
                </p>
              </div>
            </div>
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
    </Layout>
  )
}