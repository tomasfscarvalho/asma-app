import { useState } from 'react'
import { ECRA } from '../domain/fases'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase6, obterDescricaoDegrau } from '../domain/fase6-terapeutica'
import type { ResultadoFase6 } from '../domain/types'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import ResultBox from '../components/ResultBox'
import CheckItem from '../components/CheckItem'
import { calcularIdade } from '../domain/idade'

const steps = ['Percurso e degrau', 'Detalhe do degrau']

const medidasNaoFarmacologicas = [
  'Cessação tabágica - fumadores e exposição passiva',
  'Promoção de atividade física e dieta equilibrada',
  'Evitar exposição ocupacional - questionar em asma de início na vida adulta',
  'Evitar AINE se agravamento associado - questionar sempre',
  'Prevenção do broncospasmo por exercício - aquecimento antes do treino',
]

const tabelaAdultos = {
  1: [
    { degrau: 'Degrau 1-2', preferencial: 'Dose baixa ICS-formoterol conforme necessário' },
    { degrau: 'Degrau 3', preferencial: 'Dose baixa ICS-formoterol de manutenção + alívio' },
    { degrau: 'Degrau 4', preferencial: 'Dose média ICS-formoterol de manutenção + alívio' },
    { degrau: 'Degrau 5', preferencial: 'Referenciar para avaliação fenotípica' },
  ],
  2: [
    { degrau: 'Degrau 1', preferencial: 'ICS sempre que SABA for administrado' },
    { degrau: 'Degrau 2', preferencial: 'Dose baixa ICS de manutenção' },
    { degrau: 'Degrau 3', preferencial: 'Dose baixa ICS-LABA de manutenção' },
    { degrau: 'Degrau 4', preferencial: 'Dose média/alta ICS-LABA de manutenção' },
    { degrau: 'Degrau 5', preferencial: 'Referenciar para avaliação fenotípica' },
  ],
}

// Imagem 8 do GRESP — crianças dos 6 aos 11 anos (um só percurso, SABA como alívio).
const tabelaPediatrica = [
  { degrau: 'Degrau 1', preferencial: 'ICS de dose baixa sempre que for usado SABA' },
  { degrau: 'Degrau 2', preferencial: 'ICS diário em dose baixa' },
  { degrau: 'Degrau 3', preferencial: 'ICS-LABA dose baixa, ou ICS dose média, ou MART com dose muito baixa de ICS-formoterol' },
  { degrau: 'Degrau 4', preferencial: 'ICS-LABA dose média, ou MART com dose baixa de ICS-formoterol; aconselhamento especializado' },
  { degrau: 'Degrau 5', preferencial: 'Referenciar para avaliação fenotípica' },
]

