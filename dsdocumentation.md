# Pipeline de Design System
## Do Figma ao React — Guia Completo de Implementação

> Este documento é um guia de referência para designers e desenvolvedores que precisam implementar um sistema de tokens conectado entre Figma e código. Escrito para quem está começando do zero ou reconstruindo um sistema existente.

---

## Índice

1. [O que é um Design System e por que tokens importam](#1-o-que-é-um-design-system-e-por-que-tokens-importam)
2. [Arquitetura de Tokens — Os Três Níveis](#2-arquitetura-de-tokens--os-três-níveis)
3. [Convenção de Nomes](#3-convenção-de-nomes)
4. [Configuração do Figma](#4-configuração-do-figma)
5. [Configuração do Repositório GitHub](#5-configuração-do-repositório-github)
6. [O Arquivo tokens.json](#6-o-arquivo-tokensjson)
7. [Style Dictionary v5](#7-style-dictionary-v5)
8. [Componente Button em React](#8-componente-button-em-react)
9. [Conexão Tokens Studio com GitHub](#9-conexão-tokens-studio-com-github)
10. [O Pipeline Completo em Funcionamento](#10-o-pipeline-completo-em-funcionamento)
11. [Erros Comuns e Como Resolver](#11-erros-comuns-e-como-resolver)
12. [Fluxo de Trabalho do Dia a Dia](#12-fluxo-de-trabalho-do-dia-a-dia)
13. [Referência Rápida](#13-referência-rápida)

---

## 1. O que é um Design System e por que tokens importam

### O problema que estamos resolvendo

Imagine que o botão primário do seu produto usa a cor `#2563EB`. Essa cor aparece em 47 arquivos diferentes no código e em 200 componentes no Figma. Um dia, o time de branding decide mudar o azul para um roxo. Sem um sistema de tokens, esse trabalho leva dias e inevitavelmente vai ter inconsistências — alguns lugares vão continuar azuis.

**Com tokens, esse trabalho leva 4 minutos.**

### O que é um token de design

Um token não é apenas uma variável com um nome bonito. É uma **decisão de design com contrato**.

```
#2563EB                          → isso é uma cor
color/action/primary = #2563EB   → isso é uma decisão
```

O nome é a parte importante. Ele diz o que a cor *significa* e *onde ela pertence*, não apenas como ela se parece. Se o valor mudar de azul para roxo, o nome `color/action/primary` ainda faz sentido.

### A promessa do pipeline

Quando tudo está configurado corretamente, o fluxo fica assim:

```
Designer muda um token no Figma
        ↓
Tokens Studio envia para o GitHub
        ↓
Style Dictionary transforma em CSS
        ↓
Todo componente React atualiza automaticamente
        ↓
Zero inconsistências. Zero trabalho manual.
```

---

## 2. Arquitetura de Tokens — Os Três Níveis

Este é o conceito mais importante do guia. Toda a estabilidade do sistema depende de respeitar esses três níveis.

### A regra fundamental

> Valores sempre fluem de cima para baixo. Nunca pule um nível. Nunca use valores brutos nos níveis 2 e 3.

```
NÍVEL 1: PRIMITIVOS
"O que existe — valores brutos sem opinião de uso"
        ↓
NÍVEL 2: SEMÂNTICO
"O que significa — dá contexto aos primitivos"
        ↓
NÍVEL 3: COMPONENTE
"Onde é usado — tokens com escopo de um componente específico"
```

### Nível 1 — Primitivos

São os valores brutos do sistema. Eles descrevem **o que é**, nunca **onde usar**.

```
color/blue/200    = #BFDBFE
color/blue/500    = #2563EB   ← valor base da escala
color/blue/600    = #1D4ED8
color/neutral/0   = #FFFFFF
color/neutral/300 = #D1D5DB
space/12          = 12px
space/16          = 16px
radius/8          = 8px
```

**Regra:** Um primitivo nunca referencia outro token. Só contém valores reais.

### Nível 2 — Semântico

Dão **significado** aos primitivos. Um token semântico responde à pergunta "para que serve isso?".

```
color/action/primary           → color/blue/500
color/action/primary/hover     → color/blue/600
color/action/primary/disabled  → color/blue/200
color/text/inverse             → color/neutral/0
color/text/disabled            → color/neutral/300
space/component/padding-v      → space/12
space/component/padding-h      → space/16
radius/md                      → radius/8
```

**Regra:** Tokens semânticos só referenciam primitivos. Nunca valores brutos (`#2563EB` ❌).

### Nível 3 — Componente

São específicos para um único componente. Referenciam tokens semânticos.

```
button/background/default      → color/action/primary
button/background/hover        → color/action/primary/hover
button/background/disabled     → color/action/primary/disabled
button/label/color             → color/text/inverse
button/label/color-disabled    → color/text/disabled
button/padding/vertical        → space/component/padding-v
button/padding/horizontal      → space/component/padding-h
button/radius                  → radius/md
```

**Regra:** Tokens de componente só referenciam tokens semânticos. Nunca primitivos diretamente.

### Por que três níveis e não um?

O exemplo do rebranding deixa isso claro:

**Cenário:** A cor primária muda de azul `#2563EB` para roxo `#7C3AED`.

```
SEM A ARQUITETURA DE TRÊS NÍVEIS:
  Engenheiro procura #2563EB no codebase
  Encontra 340 instâncias em 47 arquivos
  Troca algumas, esquece outras
  QA encontra 23 lugares ainda azuis
  3 dias de trabalho, bugs em produção

COM A ARQUITETURA DE TRÊS NÍVEIS:
  Muda color/blue/500 = #7C3AED em um lugar
  Todos os tokens semânticos que referenciam atualizam
  Todos os tokens de componente que referenciam atualizam
  Todos os componentes no Figma e no código atualizam
  4 minutos. Zero bugs.
```

---

## 3. Convenção de Nomes

### A fórmula

```
[categoria] / [conceito] / [variante] / [estado]
```

Cada segmento responde uma pergunta diferente:

| Segmento | Pergunta |
|---|---|
| categoria | Que tipo de valor é esse? |
| conceito | Para que serve? |
| variante | Qual versão? |
| estado | Em qual estado de interação? |

### Regras que nunca quebram

```
✅ Tudo em minúsculas
✅ Barras como separadores
✅ Estado sempre é o último segmento
✅ Nunca nomeie pelo valor ("blue-button" ❌, "action-primary" ✅)
✅ Primitivos: nomeados pelo valor (color/blue/500)
✅ Semântico: nomeados pelo significado (color/action/primary)
✅ Componente: sempre começa com o nome do componente (button/background/default)
```

### Exemplos de nomes corretos vs incorretos

```
❌ ERRADO                      ✅ CORRETO
───────────────────────────────────────────────────
color/primary-blue             color/action/primary
color/button-background        button/background/default
hover/color/action             color/action/primary/hover
space/16px-padding             space/component/padding-h
color/blue-button-disabled     button/background/disabled
```

### Como o estado funciona na hierarquia

O estado é sempre o último segmento. Isso agrupa todos os estados do mesmo token:

```
color/action/primary            ← estado padrão (sem sufixo)
color/action/primary/hover      ← hover
color/action/primary/pressed    ← pressionado
color/action/primary/disabled   ← desabilitado
color/action/primary/focus      ← foco
```

No painel do Figma isso cria uma hierarquia visual limpa onde todos os estados ficam agrupados.

---

## 4. Configuração do Figma

### Instalação do Tokens Studio

O Tokens Studio é o plugin que conecta suas variáveis do Figma ao código.

```
1. Abra o Figma
2. Menu principal → Plugins → Browse plugins
3. Busque "Tokens Studio for Figma"
4. Clique em Install
```

> **Nota:** A versão gratuita suporta apenas um arquivo JSON único. A versão Pro suporta múltiplos arquivos. Este guia usa a versão gratuita.

### Criando as coleções de variáveis

No Figma, abra o painel de variáveis (atalho: sem atalho padrão, acesse pelo menu direito ou pelo painel de design). Crie três coleções nesta ordem exata:

```
1. Primitives   ← fundação, valores brutos
2. Semantic     ← camada de significado
3. Components   ← escopo de componentes
```

A ordem importa porque cada coleção vai referenciar a anterior.

### Coleção 1 — Primitives

Crie os seguintes grupos e variáveis. Atenção ao tipo de variável:

**Tipo Color:**
```
color/blue/200    = #BFDBFE
color/blue/500    = #2563EB
color/blue/600    = #1D4ED8
color/neutral/0   = #FFFFFF
color/neutral/300 = #D1D5DB
```

**Tipo Number:**
```
space/12          = 12
space/16          = 16
radius/8          = 8
typography/font-size/14    = 14
typography/font-weight/600 = 600
```

> **Atenção:** Variáveis de espaçamento e radius ficam como Number no Figma — sem unidade. O `px` é adicionado pelo Style Dictionary durante a transformação. Se você colocar `12px` no Figma, vai quebrar a sincronização.

> **Como criar com o caminho correto:** Sempre digite o caminho completo no campo de nome da variável. Exemplo: `color/blue/500`. Se você criar dentro de um grupo já selecionado, o Figma pode duplicar o prefixo e criar caminhos errados como `color/blue/color/blue/500`.

### Coleção 2 — Semantic

Toda variável semântica deve referenciar um primitivo. Nunca um valor bruto.

**Tipo Color:**
```
action/primary           → Primitives/color/blue/500
action/primary/hover     → Primitives/color/blue/600
action/primary/disabled  → Primitives/color/blue/200
text/inverse             → Primitives/color/neutral/0
text/disabled            → Primitives/color/neutral/300
```

**Tipo Number:**
```
space/component/padding-v  → Primitives/space/12
space/component/padding-h  → Primitives/space/16
radius/md                  → Primitives/radius/8
typography/label/size      → Primitives/typography/font-size/14
typography/label/weight    → Primitives/typography/font-weight/600
```

### Coleção 3 — Components

Toda variável de componente deve referenciar um token semântico.

**Tipo Color:**
```
button/background/default  → Semantic/action/primary
button/background/hover    → Semantic/action/primary/hover
button/background/disabled → Semantic/action/primary/disabled
button/label/color         → Semantic/text/inverse
button/label/color-disabled → Semantic/text/disabled
```

**Tipo Number:**
```
button/label/size          → Semantic/typography/label/size
button/label/weight        → Semantic/typography/label/weight
button/padding/vertical    → Semantic/space/component/padding-v
button/padding/horizontal  → Semantic/space/component/padding-h
button/radius              → Semantic/radius/md
```

### Criando o componente Button

**Passo 1 — Crie três frames separados**

Crie um frame para cada estado. Aplique tokens de componente em cada propriedade:

```
Frame "Default":
  Fill              → button/background/default
  Cor do texto      → button/label/color
  Padding vertical  → button/padding/vertical
  Padding horizontal → button/padding/horizontal
  Corner radius     → button/radius

Frame "Hover":
  Fill              → button/background/hover
  (resto igual ao Default)

Frame "Disabled":
  Fill              → button/background/disabled
  Cor do texto      → button/label/color-disabled
  (resto igual ao Default)
```

**Passo 2 — Combine como Variants**

```
Selecione os três frames
→ Clique com botão direito
→ "Combine as Variants"
```

**Passo 3 — Configure as propriedades**

```
Renomeie "Property 1" → "State"
Renomeie os valores:
  Frame 1 → Default
  Frame 2 → Hover
  Frame 3 → Disabled
```

**Passo 4 — Adicione propriedade de texto**

```
Selecione o component set
→ No painel direito, clique "+" ao lado de Properties
→ Escolha "Text"
→ Nome: Label
→ Vincule à camada de texto dentro do botão
```

**Regras para componentes limpos:**
```
✅ Auto Layout em todos os componentes — nunca largura fixa
✅ Nomeie todas as camadas semanticamente (Label, Container, Icon)
✅ Use apenas tokens de Componente — nunca Primitivos ou valores diretos
✅ Vincule propriedades de texto para que o conteúdo seja editável de fora
❌ Nunca nomeie camadas como "Rectangle 1" ou "Frame 23"
❌ Nunca aplique cores direto do color picker
```

---

## 5. Configuração do Repositório GitHub

### Criando o repositório

```
1. Acesse github.com
2. Clique em "New repository"
3. Nome: ds-study (ou o nome do seu projeto)
4. Visibilidade: Public ou Private
5. Marque "Add README"
6. Clique "Create repository"
```

### Clonando e inicializando o projeto

```bash
# Clone na sua máquina
cd ~/Desktop
git clone https://github.com/SEU-USUARIO/ds-study.git
cd ds-study

# Inicialize o npm
npm init -y

# Instale as dependências
npm install style-dictionary
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react

# Crie a estrutura de pastas
mkdir -p tokens dist src/components/Button
```

### Estrutura final do projeto

```
ds-study/
├── tokens/
│   └── tokens.json          ← fonte da verdade, edite aqui
├── dist/
│   └── tokens.css           ← gerado automaticamente, nunca edite
├── src/
│   └── components/
│       └── Button/
│           ├── Button.jsx
│           └── Button.css
├── index.html
├── sd.config.js             ← configuração do Style Dictionary
├── package.json
└── .gitignore
```

### .gitignore

Crie o arquivo `.gitignore` na raiz:

```
node_modules/
```

> **Atenção:** Diferente de projetos comuns, **não** coloque `dist/` no gitignore. Em um design system, o `dist/` precisa ser commitado para que outros projetos possam importar os tokens gerados.

### package.json

Este é o arquivo de configuração mais crítico. Dois erros comuns:

1. Esquecer `"type": "module"` — necessário para usar sintaxe `import/export` no Node
2. O script `build:tokens` usar o CLI do Style Dictionary em vez de `node` diretamente

```json
{
  "name": "ds-study",
  "version": "1.0.0",
  "description": "Design system study — token pipeline from Figma to React",
  "type": "module",
  "scripts": {
    "build:tokens": "node sd.config.js",
    "dev": "vite"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "style-dictionary": "^5.3.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.0",
    "vite": "^8.0.0"
  }
}
```

---

## 6. O Arquivo tokens.json

Este é o coração do sistema. É o único arquivo que tanto o Tokens Studio quanto o Style Dictionary leem.

### Por que um único arquivo?

O Tokens Studio na versão gratuita só suporta um arquivo JSON. Para contornar isso sem quebrar a arquitetura de três níveis, usamos os nomes das coleções como chaves de agrupamento no JSON:

```json
{
  "Primitives": { ... },
  "Semantic":   { ... },
  "Components": { ... }
}
```

O Style Dictionary recebe essas chaves via um **preprocessador** que as remove antes de processar — você vai ver isso na próxima seção.

### O arquivo completo

Crie `tokens/tokens.json`:

```json
{
  "Primitives": {
    "color": {
      "blue": {
        "200": { "value": "#BFDBFE", "type": "color" },
        "500": { "value": "#2563EB", "type": "color" },
        "600": { "value": "#1D4ED8", "type": "color" }
      },
      "neutral": {
        "0":   { "value": "#FFFFFF", "type": "color" },
        "300": { "value": "#D1D5DB", "type": "color" }
      }
    },
    "space": {
      "12": { "value": "12", "type": "spacing" },
      "16": { "value": "16", "type": "spacing" }
    },
    "radius": {
      "8": { "value": "8", "type": "borderRadius" }
    },
    "typography": {
      "font-size": {
        "14": { "value": "14", "type": "fontSizes" }
      },
      "font-weight": {
        "600": { "value": "600", "type": "fontWeights" }
      }
    }
  },
  "Semantic": {
    "action": {
      "primary":          { "value": "{color.blue.500}",   "type": "color" },
      "primary-hover":    { "value": "{color.blue.600}",   "type": "color" },
      "primary-disabled": { "value": "{color.blue.200}",   "type": "color" }
    },
    "text": {
      "inverse":  { "value": "{color.neutral.0}",   "type": "color" },
      "disabled": { "value": "{color.neutral.300}", "type": "color" }
    },
    "space": {
      "component": {
        "padding-v": { "value": "{space.12}", "type": "spacing" },
        "padding-h": { "value": "{space.16}", "type": "spacing" }
      }
    },
    "radius": {
      "md": { "value": "{radius.8}", "type": "borderRadius" }
    },
    "typography": {
      "label": {
        "size":   { "value": "{typography.font-size.14}",    "type": "fontSizes" },
        "weight": { "value": "{typography.font-weight.600}", "type": "fontWeights" }
      }
    }
  },
  "Components": {
    "button": {
      "background": {
        "default":  { "value": "{action.primary}",          "type": "color" },
        "hover":    { "value": "{action.primary-hover}",    "type": "color" },
        "disabled": { "value": "{action.primary-disabled}", "type": "color" }
      },
      "label": {
        "color":          { "value": "{text.inverse}",                    "type": "color" },
        "color-disabled": { "value": "{text.disabled}",                   "type": "color" },
        "size":           { "value": "{typography.label.size}",           "type": "fontSizes" },
        "weight":         { "value": "{typography.label.weight}",         "type": "fontWeights" }
      },
      "padding": {
        "vertical":   { "value": "{space.component.padding-v}", "type": "spacing" },
        "horizontal": { "value": "{space.component.padding-h}", "type": "spacing" }
      },
      "radius": { "value": "{radius.md}", "type": "borderRadius" }
    }
  }
}
```

### Lendo a sintaxe de referência

As chaves com `{...}` são aliases — referências a outros tokens:

```json
"primary": { "value": "{color.blue.500}", "type": "color" }
```

Isso significa: "o valor de `action/primary` é o mesmo que o valor de `color/blue/500`". Quando `color/blue/500` mudar, `action/primary` muda automaticamente em cascata.

> **Nota importante:** O Tokens Studio usa notação de **ponto** `{color.blue.500}` nos aliases, enquanto os nomes das chaves no JSON usam barras `color/blue/500`. Isso é esperado e correto.

---

## 7. Style Dictionary v5

O Style Dictionary é uma biblioteca open source da Amazon que transforma seu `tokens.json` em qualquer formato que o código precisa — CSS, JavaScript, Swift, Android XML, etc.

### Por que precisamos dele?

O `tokens.json` é agnóstico de plataforma. O CSS precisa de variáveis `--ds-button-radius: 8px`. O React precisa de `import { buttonRadius } from './tokens'`. O Style Dictionary faz essa transformação automaticamente.

### O arquivo de configuração completo

Crie `sd.config.js` na raiz do projeto:

```javascript
import StyleDictionary from 'style-dictionary'

// ─────────────────────────────────────────────────────────────────
// DEEP MERGE HELPER
//
// Por que precisamos disso?
// Quando o preprocessador remove os wrappers (Primitives, Semantic,
// Components) e faz merge no nível raiz, as chaves "space", "radius"
// e "typography" existem tanto em Primitives quanto em Semantic.
//
// Object.assign() simplesmente sobrescreve — Semantic.space apaga
// Primitives.space e as referências {space.12} quebram.
//
// deepMerge() combina as chaves em vez de sobrescrever, preservando
// todos os tokens de ambas as coleções.
// ─────────────────────────────────────────────────────────────────
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !source[key].value        // não é um token folha
    ) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// ─────────────────────────────────────────────────────────────────
// PREPROCESSADOR — Remove os wrappers de coleção
//
// O Tokens Studio Free exige que o JSON tenha os wrappers:
//   { "Primitives": {...}, "Semantic": {...}, "Components": {...} }
//
// O Style Dictionary precisa que os tokens estejam na raiz:
//   { "color": {...}, "space": {...}, "button": {...} }
//
// Este preprocessador faz essa conversão automaticamente antes
// que o Style Dictionary resolva qualquer referência.
// ─────────────────────────────────────────────────────────────────
StyleDictionary.registerPreprocessor({
  name: 'strip-collection-wrappers',
  preprocessor: (dictionary) => {
    const collectionKeys = ['Primitives', 'Semantic', 'Components']
    const result = {}

    for (const [key, value] of Object.entries(dictionary)) {
      if (collectionKeys.includes(key)) {
        deepMerge(result, value)    // merge sem sobrescrever
      } else {
        result[key] = value
      }
    }

    return result
  }
})

// ─────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO PRINCIPAL
// ─────────────────────────────────────────────────────────────────
const sd = new StyleDictionary({
  log: { verbosity: 'verbose' },    // mostra detalhes de erros
  source: ['tokens/tokens.json'],
  preprocessors: ['strip-collection-wrappers'],

  hooks: {
    transforms: {
      // ─────────────────────────────────────────────────────────
      // TRANSFORM: dimension/px
      //
      // Por que precisamos disso?
      // O Figma armazena valores de dimensão como números puros (12, 16)
      // sem unidade. Se colocarmos "12px" no JSON, quebra o Figma.
      // Então guardamos o número puro e adicionamos "px" aqui,
      // apenas no momento da transformação para CSS.
      //
      // O filtro inclui os tipos do Tokens Studio (spacing,
      // borderRadius, fontSizes) além do tipo padrão do
      // Style Dictionary (dimension).
      // ─────────────────────────────────────────────────────────
      'dimension/px': {
        type: 'value',
        filter: (token) => [
          'dimension',
          'spacing',
          'borderRadius',
          'fontSizes',
        ].includes(token.type),
        transform: (token) => {
          const val = parseFloat(token.value)
          return isNaN(val) ? token.value : `${val}px`
        }
      }
    },

    transformGroups: {
      // Grupo customizado que inclui nosso transform de px
      'css/custom': [
        'name/kebab',       // converte nomes para kebab-case
        'color/css',        // formata cores para CSS válido
        'dimension/px',     // adiciona px nos valores de dimensão
      ]
    }
  },

  platforms: {
    css: {
      transformGroup: 'css/custom',
      prefix: 'ds',            // prefixo das variáveis CSS: --ds-button-radius
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables'
        }
      ]
    }
  }
})

await sd.buildAllPlatforms()
```

### Rodando o build

```bash
npm run build:tokens
```

Se tudo estiver correto, você verá `dist/tokens.css` gerado com conteúdo assim:

```css
/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --ds-color-blue-200: #bfdbfe;
  --ds-color-blue-500: #2563eb;
  --ds-color-blue-600: #1d4ed8;
  --ds-color-neutral-0: #ffffff;
  --ds-color-neutral-300: #d1d5db;
  --ds-space-12: 12px;
  --ds-space-16: 16px;
  --ds-radius-8: 8px;
  --ds-action-primary: #2563eb;
  --ds-action-primary-hover: #1d4ed8;
  --ds-action-primary-disabled: #bfdbfe;
  --ds-text-inverse: #ffffff;
  --ds-text-disabled: #d1d5db;
  --ds-button-background-default: #2563eb;
  --ds-button-background-hover: #1d4ed8;
  --ds-button-background-disabled: #bfdbfe;
  --ds-button-label-color: #ffffff;
  --ds-button-label-color-disabled: #d1d5db;
  --ds-button-label-size: 14px;
  --ds-button-label-weight: 600;
  --ds-button-padding-vertical: 12px;
  --ds-button-padding-horizontal: 16px;
  --ds-button-radius: 8px;
}
```

> **Observação:** No CSS final, os aliases são resolvidos para seus valores reais. `--ds-button-background-default` mostra `#2563eb` diretamente, não `var(--ds-action-primary)`. Isso é comportamento normal do Style Dictionary — a cadeia de referências existe no JSON, não no CSS.

---

## 8. Componente Button em React

### Estrutura de arquivos

```
src/
└── components/
    └── Button/
        ├── Button.jsx    ← lógica e estrutura
        └── Button.css    ← estilos usando variáveis CSS
```

### index.html

Crie na raiz do projeto:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Design System Study</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### src/main.jsx

Ponto de entrada da aplicação. Importa o CSS de tokens gerado:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '../dist/tokens.css'       // ← tokens gerados pelo Style Dictionary
import { Button } from './components/Button/Button'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: '40px', display: 'flex', gap: '16px' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  </React.StrictMode>
)
```

### Button.jsx

```jsx
import './Button.css'

export function Button({
  variant  = 'primary',   // variante visual do botão
  disabled = false,       // estado desabilitado
  onClick,                // handler de clique
  children,               // conteúdo do botão (label)
}) {
  return (
    <button
      className={[
        'ds-button',
        `ds-button--${variant}`,
        disabled ? 'ds-button--disabled' : '',
      ].join(' ')}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}  // bloqueia clique quando desabilitado
    >
      <span className="ds-button__label">{children}</span>
    </button>
  )
}
```

### Button.css

Cada propriedade usa uma variável CSS gerada pelos tokens. Nenhum valor está hardcoded:

```css
/* ─── Estrutura base ─────────────────────────────── */
.ds-button {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  border:          none;
  cursor:          pointer;

  /* tokens de componente */
  border-radius:   var(--ds-button-radius);
  padding:         var(--ds-button-padding-vertical)
                   var(--ds-button-padding-horizontal);
  font-size:       var(--ds-button-label-size);
  font-weight:     var(--ds-button-label-weight);
  transition:      background 150ms ease;
}

/* ─── Variante Primary ───────────────────────────── */
.ds-button--primary {
  background: var(--ds-button-background-default);
  color:      var(--ds-button-label-color);
}

.ds-button--primary:hover:not(:disabled) {
  background: var(--ds-button-background-hover);
}

/* ─── Estado Disabled ────────────────────────────── */
.ds-button--disabled,
.ds-button:disabled {
  background: var(--ds-button-background-disabled);
  color:      var(--ds-button-label-color-disabled);
  cursor:     not-allowed;
}
```

### Rodando a aplicação

```bash
npm run dev
```

Acesse `http://localhost:5173`. Você deve ver os botões renderizados com os valores dos seus tokens.

---

## 9. Conexão Tokens Studio com GitHub

### Por que conectar ao GitHub?

Sem essa conexão, o `tokens.json` existe apenas no Figma. Com ela, qualquer mudança de token feita no Figma cria um commit real no repositório — rastreável, revisável e auditável como qualquer mudança de código.

### Passo 1 — Gere um Personal Access Token no GitHub

```
1. github.com → clique na sua foto → Settings
2. Role para baixo → Developer settings
3. Personal access tokens → Tokens (classic)
4. Generate new token (classic)
5. Note: tokens-studio
6. Expiration: 90 days
7. Scopes: marque "repo" (controle total de repositórios)
8. Clique Generate token
9. COPIE AGORA — você só vê uma vez
```

### Passo 2 — Configure o sync no Tokens Studio

```
Figma → Tokens Studio plugin → aba Settings
→ Sync providers → Add new → GitHub

Name:        ds-study
Repository:  SEU-USUARIO/ds-study
Branch:      main
File path:   tokens/tokens.json
Token:       cole o personal access token
```

### Passo 3 — Ative os token sets

No painel principal do Tokens Studio, todos os sets precisam estar marcados:

```
✅ Primitives
✅ Semantic
✅ Components
```

Se os sets não estiverem marcados, o botão de push fica desabilitado.

### Passo 4 — Faça Pull antes do Push

Na primeira conexão, sempre faça Pull primeiro para sincronizar o que já existe no repositório com o plugin:

```
Tokens Studio → ícone de download (↓) → Pull
```

### Passo 5 — Push para o GitHub

```
Tokens Studio → ícone de upload (↑)
Commit message: chore: sync tokens from Figma
Branch: main
→ Push
```

Verifique no GitHub se um novo commit apareceu em `tokens/tokens.json`.

### Fluxo correto de edição

```
✅ CORRETO
Edite tokens no Tokens Studio
→ Push para GitHub
→ npm run build:tokens
→ Componentes React atualizam

❌ ERRADO
Edite variáveis no painel de Variables do Figma
→ Tokens Studio não detecta a mudança
→ Push não funciona
```

O Tokens Studio é a **fonte da verdade para edição**. O painel de Variables do Figma é o **output** — ele é atualizado pelo Tokens Studio, não o contrário.

---

## 10. O Pipeline Completo em Funcionamento

### O teste que prova que tudo funciona

Faça esta mudança em `tokens/tokens.json`:

```json
"500": { "value": "#7C3AED", "type": "color" }
```

Execute:

```bash
npm run build:tokens
```

Atualize o browser. O botão ficou roxo. Você mudou um valor em um lugar e tudo propagou automaticamente pela cadeia inteira.

Reverta quando terminar:

```json
"500": { "value": "#2563EB", "type": "color" }
```

### Visualizando a cadeia completa

```
tokens/tokens.json
  "Primitives"
    color/blue/500 = #2563EB
            │
            │ referenciado por
            ▼
  "Semantic"
    action/primary = {color.blue.500}
            │
            │ referenciado por
            ▼
  "Components"
    button/background/default = {action.primary}
            │
            │ transformado pelo Style Dictionary
            ▼
dist/tokens.css
  --ds-button-background-default: #2563eb;
            │
            │ importado pelo React
            ▼
Button.css
  background: var(--ds-button-background-default);
            │
            │ renderizado no browser
            ▼
Botão azul na tela
```

---

## 11. Erros Comuns e Como Resolver

### Erro: Reference Errors — tokens não encontrados

```
Error: Some token references (20) could not be found.
```

**Causa:** Os wrappers de coleção (`Primitives`, `Semantic`, `Components`) não estão sendo removidos antes da resolução de referências.

**Solução:** Confirme que o preprocessador `strip-collection-wrappers` está registrado e listado em `preprocessors` na config.

---

### Erro: Reference Errors — apenas alguns tokens não encontrados

```
Error: Some token references (10) could not be found.
```

**Causa:** O preprocessador está usando `Object.assign` em vez de `deepMerge`. Chaves compartilhadas entre `Primitives` e `Semantic` (como `space`, `radius`, `typography`) estão sendo sobrescritas.

**Solução:** Use a função `deepMerge` conforme o exemplo no `sd.config.js` acima.

---

### Erro: Valores saindo como `rem` em vez de `px`

```css
--ds-space-12: 12rem;   /* errado */
--ds-space-12: 12px;    /* correto */
```

**Causa:** O filtro do transform `dimension/px` não está incluindo os tipos do Tokens Studio.

**Solução:** Expanda o filtro:

```javascript
filter: (token) => [
  'dimension',
  'spacing',       // ← tipo do Tokens Studio
  'borderRadius',  // ← tipo do Tokens Studio
  'fontSizes',     // ← tipo do Tokens Studio
].includes(token.type),
```

---

### Erro: `registerTransform is not a function`

**Causa:** Usando sintaxe da API v4 do Style Dictionary com a v5 instalada.

**Solução:** Use `hooks.transforms` em vez de `StyleDictionary.registerTransform()`.

---

### Erro: `name/cti/kebab not found`

**Causa:** Nome de transform mudou na v5.

**Solução:** Use `name/kebab` em vez de `name/cti/kebab`.

---

### Erro: `Cannot use import statement outside a module`

**Causa:** `"type": "module"` não está no `package.json`.

**Solução:** Adicione `"type": "module"` ao `package.json`.

---

### Erro: Script `build:tokens` ainda usa o CLI

```
style-dictionary build --config sd.config.js
```

**Causa:** Script não foi atualizado no `package.json`.

**Solução:** Mude para `"build:tokens": "node sd.config.js"`.

---

### Erro: JSON inválido no package.json

```
npm error JSON.parse Invalid package.json
```

**Causa:** Chave duplicada ou vírgula faltando no JSON.

**Solução:** Verifique o arquivo com cuidado. JSON não aceita chaves duplicadas nem vírgula após o último item de um objeto ou array.

---

### Push do Tokens Studio desabilitado

**Causa 1:** Nenhum sync provider configurado.
**Solução:** Configure o GitHub sync nas Settings do Tokens Studio.

**Causa 2:** Token sets não estão ativos.
**Solução:** Marque os checkboxes de Primitives, Semantic e Components no painel principal.

**Causa 3:** Tokens Studio não detecta mudanças.
**Solução:** Edite e salve qualquer token para marcar o set como modificado.

---

### Variáveis duplicadas no painel do Figma

```
action/primary/primary   ← errado (duplicado)
action/primary           ← correto
```

**Causa:** Variável criada dentro de um grupo já selecionado, fazendo o Figma duplicar o prefixo.

**Solução:** Sempre clique fora de qualquer grupo antes de criar uma variável. Digite o caminho completo: `action/primary`.

---

## 12. Fluxo de Trabalho do Dia a Dia

### Adicionando um novo token

```
1. Abra tokens/tokens.json no VS Code
2. Adicione o token no nível correto (Primitives, Semantic ou Components)
3. Execute: npm run build:tokens
4. Verifique o dist/tokens.css gerado
5. Adicione a variável correspondente no Figma via Tokens Studio
6. Commite a mudança
```

### Editando um token existente via Figma

```
1. Abra o Tokens Studio no Figma
2. Encontre o token e edite o valor
3. Clique no ícone de upload (↑)
4. Escreva uma mensagem de commit descritiva
5. Clique Push
6. No terminal: npm run build:tokens
7. Verifique o componente no browser
```

### Convenção de commits

Siga o padrão Conventional Commits para manter o histórico legível:

```
tipo(escopo): descrição curta

Tipos:
  feat     → nova funcionalidade
  fix      → correção de bug
  chore    → configuração e manutenção
  docs     → apenas documentação
  refactor → refatoração sem nova funcionalidade

Exemplos:
  feat(tokens): adiciona tokens de feedback (error, success, warning)
  fix(tokens): corrige referência quebrada no token button/radius
  chore(tokens): sincroniza primitivos do Figma
  feat(button): adiciona variante secondary
  docs: atualiza guia de pipeline
```

### Comandos do dia a dia

```bash
# Transformar tokens em CSS
npm run build:tokens

# Rodar a aplicação localmente
npm run dev

# Commitar e enviar ao GitHub
git add .
git commit -m "feat(tokens): adiciona escala de cor neutral completa"
git push origin main
```

---

## 13. Referência Rápida

### Tipos de variáveis por coleção

| Coleção | Contém | Referencia |
|---|---|---|
| Primitives | Valores brutos | Nada — apenas valores reais |
| Semantic | Significado | Apenas Primitives |
| Components | Escopo de componente | Apenas Semantic |

### Tipos de variáveis no Figma vs tokens.json

| Figma | tokens.json |
|---|---|
| Color | `"type": "color"` |
| Number (espaçamento) | `"type": "spacing"` |
| Number (radius) | `"type": "borderRadius"` |
| Number (fonte tamanho) | `"type": "fontSizes"` |
| Number (peso) | `"type": "fontWeights"` |

### Nomes de transforms — Style Dictionary v4 vs v5

| v4 (antigo) | v5 (correto) |
|---|---|
| `attribute/cti` | não necessário |
| `name/cti/kebab` | `name/kebab` |
| `StyleDictionary.registerTransform()` | `hooks.transforms` |
| `StyleDictionary.registerTransformGroup()` | `hooks.transformGroups` |

### Comandos úteis

```bash
# Ver versão instalada do Style Dictionary
npm list style-dictionary

# Ver o que está no package.json atual
cat package.json

# Ver tokens gerados
cat dist/tokens.css

# Ver tokens fonte
cat tokens/tokens.json

# Rodar com log verbose para debug
# (adicione log: { verbosity: 'verbose' } no sd.config.js)
npm run build:tokens
```

---

*Documento gerado a partir do processo real de implementação. Atualizado sempre que o pipeline evolui.*