import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase3 } from '../domain/fase3-provas'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'
import ResultBox from '../components/ResultBox'

const steps = ['Contexto', 'Espirometria', 'Reversibilidade', 'PEF + Output']

export default function Fase3Page() {
  const { fase3, setFase3, setResultadoFase3, navegarPara, paciente } = useAsmaStore()
  const [step, setStep] = useState(0)

  const resultado = calcularFase3(fase3)

  const racio = fase3.fev1FvcRacio ??
    (fase3.fev1Percentagem && fase3.fvcPercentagem
      ? fase3.fev1Percentagem / fase3.fvcPercentagem
      : null)

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setResultadoFase3(resultado)
      navegarPara(9)
    }
  }

  return (
    <Layout
      faseNumero={3}
      faseTitulo="Provas de função respiratória"
      badge="Decisão automática"
      resumo={[
        { key: 'Obstrução', val: fase3.fev1Percentagem ? (resultado.obstrutivo ? '✓ Confirmada' : '✗ Não confirmada') : '—' },
        { key: 'Reversibilidade', val: fase3.aumentoFev1Percentagem ? (resultado.reversibilidade ? '✓ Positiva' : '✗ Negativa') : '—' },
        { key: 'Critérios +', val: `${resultado.criteriosPositivos} / 3` },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 320 }}>

        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              A espirometria é o método de diagnóstico recomendado. A confirmação da variabilidade ao fluxo expiratório é um componente essencial no diagnóstico da asma. O diagnóstico deve ser realizado, sempre que possível, antes de o tratamento ser iniciado.
            </p>

            {paciente.jaEmICS && (
              <div style={{ background: '#FAEEDA20', border: '1px solid #FAC77550', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ color: '#FAC775', fontSize: 13, fontWeight: 500, margin: '0 0 6px' }}>⚠ Doente jÃ¡ em tratamento com ICS</p>
                <p style={{ color: '#FAC775', fontSize: 12, margin: '0 0 8px' }}>
                  A espirometria pode estar falsamente normal â€” o ICS pode ter melhorado a funÃ§Ã£o pulmonar antes da confirmaÃ§Ã£o diagnÃ³stica.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#BA7517' }}>
                  <span>• PerÃ­odos de suspensÃ£o recomendados antes da espirometria:</span>
                  <span style={{ paddingLeft: 12 }}>SABA: ≥ 4 horas | LABA: 24 horas | Formoterol/Salmeterol: 24 horas</span>
                  <span>• A ausÃªncia de obstruÃ§Ã£o nÃ£o exclui o diagnÃ³stico de asma</span>
                  <span>• Considerar variabilidade entre visitas como critÃ©rio adicional</span>
                </div>
              </div>
            )}

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Contexto do paciente
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <CheckItem
                label="Paciente pediátrico (criança > 5 anos)"
                checked={fase3.pacientePediatrico}
                onChange={v => setFase3({ pacientePediatrico: v })}
              />
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 14, border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Limiares aplicados — {fase3.pacientePediatrico ? 'pediátrico' : 'adulto'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Obstrução (FEV1/FVC)</span>
                  <span style={{ color: '#ccc' }}>{fase3.pacientePediatrico ? '< 0,90' : '< 0,75'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Reversibilidade FEV1</span>
                  <span style={{ color: '#ccc' }}>{fase3.pacientePediatrico ? '> 12% do previsto' : '> 12% E > 200 ml'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Variabilidade PEF</span>
                  <span style={{ color: '#ccc' }}>{fase3.pacientePediatrico ? '> 13%' : '> 10%'}</span>
                </div>
              </div>

              {fase3.pacientePediatrico && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: '#0F6E5615', borderRadius: 6, border: '1px solid #1D9E7530' }}>
                  <p style={{ color: '#5DCAA5', fontSize: 11, margin: 0 }}>
                    Nota clínica: Em crianças, o FEV1 pode ser normal mesmo com asma. A relação entre sintomas e resultados funcionais é complexa nesta faixa etária.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              A espirometria permite avaliar a gravidade da obstrução através do FEV1. Um valor reduzido da relação FEV1/FVC indica limitação ao fluxo expiratório.
            </p>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Espirometria pré-broncodilatador
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>FEV1 (% previsto)</label>
                <input
                  type="number"
                  value={fase3.fev1Percentagem ?? ''}
                  onChange={e => setFase3({ fev1Percentagem: e.target.value ? Number(e.target.value) : null, fev1FvcRacio: null })}
                  placeholder="ex: 72"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>FVC (% previsto)</label>
                <input
                  type="number"
                  value={fase3.fvcPercentagem ?? ''}
                  onChange={e => setFase3({ fvcPercentagem: e.target.value ? Number(e.target.value) : null, fev1FvcRacio: null })}
                  placeholder="ex: 85"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
            </div>

            {racio && (
              <div style={{ marginBottom: 16 }}>
                <ResultBox
                  label={`FEV1/FVC calculado — limiar ${fase3.pacientePediatrico ? '0,90' : '0,75'} (${fase3.pacientePediatrico ? 'pediátrico' : 'adulto'})`}
                  valor={`${racio.toFixed(2)} → ${resultado.obstrutivo ? 'Obstrução confirmada' : 'Sem obstrução confirmada'}`}
                  tipo={resultado.obstrutivo ? 'ok' : 'neutro'}
                />
              </div>
            )}

            {fase3.fev1Percentagem && fase3.fev1Percentagem < 60 && (
              <div style={{ background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#F09595', fontSize: 12, margin: 0 }}>
                  ⚠ FEV1 &lt; 60% do previsto — fator de risco para agudizações (será registado na Fase 5).
                </p>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              O teste de reversibilidade é realizado 10 a 15 minutos após administração de broncodilatador (200-400 µg salbutamol ou equivalente). A reversibilidade brônquica favorece o diagnóstico de asma quando enquadrada no contexto clínico.
            </p>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Pós-broncodilatador — 10 a 15 min após 200-400 µg salbutamol
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: fase3.pacientePediatrico ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  Aumento do FEV1 (%)
                </label>
                <input
                  type="number"
                  value={fase3.aumentoFev1Percentagem ?? ''}
                  onChange={e => setFase3({ aumentoFev1Percentagem: e.target.value ? Number(e.target.value) : null })}
                  placeholder={fase3.pacientePediatrico ? 'Positivo se > 12% do previsto' : 'Positivo se > 12%'}
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              {!fase3.pacientePediatrico && (
                <div>
                  <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                    Aumento do FEV1 (ml)
                  </label>
                  <input
                    type="number"
                    value={fase3.aumentoFev1ml ?? ''}
                    onChange={e => setFase3({ aumentoFev1ml: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Positivo se > 200 ml"
                    style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                  />
                </div>
              )}
            </div>

            {(fase3.aumentoFev1Percentagem || fase3.aumentoFev1ml) && (
              <ResultBox
                label={`Reversibilidade broncodilatadora — critério ${fase3.pacientePediatrico ? '> 12% do previsto' : '> 12% E > 200 ml'}`}
                valor={resultado.reversibilidade ? 'Critério positivo — reversibilidade confirmada' : 'Critério negativo — reversibilidade não confirmada'}
                tipo={resultado.reversibilidade ? 'ok' : 'neutro'}
              />
            )}

            <div style={{ marginTop: 16, background: '#1a1a1a', borderRadius: 6, padding: '10px 12px', border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#555', margin: 0, lineHeight: 1.6 }}>
                Nota: A reversibilidade pode estar ausente em doentes já medicados com broncodilatadores. A sua presença confirma o diagnóstico mas a ausência não o exclui.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              O PEF é uma alternativa à espirometria quando esta não está disponível. É especialmente recomendado em asma grave, fraca perceção de sintomas e suspeita de asma ocupacional.
            </p>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Variabilidade diária do PEF
            </p>

            <p style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>
              2 medições por dia durante 2 semanas — melhor de 3 determinações em cada medição.
            </p>

            <div style={{ marginBottom: 20, maxWidth: 220 }}>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                Variabilidade diária (%)
              </label>
              <input
                type="number"
                value={fase3.variabilidadePef ?? ''}
                onChange={e => setFase3({ variabilidadePef: e.target.value ? Number(e.target.value) : null })}
                placeholder={fase3.pacientePediatrico ? 'Positivo se > 13%' : 'Positivo se > 10%'}
                style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
              />
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Output automático — fase 3
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <ResultBox
                label="Limitação ao fluxo expiratório (FEV1/FVC)"
                valor={fase3.fev1Percentagem
                  ? (resultado.obstrutivo ? '✓ Critério positivo' : '✗ Critério negativo')
                  : 'Não avaliado'}
                tipo={fase3.fev1Percentagem ? (resultado.obstrutivo ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label="Reversibilidade broncodilatadora"
                valor={fase3.aumentoFev1Percentagem
                  ? (resultado.reversibilidade ? '✓ Critério positivo' : '✗ Critério negativo')
                  : 'Não avaliado'}
                tipo={fase3.aumentoFev1Percentagem ? (resultado.reversibilidade ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label={`Variabilidade diária do PEF (limiar ${fase3.pacientePediatrico ? '> 13%' : '> 10%'})`}
                valor={fase3.variabilidadePef
                  ? (resultado.pefPositivo ? '✓ Critério positivo' : '✗ Critério negativo')
                  : 'Não avaliado'}
                tipo={fase3.variabilidadePef ? (resultado.pefPositivo ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label="Total de critérios objetivos positivos"
                valor={`${resultado.criteriosPositivos} de 3`}
                tipo={resultado.criteriosPositivos >= 1 ? 'ok' : 'neutro'}
              />
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 6, padding: '10px 12px', border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#555', margin: 0, lineHeight: 1.6 }}>
                A conclusão diagnóstica final é da responsabilidade do médico. Na página seguinte poderá confirmar ou não o diagnóstico de asma com base em toda a informação recolhida.
              </p>
            </div>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(1)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Decisão diagnóstica →' : 'Próximo →'}
      />
    </Layout>
  )
}
