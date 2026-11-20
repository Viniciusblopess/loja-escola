# FormiFofo — pequenos passos, grande conforto

A FormiFofo é uma loja fictícia de pantufas para formigas. O projeto simula a jornada da vitrine até a confirmação do pedido e foi feito com HTML, CSS, Bootstrap 5.3 e JavaScript, sem build ou dependências adicionais.

## Como abrir

Sirva esta pasta por um servidor local para que a navegação entre páginas, o armazenamento da sessão e a busca de CEP funcionem no mesmo endereço. No PowerShell, dentro da pasta web, execute:

    py -m http.server 8000

Depois, acesse http://localhost:8000. A consulta de CEP precisa de conexão com a internet; se ela falhar, o endereço pode ser preenchido manualmente. O checkout é educativo: não recebe dados de cartão nem faz cobranças.

## Melhorias realizadas

### Loja e produtos

A proposta mantém o mundo divertido de FormiFofo e distribui as regras criativas entre diferentes produtos. Cada ilustração foi criada em SVG para o próprio projeto.

| Produto | Regra atendida |
| --- | --- |
| Pantufa Pétala de Orvalho | Serve em uma formiga |
| Pantufa Nuvem de Bolso | Cabe em um bolso |
| Pantufas Jardim de Colônia | Não cabe em um avião |
| Zumbilume | Começa com a letra Z |
| Pantufa Orbital de Pólen | É usada no espaço sideral |
| Pantufa Brilho de Baobá | É de uso único |

### HTML e CSS

- As quatro páginas têm idioma, título e descrição próprios, metadados Open Graph, favicon, navegação semântica, um título principal e link para pular ao conteúdo.
- Rótulos estão associados aos campos; mensagens de estado e erro usam regiões anunciadas por leitores de tela.
- Bootstrap organiza grade, espaçamentos, formulário e navegação responsiva. O CSS próprio define a paleta, os cartões, os estados de foco, os avisos e os pontos de quebra para telas pequenas.
- As imagens são ilustrações SVG locais com texto alternativo e dimensões declaradas; as imagens da vitrine carregam sob demanda.
- A identidade usa verde-folha, marrom-terra e bege-areia, com contraste reforçado nos botões e foco visível.

### JavaScript e jornada de compra

- O catálogo fica em um único array de objetos em js/store.js e alimenta a vitrine, os detalhes, o carrinho e o pedido confirmado.
- A vitrine permite busca, filtro por categoria e regra do desafio, ordenação por nome e preço e estado vazio quando não há resultados.
- produto.html lê o parâmetro id da URL e apresenta uma mensagem amigável quando ele não existe.
- O carrinho aceita vários produtos, mantém apenas IDs e quantidades em sessionStorage, permite remover itens e recalcula subtotal, entrega e total.
- O checkout valida os campos perto de cada problema, formata telefone e CEP e permite preencher o endereço manualmente.
- O botão de CEP consulta a API pública ViaCEP, valida oito dígitos e apresenta estados de carregamento, sucesso, CEP inexistente, resposta inválida, demora e falha de rede.
- A confirmação só é aberta depois que um pedido é salvo na sessão; ela mostra número, produtos, quantidades e totais.

### API utilizada

- **ViaCEP:** consulta de endereço pelo CEP em https://viacep.com.br/ws/CEP/json/. Nenhuma chave é necessária. Se o serviço não responder, os campos continuam editáveis.

### Testes realizados

- **22 de 22 cenários passaram** no Chrome headless: navegação por teclado com foco no conteúdo principal, celular/tablet/desktop, filtros com e sem resultados, ordenação, dois produtos válidos, id inexistente, carrinho com vários produtos, alteração de quantidades, frete e totais.
- Formulário vazio e e-mail inválido exibiram mensagens específicas; o checkout e a confirmação mantiveram os dados após recarga.
- A ViaCEP preencheu o endereço para o CEP real 01001-000; o CEP inexistente 99999999 foi rejeitado, e consultas com erro de rede e resposta inválida exibiram orientação para preenchimento manual.
- A confirmação redirecionou para a vitrine quando não havia pedido e exibiu o resumo após uma compra simulada. O Console não registrou exceções JavaScript no fluxo principal.
- Verificações adicionais confirmaram o menu móvel, o formato do telefone e nomes acessíveis para os links e campos. Não houve rolagem horizontal nas quatro páginas em larguras de 375, 768 e 1280 px.
- Auditoria local com Chrome/Performance API: carregamento da vitrine medido em aproximadamente 73 ms até DOMContentLoaded e 83 ms até load nesta sessão; todas as ilustrações da vitrine são SVG locais com lazy loading. Esses tempos dependem do ambiente e do cache; não são uma garantia de produção. Não foi gerado um score formal do Lighthouse.
- Oportunidade registrada: CSS/JavaScript do Bootstrap e a busca ViaCEP dependem de conexão externa. A busca já oferece preenchimento manual quando o serviço falha; para uma publicação real, vale medir uma implantação com Lighthouse e reavaliar a dependência do CDN.


### Dificuldades e soluções

- Manter nomes e preços iguais em quatro páginas: centralizei o catálogo em js/store.js e gerei as telas a partir desses dados.
- Evitar que uma atualização perca o carrinho: guardei somente os identificadores e as quantidades na sessão do navegador.
- Não deixar dados de endereço antigos após uma busca de CEP: cada nova resposta preenche os campos correspondentes, e todos permanecem editáveis para correção manual.
- As instruções recebidas não identificam os integrantes do grupo; a lista pode ser adicionada abaixo.

### Integrantes

- Não informados no material do projeto.

## Arquivos

- index.html — vitrine, filtros e busca.
- produto.html — detalhes e adição ao carrinho.
- checkout.html — carrinho, endereço e conclusão simulada.
- sucesso.html — confirmação e resumo do pedido.
- css/styles.css — identidade visual e responsividade.
- js/ — catálogo compartilhado e interações de cada página.
- assets/ — favicon, marca e ilustrações próprias.
