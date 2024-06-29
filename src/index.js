// Variables globales
let cart = [];
let queryActual = '';
const itemsPerPage = 12; // Número de ítems por página
const maxPagesToShow = 6; // Máximo número de páginas a mostrar en la paginación

// Función para buscar productos
async function searchProducts(query, offset = 0, limit = itemsPerPage, isCategory = false) {
    try {
        const url = isCategory ? 
            `https://api.mercadolibre.com/sites/MLA/search?category=${query}&offset=${offset}&limit=${limit}` : 
            `https://api.mercadolibre.com/sites/MLA/search?q=${query}&offset=${offset}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error buscando productos:', error);
        return { results: [], paging: {} };
    }
}

// Función para obtener detalles del producto
async function getProductDetails(productId) {
    try {
        const response = await fetch(`https://api.mercadolibre.com/items/${productId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo detalles del producto:', error);
        return null;
    }
}

// Función para renderizar detalles del producto
async function renderProductDetails(productId) {
    const product = await getProductDetails(productId);
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = `
        <div class="productDetail">
            <img class="imgDetail" src="${product.pictures[0].url}" alt="${product.title}">
            <div class="product-info">
                <h1>${product.title}</h1>
                <p>${product.sold_quantity} vendidos</p>
                <p>${product.condition === 'new' ? 'Nuevo' : 'Usado'}</p>
                <div class="promotion-item__description">
                    <div class="promotion-item__today-offer-container">
                        <h3 class="promotion-item__today-offer-text">OFERTA DEL DÍA</h3>
                    </div>
                    <div class="promotion-item__discount-component">
                        <div class="andes-money-amount-combo promotion-item__price has-discount">
                            <div class="andes-money-amount-combo__main-container">
                                <span class="andes-money-amount andes-money-amount--cents-superscript" style="font-size:24px" role="img" aria-label="Ahora: ${product.price} pesos" aria-roledescription="Precio">
                                    <span class="andes-money-amount__currency-symbol" aria-hidden="true">$</span>
                                    <span class="andes-money-amount__fraction" aria-hidden="true">${product.price}</span>
                                </span>
                            </div>
                            ${product.original_price ? `
                            <s class="andes-money-amount andes-money-amount-combo__previous-value andes-money-amount--previous andes-money-amount--cents-superscript" style="font-size:12px" role="img" aria-label="Antes: ${product.original_price} pesos" aria-roledescription="Precio">
                                <span class="andes-money-amount__currency-symbol" aria-hidden="true">$</span>
                                <span class="andes-money-amount__fraction" aria-hidden="true">${product.original_price}</span>
                            </s>` : ''}
                        </div>
                        <span class="promotion-item__discount-text">7% OFF</span>
                    </div>
                    <div class="promotion-item__installments-div">
                        <span class="installment-pre-text"><span class="promotion-item__installments">Mismo precio en 9 cuotas de <span>$ 29.444</span></span></span>
                    </div>
                    <span class="promotion-item__seller">por Mercado Libre Electronica</span>
                    <div class="promotion-item__newshipping-container">
                        <span><span class="promotion-item__pill" style="background-color:#00A6501A;color:#00A650">Llega gratis mañana</span></span>
                        <span style="color:#0000008C" class="fulfillment-text">Enviado por 
                            <svg viewBox="0 0 56 18" xmlns="http://www.w3.org/2000/svg" class="full-icon" width="38px" height="12px">
                                <path d="M3.545 0L0 10.286h5.91L3.544 18 13 6.429H7.09L10.637 0zm14.747 14H15.54l2.352-10.672h7.824l-.528 2.4h-5.072l-.352 1.664h4.944l-.528 2.4h-4.96L18.292 14zm13.32.192c-3.28 0-4.896-1.568-4.896-3.808 0-.176.048-.544.08-.704l1.408-6.352h2.8l-1.392 6.288c-.016.08-.048.256-.048.448.016.88.688 1.728 2.048 1.728 1.472 0 2.224-.928 2.496-2.176L35.5 3.328h2.784l-1.392 6.336c-.576 2.592-1.984 4.528-5.28 4.528zM45.844 14h-7.04l2.352-10.672h2.752L42.1 11.6h4.272l-.528 2.4zm9.4 0h-7.04l2.352-10.672h2.752L51.5 11.6h4.272l-.528 2.4z" fill="#00a650" fill-rule="evenodd"></path>
                            </svg>
                        </span>
                    </div>
                    <h2>Características</h2>
                    <div class="promotion-item__description">
                        <ul class="product-attributes">
                            ${product.attributes.map(attr => `<li><strong>${attr.name}:</strong> ${attr.value_name}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="quantity-container">
                    <label for="quantity">Cantidad:</label>
                    <input type="number" id="quantity" name="quantity" placeholder="seleccione cantidad" max="${product.available_quantity}">
                </div>
                <button class="btnAgrCarrito" id="add-to-cart-button">Agregar al carrito</button>
            </div>
        </div>
    `;

    document.getElementById('add-to-cart-button').addEventListener('click', () => addToCart(productId));
}

// Función para renderizar productos en la página
async function renderProducts(data) {
    const { results: products, paging } = data;
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';
    for (const product of products) {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <div class="product-detail">
                <img src="${product.thumbnail}" alt="${product.title}" onclick="renderProductDetails('${product.id}')">
                <div class="product-info">
                    <div class="promotion-item__description">
                        <div class="promotion-item__today-offer-container">
                            <span class="promotion-item__today-offer-text">OFERTA DEL DÍA</span>
                        </div>
                        <div class="promotion-item__discount-component">
                            <div class="andes-money-amount-combo promotion-item__price has-discount">
                                <div class="andes-money-amount-combo__main-container">
                                    <span class="andes-money-amount andes-money-amount--cents-superscript" style="font-size:24px" role="img" aria-label="Ahora: ${product.price} pesos" aria-roledescription="Precio">
                                        <span class="andes-money-amount__currency-symbol" aria-hidden="true">$</span>
                                        <span class="andes-money-amount__fraction" aria-hidden="true">${product.price}</span>
                                </div>
                                ${product.original_price ? `
                                <s class="andes-money-amount andes-money-amount-combo__previous-value andes-money-amount--previous andes-money-amount--cents-superscript" style="font-size:12px" role="img" aria-label="Antes: ${product.original_price} pesos" aria-roledescription="Precio">
                                    <span class="andes-money-amount__currency-symbol" aria-hidden="true">$</span>
                                    <span class="andes-money-amount__fraction" aria-hidden="true">${product.original_price}</span>
                                </s>` : ''}
                            </div>
                            <span class="promotion-item__discount-text">7% OFF</span>
                        </div>
                        <div class="promotion-item__installments-div">
                            <span class="installment-pre-text"><span class="promotion-item__installments">Mismo precio en 9 cuotas de <span>$ 29.444</span></span></span>
                        </div>
                        <p class="promotion-item__title">${product.title}</p>
                        <span class="promotion-item__seller">por Mercado Libre Electronica</span>
                        <div class="promotion-item__newshipping-container">
                            <span><span class="promotion-item__pill" style="background-color:#00A6501A;color:#00A650">Llega gratis mañana</span></span>
                            <span style="color:#0000008C" class="fulfillment-text">Enviado por 
                                <svg viewBox="0 0 56 18" xmlns="http://www.w3.org/2000/svg" class="full-icon" width="38px" height="12px">
                                    <path d="M3.545 0L0 10.286h5.91L3.544 18 13 6.429H7.09L10.637 0zm14.747 14H15.54l2.352-10.672h7.824l-.528 2.4h-5.072l-.352 1.664h4.944l-.528 2.4h-4.96L18.292 14zm13.32.192c-3.28 0-4.896-1.568-4.896-3.808 0-.176.048-.544.08-.704l1.408-6.352h2.8l-1.392 6.288c-.016.08-.048.256-.048.448.016.88.688 1.728 2.048 1.728 1.472 0 2.224-.928 2.496-2.176L35.5 3.328h2.784l-1.392 6.336c-.576 2.592-1.984 4.528-5.28 4.528zM45.844 14h-7.04l2.352-10.672h2.752L42.1 11.6h4.272l-.528 2.4zm9.4 0h-7.04l2.352-10.672h2.752L51.5 11.6h4.272l-.528 2.4z" fill="#00a650" fill-rule="evenodd"></path>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <button onclick="addToCart('${product.id}')">Agregar al carrito</button>
                </div>
            </div>
        `;
        productContainer.appendChild(productCard);
    }

    crearPaginacion(paging);
}

