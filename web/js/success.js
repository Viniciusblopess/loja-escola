(function () {
  const shop = window.FormiFofo;
  if (!shop) return;
  shop.updateCartCount();
  const order = shop.readOrder();
  if (!order) {
    window.location.replace("index.html?aviso=sem-pedido");
    return;
  }

  const panel = document.querySelector("#pedidoConcluido");
  const message = document.querySelector("#mensagemCliente");
  const number = document.querySelector("#numeroPedido");
  const items = document.querySelector("#itensPedido");
  const currency = shop.currency;

  message.textContent = "";
  const greeting = document.createTextNode("Obrigado, " + (order.customerName || "amiga do formigueiro") + "! Seu pedido está pronto para seguir pela trilha imaginária.");
  message.append(greeting);
  number.textContent = order.number || "PED-LOCAL";

  const rows = order.items.map(function (item) {
    const row = document.createElement("li");
    row.className = "cart-item success-cart-item";
    const name = document.createElement("span");
    name.className = "cart-item-name";
    name.textContent = item.quantity + " × " + item.name;
    const total = document.createElement("strong");
    total.className = "cart-line-total";
    total.textContent = currency(item.lineTotal);
    row.append(name, total);
    return row;
  });
  items.replaceChildren.apply(items, rows);
  document.querySelector("#subtotalPedido").textContent = currency(order.subtotal);
  document.querySelector("#fretePedido").textContent = Number(order.shipping) === 0 ? "Grátis" : currency(order.shipping);
  document.querySelector("#totalPedido").textContent = currency(order.total);
  panel.hidden = false;
})();
