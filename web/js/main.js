(function () {
  const shop = window.FormiFofo;
  const list = document.querySelector("#listaProdutos");
  const search = document.querySelector("#buscaProduto");
  const categoryFilter = document.querySelector("#filtroCategoria");
  const ruleFilter = document.querySelector("#filtroRegra");
  const sortSelect = document.querySelector("#ordenacao");
  const resultMessage = document.querySelector("#resultadoBusca");
  const emptyMessage = document.querySelector("#semResultados");
  const storeNotice = document.querySelector("#avisoLoja");

  if (!shop || !list) return;

  function addOption(select, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }

  Array.from(new Set(shop.products.map(function (product) { return product.category; })))
    .sort(function (a, b) { return a.localeCompare(b, "pt-BR"); })
    .forEach(function (category) { addOption(categoryFilter, category, category); });

  Array.from(new Set(shop.products.map(function (product) { return product.ruleKey; })))
    .map(function (key) { return shop.products.find(function (product) { return product.ruleKey === key; }); })
    .forEach(function (product) { addOption(ruleFilter, product.ruleKey, product.rule); });

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createCard(product) {
    const column = makeElement("article", "col-12 col-sm-6 col-xl-4");
    const card = makeElement("div", "card h-100 product-card");
    const imageLink = makeElement("a", "product-art-link");
    imageLink.href = "produto.html?id=" + encodeURIComponent(product.id);
    imageLink.setAttribute("aria-label", "Ver " + product.name);
    const image = document.createElement("img");
    image.className = "product-art";
    image.src = product.image;
    image.alt = product.alt;
    image.width = 720;
    image.height = 500;
    image.loading = "lazy";
    image.decoding = "async";
    imageLink.append(image);

    const body = makeElement("div", "card-body product-card-body");
    body.append(makeElement("p", "product-category", product.category));
    body.append(makeElement("h3", "h4 product-name", product.name));
    body.append(makeElement("p", "product-short-description", product.shortDescription));
    body.append(makeElement("p", "challenge-badge", product.rule));
    const bottom = makeElement("div", "product-card-bottom");
    bottom.append(makeElement("p", "price", shop.currency(product.price)));
    const details = makeElement("a", "btn btn-outline-primary", "Ver detalhes");
    details.href = "produto.html?id=" + encodeURIComponent(product.id);
    bottom.append(details);
    body.append(bottom);
    card.append(imageLink, body);
    column.append(card);
    return column;
  }

  function renderCatalog() {
    const term = search.value.trim().toLocaleLowerCase("pt-BR");
    const category = categoryFilter.value;
    const rule = ruleFilter.value;
    const sort = sortSelect.value;
    let matches = shop.products.filter(function (product) {
      const searchable = [product.name, product.category, product.rule, product.shortDescription, product.description].join(" ").toLocaleLowerCase("pt-BR");
      return (!term || searchable.includes(term)) && (!category || product.category === category) && (!rule || product.ruleKey === rule);
    });

    matches = matches.slice().sort(function (a, b) {
      if (sort === "menor-preco") return a.price - b.price || a.name.localeCompare(b.name, "pt-BR");
      if (sort === "maior-preco") return b.price - a.price || a.name.localeCompare(b.name, "pt-BR");
      return a.name.localeCompare(b.name, "pt-BR");
    });

    list.replaceChildren.apply(list, matches.map(createCard));
    emptyMessage.hidden = matches.length > 0;
    resultMessage.textContent = matches.length === 1 ? "1 invenção encontrada." : matches.length + " invenções encontradas.";
  }

  [search, categoryFilter, ruleFilter, sortSelect].forEach(function (control) {
    control.addEventListener(control === search ? "input" : "change", renderCatalog);
  });

  const notice = new URLSearchParams(window.location.search).get("aviso");
  if (notice === "sem-pedido") {
    storeNotice.textContent = "Ainda não há uma compra concluída para mostrar. Escolha uma invenção para começar.";
    storeNotice.hidden = false;
  }

  shop.updateCartCount();
  renderCatalog();
})();
