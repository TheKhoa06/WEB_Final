// Lấy tất cả các sản phẩm trên trang
function getAllProducts() {
    const products = [];
    // Lấy tất cả các thẻ a có class banchay-item
    document.querySelectorAll('.banchay-item').forEach(item => {
        const productName = item.querySelector('h3')?.textContent || item.querySelector('p')?.textContent || '';
        const productSpecs = item.querySelector('p')?.textContent || '';
        const productPrice = item.querySelector('.price')?.textContent || '';
        const productImage = item.querySelector('img')?.src || '';
        const productLink = item.href;

        products.push({
            name: productName.toLowerCase(),
            specs: productSpecs.toLowerCase(),
            price: productPrice,
            image: productImage,
            link: productLink
        });
    });

    // Lấy thêm sản phẩm từ khu vực flash sale
    document.querySelectorAll('.flashsale-item').forEach(item => {
        const productName = item.querySelector('p')?.textContent || '';
        const productPrice = item.querySelector('.price')?.textContent || '';
        const productImage = item.querySelector('img')?.src || '';
        const productLink = item.href;

        products.push({
            name: productName.toLowerCase(),
            specs: '',
            price: productPrice,
            image: productImage,
            link: productLink
        });
    });

    return products;
}

// Tạo và hiển thị kết quả tìm kiếm
function displaySearchResults(results) {
    // Ẩn các section khác
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Tạo container cho kết quả tìm kiếm nếu chưa có
    let searchResults = document.getElementById('searchResults');
    if (!searchResults) {
        searchResults = document.createElement('section');
        searchResults.id = 'searchResults';
        searchResults.className = 'container mt-4';
        document.querySelector('.container').appendChild(searchResults);
    } else {
        searchResults.style.display = 'block';
    }

    // Xóa kết quả tìm kiếm cũ
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = `
            <h3 class="text-center mb-4">Không tìm thấy sản phẩm nào</h3>
            <button onclick="resetSearch()" class="btn btn-primary d-block mx-auto">Quay lại</button>
        `;
        return;
    }

    // Hiển thị số lượng kết quả và nút quay lại
    searchResults.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Tìm thấy ${results.length} sản phẩm</h3>
            <button onclick="resetSearch()" class="btn btn-primary">Quay lại</button>
        </div>
    `;

    // Tạo grid container cho kết quả
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'row';

    // Thêm từng sản phẩm vào grid
    results.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-12 col-sm-6 col-md-3 mb-4';
        
        productCard.innerHTML = `
            <a href="${product.link}" class="text-decoration-none">
                <div class="banchay-item">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid">
                    <h3>${product.name}</h3>
                    ${product.specs ? `<p>${product.specs}</p>` : ''}
                    <span class="price">${product.price}</span>
                </div>
            </a>
        `;
        
        resultsGrid.appendChild(productCard);
    });

    searchResults.appendChild(resultsGrid);
}

// Reset tìm kiếm và hiện lại các section
function resetSearch() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }

    // Hiện lại các section
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id !== 'searchResults') {
            section.style.display = 'block';
        }
    });

    // Clear ô tìm kiếm
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.value = '';
    }
}

// Hàm tìm kiếm sản phẩm
function searchProducts(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();
    if (!searchTerm) return [];

    const products = getAllProducts();
    
    // Tìm kiếm dựa trên tên và thông số
    return products.filter(product => 
        product.name.includes(searchTerm) || 
        product.specs.includes(searchTerm)
    );
}

// Khởi tạo tìm kiếm
function initializeSearch() {
    const searchInput = document.querySelector('input[type="search"]');
    
    if (searchInput) {
        // Xóa event listener cũ nếu có
        searchInput.removeEventListener('keypress', handleSearchKeypress);
        // Thêm event listener mới
        searchInput.addEventListener('keypress', handleSearchKeypress);
        console.debug('timkiem: initializeSearch attached to input[type="search"]');
    }
}

// Hàm xử lý sự kiện tìm kiếm
function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Ngăn form submit
        const results = searchProducts(this.value);
        displaySearchResults(results);
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', initializeSearch);

// Khởi tạo lại sau khi đăng nhập thành công
window.addEventListener('userLoggedIn', initializeSearch);

// Export function để có thể gọi từ main.js sau khi đăng nhập
window.initializeSearch = initializeSearch;

// --- Delegated handler: listen on document so replacement of navbar/input doesn't break search ---
function delegatedSearchKeypress(e) {
    // Only handle Enter on any input[type="search"] in the document
    if (e.key === 'Enter' && e.target && e.target.matches && e.target.matches('input[type="search"]')) {
        e.preventDefault();
        console.debug('timkiem: delegated Enter captured on search input, value="' + e.target.value + '"');
        const results = searchProducts(e.target.value || '');
        displaySearchResults(results);
    }
}

// Attach once at load time
document.addEventListener('keypress', delegatedSearchKeypress, true);
console.debug('timkiem: delegatedSearchKeypress attached to document');