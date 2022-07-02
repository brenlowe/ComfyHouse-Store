//Contentful
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "78i5cbnd1feo",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "Qx9LkVYvHlEYlgSY6c_XlEgqx5nxO5ntCfC0X4UoAu4"
  });

// Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.cart__close-cart');
const clearCartBtn = document.querySelector('.cart__clear-cart');
const cartDOM = document.querySelector('.cart__cart');
const cartOverlay = document.querySelector('.cart');
const cartItems = document.querySelector('.cart-items');
const cartItemAmount = document.querySelector('cart-items');
const cartTotal = document.querySelector('.cart__cart-total');
const cartContent = document.querySelector('.cart__content');
const productsDom = document.querySelector('.products__center');

// Shopping Cart
let cart = [];

// Buttons
let buttonsDOM = [];

// Getting the Products
class Products{
    async getProducts() {
        try {
            const contentful = await client.getEntries({content_type: 'comfyHouseProducts'});

            let result = await fetch('products.json');
            let data = await result.json();

            let products = contentful.items;
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// Display Products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `<article class="products__product">
            <div class="products__img-container">
              <img
                src=${product.image}
                alt="product"
                class="products__product-img"
              />
              <button class="products__bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>`;

        });
        productsDom.innerHTML = result; 
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll
            (".products__bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            } 
            button.addEventListener('click', event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products
                let cartItem = {...Storage.getProducts(id),
                    amount : 1 };
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values 
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart__item');
        div.innerHTML = `<img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="cart__remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="cart__item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('show-cart');
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('show-cart');
    }

    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        cartContent.addEventListener('click', event => {
            // remove item from cart
            if(event.target.classList.contains('cart__remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } 
            // increase amount of products
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } 
            // decrease amount of products
            else if (event.target.classList.contains('fa-chevron-down')) {
                let subtractAmount = event.target;
                let id = subtractAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    subtractAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(subtractAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
                
               
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);

        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to Cart`
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products)
        );
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id );
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();
    // Get all products 
    products.getProducts().then(products => {
        ui.displayProducts(products)

        Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
})

// Event Listeners
