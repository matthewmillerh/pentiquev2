<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import ProductCardCart from '@/components/ProductCardCart.vue';
import { saveCart, formatter, getCart } from '@/scripts/global';
import { axios_api } from '@/scripts/global';

const shoppingCart = ref([]);
const products = ref([]);
const checkoutDisabled = ref(false);

onBeforeMount(() => {
    shoppingCart.value = getCart();
    getProducts();
});

//Get product information for each productID in the shopping cart
function getProducts() {
    shoppingCart.value.forEach(element => {
        getProductByID(element.productID, element.quantity);
    });
}

//Get the product from the database by the supplied productID
async function getProductByID(id, qty) {
    let productInfo = {};

    try {
        const response = await axios_api.get('/products/' + id);

        //add the quantity of the product in the cart to the product array
        productInfo = response.data;
        productInfo['quantity'] = qty;
        products.value.push(productInfo);
        //console.log(products.value)
    } catch (err) {
        console.log(err);
    }
}

//Sets the total value of the shopping cart
const cartTotalValue = computed(() => {
    let cartTotal = 0;
    products.value.forEach(element => {
        cartTotal +=
            (element.productSpecialPrice > 0 ? element.productSpecialPrice : element.productPrice) *
            element.quantity;
    });
    return cartTotal;
});

//update the quantity of an item in the cart
function updateQuantity(quantity, index) {
    if (quantity <= 0 || quantity === '') {
        console.log(quantity);
        //remove the item from the products array
        products.value.splice(index, 1);
    } else {
        //edit the quantity in the array
        products.value[index]['quantity'] = quantity;
    }

    //Save the updated cart array to localStorage
    saveCart(products.value);

    checkoutDisabled.value = false;
}

//remove an item from the cart
function removeFromCart(index) {
    products.value.splice(index, 1);

    //Save the updated cart array to localStorage
    saveCart(products.value);
}

//empty the entire cart
function emptyCart() {
    shoppingCart.value.length = 0;
    products.value.length = 0;

    //Save the updated cart array to localStorage
    saveCart(shoppingCart.value);
}

function setCheckoutButton(value) {
    checkoutDisabled.value = value;
}
</script>
<template>
    <h1 class="p-3 text-center text-lg font-semibold">Your Shopping Cart</h1>
    <div class="px-4">
        <div v-for="(product, index) in products" :key="product.productID">
            <ProductCardCart
                :category1-name="product.category1Name"
                :category2-name="product.category2Name"
                :category3-name="product.category3Name"
                :product-name="product.productName"
                :image-u-r-l="product.productFileName"
                :product-price="
                    product.productSpecialPrice > 0
                        ? product.productSpecialPrice
                        : product.productPrice
                "
                :product-quantity="product.quantity"
                :productID="product.productID"
                :category1ID="product.category1ID"
                :index="index"
                @update-quantity="updateQuantity"
                @remove-from-cart="removeFromCart"
                @checkout-disabled="setCheckoutButton"
            >
            </ProductCardCart>
        </div>

        <!-- Cart control buttons (only show if cart has items) -->
        <div class="mb-4" v-if="products.length">
            <!-- Cart total value -->
            <div class="mb-3">
                <p>
                    Shopping Cart Total:
                    <span class="font-semibold">{{ formatter.format(cartTotalValue) }}</span>
                </p>
            </div>
            <button
                class="mr-3 rounded border border-red-400 bg-red-300 px-2 py-1 text-sm font-semibold shadow-md"
                @click="emptyCart"
            >
                Empty Cart
            </button>
            <RouterLink to="/checkout" v-slot="{ navigate }">
                <button
                    @click="navigate"
                    class="mr-3 rounded border border-green-400 bg-green-300 px-2 py-1 text-sm font-semibold shadow-md disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-300"
                    :disabled="checkoutDisabled"
                >
                    Continue to Checkout
                </button>
            </RouterLink>
        </div>
    </div>
</template>
<style></style>