// Función para crear la paginación
function crearPaginacion(paging) {
    const paginacionContainer = document.getElementById('paginacion');
    paginacionContainer.innerHTML = '';

    const { total, offset, limit } = paging;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Anterior';
        prevButton.addEventListener('click', () => buscarYRenderizarProductos(queryActual, offset - limit, limit));
        paginacionContainer.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        } else {
            pageButton.addEventListener('click', () => buscarYRenderizarProductos(queryActual, (i - 1) * limit, limit));
        }
        paginacionContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Siguiente';
        nextButton.addEventListener('click', () => buscarYRenderizarProductos(queryActual, offset + limit, limit));
        paginacionContainer.appendChild(nextButton);
    }
}

// Función para renderizar categorías en el menú desplegable
async function fetchCategories() {
    try {
        const response = await fetch('https://api.mercadolibre.com/sites/MLA/categories');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        return [];
    }
}

function renderCategoriesDropdown(categories) {
    const categoriesDropdown = document.getElementById('categories-dropdown');
    categoriesDropdown.innerHTML = '';
    categories.forEach(category => {
        const categoryLink = document.createElement('a');
        categoryLink.href = "#";
        categoryLink.textContent = category.name;
        categoryLink.addEventListener('click', async (e) => {
            e.preventDefault();
            queryActual = category.id;
            buscarYRenderizarProductos(queryActual, 0, itemsPerPage, true);
        });
        categoriesDropdown.appendChild(categoryLink);
    });
}

