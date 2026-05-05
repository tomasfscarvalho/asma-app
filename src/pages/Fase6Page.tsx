import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase6, obterDescricaoDegrau } from '../domain/fase6-terapeutica'
import type { ResultadoFase6 } from '../domain/types'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import ResultBox from '../components/ResultBox'

const steps = ['Percurso e degrau', 'Detalhe do degrau']

const medidasNaoFarmacologicas = [
  'Cessacao tabagica - fumadores e exposicao passiva',
  'Promocao de atividade fisica e dieta equilibrada',
  'Evitar exposicao ocupacional - questionar em asma de inicio na vida adulta',
  'Evitar AINE se agravamento associado - questionar sempre',
  'Prevencao do broncospasmo por exercicio - aquecimento antes do treino',
]

const tabelaAdultos = {
  1: [
    { degrau: 'Degrau 1-2', preferencial: 'Dose baixa ICS-formoterol conforme necessario' },
    { degrau: 'Degrau 3', preferencial: 'Dose baixa ICS-formoterol de manutencao + alivio' },
    { degrau: 'Degrau 4', preferencial: 'Dose media ICS-formoterol de manutencao + alivio. Adicionar LAMA se insuficiente' },
    { degrau: 'Degrau 5', preferencial: 'Referenciar para avaliacao fenotipica' },
  ],
  2: [
    { degrau: 'Degrau 1', preferencial: 'ICS sempre que SABA for administrado' },
    { degrau: 'Degrau 2', preferencial: 'Dose baixa ICS de manutencao' },
    { degrau: 'Degrau 3', preferencial: 'Dose baixa ICS-LABA de manutencao' },
    { degrau: 'Degrau 4', preferencial: 'Dose media/alta ICS-LABA de manutencao' },
    { degrau: 'Degrau 5', preferencial: 'Referenciar para avaliacao fenotipica' },
  ],
}

export default function Fase6Page() {
  const { fase4, fase5, fase6, setFase6, setResultadoFase6, navegarPara } = useAsmaStore()
  const [step, setStep] = useState(0)
  const resultado = calcularFase6(fase4, fase6, fase5.fev1Baixo)
  const degrauTexto = obterDescricaoDegrau(resultado)

  const ajusteTextoPorTipo: Record<NonNullable<ResultadoFase6['ajuste']>, string> = {
    subir: 'Subir degrau terapeutico',
    manter: 'Manter terapeutica atual',
    descer: 'Considerar descer degrau (controlo >= 3 meses)',
  }

  const ajusteTexto = resultado.ajuste === null ? '-' : ajusteTextoPorTipo[resultado.ajuste]
  const ajusteResumo =
    resultado.ajuste === 'subir'
      ? 'Subir'
      : resultado.ajuste === 'descer'
        ? 'Descer'
        : resultado.ajuste === 'manter'
          ? 'Manter'
          : '-'

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    setResultadoFase6(resultado)
    navegarPara(6)
  }

  return (
    <Layout
      faseNumero={6}
      faseTitulo="Recomendacao terapeutica"
      badge="Decisao automatica"
      resumo={[
        { key: 'Degrau', val: degrauTexto },
        { key: 'Percurso', val: `Percurso ${resultado.percurso}` },
        { key: 'Ajuste', val: ajusteResumo },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 340 }}>
        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              Seleciona o percurso terapeutico. O Percurso 1 e o preferencial segundo a GINA/GRESP.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[1, 2].map((percurso) => (
                <div
                  key={percurso}
                  onClick={() => setFase6({ percursoSelecionado: percurso as 1 | 2 })}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: fase6.percursoSelecionado === percurso ? '1px solid #5DCAA5' : '1px solid #333',
                    background: fase6.percursoSelecionado === percurso ? '#0F6E5620' : '#111',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: fase6.percursoSelecionado === percurso ? '#5DCAA5' : '#ccc' }}>
                      Percurso {percurso}
                    </span>
                    {percurso === 1 && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#0F6E5630', color: '#5DCAA5' }}>
                        Preferencial
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
                    {percurso === 1
                      ? 'ICS-formoterol como medicacao de alivio em todos os degraus'
                      : 'ICS com/sem LABA para base, associado ou nao a SABA'}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Recomendacao automatica
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ResultBox label="Degrau terapeutico sugerido" valor={degrauTexto} tipo="ok" />
              <ResultBox
                label="Ajuste sugerido"
                valor={ajusteTexto}
                tipo={resultado.ajuste === 'subir' ? 'alerta' : resultado.ajuste === 'descer' ? 'ok' : 'neutro'}
              />
              {resultado.referenciarEspecialidade && (
                <ResultBox
                  label="Criterio de referenciacao"
                  valor="Sem controlo com degrau >= 3; considerar referenciacao"
                  tipo="alerta"
                />
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Detalhe do degrau selecionado
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <ResultBox label={`${degrauTexto} - medicacao preferencial`} valor={resultado.medicacaoPreferencial} tipo="ok" />
              <ResultBox label="Alternativa disponivel" valor={resultado.medicacaoAlternativa} tipo="neutro" />
              <ResultBox
                label="Nota GRESP"
                valor="O uso de SABA isolado em adultos e adolescentes nao e recomendado por questoes de seguranca."
                tipo="alerta"
              />
            </div>

            {resultado.ajustarVerificarPrimeiro && (
              <div style={{ border: '1px solid #E24B4A', background: '#E24B4A15', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
                <p style={{ color: '#F09595', fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>
                  Antes de subir degrau, verificar:
                </p>
                {[
                  'Tecnica inalatoria (presente em 80% dos doentes com fraco controlo)',
                  'Adesao a terapeutica (presente em 75% dos doentes)',
                  'Presenca de fatores de risco modificaveis',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 8, color: '#F7C1C1', fontSize: 12, marginTop: 4 }}>
                    <span>{'!'}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Esquema adultos/adolescentes - Percurso {resultado.percurso}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 20 }}>
              {tabelaAdultos[resultado.percurso].map((linha) => {
                const ativo = linha.degrau === degrauTexto
                return (
                  <div
                    key={linha.degrau}
                    style={{
                      border: ativo ? '1px solid #5DCAA5' : '1px solid #333',
                      background: ativo ? '#0F6E5620' : '#111',
                      borderRadius: 6,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ color: ativo ? '#5DCAA5' : '#aaa', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{linha.degrau}</div>
                    <div style={{ color: '#ccc', fontSize: 12, lineHeight: 1.4 }}>{linha.preferencial}</div>
                  </div>
                )
              })}
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Medidas nao farmacologicas
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {medidasNaoFarmacologicas.map((medida) => (
                <div key={medida} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#888' }}>
                  <span style={{ color: '#1D9E75' }}>-</span>
                  <span>{medida}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(4)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Fase 7 ->' : 'Proximo ->'}
      />
    </Layout>
  )
}
