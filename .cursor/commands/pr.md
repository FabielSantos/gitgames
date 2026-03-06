---
name: pr
description: Gera mensagens de commit e descrições de pull request a partir das mudanças atuais no repositório git. Use quando o usuário pedir ajuda para montar commit/PR ou chamar /pr.
---

# Skill de Commit + PR

## Objetivo

Quando este skill for chamado:

1. Analisar o estado atual do repositório git (arquivos staged e não staged), adicionar os arquivos ao stage e fazer o commit.
2. Gerar:
   - Uma sugestão de mensagem de commit no estilo Conventional Commits (`feat:`, `fix:`, etc.) ou no estilo que o usuário pedir.
   - Um título curto de PR.
   - Um corpo de PR com seções de resumo, detalhes e testes.

## Como agir

1. Ver o que mudou usando o histórico e o diff do git do projeto atual (por exemplo, usando git status, git diff e git diff --cached).
2. Agrupar as mudanças por área funcional (por exemplo: "ui", "backend", "infra", "build") e por tipo de alteração (feature nova, bugfix, refactor, etc.).
3. Propor uma mensagem de commit no formato:

   ```
   <tipo>(<escopo opcional>): <resumo curto>

   - <ponto principal 1>
   - <ponto principal 2>
   ```

   Onde `<tipo>` normalmente é um de: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, etc.

4. Propor também um título e corpo de PR, por exemplo:

   ```markdown
   ## Resumo
   - Descrever em 1–3 bullets o que mudou.

   ## Detalhes
   - Explicar decisões importantes ou partes mais sensíveis do código.

   ## Testes
   - [ ] Descrever testes manuais realizados
   - [ ] Descrever testes automatizados (se houver)
   ```

5. Sempre:
   - Explicar rapidamente como chegou àquele resumo (quais partes do diff influenciaram o commit/PR).
   - Oferecer pelo menos **duas variações** de título de commit e de PR para o usuário escolher.
   - Perguntar ao usuário se ele segue algum padrão específico de mensagem de commit/PR; se sim, adaptar o formato àquele padrão.
   - Pedir confirmação explícita do usuário antes de sugerir qualquer comando de git a ser rodado no terminal (por exemplo, `git add`, `git commit`, `gh pr create`).

## Estilo e linguagem

- Escrever mensagens em português por padrão, a menos que o usuário peça inglês.
- Manter os títulos curtos e diretos (idealmente até ~72 caracteres).
- No corpo do PR, priorizar clareza sobre verbosidade.

