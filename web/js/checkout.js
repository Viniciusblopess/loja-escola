(function () {
  const shop = window.FormiFofo;
  const form = document.querySelector("#checkoutForm");
  const checkoutLayout = document.querySelector("#checkoutLayout");
  const emptyCart = document.querySelector("#carrinhoVazio");
  const itemsList = document.querySelector("#itensCarrinho");
  const cepInput = document.querySelector("#cep");
  const cepButton = document.querySelector("#buscarCep");
  const cepFeedback = document.querySelector("#cepFeedback");
  const checkoutFeedback = document.querySelector("#checkoutFeedback");
  const submitButton = document.querySelector("#concluirPedido");

  if (!shop || !form) return;
  shop.updateCartCount();

  function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function calculateTotals(items) {
    const subtotal = items.reduce(function (total, item) { return total + item.lineTotal; }, 0);
    const shipping = shop.shippingFor(subtotal);
    return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
  }

  function renderSummary() {
    const items = shop.cartDetails();
    const hasItems = items.length > 0;
    emptyCart.hidden = hasItems;
    checkoutLayout.hidden = !hasItems;
    if (!hasItems) {
      itemsList.replaceChildren();
      shop.updateCartCount();
      return;
    }

    const listItems = items.map(function (item) {
      const row = element("li", "cart-item");
      const top = element("div", "cart-item-top");
      const nameLink = element("a", "cart-item-name", item.name);
      nameLink.href = "produto.html?id=" + encodeURIComponent(item.id);
      top.append(nameLink);
      const remove = element("button", "remove-item", "Remover");
      remove.type = "button";
      remove.dataset.removeId = item.id;
      remove.setAttribute("aria-label", "Remover " + item.name + " do carrinho");
      top.append(remove);
      const detail = element("div", "cart-item-detail");
      const unitPrice = element("span", "cart-unit-price", shop.currency(item.price) + " cada");
      const quantityLabel = element("label", "visually-hidden", "Quantidade de " + item.name);
      const quantity = document.createElement("input");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = "99";
      quantity.step = "1";
      quantity.value = String(item.quantity);
      quantity.inputMode = "numeric";
      quantity.className = "form-control cart-quantity";
      quantity.dataset.quantityId = item.id;
      quantity.setAttribute("aria-label", "Quantidade de " + item.name);
      quantityLabel.append(quantity);
      const lineTotal = element("strong", "cart-line-total", shop.currency(item.lineTotal));
      detail.append(unitPrice, quantityLabel, lineTotal);
      row.append(top, detail);
      return row;
    });
    itemsList.replaceChildren.apply(itemsList, listItems);

    const totals = calculateTotals(items);
    document.querySelector("#subtotalCarrinho").textContent = shop.currency(totals.subtotal);
    document.querySelector("#freteCarrinho").textContent = totals.shipping === 0 ? "Grátis" : shop.currency(totals.shipping);
    document.querySelector("#totalCarrinho").textContent = shop.currency(totals.total);
    document.querySelector("#avisoFrete").textContent = totals.shipping === 0
      ? "A entrega fica por nossa conta nesta aventura."
      : "Na simulação, a trilha custa " + shop.currency(totals.shipping) + " para pedidos abaixo de R$ 100,00.";
    shop.updateCartCount();
  }

  itemsList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;
    const id = button.dataset.removeId;
    shop.saveCart(shop.readCart().filter(function (item) { return item.id !== id; }));
    renderSummary();
  });

  itemsList.addEventListener("change", function (event) {
    const input = event.target.closest("[data-quantity-id]");
    if (!input) return;
    const quantity = Number(input.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      renderSummary();
      input.focus();
      return;
    }
    const cart = shop.readCart();
    const item = cart.find(function (entry) { return entry.id === input.dataset.quantityId; });
    if (item) item.quantity = quantity;
    shop.saveCart(cart);
    renderSummary();
  });

  function digits(value) {
    return value.replace(/\D/g, "");
  }

  function formatCep(value) {
    const numbers = digits(value).slice(0, 8);
    return numbers.length > 5 ? numbers.slice(0, 5) + "-" + numbers.slice(5) : numbers;
  }

  function formatPhone(value) {
    const numbers = digits(value).slice(0, 11);
    if (numbers.length <= 2) return numbers ? "(" + numbers : "";
    if (numbers.length <= 10) return "(" + numbers.slice(0, 2) + ") " + numbers.slice(2, 6) + (numbers.length > 6 ? "-" + numbers.slice(6) : "");
    return "(" + numbers.slice(0, 2) + ") " + numbers.slice(2, 7) + "-" + numbers.slice(7);
  }

  function setFeedback(node, message, isError) {
    node.textContent = message;
    node.classList.toggle("feedback-error", Boolean(isError));
    node.classList.toggle("feedback-success", Boolean(message) && !isError);
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "Erro");
    if (!field || !error) return;
    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message || "";
  }

  form.addEventListener("input", function (event) {
    const target = event.target;
    if (target && target.id && document.getElementById(target.id + "Erro")) setFieldError(target.id, "");
    if (target === cepInput && activeRequest) cancelCepRequest("CEP alterado. Você pode iniciar uma nova busca.");
  });

  form.addEventListener("change", function (event) {
    const target = event.target;
    if (target && target.id && document.getElementById(target.id + "Erro")) setFieldError(target.id, "");
  });

  document.querySelector("#telefone").addEventListener("blur", function (event) {
    const input = event.currentTarget;
    if (digits(input.value).length) input.value = formatPhone(input.value);
  });
  document.querySelector("#estado").addEventListener("blur", function (event) {
    event.currentTarget.value = event.currentTarget.value.trim().toLocaleUpperCase("pt-BR");
  });
  cepInput.addEventListener("blur", function () {
    if (digits(cepInput.value).length) cepInput.value = formatCep(cepInput.value);
  });

  let activeRequest = null;
  let requestVersion = 0;
  function cancelCepRequest(message) {
    if (!activeRequest) return;
    activeRequest.abort();
    activeRequest = null;
    requestVersion += 1;
    window.clearTimeout(activeRequestTimeout);
    cepButton.disabled = false;
    cepButton.textContent = "Buscar CEP";
    setFeedback(cepFeedback, message, false);
  }
  let activeRequestTimeout = null;

  cepButton.addEventListener("click", async function () {
    const cep = digits(cepInput.value);
    if (cep.length !== 8) {
      setFieldError("cep", "Digite um CEP com oito números antes de buscar.");
      setFeedback(cepFeedback, "A busca não foi iniciada. Confira os oito dígitos do CEP.", true);
      cepInput.focus();
      return;
    }

    if (activeRequest) cancelCepRequest("Iniciando uma nova busca de CEP.");
    const controller = new AbortController();
    const version = ++requestVersion;
    activeRequest = controller;
    cepButton.disabled = true;
    cepButton.textContent = "Buscando…";
    cepInput.value = formatCep(cep);
    setFieldError("cep", "");
    setFeedback(cepFeedback, "Buscando o endereço do CEP…", false);
    ["logradouro", "bairro", "cidade", "estado"].forEach(function (id) {
      const field = document.getElementById(id);
      field.value = "";
      setFieldError(id, "");
    });
    let timedOut = false;
    activeRequestTimeout = window.setTimeout(function () {
      timedOut = true;
      controller.abort();
    }, 10000);

    try {
      const response = await fetch("https://viacep.com.br/ws/" + cep + "/json/", {
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Resposta HTTP " + response.status);
      const data = await response.json();
      if (version !== requestVersion) return;
      if (!data || typeof data !== "object") throw new Error("Resposta inválida");
      if (data.erro === true || data.erro === "true") {
        setFeedback(cepFeedback, "Não encontramos esse CEP. Confira os números ou preencha o endereço manualmente.", true);
        return;
      }

      const fields = [
        ["logradouro", data.logradouro],
        ["bairro", data.bairro],
        ["cidade", data.localidade],
        ["estado", data.uf]
      ];
      const hasAddressData = fields.some(function (entry) {
        return typeof entry[1] === "string" && entry[1].trim().length > 0;
      });
      if (!hasAddressData) {
        setFeedback(cepFeedback, "Não encontramos esse CEP. Confira os números ou preencha o endereço manualmente.", true);
        return;
      }
      fields.forEach(function (entry) {
        const field = document.getElementById(entry[0]);
        field.value = typeof entry[1] === "string" ? entry[1] : "";
      });
      const missing = fields.filter(function (entry) { return typeof entry[1] !== "string" || !entry[1].trim(); });
      setFeedback(cepFeedback, missing.length
        ? "CEP localizado. Alguns campos vieram vazios; complete o endereço antes de continuar."
        : "Endereço encontrado. Confira os dados e informe o número.", false);
    } catch (error) {
      if (version !== requestVersion) return;
      const message = timedOut
        ? "A consulta demorou demais. Tente novamente ou preencha o endereço manualmente."
        : controller.signal.aborted
          ? "A busca foi cancelada. Você pode tentar novamente."
          : "Não foi possível consultar o CEP agora. Verifique sua conexão ou preencha o endereço manualmente.";
      setFeedback(cepFeedback, message, true);
    } finally {
      if (version === requestVersion && activeRequest === controller) {
        window.clearTimeout(activeRequestTimeout);
        activeRequest = null;
        cepButton.disabled = false;
        cepButton.textContent = "Buscar CEP";
      }
    }
  });

  function validateForm() {
    const name = document.querySelector("#nome");
    const email = document.querySelector("#email");
    const phone = document.querySelector("#telefone");
    const street = document.querySelector("#logradouro");
    const number = document.querySelector("#numero");
    const district = document.querySelector("#bairro");
    const city = document.querySelector("#cidade");
    const state = document.querySelector("#estado");
    const payment = document.querySelector("#pagamento");
    const terms = document.querySelector("#termos");

    name.value = name.value.trim();
    email.value = email.value.trim();
    cepInput.value = formatCep(cepInput.value);
    const errors = {
      nome: name.value.length < 2 ? "Informe seu nome completo." : "",
      email: !email.value ? "Informe seu e-mail." : !email.validity.valid ? "Confira o formato do e-mail." : "",
      telefone: digits(phone.value).length > 0 && ![10, 11].includes(digits(phone.value).length) ? "Informe DDD e telefone com 10 ou 11 números." : "",
      cep: digits(cepInput.value).length !== 8 ? "Informe um CEP com oito números." : "",
      logradouro: !street.value.trim() ? "Informe a rua ou o logradouro." : "",
      numero: !number.value.trim() ? "Informe o número do endereço." : "",
      bairro: !district.value.trim() ? "Informe o bairro." : "",
      cidade: !city.value.trim() ? "Informe a cidade." : "",
      estado: !/^[A-Za-z]{2}$/.test(state.value.trim()) ? "Informe a sigla do estado com duas letras." : "",
      pagamento: !payment.value ? "Escolha uma forma de pagamento simulada." : "",
      termos: !terms.checked ? "Confirme que entendeu a simulação." : ""
    };

    const invalidFields = Object.keys(errors).filter(function (id) { return Boolean(errors[id]); });
    Object.keys(errors).forEach(function (id) { setFieldError(id, errors[id]); });
    if (invalidFields.length) {
      setFeedback(checkoutFeedback, "Revise os campos destacados para continuar.", true);
      document.getElementById(invalidFields[0]).focus();
      return false;
    }
    setFeedback(checkoutFeedback, "", false);
    return true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!shop.cartDetails().length) {
      renderSummary();
      return;
    }
    if (!validateForm()) return;

    const items = shop.cartDetails();
    const totals = calculateTotals(items);
    const order = {
      number: "PED-" + Date.now().toString().slice(-8) + "-" + Math.floor(100 + Math.random() * 900),
      customerName: document.querySelector("#nome").value.trim(),
      items: items.map(function (item) {
        return { id: item.id, name: item.name, quantity: item.quantity, price: item.price, lineTotal: item.lineTotal };
      }),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    };

    submitButton.disabled = true;
    setFeedback(checkoutFeedback, "Registrando seu pedido imaginário…", false);
    if (!shop.saveOrder(order)) {
      submitButton.disabled = false;
      setFeedback(checkoutFeedback, "Não conseguimos guardar o pedido nesta sessão. Tente novamente.", true);
      return;
    }
    shop.saveCart([]);
    window.location.assign("sucesso.html");
  });

  renderSummary();
})();
