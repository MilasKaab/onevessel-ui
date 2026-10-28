// Leitor de regras de CSS, sem dependências. Usado por scripts/conferir.mjs
// e por test/css.test.mjs.

export const semComentario = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

// Regras de um CSS: { seletores, corpo, media }, entrando em @media e afins.
// `media` é a cabeça do @media (ou @container) em volta ('' fora de um).
export function regras(css) {
  const texto = semComentario(css)
  const saida = []
  let i = 0
  const percorrer = (fim, media) => {
    while (i < fim) {
      const abre = texto.indexOf('{', i)
      const fecha = texto.indexOf('}', i)
      if (abre === -1 || (fecha !== -1 && fecha < abre)) { i = fecha === -1 ? fim : fecha + 1; return }
      const cabeca = texto.slice(i, abre).replace(/^[\s\S]*;/, '').trim()
      i = abre + 1
      if (cabeca.startsWith('@media') || cabeca.startsWith('@supports') || cabeca.startsWith('@container')) {
        percorrer(fim, cabeca)
      } else if (cabeca.startsWith('@')) {
        // @keyframes, @page: pula o bloco inteiro.
        let nivel = 1
        while (nivel && i < fim) { if (texto[i] === '{') nivel++; else if (texto[i] === '}') nivel--; i++ }
        saida.push({ seletores: [cabeca], corpo: '', media })
      } else {
        const f = texto.indexOf('}', i)
        saida.push({ seletores: separar(cabeca), corpo: texto.slice(i, f), media })
        i = f + 1
      }
    }
  }
  percorrer(texto.length, '')
  return saida
}

// Divide "a, b:is(c, d)" por vírgulas fora de parênteses.
export function separar(lista) {
  const partes = []
  let nivel = 0, atual = ''
  for (const c of lista) {
    if (c === '(') nivel++
    if (c === ')') nivel--
    if (c === ',' && nivel === 0) { partes.push(atual); atual = '' } else atual += c
  }
  partes.push(atual)
  return partes.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

// Todos os seletores de um CSS (com os @keyframes), sem repetição.
export const seletores = (css) => new Set(regras(css).flatMap((r) => r.seletores))

// O que um CSS importável sozinho (casca.css, janelas.css, telas.css) não
// pode ter: regra de html, body, :root, do seletor universal * solto (.x > *
// é da classe), de a ou button soltos (sem classe), fonte fora de classe, @media print ou @page.
// Devolve a lista de problemas.
export function problemasDeBase(nome, css) {
  const texto = semComentario(css)
  const problemas = []
  if (/@media\s+print/.test(texto)) problemas.push(`${nome} tem @media print`)
  if (/@page/.test(texto)) problemas.push(`${nome} tem @page`)
  for (const { seletores, corpo } of regras(texto)) {
    for (const s of seletores) {
      if (s.startsWith('@')) continue
      if (/(^|[\s>+~(,])(html|body)\b/.test(s) || /^:root\b/.test(s)) {
        problemas.push(`${nome} tem regra de base: ${s}`)
      }
      if (/^\*/.test(s)) problemas.push(`${nome} tem regra universal: ${s}`)
      if (!/[.[]/.test(s) && /(^|[\s>+~])(a|button)(?![\w-])/.test(s)) {
        problemas.push(`${nome} tem regra de elemento solto: ${s}`)
      }
      if (/(^|;|\s)font(-size)?\s*:/.test(corpo) && !s.includes('.')) {
        problemas.push(`${nome} define fonte fora de classe: ${s}`)
      }
    }
  }
  return problemas
}
