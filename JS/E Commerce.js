document.addEventListener('DOMContentLoaded', function () {
    // ===== Elements =====
    const globalOverlay = document.getElementById('global-overlay');

    // Cart elements with null checks
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.querySelector('.cart-count');
    let cart = [];

    // Sidebar elements
    const menuIcon = document.getElementById('menu-icon');
    const sidebarNav = document.getElementById('sidebar-nav');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    // Checkout elements
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

    // Products & Categories
    const productGrid = document.getElementById('product-grid');
    const allCategoryLinks = document.querySelectorAll('.category-list a');
    const productCards = document.querySelectorAll('.product-card');
    const noItemsFoundMessage = document.getElementById('no-items-found-message');
    let cachedProductCards = Array.from(productCards); // Cache for better performance

    // Logo
    const mainLogo = document.getElementById('main-logo');

    // Auth Modal
    const userIcon = document.getElementById('user-icon');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const authTitle = document.getElementById('auth-title');
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const toggleToSignup = document.getElementById('toggle-to-signup');
    const toggleToSignin = document.getElementById('toggle-to-signin');

    // Search
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Scroll Animations
    const generalAnimatedSections = document.querySelectorAll('main, .info-section, footer');

    // ===== Helper Functions =====
    function safeToggleClass(element, className, condition = true) {
        if (element) {
            condition ? element.classList.add(className) : element.classList.remove(className);
        }
    }

    function setAriaAttributes(element, attributes) {
        if (element) {
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
    }

    // ===== Event Listeners =====
    // Main logo click handler
    if (mainLogo) mainLogo.addEventListener('click', () => location.reload());

    // Cart handlers
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);

    // Sidebar handlers
    if (menuIcon) menuIcon.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

    // Auth handlers
    if (userIcon) userIcon.addEventListener('click', toggleAuthModal);
    if (closeAuthModal) closeAuthModal.addEventListener('click', toggleAuthModal);

    // Auth form togglers
    if (toggleToSignup) {
        toggleToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signup');
        });
    }
    if (toggleToSignin) {
        toggleToSignin.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signin');
        });
    }

    // Global overlay click handler
    if (globalOverlay) {
        globalOverlay.addEventListener('click', () => {
            if (cartModal?.classList.contains('open')) toggleCart();
            if (sidebarNav?.classList.contains('open')) toggleSidebar();
            if (checkoutModal?.classList.contains('open')) toggleCheckoutModal();
            if (authModal?.classList.contains('open')) toggleAuthModal();
        });
    }

    // Checkout handlers
    if (openCheckoutBtn) {
        openCheckoutBtn.addEventListener('click', function () {
            if (cart.length === 0) {
                alert('Your cart is empty. Please add items before proceeding to checkout.');
                return;
            }
            toggleCart();
            openCheckout();
        });
    }

    if (closeCheckoutModal) closeCheckoutModal.addEventListener('click', toggleCheckoutModal);

    // Checkout navigation
    if (prevBtn) prevBtn.addEventListener('click', goToPreviousStep);
    if (nextBtn) nextBtn.addEventListener('click', goToNextStep);
    if (placeOrderBtn) placeOrderBtn.addEventListener('click', placeOrder);

    // Product grid handlers
    if (productGrid) {
        productGrid.addEventListener('click', function (e) {
            if (e.target.classList.contains('add-to-cart')) {
                addToCart(e);
            }
        });
    }

    // Category filtering
    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.category-item a')) {
            e.preventDefault();
            const clickedLink = e.target.closest('.category-item a');
            const category = clickedLink.getAttribute('data-category');
            filterProductsByCategory(category);
            if (sidebarNav?.classList.contains('open')) {
                toggleSidebar();
            }
        }
    });

    // Search functionality
    if (searchButton) searchButton.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    // ===== Core Functions =====
    function toggleCart() {
        if (!cartModal) return;

        cartModal.classList.toggle('open');
        globalOverlay?.classList.toggle('open');

        // Accessibility enhancements
        setAriaAttributes(cartModal, {
            'aria-hidden': !cartModal.classList.contains('open'),
            'aria-modal': cartModal.classList.contains('open')
        });

        if (cartModal.classList.contains('open')) {
            // Close other modals
            safeToggleClass(sidebarNav, 'open', false);
            safeToggleClass(checkoutModal, 'open', false);
            safeToggleClass(authModal, 'open', false);

            // Focus management
            cartModal.focus();
        }
    }

    function toggleSidebar() {
        if (!sidebarNav) return;

        sidebarNav.classList.toggle('open');
        globalOverlay?.classList.toggle('open');

        setAriaAttributes(sidebarNav, {
            'aria-hidden': !sidebarNav.classList.contains('open'),
            'aria-modal': sidebarNav.classList.contains('open')
        });

        if (sidebarNav.classList.contains('open')) {
            safeToggleClass(cartModal, 'open', false);
            safeToggleClass(checkoutModal, 'open', false);
            safeToggleClass(authModal, 'open', false);
        }
    }

    function toggleAuthModal() {
        if (!authModal) return;

        authModal.classList.toggle('open');
        globalOverlay?.classList.toggle('open');

        setAriaAttributes(authModal, {
            'aria-hidden': !authModal.classList.contains('open'),
            'aria-modal': authModal.classList.contains('open')
        });

        if (authModal.classList.contains('open')) {
            safeToggleClass(cartModal, 'open', false);
            safeToggleClass(sidebarNav, 'open', false);
            safeToggleClass(checkoutModal, 'open', false);
            showAuthForm('signin');
        }
    }

    function showAuthForm(mode) {
        if (!authTitle || !signInForm || !signUpForm || !toggleToSignup || !toggleToSignin) return;

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
        if (!checkoutModal || !globalOverlay) return;

        currentStep = 0;
        showStep(currentStep);
        updateOrderSummary();

        checkoutModal.classList.add('open');
        globalOverlay.classList.add('open');

        setAriaAttributes(checkoutModal, {
            'aria-hidden': false,
            'aria-modal': true
        });
    }

    function toggleCheckoutModal() {
        if (!checkoutModal || !globalOverlay) return;

        checkoutModal.classList.remove('open');
        globalOverlay.classList.remove('open');

        setAriaAttributes(checkoutModal, {
            'aria-hidden': true,
            'aria-modal': false
        });
    }

    function showStep(stepIndex) {
        if (!checkoutSteps.length || !prevBtn || !nextBtn || !placeOrderBtn) return;

        checkoutSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        prevBtn.style.display = (stepIndex === 0) ? 'none' : 'block';
        nextBtn.style.display = (stepIndex === checkoutSteps.length - 1) ? 'none' : 'block';
        placeOrderBtn.style.display = (stepIndex === checkoutSteps.length - 1) ? 'block' : 'none';
    }

    function goToPreviousStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }

    function goToNextStep() {
        if (validateStep(currentStep)) {
            if (currentStep < checkoutSteps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        }
    }

    function placeOrder() {
        if (validateStep(currentStep)) {
            alert('Order Placed Successfully! Thank you for your purchase.');
            cart = [];
            updateCartUI();
            toggleCheckoutModal();
        }
    }

    function validateStep(stepIndex) {
        if (!checkoutSteps[stepIndex]) return false;

        const currentForm = checkoutSteps[stepIndex];
        const inputs = currentForm.querySelectorAll('input[required], textarea[required]');
        let allValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                allValid = false;
            } else {
                input.style.borderColor = '';
            }
        });

        if (!allValid) {
            alert('Please fill in all required fields.');
            return false;
        }
        return true;
    }

    function updateOrderSummary() {
        if (!orderSummaryItemsContainer || !orderSummaryTotal) return;

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

        if (!productCard) return;

        const productTitle = productCard.querySelector('.product-title')?.textContent;
        const productPrice = productCard.querySelector('.product-price')?.textContent;
        const productImage = productCard.querySelector('.product-image img')?.src;

        if (!productTitle || !productPrice || !productImage) return;

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
        if (!cartCount || !cartItemsContainer || !cartTotal) return;

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

            // Add event listeners to remove buttons
            document.querySelectorAll('.cart-item-remove').forEach(button => {
                button.addEventListener('click', removeFromCart);
            });
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function removeFromCart(e) {
        const title = e.target.getAttribute('data-title');
        cart = cart.filter(item => item.title !== title);
        updateCartUI();
    }

    function filterProductsByCategory(selectedCategory) {
        if (!noItemsFoundMessage) return;

        // Update active state on category links
        allCategoryLinks.forEach(link => {
            const linkCategory = link.getAttribute('data-category');
            link.classList.toggle('active', linkCategory === selectedCategory ||
                (selectedCategory === 'all' && linkCategory === 'all'));
        });

        let foundItems = false;

        cachedProductCards.forEach(card => {
            const productCategory = card.getAttribute('data-category');
            const shouldShow = selectedCategory === 'all' || productCategory === selectedCategory;

            card.style.display = shouldShow ? 'flex' : 'none';
            foundItems = foundItems || shouldShow;
        });

        noItemsFoundMessage.classList.toggle('show', !foundItems);
    }

    function performSearch() {
        if (!searchInput || !noItemsFoundMessage) return;

        const searchTerm = searchInput.value.trim().toLowerCase();

        // Reset category filter
        allCategoryLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-category') === 'all');
        });

        let foundItems = false;

        cachedProductCards.forEach(card => {
            const productTitle = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
            const shouldShow = productTitle.includes(searchTerm);

            card.style.display = shouldShow ? 'flex' : 'none';
            foundItems = foundItems || shouldShow;
        });

        noItemsFoundMessage.classList.toggle('show', !foundItems);
    }

    // ===== Scroll Animations =====
    const productCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hidden-scroll');
                entry.target.classList.add('visible-scroll');
                productCardObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    const generalSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hidden-general-scroll');
                entry.target.classList.add('visible-general-scroll');
                generalSectionObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    // Initialize observers
    cachedProductCards.forEach(card => {
        card.classList.add('hidden-scroll');
        productCardObserver.observe(card);
    });

    generalAnimatedSections.forEach(section => {
        section.classList.add('hidden-general-scroll');
        generalSectionObserver.observe(section);
    });

    // Initialize cart UI
    updateCartUI();
});

