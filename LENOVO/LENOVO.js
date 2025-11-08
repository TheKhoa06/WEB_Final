// Configuration
const CONFIG = {
    ITEMS_PER_PAGE: 12,
    ANIMATION_DURATION: 300,
    BREAKPOINTS: {
        MOBILE: 480,
        TABLET: 768,
        DESKTOP: 1024
    },
    SORTING_DEFAULTS: {
        DEFAULT: 'default',
        PRICE_ASC: 'price-asc',
        PRICE_DESC: 'price-desc',
        NAME_ASC: 'name-asc',
        NAME_DESC: 'name-desc'
    }
};

// Utility Functions
const utils = {
    extractPrice(priceStr) {
        return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
    },
    
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    scrollTo(element, offset = 0) {
        window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
        });
    },

    addClass(element, className) {
        if (element) element.classList.add(className);
    },

    removeClass(element, className) {
        if (element) element.classList.remove(className);
    },

    toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    }
};

// Product Manager - Handles product display, filtering, and sorting
class ProductManager {
    constructor() {
        this.grid = document.querySelector('.product-grid');
        this.products = Array.from(document.querySelectorAll('.product-card'));
        this.sortSelect = document.getElementById('sort-select');
        this.searchInput = document.querySelector('.search-input');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        this.initialize();
    }

    initialize() {
        this.initializeProducts();
        this.initializeSorting();
        this.initializeSearch();
        this.initializeFilters();
        this.initializeLazyLoading();
    }

    initializeProducts() {
        this.products.forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                utils.addClass(card, 'hovering');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                utils.removeClass(card, 'hovering');
            });

            // Add click animation
            card.addEventListener('click', () => {
                utils.addClass(card, 'clicked');
                setTimeout(() => utils.removeClass(card, 'clicked'), 200);
            });
        });
    }

    initializeSorting() {
        if (!this.sortSelect) return;

        this.sortSelect.addEventListener('change', () => {
            const value = this.sortSelect.value;
            this.sortProducts(value);
        });
    }

    initializeSearch() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', utils.debounce(() => {
            const query = this.searchInput.value.toLowerCase().trim();
            this.filterProducts(query);
        }, 300));

        // Add search input animations
        this.searchInput.addEventListener('focus', () => {
            utils.addClass(this.searchInput.parentElement, 'focused');
        });
        
        this.searchInput.addEventListener('blur', () => {
            utils.removeClass(this.searchInput.parentElement, 'focused');
        });
    }

    initializeFilters() {
        if (!this.filterButtons.length) return;

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterButtons.forEach(b => utils.removeClass(b, 'active'));
                utils.addClass(btn, 'active');
                this.filterByCategory(btn.dataset.category);
            });
        });
    }

    initializeLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target.querySelector('img');
                        if (img?.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            utils.addClass(img, 'loaded');
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '50px' }
        );

        this.products.forEach(card => observer.observe(card));
    }

    sortProducts(type) {
        const products = [...this.products];
        
        products.forEach(p => utils.addClass(p, 'sorting'));

        products.sort((a, b) => {
            const priceA = utils.extractPrice(a.querySelector('.price')?.textContent);
            const priceB = utils.extractPrice(b.querySelector('.price')?.textContent);
            const nameA = a.querySelector('h3')?.textContent || '';
            const nameB = b.querySelector('h3')?.textContent || '';

            switch(type) {
                case CONFIG.SORTING_DEFAULTS.PRICE_ASC: return priceA - priceB;
                case CONFIG.SORTING_DEFAULTS.PRICE_DESC: return priceB - priceA;
                case CONFIG.SORTING_DEFAULTS.NAME_ASC: return nameA.localeCompare(nameB);
                case CONFIG.SORTING_DEFAULTS.NAME_DESC: return nameB.localeCompare(nameA);
                default: return 0;
            }
        });

        // Animate and reorder
        requestAnimationFrame(() => {
            this.grid.innerHTML = '';
            products.forEach(product => {
                this.grid.appendChild(product);
                requestAnimationFrame(() => utils.removeClass(product, 'sorting'));
            });
        });
    }

    filterProducts(query) {
        const shouldReset = !query;
        
        this.products.forEach(product => {
            if (shouldReset) {
                product.style.display = '';
                utils.addClass(product, 'fade-in');
                return;
            }

            const title = product.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = product.querySelector('.description')?.textContent.toLowerCase() || '';
            const isVisible = title.includes(query) || description.includes(query);
            
            product.style.display = isVisible ? '' : 'none';
            if (isVisible) utils.addClass(product, 'fade-in');
        });
    }

    filterByCategory(category) {
        const shouldShowAll = !category || category === 'all';
        
        this.products.forEach(product => {
            const shouldShow = shouldShowAll || product.dataset.category === category;
            product.style.display = shouldShow ? '' : 'none';
            if (shouldShow) utils.addClass(product, 'fade-in');
        });
    }
}