// Función para renderizar la sección de ayuda
function renderHelpOptions() {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = `
        <div class="cx-peach-home__help">
            <div class="cx-peach-home__section cx-peach-home__section--size-0 search-section">
                <div class="cx-search-section">
                    <div class="search-bar-new">
                        <h1 class="search-bar__subtitle">¿Con qué podemos ayudarte?</h1>
                        <div aria-owns="cb1-listbox" class="cx-search-box">
                            <div class="andes-form-control andes-form-control--textfield cx-input-search">
                                <div class="andes-form-control__control">
                                    <input role="combobox" aria-activedescendant="" aria-controls="cb2-listbox" aria-expanded="false" id="cb1-listbox" class="andes-form-control__field" maxlength="120" placeholder="Buscá en Ayuda" aria-label="Buscá en Ayuda" rows="1" value="">
                                </div>
                            </div>
                            <button disabled="" type="button" class="andes-button cx-search-button andes-button--large andes-button--quiet andes-button--disabled" id=":Rli97m:"><span class="andes-button__content">Buscar</span></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="realestates-web__message andes-message andes-message--orange andes-message--quiet" id=":r0:">
                <div class="andes-message__border-color--orange"></div>
                <div class="andes-badge andes-badge--pill andes-badge--orange andes-message__badge andes-badge--pill-icon andes-badge--small" id=":r0:-notification">
                    <div aria-hidden="true" class="andes-badge__icon">
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M13.4545 5.81824H10.5454L10.909 13.8182H13.0909L13.4545 5.81824Z" fill="white"></path>
                            <path d="M12 15.2728C12.8033 15.2728 13.4545 15.924 13.4545 16.7273C13.4545 17.5307 12.8033 18.1819 12 18.1819C11.1966 18.1819 10.5454 17.5307 10.5454 16.7273C10.5454 15.924 11.1966 15.2728 12 15.2728Z" fill="white"></path>
                        </svg>
                    </div>
                </div>
                <div class="andes-message__content andes-message__content--untitled">
                    <div class="andes-message__text andes-message__text--orange">
                        <div class="realestates-web__message-description">Por un problema técnico, puede que veas en el listado de tus compras un mensaje de "No pudimos cargar los datos" pese a que nosotros los tenemos registrados. Queremos acercarte la tranquilidad de que tus compras llegarán a tiempo.
                        Te pedimos disculpas por la confusión que podemos haber ocasionado. Estamos trabajando para solucionarlo.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para agregar productos al carrito
function addToCart(productId) {
    const quantityElement = document.getElementById('quantity');
    if (!quantityElement) {
        alert('Por favor, seleccione una cantidad válida.');
        return;
    }

    const quantity = parseInt(quantityElement.value, 10);
    if (isNaN(quantity) || quantity <= 0) {
        alert('Por favor, ingrese una cantidad válida.');
        return;
    }

    getProductDetails(productId).then(product => {
        const productSave = {
            title: product.title,
            image: product.pictures[0].url,
            id: product.id,
            price: product.price,
            quantity: quantity,
        }
        cart.push(productSave);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${quantity} productos agregados al carrito`);
        renderCart();
    });
}

