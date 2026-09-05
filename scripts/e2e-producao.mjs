// Percorre a aplicação publicada com dois casos e imprime o que cada fase
// conclui, o relatório gerado e os erros de consola. Serve para verificar a
// app em produção sem depender do ambiente local.
//
//   node scripts/e2e-producao.mjs [url]

import { chromium } from 'playwright'

const URL = process.argv[2] ?? 'https://asma-app.vercel.app/'

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: 1180, height: 900 } })
const erros = []
pagina.on('console', m => { if (m.type() === 'error') erros.push(m.text()) })
pagina.on('pageerror', e => erros.push(`pageerror: ${e.message}`))

// --- helpers -----------------------------------------------------------------
async function clicar(texto) { await pagina.locator(`text=${texto}`).first().click(); await pagina.waitForTimeout(120) }
async function botaoExato(texto) { await pagina.locator('button', { hasText: new RegExp(`^${texto}$`) }).first().click(); await pagina.waitForTimeout(120) }
async function proximo() {
  const anterior = pagina.locator('button', { hasText: 'Anterior' }).last()
  await anterior.locator('xpath=..').locator('button').last().click()
  await pagina.waitForTimeout(240)
}
async function marcar(rotulo) { await pagina.locator(`text=${rotulo}`).first().click(); await pagina.waitForTimeout(80) }
async function escrever(i, v) { await pagina.locator('input[type="number"]').nth(i).fill(String(v)); await pagina.waitForTimeout(80) }
async function texto() { return (await pagina.locator('body').innerText()).replace(/\n{2,}/g, '\n') }

/** As n linhas a seguir ao cabeçalho que contém `chave`. */
function apos(t, chave, n = 3) {
  const L = t.split('\n')
  const i = L.findIndex(l => l.includes(chave))
  return i < 0 ? `(${chave}: não encontrado)` : L.slice(i, i + 1 + n).join(' | ')
}
function avisos(t) { return t.split('\n').filter(l => /⚠/.test(l) && !/Avaliar agudização/.test(l)) }

// ============================================================ caso 1
console.log('\n########## CASO 1 — adulta 47 anos, suspeita diagnóstica ##########')
await pagina.goto(URL)
await pagina.locator('input[type="text"]').first().fill('Maria Alves Pereira')
await pagina.locator('input[type="date"]').first().fill('1979-06-14')
await pagina.locator('select').first().selectOption('feminino')
await pagina.locator('input[type="text"]').nth(1).fill('284517903')
await clicar('Suspeita diagnóstica')
await clicar('Iniciar avaliação')

for (const r of ['Sibilância (pieira)', 'Dispneia (falta de ar)']) await marcar(r)
await proximo()
for (const r of ['Normalmente ocorre mais do que um tipo de sintoma', 'Sintomas surgem de forma e intensidade variável ao longo do tempo', 'Exercício físico']) await marcar(r)
await proximo()
await marcar('História de rinite alérgica ou eczema')
await proximo()
await marcar('Sibilos na expiração (alteração mais frequente, não específica)')
await proximo()
await clicar('Selecionar todos'); await proximo()

// Fase 3: FEV1 55% (baixo), reversibilidade 22% / 480 ml (elevada), sem PEF
await proximo()
await escrever(0, 1.7); await escrever(1, 3.0); await escrever(2, 55); await escrever(3, 88)
await proximo()
await escrever(0, 22); await escrever(1, 480)
await proximo()
console.log('[Fase 3]', apos(await texto(), 'Confirmação funcional', 3))
await proximo()
await clicar('Sim — diagnóstico confirmado')

// Fase 4: um domínio + "maioria dos dias" (rótulo exato, o outro contém-no)
await marcar('Sintomas diurnos')
await botaoExato('Maioria dos dias')
let t = await texto()
console.log('[Fase 4]', apos(t, 'Nível de controlo', 1), '| avisos:', avisos(t))
await proximo()
await clicar('ACT')
const opcoes = pagina.locator('button', { hasText: /^[1-5]$/ })
for (let p = 0; p < 5; p++) { await opcoes.nth(p * 5 + 2).click(); await pagina.waitForTimeout(60) }
t = await texto()
console.log('[ACT]', t.split('\n').filter(l => /\/ ?25|ACT deu/.test(l)).slice(0, 3).join(' | '), '| avisos:', avisos(t))
await proximo()

// Fase 5: caixa do FEV1 por marcar — o valor medido (55%) deve prevalecer
t = await texto()
console.log('[Fase 5]', t.split('\n').filter(l => /FEV1/.test(l)).join(' | '))
await marcar('Má adesão à terapêutica')
await proximo(); await proximo(); await proximo()

// Fase 6
t = await texto()
console.log('[Fase 6]', apos(t, 'Degrau terapêutico sugerido', 5))
await proximo(); await proximo()

// Fase 7
t = await texto()
console.log('[Fase 7]', t.split('\n').filter(l => /degrau ≥ 3|Confirmo|Não foram|critérios presentes/i.test(l)).slice(0, 3).join(' | ') || '(sem pergunta do degrau ≥ 3)')
await proximo()

// Fase 8: grave
await clicar('Palavras isoladas')
await escrever(0, 32); await escrever(1, 124); await escrever(2, 91); await escrever(3, 45)
await proximo()
console.log('[Fase 8]', apos(await texto(), 'Gravidade da agudização', 4))
await proximo()

const rel = await pagina.locator('pre').first().innerText().catch(async () => await texto())
console.log('\n----- RELATÓRIO (caso 1), secções A e P -----')
console.log(rel.slice(rel.indexOf('A — AVALIAÇÃO'), rel.indexOf('AVALIAÇÃO DE AGUDIZAÇÃO')))

// ============================================================ caso 2
console.log('\n########## CASO 2 — criança 8 anos, diagnóstico confirmado, degrau atual 2 ##########')
await pagina.goto(URL)
await pagina.locator('input[type="text"]').first().fill('Tiago Sousa')
await pagina.locator('input[type="date"]').first().fill('2018-03-02')
await pagina.locator('select').first().selectOption('masculino')
await pagina.locator('input[type="text"]').nth(1).fill('123456789')
await clicar('Diagnóstico confirmado')
await clicar('Iniciar avaliação')
t = await texto()
console.log('[Fase 4] CARAT oferecido a 8 anos (deve ser false):', /CARAT/.test(t))
await marcar('Sintomas diurnos'); await marcar('Sintomas noturnos'); await marcar('Limitação')
console.log('[Fase 4]', apos(await texto(), 'Nível de controlo', 1))
await proximo(); await proximo()
await proximo(); await proximo(); await proximo()
await botaoExato('Degrau 2')
t = await texto()
console.log('[Fase 6]', apos(t, 'Degrau terapêutico sugerido', 5))
await proximo(); await proximo(); await proximo()
// Fase 8: FC 140 numa criança de 8 anos — limite aplicável é 120 (> 5 anos)
await clicar('Frases')
await escrever(1, 140)
await proximo()
console.log('[Fase 8]', apos(await texto(), 'Gravidade da agudização', 6))

console.log('\n----- ERROS DE CONSOLA -----'); console.log(erros.length ? erros.join('\n') : '(nenhum)')
await navegador.close()