// Pagination Manager - Handles page navigation and display
class PaginationManager {
    constructor() {
        this.currentPage = 1;
        this.products = document.querySelectorAll('.product-card');
        this.totalPages = Math.ceil(this.products.length / CONFIG.ITEMS_PER_PAGE);
        
        this.controls = {
            container: document.querySelector('.pagination'),
            first: document.querySelector('.page-btn:nth-child(1)'),
            prev: document.querySelector('.page-btn:nth-child(2)'),
            current: document.querySelector('.current-page'),
            next: document.querySelector('.page-btn:nth-child(4)'),
            last: document.querySelector('.page-btn:nth-child(5)')
        };

        this.initialize();
    }

    initialize() {
        if (!this.controls.container) return;

        this.controls.container.addEventListener('click', (e) => {
            if (!e.target.classList.contains('page-btn')) return;
            
            const action = e.target.textContent.trim();
            switch(action) {
                case 'Đầu tiên': this.goToPage(1); break;
                case 'Trước': this.goToPage(this.currentPage - 1); break;
                case 'Kế tiếp': this.goToPage(this.currentPage + 1); break;
                case 'Cuối cùng': this.goToPage(this.totalPages); break;
            }
        });

        this.goToPage(1);
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        const start = (page - 1) * CONFIG.ITEMS_PER_PAGE;
        const end = start + CONFIG.ITEMS_PER_PAGE;

        // Animate page transition
        this.products.forEach(p => utils.addClass(p, 'page-transition'));

        requestAnimationFrame(() => {
            this.products.forEach((product, index) => {
                const isVisible = index >= start && index < end;
                product.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    requestAnimationFrame(() => utils.removeClass(product, 'page-transition'));
                }
            });
        });

        this.updateControls();
        utils.scrollTo(this.controls.container, 80);
    }

    updateControls() {
        const { current, first, prev, next, last } = this.controls;
        
        if (current) current.textContent = this.currentPage;
        if (first) first.disabled = this.currentPage === 1;
        if (prev) prev.disabled = this.currentPage === 1;
        if (next) next.disabled = this.currentPage === this.totalPages;
        if (last) last.disabled = this.currentPage === this.totalPages;
    }
}

// Menu Manager - Handles mobile menu interactions
class MenuManager {
    constructor() {
        this.button = document.getElementById('hamburgerToggle');
        this.sidebar = document.getElementById('sidebarMenu');
        this.isOpen = false;
        
        this.initialize();
    }

    initialize() {
        if (!this.button || !this.sidebar) return;

        // Toggle menu
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.sidebar.contains(e.target) && !this.button.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        utils.toggleClass(this.sidebar, 'active');
        utils.toggleClass(this.button, 'active');
        
        if (this.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        utils.removeClass(this.sidebar, 'active');
        utils.removeClass(this.button, 'active');
        document.body.style.overflow = '';
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    const productManager = new ProductManager();
    const paginationManager = new PaginationManager();
    const menuManager = new MenuManager();

    // Initialize responsive handler
    const handleResize = utils.debounce(() => {
        const width = window.innerWidth;
        const body = document.body;

        if (width <= CONFIG.BREAKPOINTS.MOBILE) {
            utils.addClass(body, 'mobile');
            utils.removeClass(body, 'tablet desktop');
        } else if (width <= CONFIG.BREAKPOINTS.TABLET) {
            utils.addClass(body, 'tablet');
            utils.removeClass(body, 'mobile desktop');
        } else {
            utils.addClass(body, 'desktop');
            utils.removeClass(body, 'mobile tablet');
        }
    }, 250);

    // Add resize listener and trigger initial check
    window.addEventListener('resize', handleResize);
    handleResize();
});