
// Chuyển ảnh thumbnail thành ảnh chính khi click

document.addEventListener('DOMContentLoaded', function () {
  class ProductGallery {
    constructor() {
      this.mainImg = document.querySelector('.product-main-img');
      this.thumbs = Array.from(document.querySelectorAll('.product-thumbs .thumb'));
      this.currentIndex = 0;
      this.isAnimating = false;

      if (this.mainImg && this.thumbs.length) {
        this.init();
      }
    }

    init() {
      // Setup thumbnail clicks
      this.thumbs.forEach((thumb, index) => {
        const img = thumb.querySelector('img');
        thumb.style.cursor = 'pointer';

        thumb.addEventListener('click', () => this.switchImage(index));
        img?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.switchImage(index);
        });
      });

      // Setup keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      // Setup touch navigation
      let touchStartX = 0;
      this.mainImg.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      });

      this.mainImg.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // Minimum swipe distance
          if (diff > 0) this.next();
          else this.prev();
        }
      });
    }

    switchImage(index) {
      if (this.isAnimating || index === this.currentIndex) return;

      this.isAnimating = true;
      this.currentIndex = index;
      
      // Fade out current image
      this.mainImg.style.opacity = '0';
      
      setTimeout(() => {
        const img = this.thumbs[index].querySelector('img');
        const large = img?.dataset?.large || img?.src;
        
        if (large) {
          this.mainImg.src = large;
          // Fade in new image
          this.mainImg.style.opacity = '1';
        }

        this.thumbs.forEach((t, i) => {
          t.classList.toggle('active', i === index);
        });

        setTimeout(() => {
          this.isAnimating = false;
        }, 300);
      }, 300);
    }

    prev() {
      const newIndex = this.currentIndex === 0 ? 
        this.thumbs.length - 1 : 
        this.currentIndex - 1;
      this.switchImage(newIndex);
    }

    next() {
      const newIndex = this.currentIndex === this.thumbs.length - 1 ? 
        0 : 
        this.currentIndex + 1;
      this.switchImage(newIndex);
    }
  }

  // Initialize gallery
  const gallery = new ProductGallery();

  // Add smooth scroll to thumbnail when switching images
  const thumbsContainer = document.querySelector('.product-thumbs');
  if (thumbsContainer) {
    const scrollToThumb = (thumb) => {
      const containerWidth = thumbsContainer.offsetWidth;
      const thumbLeft = thumb.offsetLeft;
      const thumbWidth = thumb.offsetWidth;
      const scrollLeft = thumbLeft - (containerWidth - thumbWidth) / 2;
      
      thumbsContainer.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    };

    // Scroll to active thumb when clicking
    document.querySelectorAll('.thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        if (thumb.classList.contains('active')) {
          scrollToThumb(thumb);
        }
      });
    });
  }
});

//============================================

// ======= XỬ LÝ NÚT "MUA NGAY" =======
document.addEventListener('DOMContentLoaded', () => {
  const buyBtn = document.getElementById("buyNowBtn");
  if (!buyBtn) return;

  buyBtn.addEventListener("click", () => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("⚠️ Bạn cần đăng nhập trước khi mua hàng!");
      window.location.href = "../main.html";
      return;
    }

    // Lấy thông tin sản phẩm từ HTML
    const productName = document.querySelector("h3")?.textContent.trim() || "Sản phẩm không xác định";
    const priceText = document.querySelector(".price-new")?.textContent.replace(/[^\d]/g, "") || "0";
    const price = parseFloat(priceText);
    const productImg = document.querySelector(".product-main-img")?.src || "";
    const cpu = document.querySelector(".row-md-3:nth-child(1) .text-center")?.textContent.trim() || "";
    const ram = document.querySelector(".row-md-3:nth-child(2) .text-center")?.textContent.trim() || "";
    const ssd = document.querySelector(".row-md-3:nth-child(3) .text-center")?.textContent.trim() || "";
    const gpu = document.querySelector(".row-md-3:nth-child(4) .text-center")?.textContent.trim() || "";

    // Tạo đơn hàng
    const newOrder = {
      id: Date.now(),
      email: currentUser.email,
      product: productName,
      specs: { cpu, ram, ssd, gpu },
      quantity: 1,
      total: price,
      status: "Đang giao",
      image: productImg
    };

    // Lưu đơn hàng vào localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    alert(`✅ Đã thêm "${productName}" vào đơn hàng của bạn!`);
    window.location.href = "../profile.html"; // điều hướng sang trang hồ sơ
  });
});

