// Percorre o fluxo clínico da aplicação e captura as dez figuras do capítulo 3.
//
//   node scripts/capturar-figuras.mjs [destino]
//
// Requer o servidor de desenvolvimento em http://localhost:5173.

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DESTINO = process.argv[2] ?? 'figuras'
const URL = 'http://localhost:5173/'
const LARGURA = 1180

mkdirSync(DESTINO, { recursive: true })

const navegador = await chromium.launch()
const pagina = await navegador.newPage({
  viewport: { width: LARGURA, height: 900 },
  deviceScaleFactor: 2,          // dobro da densidade: legível em papel
})

let capturas = 0
async function capturar(nome, legenda) {
  await pagina.waitForTimeout(250)
  const caminho = join(DESTINO, `${nome}.png`)
  await pagina.screenshot({ path: caminho, fullPage: true })
  capturas += 1
  console.log(`  ${nome}.png  —  ${legenda}`)
}

// --- helpers de interação ---------------------------------------------------
const porTexto = (t) => pagina.locator(`text=${t}`).first()
async function clicar(texto) {
  await porTexto(texto).click()
  await pagina.waitForTimeout(120)
}
async function proximo() {
  // O rótulo do botão muda em cada fase ("Próximo", "Fase 3", "Ver relatório"),
  // e desde a correção de acessibilidade os indicadores da barra de progresso
  // também são <button>. O critério estável é o rodapé: o contentor que tem o
  // botão "Anterior". O botão de avanço é o último desse contentor.
  const anterior = pagina.locator('button', { hasText: 'Anterior' }).last()
  const rodape = anterior.locator('xpath=..')
  await rodape.locator('button').last().click()
  await pagina.waitForTimeout(240)
}

async function marcar(rotulo) {
  await pagina.locator(`text=${rotulo}`).first().click()
  await pagina.waitForTimeout(80)
}
async function escrever(indice, valor) {
  await pagina.locator('input[type="number"]').nth(indice).fill(String(valor))
  await pagina.waitForTimeout(80)
}

await pagina.goto(URL)

// ============================================================ 3.1 ecrã inicial
await pagina.locator('input[type="text"]').first().fill('Maria Alves Pereira')
await pagina.locator('input[type="date"]').first().fill('1979-06-14')
await pagina.locator('select').first().selectOption('feminino')
await pagina.locator('input[type="text"]').nth(1).fill('284517903')
await pagina.locator('input[type="tel"]').first().fill('912345678')
await clicar('Suspeita diagnóstica')
await capturar('figura-3-1', 'Ecrã inicial: seleção do tipo de consulta')

await clicar('Iniciar avaliação')

// ============================================================ Fase 1
for (const s of ['Sibilância (pieira)', 'Dispneia (falta de ar)', 'Tosse']) await marcar(s)
await proximo()
for (const s of ['Mais do que 1 tipo de sintoma', 'Sintomas variáveis', 'Agravam com exercício']) {
  await marcar(s).catch(() => {})
}
await proximo()
for (const s of ['Início dos sintomas na infância', 'Rinite alérgica ou eczema']) {
  await marcar(s).catch(() => {})
}
await proximo()
await marcar('Sibilos na expiração').catch(() => {})
await capturar('figura-3-3', 'Fase 1: perfil de probabilidade gerado')
await proximo()

// ============================================================ Fase 2
await clicar('Selecionar todos')
await proximo()

// ============================================================ Fase 3
await proximo()                                   // contexto -> espirometria
await escrever(0, 2.10)                           // FEV1 (L)
await escrever(1, 3.00)                           // FVC (L)
await escrever(2, 68)                             // FEV1 %
await escrever(3, 88)                             // FVC %
await proximo()                                   // -> reversibilidade
await escrever(0, 15)
await escrever(1, 320)
await proximo()                                   // -> PEF + output
await escrever(0, 14)
await capturar('figura-3-5', 'Fase 3: resultados espirométricos calculados')
await proximo()

// ============================================================ decisão
await capturar('figura-3-2', 'Decisão diagnóstica')
await clicar('Sim — diagnóstico confirmado')

// ============================================================ Fase 4
for (const s of ['Sintomas diurnos', 'Sintomas noturnos', 'Necessidade de medicação de alívio']) {
  await marcar(s).catch(() => {})
}
await marcar('Maioria dos dias').catch(() => {})
await capturar('figura-3-6', 'Fase 4: classificação automática do controlo')
await proximo()
await clicar('ACT')
const opcoes = pagina.locator('button', { hasText: /^[1-5]$/ })
for (let p = 0; p < 5; p++) {
  await opcoes.nth(p * 5 + 2).click().catch(() => {})
  await pagina.waitForTimeout(60)
}
await capturar('figura-3-7', 'Fase 4: score ACT calculado')
await proximo()

// ============================================================ Fase 5
for (const s of ['Abuso de SABA', 'Má adesão à terapêutica']) await marcar(s).catch(() => {})
await marcar('Intubação ou internamento prévio em UCI por asma').catch(() => {})
await marcar('≥ 1 agudização grave nos últimos 12 meses').catch(() => {})
await capturar('figura-3-8', 'Fase 5: sinalização de fatores major')
await proximo(); await proximo(); await proximo()

// ============================================================ Fase 6
await capturar('figura-3-9', 'Fase 6: recomendação terapêutica')
await proximo(); await proximo()

// ============================================================ Fase 7
await marcar('Suspeita de asma ocupacional').catch(() => {})
await proximo()

// ============================================================ Fase 8
await clicar('Não — palavras isoladas').catch(() => {})
await escrever(0, 32).catch(() => {})
await escrever(1, 124).catch(() => {})
await escrever(2, 91).catch(() => {})
await escrever(3, 45).catch(() => {})
await proximo()
await capturar('figura-3-4', 'Fase 8: avaliação de agudização')
await proximo()

// ============================================================ 3.10 relatório
await capturar('figura-3-10', 'Relatório SOAP gerado automaticamente')

await navegador.close()
console.log(`\n${capturas} figuras em ${DESTINO}/`)