// Función para mostrar el carrito de compras
function renderCart() {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const productContainer = document.getElementById('product-container');
    
    if (storedCart.length === 0) {
        productContainer.innerHTML = '<p>El carrito está vacío</p>';
        return;
    }

    let totalPrice = 0;
    let cartItemHtml = "";
    storedCart.forEach(product => {
        totalPrice += product.price * product.quantity;
        cartItemHtml += `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.title}">
                <div class="cart-item-info">
                    <h3>${product.title}</h3>
                    <p class="price">$${product.price}</p>
                    <p class="quantity">Cantidad: ${product.quantity}</p>
                    <p>Cantidad total: $${(product.price * product.quantity).toFixed(2)}</p>
                    <button class= "btnDeleteCarrito" onclick="removeFromCart('${product.id}')">Eliminar</button>
                </div>
            </div>
        `;
    });

    productContainer.innerHTML = `
        <div class="carritoContent">    
            <h2>Mis Productos</h2>
            <div class="cart-items">
                ${cartItemHtml}
            </div>
            <div class="cart-total">
                <h3>Total: $${totalPrice.toFixed(2)}</h3>
            </div>
            <button class="btnAgrCarrito" onclick="clearCart()">Vaciar carrito</button>
            <button class="btnAgrCarrito" onclick="checkout()">Comprar ahora</button>
        </div>
    `;
}

// Función para eliminar un producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(product => product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Función para vaciar el carrito
function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    renderCart();
}

// Función para proceder a la compra
function checkout() {
    window.location.href = "https://www.mercadolibre.com/jms/mla/lgz/msl/login/H4sIAAAAAAAEAzWNwQ7DIAxD_yXnqr1z3I-gjKYULRQE6ehU9d8bpu1o-9k-gZMPm5VPJjBAR-bggsAAmVGWVKINswYxq1WD0E8ydgQLRhIqFczZhzzND9JSn1qQKymEu6x24dTU-36pF6qlQ3sbsm30fAfq6b_hk4pVJFczTa21MVJxOKeMPo0uxRHLBNegfBUrBd0LjJSdrhut-OJLzQAAAA/user";
}

