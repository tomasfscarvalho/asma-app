import { useState } from 'react'
import { ECRA } from '../domain/fases'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase8 } from '../domain/fase8-agudizacao'
import { calcularIdade, dentroDoAmbitoCronico } from '../domain/idade'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'
import ResultBox from '../components/ResultBox'
import CampoNumero from '../components/CampoNumero'
import { anos } from '../domain/formato'

const steps = ['Parâmetros', 'Gravidade']

export default function Fase8Page() {
  const { fase8, setFase8, setResultadoFase8, navegarPara, paciente, faseOrigemAgudizacao } = useAsmaStore()
  const [step, setStep] = useState(0)

  const idade = calcularIdade(paciente.dataNascimento)
  const resultado = calcularFase8(fase8, idade)
  // Limiares de gravidade próprios (Tabela 7) e sem PEF: crianças até aos 5 anos.
  const preEscolar = idade !== null ? idade < 6 : fase8.idadeMenorCinco

  // "Anterior" volta ao ecrã de onde se abriu a agudização pelo atalho; no
  // percurso normal, à Fase 7. Abaixo dos 6 anos, ao ecrã inicial.
  const ecraAnterior = idade !== null && !dentroDoAmbitoCronico(idade)
    ? ECRA.DADOS_DOENTE
    : faseOrigemAgudizacao ?? ECRA.FASE_7_REFERENCIACAO

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setResultadoFase8(resultado)
      navegarPara(ECRA.RELATORIO)
    }
  }

  // A Tabela 7 do GRESP junta a ligeira e a moderada numa só classe.
  const gravidadeTexto = {
    'ligeira-moderada': 'Ligeira ou moderada',
    'grave': 'Grave',
    'critica': 'Crítica',
  }[resultado.gravidade]

  const gravidadeTipo = {
    'ligeira-moderada': 'ok',
    'grave': 'alerta',
    'critica': 'alerta',
  }[resultado.gravidade] as 'ok' | 'alerta' | 'neutro'

  return (
    <Layout
      faseNumero={8}
      faseTitulo="Avaliação de agudização"
      badge="Cálculo automático"
      resumo={[
        { key: 'Gravidade', val: gravidadeTexto },
        { key: 'UCI', val: resultado.transferirUci ? '⚠ Sim' : 'Não' },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 280 }}>

        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              Se existirem parâmetros compatíveis com agudização, preencha os valores abaixo.
            </p>

            <div style={{ marginBottom: 16 }}>
              {idade === null ? (
                <CheckItem
                  label="Doente pediátrico (≤ 5 anos)"
                  checked={fase8.idadeMenorCinco}
                  onChange={v => setFase8({ idadeMenorCinco: v, pacientePediatrico: v })}
                />
              ) : (
                <p style={{ fontSize: 12, color: '#9FE1CB', margin: '0 0 10px' }}>
                  {idade <= 5
                    ? `Doente com ${anos(idade)}: limiares de gravidade e tratamento pediátricos (≤ 5 anos).`
                    : idade <= 11
                      ? `Doente com ${anos(idade)}: limiares de gravidade do adulto e tratamento pediátrico (6–11 anos).`
                      : `Doente com ${anos(idade)}: limiares e tratamento do adulto.`}
                </p>
              )}
              <CheckItem
                label="Sonolência, confusão mental ou tórax silencioso"
                checked={fase8.sonolenciaConfusaoToraxSilencioso}
                onChange={v => setFase8({ sonolenciaConfusaoToraxSilencioso: v })}
                alerta
              />
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Avaliação clínica
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8 }}>O doente exprime-se por:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Frases', val: true },
                  { label: 'Palavras isoladas', val: false },
                ].map(op => (
                  <button
                    key={op.label}
                    onClick={() => setFase8({ exprimePorFrases: op.val })}
                    style={{
                      padding: '7px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                      border: fase8.exprimePorFrases === op.val ? '1px solid #5DCAA5' : '1px solid #444',
                      background: fase8.exprimePorFrases === op.val ? '#0F6E56' : '#111',
                      color: fase8.exprimePorFrases === op.val ? 'white' : '#888',
                    }}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {/* Os textos de ajuda dão o limiar de gravidade da Tabela 7, e não um valor normal. */}
              <CampoNumero
                label="Freq. respiratória (/min)"
                valor={fase8.freqRespiratoria}
                onChange={v => setFase8({ freqRespiratoria: v })}
                min={5} max={120} unidade="/min"
                placeholder={preEscolar ? 'Grave > 40' : 'Grave > 30'}
              />
              <CampoNumero
                label="Freq. cardíaca (bpm)"
                valor={fase8.freqCardiaca}
                onChange={v => setFase8({ freqCardiaca: v })}
                min={30} max={250} unidade="bpm"
                placeholder={idade === null ? (fase8.idadeMenorCinco ? 'Grave > 150' : 'Grave > 120') : idade <= 3 ? 'Grave > 180' : idade <= 5 ? 'Grave > 150' : 'Grave > 120'}
              />
              <CampoNumero
                label="SpO₂ (%)"
                valor={fase8.spo2}
                onChange={v => setFase8({ spo2: v })}
                min={40} max={100} unidade="%"
                placeholder={preEscolar ? 'Grave < 92' : 'Grave < 90'}
              />
              {!preEscolar && (
                <CampoNumero
                  label="PEF (% do previsto ou do melhor valor anterior)"
                  valor={fase8.pefPercentagem}
                  onChange={v => setFase8({ pefPercentagem: v })}
                  min={5} max={150} unidade="%"
                  placeholder="Grave ≤ 50"
                />
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Restantes critérios de gravidade
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              <CheckItem label="Utilização de músculos acessórios (tiragem supraesternal, supraclavicular ou intercostal)" checked={fase8.musculosAcessorios} onChange={v => setFase8({ musculosAcessorios: v })} alerta />
              <CheckItem label="Debruçado para a frente" checked={fase8.posicaoDebrucada} onChange={v => setFase8({ posicaoDebrucada: v })} alerta />
              <CheckItem label="Agitação" checked={fase8.agitacao} onChange={v => setFase8({ agitacao: v })} alerta />
              <CheckItem label="Cianose" checked={fase8.cianose} onChange={v => setFase8({ cianose: v })} alerta />
              <CheckItem label="Sem boa resposta ao tratamento inicial, avaliada ao fim de 1 hora" checked={fase8.respostaIncompletaAoAlivio} onChange={v => setFase8({ respostaIncompletaAoAlivio: v })} />
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Classificação automática de gravidade
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              <ResultBox
                label="Gravidade da agudização"
                valor={gravidadeTexto}
                tipo={gravidadeTipo}
              />
              <ResultBox
                label="Nível de cuidados"
                valor={resultado.nivelCuidados}
                tipo={resultado.gravidade === 'ligeira-moderada' && !resultado.reavaliar && resultado.fatoresMauPrognostico.length === 0 ? 'ok' : 'alerta'}
              />
              {resultado.transferirUci && (
                <ResultBox
                  label="UCI"
                  valor="⚠ Transferir para UCI imediatamente"
                  tipo="alerta"
                />
              )}
            </div>

            {resultado.criteriosPresentes.length > 0 && (
              <div style={{ marginBottom: 16, background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#F09595', fontSize: 12, fontWeight: 500, margin: '0 0 6px' }}>Critérios de gravidade presentes</p>
                {resultado.criteriosPresentes.map(c => (
                  <p key={c} style={{ color: '#F09595', fontSize: 11, margin: '2px 0' }}>• {c}</p>
                ))}
              </div>
            )}

            {resultado.avaliacaoIncompleta && (
              <div style={{ marginBottom: 16, background: '#FAEEDA20', border: '1px solid #FAC77550', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#FAC775', fontSize: 12, fontWeight: 500, margin: '0 0 6px' }}>
                  ⚠ Avaliação incompleta — {resultado.criteriosPorAvaliar.length} {resultado.criteriosPorAvaliar.length === 1 ? 'critério' : 'critérios'} por medir
                </p>
                <p style={{ color: '#FAC775', fontSize: 11, margin: '0 0 6px' }}>
                  {resultado.criteriosPorAvaliar.join('; ')}.
                </p>
                <p style={{ color: '#BA7517', fontSize: 11, margin: 0 }}>
                  Um parâmetro não medido não é um parâmetro normal. A classificação acima só cobre o que foi avaliado.
                </p>
              </div>
            )}

            {resultado.fatoresMauPrognostico.length > 0 && (
              <div style={{ marginBottom: 16, background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#F09595', fontSize: 12, fontWeight: 500, margin: '0 0 6px' }}>
                  ⚠ {resultado.fatoresMauPrognostico.length === 1 ? '1 fator de mau prognóstico' : `${resultado.fatoresMauPrognostico.length} fatores de mau prognóstico`}
                </p>
                {resultado.fatoresMauPrognostico.map(f => (
                  <p key={f} style={{ color: '#F09595', fontSize: 11, margin: '2px 0' }}>• {f}</p>
                ))}
                <p style={{ color: '#BA7517', fontSize: 11, margin: '6px 0 0' }}>
                  Não alteram a classificação de gravidade, que assenta nos sinais vitais, mas pesam na decisão de hospitalização.
                </p>
              </div>
            )}

            <div style={{ marginBottom: 24, background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 6, padding: '10px 12px' }}>
              <p style={{ color: '#9FE1CB', fontSize: 12, fontWeight: 500, margin: '0 0 6px' }}>Tratamento recomendado</p>
              {resultado.tratamento.map(t => (
                <p key={t} style={{ color: '#9FE1CB', fontSize: 11, margin: '2px 0' }}>• {t}</p>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Fatores de mau prognóstico
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckItem label="Episódios prévios de ventilação mecânica" checked={fase8.ventilacaoMecanicaPrevia} onChange={v => setFase8({ ventilacaoMecanicaPrevia: v })} alerta />
              <CheckItem label="≥ 2 urgências ou hospitalizações no último ano" checked={fase8.duasOuMaisUrgencias} onChange={v => setFase8({ duasOuMaisUrgencias: v })} alerta />
              <CheckItem label="Corticosteroides sistémicos recentes" checked={fase8.corticosteroidesRecentes} onChange={v => setFase8({ corticosteroidesRecentes: v })} />
              <CheckItem label="Utilização excessiva e prolongada de SABA" checked={fase8.abusoDeSabaProlong} onChange={v => setFase8({ abusoDeSabaProlong: v })} />
              <CheckItem label="Comorbilidades graves descompensadas" checked={fase8.comorbilidadesGraves} onChange={v => setFase8({ comorbilidadesGraves: v })} alerta />
              <CheckItem label="Não adesão ao tratamento" checked={fase8.naoAdesaoTratamento} onChange={v => setFase8({ naoAdesaoTratamento: v })} />
              <CheckItem label="Presença de alergia alimentar" checked={fase8.alergiaAlimentar} onChange={v => setFase8({ alergiaAlimentar: v })} alerta />
            </div>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(ecraAnterior)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Ver relatório →' : 'Próximo →'}
      />
    </Layout>
  )
}
