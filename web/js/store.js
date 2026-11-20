(function () {
  const products = [
    {
      id: "1", name: "Pantufa Pétala de Orvalho", category: "Conforto de formigueiro", rule: "Serve em uma formiga", ruleKey: "formiga", price: 28.9,
      image: "assets/pantufa-orvalho.svg", alt: "Ilustração de uma pantufa verde em forma de pétala, com uma pequena formiga ao lado.",
      shortDescription: "Um abraço macio para as patinhas que caminham o dia inteiro.",
      description: "Costurada com fibras de algodão de dente-de-leão e forrada com musgo fofinho. A sola tem textura de folha para a formiga não escorregar na trilha de volta para casa.",
      details: ["Tamanho único para formigas operárias", "Forro de musgo macio e respirável", "Sola antiderrapante feita de casca flexível", "Modo de uso: calce uma patinha de cada vez e descanse"]
    },
    {
      id: "2", name: "Pantufa Nuvem de Bolso", category: "Sonhos portáteis", rule: "Cabe em um bolso", ruleKey: "bolso", price: 19.5,
      image: "assets/nuvem-bolso.svg", alt: "Ilustração de pantufas fofas em forma de nuvem guardadas dentro de um bolso de folha.",
      shortDescription: "Pantufas nuvenzinhas que viajam dobradas no bolso.",
      description: "Um par de pantufas macias que cabe no bolso do casaco de uma formiga. Ao abrir o botão de semente, o tecido de algodão de algodoeiro se afofa e aquece as patinhas na pausa da expedição.",
      details: ["O par cabe em um bolso de casaco de formiga", "Tecido macio de algodão de algodoeiro", "Inclui um botão de semente para guardar", "Modo de uso: afofe e calce para uma pausa confortável"]
    },
    {
      id: "3", name: "Pantufas Jardim de Colônia", category: "Jardins impossíveis", rule: "Não cabe em um avião", ruleKey: "aviao", price: 249.9,
      image: "assets/jardim-colonia.svg", alt: "Ilustração de um par gigantesco de pantufas verdes com folhas, flores e uma trilha sinuosa.",
      shortDescription: "Um par tão enorme que não cabe em um avião — perfeito para a rainha e suas visitas.",
      description: "Duas pantufas acolchoadas se estendem por quilômetros de trilhas floridas. A rainha pode receber a colônia inteira sobre a sola macia, com clareiras de descanso e fontes de orvalho pelo caminho.",
      details: ["Dimensão imaginária: 2 km de ponta a ponta", "Cada pantufa tem jardins de musgo e folhas", "Cabe a colônia inteira em uma visita", "Modo de uso: espalhe as duas pantufas e escolha uma trilha"]
    },
    {
      id: "4", name: "Zumbilume", category: "Luzes de trilha", rule: "Começa com a letra Z", ruleKey: "letra-z", price: 12.9,
      image: "assets/zumbilume.svg", alt: "Ilustração de uma pantufa luminosa azul com um pequeno frasco dourado e estrelas.",
      shortDescription: "Uma pantufa brilhante para encontrar a trilha depois do anoitecer.",
      description: "O Zumbilume é uma pantufa com um vaga-lume de luz suave costurado na lateral. O brilho acompanha o passo sem assustar os grilos e ajuda a encontrar o caminho de volta para o formigueiro.",
      details: ["Nome que começa com a letra Z", "Luz suave em tom de mel", "Bateria imaginária recarregada com orvalho", "Modo de uso: calce e siga o brilho na trilha"]
    },
    {
      id: "5", name: "Pantufa Orbital de Pólen", category: "Tecnologia espacial", rule: "É usado no espaço sideral", ruleKey: "espaco", price: 84,
      image: "assets/pantufa-orbital.svg", alt: "Ilustração de pantufas espaciais arredondadas com sola dourada e pequenas estrelas ao redor.",
      shortDescription: "Pantufas flutuantes para a primeira trilha entre as estrelas.",
      description: "A sola magnética mantém as patinhas juntas durante passeios imaginários pela órbita. O tecido bloqueia poeira estelar e a bolsinha lateral guarda pólen crocante para a viagem de volta ao formigueiro.",
      details: ["Desenhadas para passeios pelo espaço sideral", "Sola magnética para caminhar em gravidade zero", "Tecido macio com proteção contra poeira estelar", "Modo de uso: ajuste as tiras antes da decolagem"]
    },
    {
      id: "6", name: "Pantufa Brilho de Baobá", category: "Festas do formigueiro", rule: "É de uso único", ruleKey: "uso-unico", price: 4.9,
      image: "assets/pantufa-baoba.svg", alt: "Ilustração de pantufas descartáveis douradas que espalham pontinhos de luz para uma festa.",
      shortDescription: "Um par de pantufas brilhantes para uma única noite de festa.",
      description: "Feitas para uma celebração especial sob as raízes do baobá. A sola de pólen cintilante brilha na pista de dança e, depois da festa, as pantufas se transformam em adubo para o jardim do formigueiro.",
      details: ["Uso único, para uma celebração especial", "Pólen cintilante de origem imaginária", "Embalagem de folha compostável", "Modo de uso: calce para dançar e devolva ao jardim depois"]
    }
  ];

  const keys = { cart: "formifofo.carrinho", order: "formifofo.pedido" };

  function currency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function productById(id) {
    return products.find(function (product) { return product.id === String(id); }) || null;
  }

  function readCart() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(keys.cart) || "[]");
      if (!Array.isArray(stored)) return [];
      return stored.map(function (item) {
        return { id: String(item.id), quantity: Number(item.quantity) };
      }).filter(function (item) {
        return productById(item.id) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99;
      });
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    const cleanCart = Array.isArray(cart) ? cart.map(function (item) {
      return { id: String(item.id), quantity: Number(item.quantity) };
    }).filter(function (item) {
      return productById(item.id) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99;
    }) : [];
    try {
      if (cleanCart.length) sessionStorage.setItem(keys.cart, JSON.stringify(cleanCart));
      else sessionStorage.removeItem(keys.cart);
      updateCartCount();
      return true;
    } catch (error) {
      return false;
    }
  }

  function cartDetails() {
    return readCart().map(function (item) {
      const product = productById(item.id);
      return Object.assign({}, product, { quantity: item.quantity, lineTotal: product.price * item.quantity });
    });
  }

  function cartCount() {
    return readCart().reduce(function (total, item) { return total + item.quantity; }, 0);
  }

  function updateCartCount() {
    const count = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
      badge.textContent = String(count);
      const link = badge.closest("a");
      if (link) link.setAttribute("aria-label", count === 1 ? "Carrinho, 1 item" : "Carrinho, " + count + " itens");
    });
  }

  function addToCart(id, quantity) {
    const product = productById(id);
    if (!product || !Number.isInteger(quantity) || quantity < 1) return false;
    const cart = readCart();
    const existing = cart.find(function (item) { return item.id === product.id; });
    if (existing) {
      if (existing.quantity + quantity > 99) return false;
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, quantity: quantity });
    }
    return saveCart(cart);
  }

  function shippingFor(subtotal) {
    return subtotal >= 100 ? 0 : 12.9;
  }

  function readOrder() {
    try {
      const order = JSON.parse(sessionStorage.getItem(keys.order) || "null");
      return order && Array.isArray(order.items) && order.items.length ? order : null;
    } catch (error) {
      return null;
    }
  }

  function saveOrder(order) {
    try {
      sessionStorage.setItem(keys.order, JSON.stringify(order));
      return true;
    } catch (error) {
      return false;
    }
  }

  document.addEventListener("DOMContentLoaded", updateCartCount);
  window.addEventListener("pageshow", updateCartCount);
  window.FormiFofo = Object.freeze({
    products: products, productById: productById, currency: currency,
    readCart: readCart, saveCart: saveCart, cartDetails: cartDetails,
    cartCount: cartCount, updateCartCount: updateCartCount, addToCart: addToCart,
    shippingFor: shippingFor, readOrder: readOrder, saveOrder: saveOrder,
    cartKey: keys.cart, orderKey: keys.order
  });
})();
