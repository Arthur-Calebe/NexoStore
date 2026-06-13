# ⚡ NEXO Store

Projeto de e-commerce desenvolvido como trabalho acadêmico de graduação. A aplicação simula uma loja virtual completa com listagem de produtos, filtros por categoria, busca, carrinho de compras persistente e finalização de pedido.

---

## 🖥️ Páginas

| Página | Arquivo | Descrição |
|---|---|---|
| Início | `index.html` | Hero section com chamada para ação |
| Produtos | `pages/produtos.html` | Catálogo com filtros, busca e paginação |
| Carrinho | `pages/carrinho.html` | Resumo do pedido e finalização de compra |

---

## ✨ Funcionalidades

- **Catálogo dinâmico** — produtos carregados via API externa (DummyJSON)
- **Filtro por categoria** — filtragem instantânea sem recarregar a página
- **Busca em tempo real** — filtra por nome e descrição do produto
- **Paginação** — 12 produtos por página
- **Card com flip** — vira o card para exibir avaliações dos produtos
- **Carrinho persistente** — salvo no `localStorage`, mantido entre sessões
- **Badge dinâmico** — contador de itens atualizado em tempo real no ícone do carrinho
- **Frete automático** — grátis para compras acima de $500
- **Modal de confirmação** — exibido ao finalizar a compra
- **Toasts de feedback** — notificações ao adicionar ou remover produtos

---

## 🛠️ Tecnologias

- **HTML5** semântico com atributos de acessibilidade (ARIA)
- **CSS3** — variáveis CSS, Grid, Flexbox, animações
- **JavaScript** puro (ES6+), sem frameworks
- **[DummyJSON API](https://dummyjson.com/)** — fonte dos dados de produtos
- **[Phosphor Icons](https://phosphoricons.com/)** — biblioteca de ícones
- **Google Fonts** — famílias Outfit e Plus Jakarta Sans

---

## 📁 Estrutura de arquivos

```
nexo-store/
├── index.html
├── pages/
│   ├── produtos.html
│   └── carrinho.html
├── css/
│   └── style.css
└── js/
    └── main.js
```

---

## 🚀 Como rodar

O projeto usa `localStorage`, que é bloqueado ao abrir arquivos diretamente pelo navegador (`file://`). É necessário rodar um servidor local.

**Opção 1 — VS Code (recomendado)**
1. Instale a extensão **Live Server**
2. Clique com o botão direito em `index.html`
3. Selecione **"Open with Live Server"**

**Opção 2 — Python**
```bash
# Na pasta raiz do projeto
python -m http.server 3000
```
Acesse `http://localhost:3000` no navegador.

---

## 👤 Autor

**Arthur Calebe**  
Trabalho acadêmico — Graduação

---

## 📄 Licença

Projeto desenvolvido para fins educacionais.
