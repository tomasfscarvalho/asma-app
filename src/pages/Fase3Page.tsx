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
      faseTitulo={'Provas de fun\u00e7\u00e3o respirat\u00f3ria'}
      badge={'Decis\u00e3o autom\u00e1tica'}
      resumo={[
        { key: 'Obstru\u00e7\u00e3o', val: fase3.fev1Percentagem ? (resultado.obstrutivo ? '\u2713 Confirmada' : '\u2717 N\u00e3o confirmada') : '\u2014' },
        { key: 'Reversibilidade', val: fase3.aumentoFev1Percentagem ? (resultado.reversibilidade ? '\u2713 Positiva' : '\u2717 Negativa') : '\u2014' },
        { key: 'Crit\u00e9rios +', val: `${resultado.criteriosPositivos} / 3` },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 320 }}>
        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              {'A espirometria \u00e9 o m\u00e9todo de diagn\u00f3stico recomendado. A confirma\u00e7\u00e3o da variabilidade ao fluxo expirat\u00f3rio \u00e9 um componente essencial no diagn\u00f3stico da asma. O diagn\u00f3stico deve ser realizado, sempre que poss\u00edvel, antes de o tratamento ser iniciado.'}
            </p>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Contexto do paciente
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <CheckItem
                label={'Paciente pedi\u00e1trico (crian\u00e7a > 5 anos)'}
                checked={fase3.pacientePediatrico}
                onChange={v => setFase3({ pacientePediatrico: v })}
              />
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 14, border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                {'Limiares aplicados \u2014 '}{fase3.pacientePediatrico ? 'pedi\u00e1trico' : 'adulto'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>{'Obstru\u00e7\u00e3o (FEV1/FVC)'}</span>
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
                    {'Nota cl\u00ednica: Em crian\u00e7as, o FEV1 pode ser normal mesmo com asma. A rela\u00e7\u00e3o entre sintomas e resultados funcionais \u00e9 complexa nesta faixa et\u00e1ria.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              {'A espirometria permite avaliar a gravidade da obstru\u00e7\u00e3o atrav\u00e9s do FEV1. Um valor reduzido da rela\u00e7\u00e3o FEV1/FVC indica limita\u00e7\u00e3o ao fluxo expirat\u00f3rio.'}
            </p>

            {paciente.jaEmICS && (
              <div style={{ background: '#FAEEDA20', border: '1px solid #FAC77550', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ color: '#FAC775', fontSize: 13, fontWeight: 500, margin: '0 0 6px' }}>{'\u26a0 Doente j\u00e1 em tratamento com ICS'}</p>
                <p style={{ color: '#FAC775', fontSize: 12, margin: '0 0 8px' }}>
                  {'A espirometria pode estar falsamente normal \u2014 o ICS pode ter melhorado a fun\u00e7\u00e3o pulmonar antes da confirma\u00e7\u00e3o diagn\u00f3stica.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#BA7517' }}>
                  <span>{'\u2022 Per\u00edodos de suspens\u00e3o recomendados antes da espirometria:'}</span>
                  <span style={{ paddingLeft: 12 }}>{'SABA: \u2265 4 horas | LABA: 24 horas | Formoterol/Salmeterol: 24 horas'}</span>
                  <span>{'\u2022 A aus\u00eancia de obstru\u00e7\u00e3o n\u00e3o exclui o diagn\u00f3stico de asma'}</span>
                  <span>{'\u2022 Considerar variabilidade entre visitas como crit\u00e9rio adicional'}</span>
                </div>
              </div>
            )}

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {'Espirometria pr\u00e9-broncodilatador'}
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
                  label={`FEV1/FVC calculado \u2014 limiar ${fase3.pacientePediatrico ? '0,90' : '0,75'} (${fase3.pacientePediatrico ? 'pedi\u00e1trico' : 'adulto'})`}
                  valor={`${racio.toFixed(2)} \u2192 ${resultado.obstrutivo ? 'Obstru\u00e7\u00e3o confirmada' : 'Sem obstru\u00e7\u00e3o confirmada'}`}
                  tipo={resultado.obstrutivo ? 'ok' : 'neutro'}
                />
              </div>
            )}

            {fase3.fev1Percentagem && fase3.fev1Percentagem < 60 && (
              <div style={{ background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#F09595', fontSize: 12, margin: 0 }}>
                  {'\u26a0 FEV1 < 60% do previsto \u2014 fator de risco para agudiza\u00e7\u00f5es (ser\u00e1 registado na Fase 5).'}
                </p>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              {'O teste de reversibilidade \u00e9 realizado 10 a 15 minutos ap\u00f3s administra\u00e7\u00e3o de broncodilatador (200-400 \u00b5g salbutamol ou equivalente). A reversibilidade br\u00f4nquica favorece o diagn\u00f3stico de asma quando enquadrada no contexto cl\u00ednico.'}
            </p>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {'P\u00f3s-broncodilatador \u2014 10 a 15 min ap\u00f3s 200-400 \u00b5g salbutamol'}
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
                label={`Reversibilidade broncodilatadora \u2014 crit\u00e9rio ${fase3.pacientePediatrico ? '> 12% do previsto' : '> 12% E > 200 ml'}`}
                valor={resultado.reversibilidade ? 'Crit\u00e9rio positivo \u2014 reversibilidade confirmada' : 'Crit\u00e9rio negativo \u2014 reversibilidade n\u00e3o confirmada'}
                tipo={resultado.reversibilidade ? 'ok' : 'neutro'}
              />
            )}

            <div style={{ marginTop: 16, background: '#1a1a1a', borderRadius: 6, padding: '10px 12px', border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#555', margin: 0, lineHeight: 1.6 }}>
                {'Nota: A reversibilidade pode estar ausente em doentes j\u00e1 medicados com broncodilatadores. A sua presen\u00e7a confirma o diagn\u00f3stico mas a aus\u00eancia n\u00e3o o exclui.'}
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              {'O PEF \u00e9 uma alternativa \u00e0 espirometria quando esta n\u00e3o est\u00e1 dispon\u00edvel. \u00c9 especialmente recomendado em asma grave, fraca perce\u00e7\u00e3o de sintomas e suspeita de asma ocupacional.'}
            </p>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {'Variabilidade di\u00e1ria do PEF'}
            </p>

            <p style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>
              {'2 medi\u00e7\u00f5es por dia durante 2 semanas \u2014 melhor de 3 determina\u00e7\u00f5es em cada medi\u00e7\u00e3o.'}
            </p>

            <div style={{ marginBottom: 20, maxWidth: 220 }}>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                {'Variabilidade di\u00e1ria (%)'}
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
              {'Output autom\u00e1tico \u2014 fase 3'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <ResultBox
                label={'Limita\u00e7\u00e3o ao fluxo expirat\u00f3rio (FEV1/FVC)'}
                valor={fase3.fev1Percentagem
                  ? (resultado.obstrutivo ? '\u2713 Crit\u00e9rio positivo' : '\u2717 Crit\u00e9rio negativo')
                  : 'N\u00e3o avaliado'}
                tipo={fase3.fev1Percentagem ? (resultado.obstrutivo ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label="Reversibilidade broncodilatadora"
                valor={fase3.aumentoFev1Percentagem
                  ? (resultado.reversibilidade ? '\u2713 Crit\u00e9rio positivo' : '\u2717 Crit\u00e9rio negativo')
                  : 'N\u00e3o avaliado'}
                tipo={fase3.aumentoFev1Percentagem ? (resultado.reversibilidade ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label={`Variabilidade di\u00e1ria do PEF (limiar ${fase3.pacientePediatrico ? '> 13%' : '> 10%'})`}
                valor={fase3.variabilidadePef
                  ? (resultado.pefPositivo ? '\u2713 Crit\u00e9rio positivo' : '\u2717 Crit\u00e9rio negativo')
                  : 'N\u00e3o avaliado'}
                tipo={fase3.variabilidadePef ? (resultado.pefPositivo ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label={'Total de crit\u00e9rios objetivos positivos'}
                valor={`${resultado.criteriosPositivos} de 3`}
                tipo={resultado.criteriosPositivos >= 1 ? 'ok' : 'neutro'}
              />
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 6, padding: '10px 12px', border: '1px solid #2a2a2a' }}>
              <p style={{ fontSize: 11, color: '#555', margin: 0, lineHeight: 1.6 }}>
                {'A conclus\u00e3o diagn\u00f3stica final \u00e9 da responsabilidade do m\u00e9dico. Na p\u00e1gina seguinte poder\u00e1 confirmar ou n\u00e3o o diagn\u00f3stico de asma com base em toda a informa\u00e7\u00e3o recolhida.'}
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
        labelProximo={step === steps.length - 1 ? 'Decis\u00e3o diagn\u00f3stica \u2192' : 'Pr\u00f3ximo \u2192'}
      />
    </Layout>
  )
}
