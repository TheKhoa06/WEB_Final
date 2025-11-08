// === Cấu hình chung ===
const CONFIG = {
    ITEMS_PER_PAGE: 12, // Số sản phẩm hiển thị trên mỗi trang
    ANIMATION_DURATION: 300, // Thời gian animation mặc định (ms)
    BREAKPOINTS: { MOBILE: 480, TABLET: 768, DESKTOP: 1024 }, // Điểm gãy responsive
    SORTING_DEFAULTS: {
        DEFAULT: 'default', PRICE_ASC: 'price-asc', PRICE_DESC: 'price-desc',
        NAME_ASC: 'name-asc', NAME_DESC: 'name-desc'
    }
};

// === Các hàm tiện ích ===
const utils = {
    // Lấy số tiền từ chuỗi
    extractPrice: str => parseInt(str.replace(/[^\d]/g, '')) || 0,
    
    // Hàm debounce (trì hoãn thực thi)
    debounce: (fn, wait) => {
        let t; 
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    },

    // Scroll mượt tới phần tử
    scrollTo: (el, offset = 0) => window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' }),

    // Thêm / xóa / toggle class
    addClass: (el, c) => el?.classList.add(c),
    removeClass: (el, c) => el?.classList.remove(c),
    toggleClass: (el, c) => el?.classList.toggle(c),

    // Thêm class tạm thời và tự động remove sau duration
    tempClass: (el, c, duration = CONFIG.ANIMATION_DURATION) => {
        utils.addClass(el, c);
        setTimeout(() => utils.removeClass(el, c), duration);
    }
};

// === Quản lý sản phẩm ===
class ProductManager {
    constructor() {
        this.grid = document.querySelector('.product-grid'); // container sản phẩm
        this.products = Array.from(document.querySelectorAll('.product-card')); // tất cả card sản phẩm
        this.sortSelect = document.getElementById('sort-select'); // dropdown sắp xếp
        this.searchInput = document.querySelector('.search-input'); // input tìm kiếm
        this.filterButtons = document.querySelectorAll('.filter-btn'); // nút lọc
        this.init();
    }

    // Khởi tạo các chức năng
    init() {
        // Animation hover và click
        this.products.forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform='translateY(-5px)');
            card.addEventListener('mouseleave', () => card.style.transform='translateY(0)');
            card.addEventListener('click', () => utils.tempClass(card,'clicked',200));
        });

        // Sắp xếp
        this.sortSelect?.addEventListener('change', () => this.sortProducts(this.sortSelect.value));

        // Tìm kiếm
        this.searchInput?.addEventListener('input', utils.debounce(() => this.filterProducts(this.searchInput.value),300));
        this.searchInput?.addEventListener('focus', () => utils.addClass(this.searchInput.parentElement,'focused'));
        this.searchInput?.addEventListener('blur', () => utils.removeClass(this.searchInput.parentElement,'focused'));

        // Lọc theo category
        this.filterButtons.forEach(btn => btn.addEventListener('click', () => {
            this.filterButtons.forEach(b=>utils.removeClass(b,'active'));
            utils.addClass(btn,'active');
            this.filterByCategory(btn.dataset.category);
        }));

        this.initLazyLoad(); // Lazy load ảnh
    }

    // Lazy load ảnh
    initLazyLoad() {
        if(!('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    const img = entry.target.querySelector('img');
                    if(img?.dataset.src){ 
                        img.src = img.dataset.src; 
                        img.removeAttribute('data-src'); 
                        utils.addClass(img,'loaded'); 
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin:'50px' });
        this.products.forEach(card => observer.observe(card));
    }

    // Sắp xếp sản phẩm
    sortProducts(type) {
        const sorted = [...this.products].sort((a,b)=>{
            const priceA = utils.extractPrice(a.querySelector('.price')?.textContent);
            const priceB = utils.extractPrice(b.querySelector('.price')?.textContent);
            const nameA = a.querySelector('h3')?.textContent||'';
            const nameB = b.querySelector('h3')?.textContent||'';
            switch(type){
                case CONFIG.SORTING_DEFAULTS.PRICE_ASC: return priceA-priceB;
                case CONFIG.SORTING_DEFAULTS.PRICE_DESC: return priceB-priceA;
                case CONFIG.SORTING_DEFAULTS.NAME_ASC: return nameA.localeCompare(nameB);
                case CONFIG.SORTING_DEFAULTS.NAME_DESC: return nameB.localeCompare(nameA);
                default: return 0;
            }
        });
        sorted.forEach(p=>utils.addClass(p,'sorting'));
        requestAnimationFrame(()=>{
            this.grid.innerHTML='';
            sorted.forEach(p=>{
                this.grid.appendChild(p);
                requestAnimationFrame(()=>utils.removeClass(p,'sorting'));
            });
        });
    }

    // Lọc sản phẩm theo từ khóa
    filterProducts(query='') {
        const q = query.toLowerCase().trim();
        this.products.forEach(p=>{
            const text = (p.querySelector('h3')?.textContent + p.querySelector('.description')?.textContent).toLowerCase();
            const show = !q || text.includes(q);
            p.style.display = show ? '' : 'none';
            if(show) utils.tempClass(p,'fade-in');
        });
    }

    // Lọc theo category
    filterByCategory(cat='all') {
        this.products.forEach(p=>{
            const show = !cat || cat==='all' || p.dataset.category===cat;
            p.style.display = show ? '' : 'none';
            if(show) utils.tempClass(p,'fade-in');
        });
    }
}