// Funciones adicionales para mostrar las secciones de login y signup
function showLoginForm() {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = `
        <div class="andes-card grid-view_section grid-view_section--content andes-card--outline andes-card--padding-0">
            <div class="andes-card__content">
                <div class="children-wrapper">
                    <form class="login-form" action="/jms/mla/lgz/msl/login" method="POST" novalidate>
                        <div class="login-form__input">
                            <div class="login-form__input">
                                <div class="andes-form-control andes-form-control--textfield login-form__input--email andes-form-control--default">
                                    <label for="user_id">
                                        <span class="andes-form-control__label">E‑mail, teléfono o usuario</span>
                                    </label>
                                    <div class="andes-form-control__control">
                                        <input type="email" data-testid="user_id" name="user_id" autocomplete="on" autocapitalize="none" spellcheck="false" autocorrect="off" rows="1" id="user_id" class="andes-form-control__field" maxlength="120" placeholder="">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="login-form__actions">
                            <button type="submit" class="andes-button login-form__submit andes-button--large andes-button--loud">
                                <span class="andes-button__content">Continuar</span>
                            </button>
                            <a href="#" class="andes-button andes-button--large andes-button--transparent andes-button--full-width" id="registration-link">
                                <span class="andes-button__content">Crear cuenta</span>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function showSignupForm() {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = `
        <div class="hub-card__container">
            <h1 class="hub-card__title">Completá los datos para crear tu cuenta</h1>
            <ul class="andes-list step-list andes-list--default">
                <div class="andes-card step-list__card andes-card--elevated andes-card--padding-16">
                    <li class="andes-list_item step-listitem andes-listitem--size-medium andes-list_item-with-secondary">
                        <div class="andes-list__item-first-column">
                            <div class="andes-list_item-asset andes-list_item-asset--icon" aria-hidden="true">
                                <div class="thumbnail-congrats">
                                    <svg class="thumbnail-pending" viewBox="0 0 100 100">
                                        <circle class="bg" cx="50" cy="50" r="40"></circle>
                                        <circle class="meter" cx="50" cy="50" r="40"></circle>
                                    </svg>
                                    <div class="asset">
                                        <svg width="24px" height="16px" viewBox="0 0 24 16" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <title>Thumbnail</title>
                                            <g id="Registro-ML---nativo-" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g id="HUB---Validación-de-e-mail" transform="translate(-28.000000, -205.000000)">
                                                    <rect fill="#FFFFFF" x="0" y="0" width="360" height="640"></rect>
                                                    <g id="Group" transform="translate(8.000000, 179.000000)">
                                                        <g id="🔲-Shadow-style">
                                                            <circle stroke-opacity="0.0700000003" stroke="#000000" cx="20" cy="20" r="19.5"></circle>
                                                        </g>
                                                        <g id="02-Medium-/-01-Simple-/-With-Thumbnail-+-Text-+-Description" transform="translate(12.000000, 0.000000)">
                                                            <g id="Thumbnail" transform="translate(0.000000, 14.000000)">
                                                                <g id="Thumbnail-state">
                                                                    <circle stroke-opacity="0.0700000003" stroke="#000000" cx="20" cy="20" r="19.5"></circle>
                                                                    <g id="Group" transform="translate(8.000000, 8.000000)" fill="#3483FA" fill-rule="nonzero">
                                                                        <g id="🖼Icon">
                                                                            <path d="M23.25,4.546797 L23.25,19.4798466 L0.75,19.4798466 L0.75,4.546797 L23.25,4.546797 Z M21.75,8.791797 L13.860521,13.3006585 C12.7754645,13.9206907 11.457949,13.9571632 10.3455444,13.4100759 L10.139479,13.3006585 L2.25,8.792797 L2.25,17.979 L21.75,17.979 L21.75,8.791797 Z M21.75,6.046 L2.25,6.046 L2.25,7.064797 L10.8836874,11.9982937 C11.5222014,12.3631589 12.294878,12.3912254 12.9540324,12.0824934 L13.1163126,11.9982937 L21.75,7.063797 L21.75,6.046 Z" id="Combined-Shape"></path>
                                                                        </g>
                                                                    </g>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div class="andes-list__item-text">
                                <span class="andes-list__item-primary">Agregá tu e-mail</span>
                                <span class="andes-list__item-secondary">Recibirás información de tu cuenta.</span>
                            </div>
                        </div>
                        <div class="andes-list__item-second-column">
                            <div class="andes-list_item-tertiary-container andes-list_item-tertiary-container--top">
                                <span class="andes-list_item-tertiary andes-list_item-tertiary--top">
                                    <button type="button" class="andes-button hub-item__button andes-button--medium andes-button--loud">
                                        <span class="andes-button__content">
                                            <span class="andes-button__text">Agregar</span>
                                        </span>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </li>
                </div>
                <li class="andes-list_item step-listitem andes-listitem--size-medium andes-list_item-with-secondary">
                    <div class="andes-list__item-first-column">
                        <div class="andes-list_item-asset andes-list_item-asset--icon" aria-hidden="true">
                            <div class="thumbnail-congrats">
                                <svg class="thumbnail-pending" viewBox="0 0 100 100">
                                <circle class="bg" cx="50" cy="50" r="40"></circle>
                                <circle class="meter" cx="50" cy="50" r="40"></circle>
                            </svg>
                                <div class="asset">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M9.49989 15C9.49989 15.8284 8.82831 16.5 7.99989 16.5C7.17146 16.5 6.49989 15.8284 6.49989 15C6.49989 14.1716 7.17146 13.5 7.99989 13.5C8.82831 13.5 9.49989 14.1716 9.49989 15Z" fill="#3483FA"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2519 6.002V8.98398H15.4632V18C15.4632 20.8995 13.1126 23.25 10.2132 23.25H5.78662C2.88713 23.25 0.536621 20.8995 0.536621 18V8.98398H2.74789V6.002C2.74789 3.1014 5.09929 0.75 7.99989 0.75C10.9005 0.75 13.2519 3.1014 13.2519 6.002ZM4.24789 8.98398V6.002C4.24789 3.92983 5.92771 2.25 7.99989 2.25C10.0721 2.25 11.7519 3.92983 11.7519 6.002V8.98398H4.24789ZM13.9632 10.484V18C13.9632 20.0711 12.2842 21.75 10.2132 21.75H5.78662C3.71555 21.75 2.03662 20.0711 2.03662 18V10.484H13.9632Z" fill="#3483FA"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="andes-list__item-text">
                            <span class="andes-list__item-primary">Elegí tu nombre</span>
                            <span class="andes-list__item-secondary">Contanos cómo querés que te llamemos.</span>
                        </div>
                    </div>
                </li>
                <li class="andes-list_item step-listitem andes-listitem--size-medium andes-list_item-with-secondary">
                    <div class="andes-list__item-first-column">
                        <div class="andes-list_item-asset andes-list_item-asset--icon" aria-hidden="true">
                            <div class="thumbnail-congrats">
                                <svg class="thumbnail-pending" viewBox="0 0 100 100">
                                    <circle class="bg" cx="50" cy="50" r="40"></circle>
                                    <circle class="meter" cx="50" cy="50" r="40"></circle>
                                </svg>
                                <div class="asset">
                                    <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M9.49989 15C9.49989 15.8284 8.82831 16.5 7.99989 16.5C7.17146 16.5 6.49989 15.8284 6.49989 15C6.49989 14.1716 7.17146 13.5 7.99989 13.5C8.82831 13.5 9.49989 14.1716 9.49989 15Z" fill="#3483FA"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2519 6.002V8.98398H15.4632V18C15.4632 20.8995 13.1126 23.25 10.2132 23.25H5.78662C2.88713 23.25 0.536621 20.8995 0.536621 18V8.98398H2.74789V6.002C2.74789 3.1014 5.09929 0.75 7.99989 0.75C10.9005 0.75 13.2519 3.1014 13.2519 6.002ZM4.24789 8.98398V6.002C4.24789 3.92983 5.92771 2.25 7.99989 2.25C10.0721 2.25 11.7519 3.92983 11.7519 6.002V8.98398H4.24789ZM13.9632 10.484V18C13.9632 20.0711 12.2842 21.75 10.2132 21.75H5.78662C3.71555 21.75 2.03662 20.0711 2.03662 18V10.484H13.9632Z" fill="#3483FA"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="andes-list__item-text">
                            <span class="andes-list__item-primary">Creá tu contraseña</span>
                            <span class="andes-list__item-secondary">Mantendrás tu cuenta protegida.</span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    `;
}

// Evento para el botón de búsqueda
document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    queryActual = query;
    buscarYRenderizarProductos(queryActual, 0, itemsPerPage);
});

// Cargar las categorías y mostrarlas en el menú desplegable
document.addEventListener('DOMContentLoaded', async () => {
    const categories = await fetchCategories();
    renderCategoriesDropdown(categories);

    // Cargar ofertas por defecto en la página de inicio
    queryActual = 'ofertas';
    buscarYRenderizarProductos(queryActual, 0, itemsPerPage);
});

// Otros eventos para los enlaces (se pueden agregar funciones similares para los demás enlaces)
document.getElementById('offers-link').addEventListener('click', async (e) => {
    e.preventDefault();
    queryActual = 'ofertas';
    buscarYRenderizarProductos(queryActual, 0, itemsPerPage);
});

document.getElementById('history-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderViewHistory();
});

document.getElementById('supermarket-link').addEventListener('click', async (e) => {
    e.preventDefault();
    queryActual = 'supermercado';
    buscarYRenderizarProductos(queryActual, 0, itemsPerPage);
});

document.getElementById('fashion-link').addEventListener('click', async (e) => {
    e.preventDefault();
    queryActual = 'moda';
    buscarYRenderizarProductos(queryActual, 0, itemsPerPage);
});

document.getElementById('sell-link').addEventListener('click', async (e) => {
    e.preventDefault();
    queryActual = 'vender';
    buscarYRenderizarProductos(queryActual, 0, itemsPerPage);
});

document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderHelpOptions();
});

document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

document.getElementById('signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSignupForm();
});

document.getElementById('purchases-link').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

document.getElementById('cart-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderCart();
});

async function buscarYRenderizarProductos(query, offset = 0, limit = itemsPerPage, isCategory = false) {
    const data = await searchProducts(query, offset, limit, isCategory);
    renderProducts(data);
}

// Función para obtener detalles del producto
async function getProductDetails(productId) {
    try {
        const response = await fetch(`https://api.mercadolibre.com/items/${productId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo detalles del producto:', error);
        return null;
    }
}

// Función para renderizar historial de navegación (solo ejemplo)
function renderViewHistory() {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = `
        <h2>Historial de navegación</h2>
        <p>Aquí se mostrarán los productos que has visto recientemente.</p>
    `;
}