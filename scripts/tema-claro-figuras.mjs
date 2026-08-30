// Converte a interface para fundo claro, apenas no momento de capturar as
// figuras da tese. A aplicação continua escura — nada aqui toca no código da app.
//
// Uma folha de estilo com seletores de atributo não serve: a app define as
// cores em estilos inline e o browser serializa-as como rgb(...), pelo que
// [style*="#1a1a1a"] nunca casa. Esta função percorre o DOM e decide cada cor
// pela sua luminância, o que também resolve o caso difícil — texto branco sobre
// a barra verde, que tem de continuar branco.

export const TRANSFORMAR_PARA_CLARO = () => {
  const ler = (v) => {
    const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(v || '')
    if (!m) return null
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] }
  }
  const lum = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  const rgb = ({ r, g, b }) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`

  // Mistura a cor com branco (t=1 dá branco puro).
  const clarear = (c, t) => ({
    r: c.r + (255 - c.r) * t, g: c.g + (255 - c.g) * t, b: c.b + (255 - c.b) * t,
  })
  // Mistura a cor com preto.
  const escurecer = (c, t) => ({ r: c.r * (1 - t), g: c.g * (1 - t), b: c.b * (1 - t) })

  const cinzento = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 14

  const elementos = [document.documentElement, document.body, ...document.querySelectorAll('*')]

  // ---- 1. fundos ----
  for (const el of elementos) {
    const st = getComputedStyle(el)
    const c = ler(st.backgroundColor)
    if (!c || c.a === 0) continue

    if (c.a < 0.6) {
      // Tinta translúcida (avisos, realces): mesma matiz, muito mais clara.
      el.style.setProperty('background-color', rgb(clarear(c, 0.88)), 'important')
      continue
    }
    if (cinzento(c) && lum(c) < 0.5) {
      // Superfícies escuras neutras: página a branco, cartões a cinza muito claro.
      const claro = lum(c) < 0.09 ? 255 : 246
      el.style.setProperty('background-color', `rgb(${claro}, ${claro + 1}, ${claro})`, 'important')
      continue
    }
    // Cores saturadas opacas (verde da barra, botões primários) mantêm-se: já
    // funcionam sobre branco e são a assinatura visual da aplicação.
  }

  // ---- 2. texto, decidido pelo fundo efetivo ----
  const fundoEfetivo = (el) => {
    for (let n = el; n && n !== document.documentElement.parentNode; n = n.parentElement) {
      const c = ler(getComputedStyle(n).backgroundColor)
      if (c && c.a > 0.6) return c
    }
    return { r: 255, g: 255, b: 255, a: 1 }
  }

  for (const el of elementos) {
    const c = ler(getComputedStyle(el).color)
    if (!c) continue
    const fundoClaro = lum(fundoEfetivo(el)) > 0.55
    if (!fundoClaro) continue          // texto claro sobre a barra verde: manter

    if (lum(c) > 0.45) {
      // Texto claro que passaria a ilegível sobre branco.
      el.style.setProperty(
        'color',
        rgb(cinzento(c) ? { r: 40, g: 48, b: 44 } : escurecer(c, 0.55)),
        'important',
      )
    }
  }

  // ---- 3. contornos ----
  for (const el of elementos) {
    const st = getComputedStyle(el)
    for (const lado of ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor']) {
      const c = ler(st[lado])
      if (!c || c.a === 0) continue
      const prop = lado.replace(/([A-Z])/g, '-$1').toLowerCase()
      if (cinzento(c) && lum(c) < 0.5) {
        el.style.setProperty(prop, 'rgb(211, 220, 215)', 'important')
      } else if (!cinzento(c) && lum(c) > 0.5) {
        el.style.setProperty(prop, rgb(escurecer(c, 0.28)), 'important')
      }
    }
  }

  // ---- 4. campos de formulário ----
  for (const el of document.querySelectorAll('input, select, textarea')) {
    el.style.setProperty('background-color', '#ffffff', 'important')
    el.style.setProperty('color', 'rgb(18, 32, 27)', 'important')
    el.style.setProperty('border-color', 'rgb(200, 211, 205)', 'important')
  }
}
