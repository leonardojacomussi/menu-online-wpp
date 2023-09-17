$(document).ready(function() {
  menu.events.init();
});

let MY_CART = [];

let MY_ADDRESS = null;

let VALUE_CART = 0;

let VALUE_DELIVERY = 5;

const CLIENT_PHONE_NUMBER = "5511939384181";

const menu = {
  events: {
    init: () => {
      menu.methods.getItemsMenu();
      menu.methods.loadReservationButton();
      menu.methods.loadCallButton();
      menu.methods.loadWppSocial();
    }
  },
  methods: {
    getItemsMenu: (category = "burgers", seeMore = false) => {

      if (!seeMore) {
        $("#items-menu").html("");
        $("#btn-see-more").removeClass("hidden");
      }

      const filter = DB[category]
      $.each(filter, function(index, item) {
        let temp = menu.templates.itemMenu;
        temp = temp
          .replaceAll(/\${id}/g, item.id)
          .replaceAll(/\${img}/g, item.img)
          .replaceAll(/\${name}/g, item.name)
          .replaceAll(/\${price}/g, item.price.toFixed(2).replaceAll(".", ","));

        // Botão ver mais foi clicado (12 itens)
        if (seeMore && index >= 8 && index < 12) {
          $("#items-menu").append(temp);
        }

        // Paginação inicial (8 itens)
        if (!seeMore && index < 8) {
          $("#items-menu").append(temp);
        }

      });

      $(".container-menu a").removeClass("active");
      $(`#menu-${category}`).addClass("active");
    },

    seeMore: () => {
      const activeCategory = $(".container-menu a.active").attr("id").split("-")[1];
      menu.methods.getItemsMenu(activeCategory, true);
      $("#btn-see-more").addClass("hidden");
    },

    decreaseAmount: (id) => {
      const currentAmount = parseInt($(`#amount-${id}`).text());
      if (currentAmount > 0) {
        $(`#amount-${id}`).text(currentAmount - 1);
      }
    },

    increaseAmount: (id) => {
      const currentAmount = parseInt($(`#amount-${id}`).text());
      $(`#amount-${id}`).text(currentAmount + 1);
    },

    addToCart: (id) => {
      const currentAmount = parseInt($(`#amount-${id}`).text());
      if (currentAmount > 0) {
        const activeCategory = $(".container-menu a.active").attr("id").split("-")[1];
        const filter = DB[activeCategory];
        const item = $.grep(filter, (e, i) => e.id == id);
        if (item.length > 0) {
          // Validar se o item já existe no carrinho
          const itemExists = $.grep(MY_CART, (element, index) => element.id == id);
          // Se o item já existe no carrinho, atualizar a quantidade
          if (itemExists.length > 0) {
            const index = MY_CART.findIndex(obj => obj.id == id);
            MY_CART[index].amount = currentAmount;
            // Caso contrário, adicionar o item no carrinho
          } else {
            item[0].amount = currentAmount;
            MY_CART.push(item[0]);
          }

          menu.methods.message("Item adicionado ao carrinho", "green");

          $("#amount-" + id).text(0);

          menu.methods.updateBadgeTotal();
        }
      }
    },

    updateBadgeTotal: () => {
      let total = 0;
      $.each(MY_CART, (index, item) => {
        total += item.amount;
      });
      if (total > 0) {
        $(".btn-cart").removeClass("hidden");
        $(".container-total-cart").removeClass("hidden");
      } else {
        $(".btn-cart").addClass("hidden");
        $(".container-total-cart").addClass("hidden");
      }
      $(".badge-total-cart").html(total);
    },

    openCart: (open) => {
      if (open) {
        $("#modal-cart").removeClass("hidden");
        menu.methods.loadCart();
      } else {
        $("#modal-cart").addClass("hidden");
      }
    },

    changeStep: (step) => {
      if (step == 1) {
        $("#lbl-title-step").text("Seu carrinho:");
        $("#items-cart").removeClass("hidden");
        $("#local-delivery").addClass("hidden");
        $("#summary-cart").addClass("hidden");

        $(".step").removeClass("active");
        $(".step-1").addClass("active");

        $("#btn-step-order").removeClass("hidden");
        $("#btn-step-address").addClass("hidden");
        $("#btn-step-summary").addClass("hidden");
        $("#btn-step-return").addClass("hidden");
      };

      if (step == 2) {
        $("#lbl-title-step").text("Endereço de entrega:");
        $("#items-cart").addClass("hidden");
        $("#local-delivery").removeClass("hidden");
        $("#summary-cart").addClass("hidden");

        $(".step").removeClass("active");
        $(".step-1").addClass("active");
        $(".step-2").addClass("active");

        $("#btn-step-order").addClass("hidden");
        $("#btn-step-address").removeClass("hidden");
        $("#btn-step-summary").addClass("hidden");
        $("#btn-step-return").removeClass("hidden");
      };

      if (step == 3) {
        $("#lbl-title-step").text("Resumo do pedido:");
        $("#items-cart").addClass("hidden");
        $("#local-delivery").addClass("hidden");
        $("#summary-cart").removeClass("hidden");

        $(".step").removeClass("active");
        $(".step-1").addClass("active");
        $(".step-2").addClass("active");
        $(".step-3").addClass("active");

        $("#btn-step-order").addClass("hidden");
        $("#btn-step-address").addClass("hidden");
        $("#btn-step-summary").removeClass("hidden");
        $("#btn-step-return").removeClass("hidden");
      };
    },

    returnStep: () => {
      const step = $(".step.active").length;
      menu.methods.changeStep(step - 1);
    },

    loadCart: () => {
      menu.methods.changeStep(1);

      if (MY_CART.length > 0) {
        $("#items-cart").html("");
        $.each(MY_CART, (index, item) => {
          let temp = menu.templates.itemCart;
          temp = temp
            .replaceAll(/\${id}/g, item.id)
            .replaceAll(/\${img}/g, item.img)
            .replaceAll(/\${name}/g, item.name)
            .replaceAll(/\${price}/g, item.price.toFixed(2).replaceAll(".", ","))
            .replaceAll(/\${amount}/g, item.amount);

          $("#items-cart").append(temp);
        });
      } else {
        $("#items-cart").html(`
          <p class="empty-cart">
            <i class="fa fa-shopping-bag"></i>
            Seu carrinho está vazio
          </p>
        `);
      };
      menu.methods.loadValues();
    },

    decreaseAmountCart: (id) => {
      const currentAmount = parseInt($(`#amount-cart-${id}`).text());
      if (currentAmount > 1) {
        $(`#amount-cart-${id}`).text(currentAmount - 1);
        menu.methods.updateCart(id, currentAmount - 1);
      } else {
        menu.methods.removeFromCart(id);
      }
    },

    increaseAmountCart: (id) => {
      const currentAmount = parseInt($(`#amount-cart-${id}`).text());
      $(`#amount-cart-${id}`).text(currentAmount + 1);
      menu.methods.updateCart(id, currentAmount + 1);
    },

    removeFromCart: (id) => {
      MY_CART = $.grep(MY_CART, (element, index) => element.id != id);
      menu.methods.loadCart();
      menu.methods.updateBadgeTotal();
    },

    updateCart: (id, amount) => {
      const index = MY_CART.findIndex(obj => obj.id == id);
      MY_CART[index].amount = amount;
      menu.methods.updateBadgeTotal();
      menu.methods.loadValues();
    },

    loadValues: () => {
      VALUE_CART = 0;

      $("#lbl-subtotal").text("R$ 0,00");
      $("#lbl-value-delivery").text("+ R$ 0,00");
      $("#lbl-value-total").text("R$ 0,00");

      if (MY_CART.length <= 0) {
        return false;
      };

      $.each(MY_CART, (index, item) => {
        VALUE_CART += parseFloat(item.price * item.amount);
      });

      $("#lbl-subtotal").text(`R$ ${VALUE_CART.toFixed(2).replaceAll(".", ",")}`);
      $("#lbl-value-delivery").text(`+ R$ ${VALUE_DELIVERY.toFixed(2).replaceAll(".", ",")}`);
      $("#lbl-value-total").text(`R$ ${(VALUE_CART + VALUE_DELIVERY).toFixed(2).replaceAll(".", ",")}`);
    },

    loadAddress: () => {
      if (MY_CART.length <= 0) {
        menu.methods.message("Seu carrinho está vazio", "red");
        return false;
      };

      menu.methods.changeStep(2);
    },

    searchZipCode: () => {
      const zipCode = $("#text-zipcode")
        .val()
        .trim()
        .replaceAll(/\D/g, "");

      if (zipCode == "") {
        menu.methods.message("Digite um CEP, por favor", "red");
        $("#text-zipcode").focus();
        return false;
      } else {
        const validZipCode = /^[0-9]{8}$/;

        if (!validZipCode.test(zipCode)) {
          menu.methods.message("Digite um CEP válido", "red");
          $("#text-zipcode").focus();
          return false;
        }

        $("#text-address").val("");
        $("#text-neighborhood").val("");
        $("#text-city").val("");
        $("#ddlUF").val("-1");
        $("#text-number").val("");
        $("#text-complement").val("");

        $.getJSON(`https://viacep.com.br/ws/${zipCode}/json/`, (data) => {
          if (data.erro) {
            menu.methods.message("CEP não encontrado. Preencha as informações manualmente.", "red");
            $("#text-address").focus();
            return false;
          } else {
            $("#text-address").val(data.logradouro);
            $("#text-neighborhood").val(data.bairro);
            $("#text-city").val(data.localidade);
            $("#ddlUF").val(data.uf);
            $("#text-number").focus();
          }
        });
      }


    },

    summaryOrder: () => {
      const zipCode = $("#text-zipcode").val().trim().replaceAll(/\D/g, "");
      const address = $("#text-address").val().trim();
      const neighborhood = $("#text-neighborhood").val().trim();
      const city = $("#text-city").val().trim();
      const uf = $("#ddlUF").val();
      const number = $("#text-number").val().trim();
      const complement = $("#text-complement").val().trim();

      if (zipCode.length <= 0) {
        menu.methods.message("Digite um CEP, por favor", "red");
        $("#text-zipcode").focus();
        return;
      }

      if (address.length <= 0) {
        menu.methods.message("Digite um endereço, por favor", "red");
        $("#text-address").focus();
        return;
      }

      if (neighborhood.length <= 0) {
        menu.methods.message("Digite um bairro, por favor", "red");
        $("#text-neighborhood").focus();
        return;
      }

      if (city.length <= 0) {
        menu.methods.message("Digite uma cidade, por favor", "red");
        $("#text-city").focus();
        return;
      }

      if (uf == "-1") {
        menu.methods.message("Selecione um estado, por favor", "red");
        $("#ddlUF").focus();
        return;
      }

      if (number.length <= 0) {
        menu.methods.message("Digite um número, por favor", "red");
        $("#text-number").focus();
        return;
      }

      MY_ADDRESS = {
        zipCode,
        address,
        neighborhood,
        city,
        uf,
        number,
        complement: complement.length > 0 ? complement : null
      };

      menu.methods.changeStep(3);

      menu.methods.loadSummary();
    },

    loadSummary: () => {
      $("#list-items-summary").html("");
      $.each(MY_CART, (index, item) => {
        let temp = menu.templates.itemSummary;
        temp = temp
          .replaceAll(/\${img}/g, item.img)
          .replaceAll(/\${name}/g, item.name)
          .replaceAll(/\${price}/g, item.price.toFixed(2).replaceAll(".", ","))
          .replaceAll(/\${amount}/g, item.amount);

        $("#list-items-summary").append(temp);
      });

      $("#summary-address")
        .text(`${MY_ADDRESS.address}, ${MY_ADDRESS.number} ${MY_ADDRESS.complement ? `, ${MY_ADDRESS.complement}` : ""} - ${MY_ADDRESS.neighborhood}`);
      $("#city-address").text(`${MY_ADDRESS.city} - ${MY_ADDRESS.uf} / ${MY_ADDRESS.zipCode}`);
      menu.methods.finalizeOrder();
    },

    finalizeOrder: () => {
      if (MY_CART.length <= 0 || MY_ADDRESS == null) {
        menu.methods.message("Ocorreu um erro ao finalizar o pedido", "red");
        return false;
      }
      // send data to whatsapp
      const message = `Olá, gostaria de fazer um pedido.\n\n`;
      let total = 0;
      let text = "*ITENS:*";

      Object.keys(DB).forEach((category) => {
        $.each(MY_CART, (_, item) => {
          // listar itens por categoria
          const filter = DB[category];
          const itemExists = $.grep(filter, (element, index) => element.id == item.id);
          if (itemExists.length > 0) {
            if (!text.includes(category.toUpperCase())) {
              text += `\n_${category.toUpperCase()}_\n`;
            };
            // lista os itens da categoria
            $.each(itemExists, (_, item) => {
              text += `  ${item.amount}x ${item.name} = R$ ${(item.amount * item.price).toFixed(2).replaceAll(".", ",")}\n`;
            });
          }
          total += item.amount * item.price;
        });
      });

      text += `\n*VALORES:*\n`;
      text += `Subtotal: R$ ${VALUE_CART.toFixed(2).replaceAll(".", ",")}\n`;
      text += `Taxa de entrega: R$ ${VALUE_DELIVERY.toFixed(2).replaceAll(".", ",")}\n`;
      text += `TOTAL: R$ ${(VALUE_CART + VALUE_DELIVERY).toFixed(2).replaceAll(".", ",")}\n\n`;

      text += `*ENDEREÇO DE ENTREGA:*\n`;
      text += `Endereço: ${MY_ADDRESS.address}, ${MY_ADDRESS.number} ${MY_ADDRESS.complement ? `, ${MY_ADDRESS.complement}` : ""} - ${MY_ADDRESS.neighborhood}\n`;
      text += `Cidade: ${MY_ADDRESS.city} - ${MY_ADDRESS.uf}\n`;
      text += `CEP: ${MY_ADDRESS.zipCode}\n\n`;

      text += `Observações: \n`;
      text += `\n`;
      text += `*Pedido realizado pelo site*`;

      const url = `https://api.whatsapp.com/send?phone=5511939384181&text=${encodeURI(message + text)}`;
      $("#btn-step-summary").attr("href", url);
    },

    loadReservationButton: () => {
      let text = `Olá, gostaria de fazer uma *reserva*.\n\n`;
      let url = `https://api.whatsapp.com/send?phone=${CLIENT_PHONE_NUMBER}&text=${encodeURI(text)}`;
      $("#bnt-reservation").attr("href", url);
    },

    loadCallButton: () => {
      $("#btn-call").attr("href",  `tel:${CLIENT_PHONE_NUMBER}`);
    },

    loadWppSocial: () => {
      let text = `Olá, gostaria de tirar uma dúvida.\n\n`;
      let url = `https://api.whatsapp.com/send?phone=${CLIENT_PHONE_NUMBER}&text=${encodeURI(text)}`;
      $(".btn-social.wpp").attr("href", url);
    },

    message: (text, color = "red", time = 3500) => {
      const id = Math.floor(Date.now() * Math.random()).toString();
      const msg = `
      <div
        id="msg-${id}"
        class="animated fadeInDown toast ${color}" role="alert"
      >
        ${text}
      </div>
      `;
      $("#container-messages").append(msg);

      setTimeout(() => {
        $(`#msg-${id}`).removeClass("fadeInDown");
        $(`#msg-${id}`).addClass("fadeOutUp");
        setTimeout(() => {
          $(`#msg-${id}`).remove();
        }, 800);
      }, time);
    },

    openDeposition: (deposition) => {
      $(".deposition").addClass("hidden");
      $(".depositions .btn").removeClass("active");
      $(`#deposition-${deposition}`).removeClass("hidden");
      $(`#btn-deposition-${deposition}`).addClass("active");
    }
  },
  templates: {
    itemMenu: `
      <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
        <div class="card card-item" id="\${id}">
          <div class="img-product">
            <img src="\${img}">
          </div>
          <p class="title-product text-center mt-4">
            <b>\${name}</b>
          </p>
          <p class="price-product text-center">
            <b>R$ \${price}</b>
          </p>
          <div class="add-cart">
            <span
              class="btn-minus"
              onclick="menu.methods.decreaseAmount('\${id}')"
            >
              <i class="fas fa-minus"></i>
            </span>
            <span
              id="amount-\${id}"
              class="add-num-items"
            >
              0
            </span>
            <span
              class="btn-plus"
              onclick="menu.methods.increaseAmount('\${id}')"
            >
              <i class="fas fa-plus"></i>
            </span>
            <span
              class="btn btn-add"
              onclick="menu.methods.addToCart('\${id}')"
            >
              <i class="fas fa-shopping-bag"></i>
            </span>
          </div>
        </div>
      </div>
    `,
    itemCart: `
        <div class="col-12 item-cart">
          <div class="img-product">
            <img src="\${img}">
          </div>
          <div class="infos-product">
            <p class="title-product">
              <b>\${name}</b>
            </p>
            <p class="price-product">
              <b>R$ \${price}</b>
            </p>
          </div>
          <div class="add-cart">
            <span
              class="btn-minus"
              onclick="menu.methods.decreaseAmountCart('\${id}')"
            >
              <i class="fas fa-minus"></i>
            </span>
            <span
              id="amount-cart-\${id}"
              class="add-num-items"
            >
              \${amount}
            </span>
            <span
              class="btn-plus"
              onclick="menu.methods.increaseAmountCart('\${id}')"
            >
              <i class="fas fa-plus"></i>
            </span>
            <span
              class="btn btn-remove"
              onclick="menu.methods.removeFromCart('\${id}')"
            >
              <i class="fas fa-times"></i>
            </span>
          </div>
        </div>
    `,
    itemSummary: `
      <div class="col-12 item-cart summary">
        <div class="img-product-summary">
          <img src="\${img}">
        </div>
        <div class="infos-product">
          <p class="title-product-summary">
            <b>\${name}</b>
          </p>
          <p class="price-product-summary">
            <b>R$ \${price}</b>
          </p>
        </div>
        <p class="amount-product-summary">
          x <b>\${amount}</b>
        </p>
      </div>
    `,
  },
};