export default function Fase6Page() {
  const { fase3, fase4, fase5, fase6, setFase6, setResultadoFase6, navegarPara, tipoConsulta, paciente } = useAsmaStore()
  const [step, setStep] = useState(0)
  const idade = calcularIdade(paciente.dataNascimento)
  const resultado = calcularFase6(fase4, fase6, fase5, fase3, idade)
  const pediatrico = resultado.esquema === 'pediatrico'
  const degrauTexto = obterDescricaoDegrau(resultado)

  const ajusteTextoPorTipo: Record<NonNullable<ResultadoFase6['ajuste']>, string> = {
    subir: 'Verificar fatores modificáveis e considerar subir degrau',
    manter: 'Manter terapêutica atual',
    descer: 'Considerar descer degrau (controlo ≥ 3 meses)',
  }

  const ajusteTexto = resultado.ajuste === null
    ? (resultado.degrauInicial ? 'Iniciar no degrau proposto e reavaliar a resposta em 2 a 3 meses' : '-')
    : ajusteTextoPorTipo[resultado.ajuste]
  const ajusteResumo =
    resultado.ajuste === 'subir'
      ? 'Subir'
      : resultado.ajuste === 'descer'
        ? 'Descer'
        : resultado.ajuste === 'manter'
          ? 'Manter'
          : resultado.degrauInicial ? 'Iniciar' : '-'

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    setResultadoFase6(resultado)
    navegarPara(ECRA.FASE_7_REFERENCIACAO)
  }

  return (
    <Layout
      faseNumero={6}
      faseTitulo="Recomendação terapêutica"
      badge="Cálculo automático"
      resumo={[
        { key: 'Degrau', val: degrauTexto },
        { key: pediatrico ? 'Esquema' : 'Percurso', val: pediatrico ? '6–11 anos' : `Percurso ${resultado.percurso}` },
        { key: 'Ajuste', val: ajusteResumo },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 340 }}>
        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              {pediatrico
                ? `Criança com ${idade} anos: esquema terapêutico dos 6 aos 11 anos (GRESP 2022, Imagem 8). Há um só percurso, com SABA como alívio; o ICS-formoterol só entra em manutenção e alívio nos Degraus 3 e 4. O degrau inicial segue a GINA 2025 (Box 4-11).`
                : 'Selecione o percurso terapêutico. O Percurso 1 é o preferencial segundo a GINA/GRESP.'}
            </p>

            {tipoConsulta === 'seguimento' && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Terapêutica atual do doente
                </p>
                <p style={{ fontSize: 11, color: '#777', marginBottom: 10, lineHeight: 1.6 }}>
                  Sem o degrau atual, a ferramenta só pode propor um degrau inicial. Com ele, a recomendação passa a ser um ajuste ao que o doente já faz.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, marginBottom: 10 }}>
                  {([null, 1, 2, 3, 4, 5] as const).map(d => (
                    <button
                      key={String(d)}
                      onClick={() => setFase6(d === null ? { degrauAtual: null, percursoAtual: null } : { degrauAtual: d })}
                      style={{
                        minHeight: 40, padding: '6px 4px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                        border: fase6.degrauAtual === d ? '1px solid #5DCAA5' : '1px solid #444',
                        background: fase6.degrauAtual === d ? '#0F6E56' : '#111',
                        color: fase6.degrauAtual === d ? 'white' : '#bbb',
                      }}
                    >
                      {d === null ? 'Sem tratamento' : `Degrau ${d}`}
                    </button>
                  ))}
                </div>
                {!pediatrico && fase6.degrauAtual !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#888' }}>Percurso em que está:</span>
                    {([1, 2] as const).map(p => {
                      const ativo = fase6.percursoAtual === p
                      return (
                        <button
                          key={p}
                          // Por omissão, a proposta continua no percurso em que o doente está.
                          onClick={() => setFase6({ percursoAtual: p, percursoSelecionado: p })}
                          style={{
                            padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                            border: ativo ? '1px solid #5DCAA5' : '1px solid #444',
                            background: ativo ? '#0F6E56' : '#111',
                            color: ativo ? 'white' : '#bbb',
                            fontWeight: ativo ? 500 : 400,
                          }}
                        >
                          {`Percurso ${p}`}
                        </button>
                      )
                    })}
                  </div>
                )}
                <CheckItem
                  label="Controlo mantido nos últimos 3 meses — condição para descer degrau"
                  checked={fase6.controloMantidoTresMeses}
                  onChange={v => setFase6({ controloMantidoTresMeses: v })}
                />
              </div>
            )}

            {!pediatrico && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
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
                      ? 'ICS-formoterol como medicação de alívio em todos os degraus.'
                      : 'ICS com/sem LABA para tratamento de base, associado ou não a SABA.'}
                  </p>
                </div>
              ))}
            </div>}

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Sugestão automática
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ResultBox label="Degrau terapêutico sugerido" valor={degrauTexto} tipo="ok" />
              {resultado.avisos.map(aviso => (
                <ResultBox key={aviso} label="Atenção" valor={aviso} tipo="alerta" />
              ))}
              <ResultBox
                label="Ajuste sugerido"
                valor={ajusteTexto}
                tipo={resultado.ajuste === 'subir' ? 'alerta' : resultado.ajuste === 'descer' ? 'ok' : 'neutro'}
              />
              {resultado.referenciarEspecialidade && (
                <ResultBox
                  label="Critério de referenciação"
                  valor={pediatrico
                    ? 'Criança sem controlo com dose média de ICS (Degrau 3 ou superior): o GRESP recomenda referenciar para especialista'
                    : 'Se persistir sem controlo 3-6 meses com degrau ≥ 3, técnica correta e boa adesão, referenciar'}
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
              <ResultBox label={`${degrauTexto} - medicação preferencial`} valor={resultado.medicacaoPreferencial} tipo="ok" />
              <ResultBox label="Alternativa disponível" valor={resultado.medicacaoAlternativa} tipo="neutro" />
              <ResultBox
                label="Nota GRESP"
                valor={pediatrico
                  ? 'Em crianças dos 6 aos 11 anos, aumentar a dose baixa de ICS para média é menos eficaz do que adicionar um LABA; a teofilina não é recomendada.'
                  : 'O uso de SABA isolado em adultos e adolescentes não é recomendado por questões de segurança.'}
                tipo="alerta"
              />
            </div>

            {resultado.ajustarVerificarPrimeiro && (
              <div style={{ border: '1px solid #E24B4A', background: '#E24B4A15', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
                <p style={{ color: '#F09595', fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>
                  Antes de intensificar o tratamento, verificar:
                </p>
                {[
                  'Técnica inalatória (presente em 80% dos doentes com fraco controlo)',
                  'Adesão à terapêutica (presente em 75% dos doentes)',
                  'Presença de fatores de risco modificáveis',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 8, color: '#F7C1C1', fontSize: 12, marginTop: 4 }}>
                    <span>{'!'}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {pediatrico ? 'Esquema crianças dos 6 aos 11 anos (GRESP, Imagem 8)' : `Esquema adultos/adolescentes - Percurso ${resultado.percurso}`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 20 }}>
              {(pediatrico ? tabelaPediatrica : tabelaAdultos[resultado.percurso]).map((linha) => {
                // No Percurso 1, os Degraus 1 e 2 são uma só linha («Degrau 1-2»).
                const ativo = linha.degrau === degrauTexto
                  || (!pediatrico && resultado.percurso === 1 && resultado.degrau <= 2 && linha.degrau === 'Degrau 1-2')
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
              Medidas não farmacológicas
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
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(ECRA.FASE_5_RISCO)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Fase 7 →' : 'Próximo →'}
      />
    </Layout>
  )
}
