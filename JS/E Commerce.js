document.addEventListener('DOMContentLoaded', function () {
    // Global Overlay
    const globalOverlay = document.getElementById('global-overlay');

    // Cart functionality
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.querySelector('.cart-count');

    let cart = [];

    // Sidebar functionality
    const menuIcon = document.getElementById('menu-icon');
    const sidebarNav = document.getElementById('sidebar-nav');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    // Checkout functionality
    const openCheckoutBtn = document.getElementById('open-checkout');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModal = document.getElementById('close-checkout-modal');
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const orderSummaryItemsContainer = document.getElementById('order-summary-items');
    const orderSummaryTotal = document.getElementById('order-summary-total');

    let currentStep = 0;

    // Product grid and category links
    const productGrid = document.getElementById('product-grid');
    const allCategoryLinks = document.querySelectorAll('.category-list a');
    const productCards = document.querySelectorAll('.product-card');
    const noItemsFoundMessage = document.getElementById('no-items-found-message');

    // Logo functionality
    const mainLogo = document.getElementById('main-logo');

    // Auth Modal functionality
    const userIcon = document.getElementById('user-icon');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const authTitle = document.getElementById('auth-title');
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const toggleToSignup = document.getElementById('toggle-to-signup');
    const toggleToSignin = document.getElementById('toggle-to-signin');

    // General sections for turn-in animation
    const generalAnimatedSections = document.querySelectorAll('main, .info-section, footer');


    // --- Event Listeners ---

    // Logo click to refresh page
    mainLogo.addEventListener('click', () => {
        location.reload();
    });

    // Toggle Cart Modal
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);

    // Toggle Sidebar Navigation
    menuIcon.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', toggleSidebar);

    // Toggle Auth Modal
    userIcon.addEventListener('click', toggleAuthModal);
    closeAuthModal.addEventListener('click', toggleAuthModal);
    toggleToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signup');
    });
    toggleToSignin.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signin');
    });


    // Close any open modal/sidebar when overlay is clicked
    globalOverlay.addEventListener('click', () => {
        if (cartModal.classList.contains('open')) {
            toggleCart();
        }
        if (sidebarNav.classList.contains('open')) {
            toggleSidebar();
        }
        if (checkoutModal.classList.contains('open')) {
            toggleCheckoutModal();
        }
        if (authModal.classList.contains('open')) {
            toggleAuthModal();
        }
    });

    // Open Checkout Modal
    openCheckoutBtn.addEventListener('click', function () {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before proceeding to checkout.');
            return;
        }
        toggleCart(); // Close cart modal if open
        openCheckout();
    });

    // Close Checkout Modal
    closeCheckoutModal.addEventListener('click', toggleCheckoutModal);

    // Checkout Navigation
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < checkoutSteps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });

    placeOrderBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            alert('Order Placed Successfully! Thank you for your purchase.');
            cart = []; // Clear cart after order
            updateCartUI();
            toggleCheckoutModal();
        }
    });

    // Add to cart functionality (delegated event listener)
    productGrid.addEventListener('click', function (e) {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(e);
        }
    });

    // Category filtering (delegated event listener for all category links)
    document.querySelector('body').addEventListener('click', function (e) {
        if (e.target.closest('.category-item a')) {
            e.preventDefault();
            const clickedLink = e.target.closest('.category-item a');

            // Remove active class from all category links
            allCategoryLinks.forEach(l => l.classList.remove('active'));

            // Add active class to the clicked link (and its counterpart if exists)
            const category = clickedLink.getAttribute('data-category');
            document.querySelectorAll(`.category-item a[data-category="${category}"]`).forEach(link => {
                link.classList.add('active');
            });

            filterProductsByCategory(category);
            if (sidebarNav.classList.contains('open')) {
                toggleSidebar(); // Close sidebar after selection
            }
        }
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });


    // --- Functions ---

    function toggleCart() {
        cartModal.classList.toggle('open');
        globalOverlay.classList.toggle('open');
        // Ensure other modals are closed if cart opens
        if (cartModal.classList.contains('open')) {
            sidebarNav.classList.remove('open');
            checkoutModal.classList.remove('open');
            authModal.classList.remove('open');
        }
    }

    function toggleSidebar() {
        sidebarNav.classList.toggle('open');
        globalOverlay.classList.toggle('open');
        // Ensure other modals are closed if sidebar opens
        if (sidebarNav.classList.contains('open')) {
            cartModal.classList.remove('open');
            checkoutModal.classList.remove('open');
            authModal.classList.remove('open');
        }
    }

    function toggleAuthModal() {
        authModal.classList.toggle('open');
        globalOverlay.classList.toggle('open');
        // Ensure other modals are closed if auth modal opens
        if (authModal.classList.contains('open')) {
            cartModal.classList.remove('open');
            sidebarNav.classList.remove('open');
            checkoutModal.classList.remove('open');
        }
        // Default to sign-in form when opening
        showAuthForm('signin');
    }

    function showAuthForm(mode) {
        if (mode === 'signin') {
            authTitle.textContent = 'Sign In';
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
            toggleToSignup.style.display = 'inline';
            toggleToSignin.style.display = 'none';
        } else {
            authTitle.textContent = 'Sign Up';
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
            toggleToSignup.style.display = 'none';
            toggleToSignin.style.display = 'inline';
        }
    }


    function openCheckout() {
        currentStep = 0;
        showStep(currentStep);
        updateOrderSummary();
        checkoutModal.classList.add('open');
        globalOverlay.classList.add('open');
    }

    function toggleCheckoutModal() {
        checkoutModal.classList.remove('open');
        globalOverlay.classList.remove('open');
    }

    function showStep(stepIndex) {
        checkoutSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === stepIndex) {
                step.classList.add('active');
            }
        });

        prevBtn.style.display = (stepIndex === 0) ? 'none' : 'block';
        nextBtn.style.display = (stepIndex === checkoutSteps.length - 1) ? 'none' : 'block';
        placeOrderBtn.style.display = (stepIndex === checkoutSteps.length - 1) ? 'block' : 'none';
    }

    function validateStep(stepIndex) {
        const currentForm = checkoutSteps[stepIndex];
        const inputs = currentForm.querySelectorAll('input[required], textarea[required]');
        let allValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                allValid = false;
            } else {
                input.style.borderColor = ''; // Reset border
            }
        });

        if (!allValid) {
            alert('Please fill in all required fields.');
        }
        return allValid;
    }

    function updateOrderSummary() {
        orderSummaryItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            orderSummaryItemsContainer.innerHTML = '<div class="order-summary-empty">No items in cart.</div>';
        } else {
            cart.forEach(item => {
                const summaryItem = document.createElement('div');
                summaryItem.classList.add('order-summary-item');
                summaryItem.innerHTML = `
                            <span>${item.title} (x${item.quantity})</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        `;
                orderSummaryItemsContainer.appendChild(summaryItem);
            });
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderSummaryTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function addToCart(e) {
        const button = e.target;
        const productCard = button.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('.product-image img').src;

        const existingItem = cart.find(item => item.title === productTitle);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                title: productTitle,
                price: parseFloat(productPrice.replace('$', '')),
                image: productImage,
                quantity: 1
            });
        }

        updateCartUI();

        button.textContent = 'Added!';
        button.classList.add('added');
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.classList.remove('added');
        }, 2000);
    }

    function updateCartUI() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                            <div class="cart-item-image">
                                <img src="${item.image}" alt="${item.title}">
                            </div>
                            <div class="cart-item-details">
                                <div class="cart-item-title">${item.title}</div>
                                <div class="cart-item-price">$${item.price.toFixed(2)} &times; ${item.quantity}</div>
                                <div class="cart-item-remove" data-title="${item.title}">Remove</div>
                            </div>
                        `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            const removeButtons = document.querySelectorAll('.cart-item-remove');
            removeButtons.forEach(button => {
                button.addEventListener('click', removeFromCart);
            });
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function filterProductsByCategory(selectedCategory) {
        let foundItems = false;
        productCards.forEach(card => {
            const productCategory = card.getAttribute('data-category');
            if (selectedCategory === 'all' || productCategory === selectedCategory) {
                card.style.display = 'flex';
                foundItems = true;
            } else {
                card.style.display = 'none';
            }
        });
        if (!foundItems) {
            noItemsFoundMessage.classList.add('show');
        } else {
            noItemsFoundMessage.classList.remove('show');
        }
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        allCategoryLinks.forEach(l => l.classList.remove('active'));
        // Ensure 'All Products' is active when searching
        document.querySelectorAll('.category-item a[data-category="all"]').forEach(link => {
            link.classList.add('active');
        });

        let foundItems = false;
        productCards.forEach(card => {
            const productTitle = card.querySelector('.product-title').textContent.toLowerCase();
            if (productTitle.includes(searchTerm)) {
                card.style.display = 'flex';
                foundItems = true;
            } else {
                card.style.display = 'none';
            }
        });

        if (!foundItems) {
            noItemsFoundMessage.classList.add('show');
        } else {
            noItemsFoundMessage.classList.remove('show');
        }
    }

    // --- Scroll Animation Logic for Product Cards ---
    const productCardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hidden-scroll');
                entry.target.classList.add('visible-scroll');
                productCardObserver.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    });

    // Add hidden-scroll class to all product cards initially and observe them
    productCards.forEach(card => {
        card.classList.add('hidden-scroll');
        productCardObserver.observe(card);
    });

    // --- Scroll Animation Logic for General Sections ---
    const generalSectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hidden-general-scroll');
                entry.target.classList.add('visible-general-scroll');
                generalSectionObserver.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    });

    // Add hidden-general-scroll class to all general sections and observe them
    generalAnimatedSections.forEach(section => {
        section.classList.add('hidden-general-scroll');
        generalSectionObserver.observe(section);
    });
});