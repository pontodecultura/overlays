# Gerador de Declaração de Atividades Profissionais

Aplicação local feita em HTML5, CSS3 e JavaScript puro. Não requer instalação, servidor, conta ou conexão com a internet.

## Como usar

1. Extraia a pasta `gerador_declaracao`.
2. Abra `index.html` em um navegador moderno (Chrome, Edge ou Firefox).
3. Preencha os dados da instituição, do(a) profissional, das atividades e da assinatura.
4. Opcionalmente, carregue o logotipo da instituição.
5. Revise a pré-visualização A4.
6. Clique em **Gerar PDF / Imprimir**. Na janela de impressão, selecione **Salvar como PDF** como destino e confirme o formato A4, retrato e margens em zero ou padrão sem cabeçalhos/rodapés do navegador.

O botão usa o mecanismo de impressão do navegador para gerar um PDF com texto vetorial, sem dependências externas. O nome sugerido para o arquivo é `Declaracao_Atividades_Nome_Do_Profissional.pdf`.

## Marcadores do texto

O texto da declaração é editável. Os marcadores entre `<` e `>` são substituídos pelos valores correspondentes:

| Marcador | Valor utilizado |
|---|---|
| `<NOME_COMPLETO>` | Nome do(a) profissional |
| `<CPF>` | CPF |
| `<FUNCAO>` ou `<CARGO>` | Função/cargo exercido |
| `<DATA_INICIO>` | Início do período, no formato DD/MM/AAAA |
| `<DATA_FIM>` | Fim do período, no formato DD/MM/AAAA |
| `<AREA>` | Área de atuação |
| `<ATIVIDADES>` | Lista de atividades cadastradas |
| `<NOME_INSTITUICAO>` ou `<INSTITUICAO>` | Nome da instituição |
| `<ORGAO>` | Órgão/secretaria |
| `<CNPJ>` ou `<CNPJ_INSTITUICAO>` | CNPJ da instituição |
| `<ENDERECO>` ou `<ENDERECO_INSTITUICAO>` | Endereço da instituição |
| `<MUNICIPIO>` e `<UF>` | Local da emissão |
| `<DATA_EMISSAO>` | Data da emissão |
| `<DIA_EMISSAO>`, `<MES_EMISSAO>`, `<ANO_EMISSAO>` | Partes da data de emissão |
| `<RESPONSAVEL>` ou `<NOME_RESPONSAVEL>` | Nome do responsável pela assinatura |
| `<CARGO_RESPONSAVEL>` ou `<FUNCAO_RESPONSAVEL>` | Cargo do responsável pela assinatura |

Marcadores novos são detectados no modelo. Clique em **Atualizar campos do modelo** e preencha os campos personalizados apresentados.

## Flexões entre parênteses

O seletor de gênero controla expressões como `inscrito(a)`, `o(a)` e `interessado(a)`. A opção inclusiva mantém as formas entre parênteses; as opções masculino e feminino ajustam as formas reconhecidas.

## Privacidade

O código não envia os dados para servidores nem grava os dados preenchidos em armazenamento persistente. As imagens de logotipo são lidas localmente no navegador.
