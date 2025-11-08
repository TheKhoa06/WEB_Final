//chạy các địa chỉ cơ sở
document.addEventListener("DOMContentLoaded", () => {
  const marquee = document.getElementById("marqueeText");
  if (marquee) {
    // Nhân đôi nội dung để chạy nối đuôi nhau không bị giật
    marquee.innerHTML += marquee.innerHTML;
  }
});


//vinh------------
//menu---
// Khi nhấn nút menu, mở hoặc đóng sidebar
const hamburgerBtn = document.getElementById('hamburgerToggle');
const sidebarMenu = document.getElementById('sidebarMenu');

if (hamburgerBtn && sidebarMenu) {
  hamburgerBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    sidebarMenu.classList.toggle('active');
  });

  // Khi nhấn ra ngoài menu thì đóng lại
  document.addEventListener('click', function (event) {
    // Nếu click xuất phát từ flashsale (next, prev, slider) thì bỏ qua
    if (
      event.target.closest('.flashsale-slider') ||
      event.target.closest('.next') ||
      event.target.closest('.prev')
    ) {
      return;
    }

    // Nếu click không nằm trong sidebar và cũng không phải nút menu thì đóng
    if (!sidebarMenu.contains(event.target) && !hamburgerBtn.contains(event.target)) {
      sidebarMenu.classList.remove('active');
    }
  });
}
//----------------------

// Xử lý form tìm kiếm
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo tìm kiếm khi trang load
    if (typeof initializeSearch === 'function') {
        initializeSearch();
    }
});

// Thêm hàm để gọi sau khi đăng nhập thành công
function handleLoginSuccess() {
    // Khởi tạo lại tìm kiếm sau khi đăng nhập
    if (typeof initializeSearch === 'function') {
        setTimeout(initializeSearch, 100); // Đợi DOM cập nhật
    }
    
    // Các xử lý khác sau đăng nhập nếu có...
}
//flsale--
// flashsale.js
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".flashsale-slider");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const items = document.querySelectorAll(".flashsale-item");

    // Số lượng sản phẩm hiển thị mỗi lần
    const visibleCount = 5; 
    let index = 0;
    const itemWidth = items[0].offsetWidth +15; // 15px là khoảng cách gap trong CSS

    // Hàm trượt slider
    function updateSlider() {
        slider.style.transform = `translateX(-${index * itemWidth}px)`;
    }

    // Nút next
    nextBtn.addEventListener("click", () => {
        if (index < items.length - visibleCount) {
            index++;
        } else {
            index = 0; // Quay lại đầu
        }
        updateSlider();
    });

    // Nút prev
    prevBtn.addEventListener("click", () => {
        if (index > 0) {
            index--;
        } else {
            index = items.length - visibleCount;
        }
        updateSlider();
    });

    // Tự động trượt mỗi 1.5 giây
    let autoSlide = setInterval(() => {
        nextBtn.click();
    }, 3000);

    // Dừng khi rê chuột
    slider.addEventListener("mouseenter", () => clearInterval(autoSlide));
    slider.addEventListener("mouseleave", () => {
        autoSlide = setInterval(() => nextBtn.click(), 3000);
    });

    // Responsive: Cập nhật lại khi thay đổi kích thước
    window.addEventListener("resize", () => {
        updateSlider();
    });
});
// ======================
// PHÂN TRANG SẢN PHẨM BÁN CHẠY (CẬP NHẬT CHO .bcp1)
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".bcp1"); // dùng class mới
  const buttons = document.querySelectorAll(".page-btn");

  if (pages.length > 0 && buttons.length > 0) {
    // Ẩn tất cả các trang trừ trang 1
    pages.forEach((p, i) => {
      if (i !== 0) p.classList.add("d-none");
    });
    buttons[0].classList.add("active");

    // Lắng nghe click trên từng nút
    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const targetPage = this.getAttribute("data-page");

        // Ẩn tất cả các trang
        pages.forEach((p) => p.classList.add("d-none"));

        // Hiện trang được chọn
        const activePage = document.getElementById("page" + targetPage);
        if (activePage) activePage.classList.remove("d-none");

        // Cập nhật nút đang chọn
        buttons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        // Cuộn mượt lên đầu danh sách
        activePage.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
});

