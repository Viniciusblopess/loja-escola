(function () {
  const shop = window.FormiFofo;
  const params = new URLSearchParams(window.location.search);
  const product = shop && shop.productById(params.get("id"));
  const title = document.querySelector("#produtoTitulo");
  const loading = document.querySelector("#produtoCarregando");
  const content = document.querySelector("#produtoConteudo");
  const notFound = document.querySelector("#produtoNaoEncontrado");
  const form = document.querySelector("#formProduto");
  const quantityInput = document.querySelector("#quantidade");
  const subtotal = document.querySelector("#subtotalProduto");
  const feedback = document.querySelector("#produtoFeedback");

  if (!shop || !title) return;
  shop.updateCartCount();

  if (!product) {
    title.textContent = "Invenção não encontrada";
    loading.hidden = true;
    notFound.hidden = false;
    document.title = "Produto não encontrado | FormiFofo";
    return;
  }

  title.textContent = product.name;
  document.title = product.name + " | FormiFofo";
  document.querySelector("#breadcrumbProduto").textContent = product.name;
  document.querySelector("#produtoCategoria").textContent = product.category;
  document.querySelector("#produtoRegra").textContent = "Regra do desafio: " + product.rule;
  document.querySelector("#produtoDescricaoCurta").textContent = product.shortDescription;
  document.querySelector("#produtoDescricao").textContent = product.description;
  document.querySelector("#produtoPreco").textContent = shop.currency(product.price);
  const image = document.querySelector("#produtoImagem");
  image.src = product.image;
  image.alt = product.alt;

  const details = document.querySelector("#produtoDetalhes");
  details.replaceChildren.apply(details, product.details.map(function (detail) {
    const item = document.createElement("li");
    item.textContent = detail;
    return item;
  }));

  loading.hidden = true;
  content.hidden = false;

  function updateSubtotal() {
    const quantity = Number(quantityInput.value);
    subtotal.textContent = Number.isInteger(quantity) && quantity > 0 && quantity <= 99
      ? "Subtotal: " + shop.currency(product.price * quantity)
      : "Escolha entre 1 e 99 unidades.";
  }

  quantityInput.addEventListener("input", updateSubtotal);
  updateSubtotal();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const quantity = Number(quantityInput.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      feedback.textContent = "Escolha uma quantidade inteira entre 1 e 99.";
      feedback.classList.add("feedback-error");
      quantityInput.focus();
      return;
    }

    if (!shop.addToCart(product.id, quantity)) {
      feedback.textContent = "O carrinho já tem 99 unidades deste item. Reduza a quantidade antes de adicionar mais.";
      feedback.classList.add("feedback-error");
      quantityInput.focus();
      return;
    }

    feedback.classList.remove("feedback-error");
    feedback.replaceChildren(document.createTextNode(quantity + (quantity === 1 ? " unidade adicionada. " : " unidades adicionadas. ")));
    const checkoutLink = document.createElement("a");
    checkoutLink.href = "checkout.html";
    checkoutLink.textContent = "Ir para o carrinho";
    feedback.append(checkoutLink);
    quantityInput.value = "1";
    updateSubtotal();
  });
})();