// === Quản lý phân trang ===
class PaginationManager {
    constructor(){
        this.currentPage=1;
        this.products=document.querySelectorAll('.product-card');
        this.totalPages=Math.ceil(this.products.length/CONFIG.ITEMS_PER_PAGE);
        this.container=document.querySelector('.pagination');

        // Click phân trang
        if(this.container) this.container.addEventListener('click', e=>{
            if(!e.target.classList.contains('page-btn')) return;
            const a = e.target.textContent.trim();
            if(a==='Đầu tiên') this.goToPage(1);
            else if(a==='Trước') this.goToPage(this.currentPage-1);
            else if(a==='Kế tiếp') this.goToPage(this.currentPage+1);
            else if(a==='Cuối cùng') this.goToPage(this.totalPages);
        });

        this.goToPage(1); // hiển thị trang đầu
    }

    // Hiển thị trang
    goToPage(page){
        if(page<1||page>this.totalPages) return;
        this.currentPage=page;
        const start=(page-1)*CONFIG.ITEMS_PER_PAGE, end=start+CONFIG.ITEMS_PER_PAGE;
        this.products.forEach((p,i)=>{
            const show = i>=start && i<end;
            p.style.display = show ? '' : 'none';
            if(show) utils.tempClass(p,'page-transition');
        });
        utils.scrollTo(this.container,80);
        this.updateControls();
    }

    // Cập nhật trạng thái nút
    updateControls(){
        const [first,prev,current,next,last]=[...this.container.querySelectorAll('.page-btn')];
        this.container.querySelector('.current-page').textContent=this.currentPage;
        first.disabled=prev.disabled=this.currentPage===1;
        next.disabled=last.disabled=this.currentPage===this.totalPages;
    }
}

// === Quản lý menu mobile ===
class MenuManager {
    constructor(){
        this.button=document.getElementById('hamburgerToggle');
        this.sidebar=document.getElementById('sidebarMenu');
        this.isOpen=false;

        // Toggle menu khi click
        this.button?.addEventListener('click', e=>{e.stopPropagation(); this.toggleMenu();});

        // Click ngoài menu đóng menu
        document.addEventListener('click', e=>{
            if(this.isOpen && !this.sidebar.contains(e.target) && !this.button.contains(e.target))
                this.closeMenu();
        });

        // Nhấn ESC đóng menu
        document.addEventListener('keydown', e=>{
            if(e.key==='Escape' && this.isOpen) this.closeMenu();
        });
    }

    toggleMenu(){
        this.isOpen=!this.isOpen;
        utils.toggleClass(this.sidebar,'active');
        utils.toggleClass(this.button,'active');
        document.body.style.overflow=this.isOpen?'hidden':'';
    }

    closeMenu(){
        this.isOpen=false;
        utils.removeClass(this.sidebar,'active');
        utils.removeClass(this.button,'active');
        document.body.style.overflow='';
    }
}

// === Khởi tạo khi DOM sẵn sàng ===
document.addEventListener('DOMContentLoaded',()=>{
    new ProductManager();    // Sản phẩm
    new PaginationManager(); // Phân trang
    new MenuManager();       // Menu

    // Responsive
    const handleResize = utils.debounce(()=>{
        const w=window.innerWidth, body=document.body;
        body.classList.toggle('mobile', w<=CONFIG.BREAKPOINTS.MOBILE);
        body.classList.toggle('tablet', w>CONFIG.BREAKPOINTS.MOBILE && w<=CONFIG.BREAKPOINTS.TABLET);
        body.classList.toggle('desktop', w>CONFIG.BREAKPOINTS.TABLET);
    },250);
    window.addEventListener('resize',handleResize);
    handleResize(); // gọi lần đầu
});
