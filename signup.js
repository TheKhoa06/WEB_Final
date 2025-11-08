// ======= GIẢ LẬP DỮ LIỆU NGƯỜI DÙNG =======
let users = JSON.parse(localStorage.getItem("users")) || [];

// Helper: show a small toast message (auto-hide after duration ms)
function showToast(message, duration = 1200) {
  try {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'site-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    // trigger show
    toast.classList.add('show');
    // remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  } catch (e) {
    // ignore if DOM not ready or errors
    console && console.debug && console.debug('showToast error', e);
  }
}

// ======= XỬ LÝ ĐĂNG KÝ =======
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput = this.querySelector('input[placeholder="Name"]');
    const emailInput = this.querySelector('input[placeholder="Email"]');
    const passwordInput = this.querySelector('input[placeholder="Password"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Xóa thông báo lỗi cũ nếu có
    const oldError = this.querySelector(".email-error");
    if (oldError) oldError.remove();

    // Kiểm tra định dạng email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      const errorMsg = document.createElement("small");
      errorMsg.className = "text-danger email-error";
      errorMsg.innerText = "Vui lòng nhập đúng định dạng email (ví dụ: name@gmail.com)";
      emailInput.insertAdjacentElement("afterend", errorMsg);
      return;
    }

    // Kiểm tra email trùng
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find((u) => u.email === email)) {
      const errorMsg = document.createElement("small");
      errorMsg.className = "text-danger email-error";
      errorMsg.innerText = "Email này đã được đăng ký!";
      emailInput.insertAdjacentElement("afterend", errorMsg);
      return;
    }

    // Lưu người dùng mới
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    // Tự động đăng nhập sau khi đăng ký thay vì hiện alert
    try {
      localStorage.setItem("currentUser", JSON.stringify(newUser));
    } catch (e) {}

    // Reset form
    try { this.reset(); } catch (e) {}

    // Cập nhật navbar nếu cần
    try { updateNavbar(); } catch (e) {}

    // Gửi event để các script khác (ví dụ timkiem.js) khởi tạo lại listener
    try { window.dispatchEvent(new Event('userLoggedIn')); } catch (e) {}

  // Ẩn modal rồi hiển thị toast, sau đó chuyển về trang chủ
  try { $("#Sign-up").modal("hide"); } catch (e) {}
  try { showToast('Đăng ký thành công', 1200); } catch (e) {}
  setTimeout(function() { window.location.href = 'main.html'; }, 1000);
  });
}


// ======= XỬ LÝ ĐĂNG NHẬP =======
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = this.querySelector('input[placeholder="Email"]').value.trim();
    const password = this.querySelector('input[placeholder="Password"]').value.trim();

    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      // Lưu trạng thái người dùng
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Cập nhật navbar (nếu cần cho phía client)
      try { updateNavbar(); } catch (e) { /* ignore */ }

      // Phát event để các script khác (ví dụ timkiem.js) có thể khởi tạo lại listener nếu cần
      try { window.dispatchEvent(new Event('userLoggedIn')); } catch (e) { }

  // Ẩn modal rồi hiển thị toast, sau đó chuyển hướng về trang chủ
  try { $("#loginmodal").modal("hide"); } catch (e) { }
  try { showToast('Đăng nhập thành công', 1200); } catch (e) {}
  setTimeout(function() { window.location.href = 'main.html'; }, 1000);
    } else {
      // Hiển thị lỗi ngay dưới input
      const oldError = this.querySelector(".login-error");
      if (oldError) oldError.remove();

      const errorMsg = document.createElement("small");
      errorMsg.className = "text-danger login-error d-block mt-1";
      errorMsg.innerText = "Sai email hoặc mật khẩu!";
      this.querySelector('input[placeholder="Password"]').insertAdjacentElement("afterend", errorMsg);
    }
  });
}


// ======= CẬP NHẬT GIAO DIỆN SAU KHI ĐĂNG NHẬP =======
function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const navbar = document.querySelector(".navbar");

  if (user && navbar) {
    newFunction();
  }

    function newFunction() {
        navbar.innerHTML = `
      <div class="container-fluid">
        <!-- Logo -->
        <a href="main.html" class="navbar-brand d-flex align-items-center text-white text-decoration-none">
          <!-- Logo desktop -->
          <img src="/IMG/logo1.png" class="me-2 d-none d-md-inline" height="80" alt="Logo1">
          <img src="/IMG/logo2.png" class="me-2 d-none d-md-inline" height="80" alt="Logo2">
          <!-- Logo mobile -->
          <img src="/IMG/Logo3.png" class="me-inline d-md-none" height="50" alt="Logo mobile">
        </a>

        <!-- Thanh tìm kiếm -->
        <form class="search d-flex mx-auto my-2 my-md-0 justify-content-center">
          <input class="form-control me-2 rounded-pill " type="search" placeholder="Bạn cần mua gì?" aria-label="Search">
        </form>

        <!-- Nút chuyển trang / đăng xuất -->
        <div class="d-flex align-items-center">
          <button class="btn btn-light me-2 m-2" onclick="goProfile()">Profile</button>
        </div>
      </div>
      <div class="marquee-wrapper w-100 mt-2">
          <p class="marquee-text">
              <span class="branch">   Cơ sở 1 - Đống Đa, Hà Nội | Số 10 Ngõ 117 Thái Hà, Hà Nội | Điện thoại: 0969 123 555 | Email: example1@gmail.com</span>
              <span class="branch">   Cơ sở 2 - Thanh Xuân, Hà Nội | Số 20 Ngõ 15 Nguyễn Trãi, Thanh Xuân, Hà Nội | Điện thoại: 0969 123 666 | Email: example2@gmail.com</span>
              <span class="branch">   Cơ sở 3 - Cầu Giấy, Hà Nội | Số 30 Ngõ 50 Trần Thái Tông, Cầu Giấy, Hà Nội | Điện thoại: 0969 123 777 | Email: example3@gmail.com</span>
              <span class="branch">   Cơ sở 4 - Hai Bà Trưng, Hà Nội | Số 40 Ngõ 100 Bạch Mai, Hai Bà Trưng, Hà Nội | Điện thoại: 0969 123 888 | Email: example4@gmail.com</span>
          </p>
      </div>
    `;
    }
}
// ======= CHỈ CHO PHÉP MỞ 1 MODAL TẠI MỘT THỜI ĐIỂM =======
$("#loginmodal").on("show.bs.modal", function () {
  $("#Sign-up").modal("hide");
});

$("#Sign-up").on("show.bs.modal", function () {
  $("#loginmodal").modal("hide");
});

// ======= CHUYỂN SANG TRANG PROFILE =======
function goProfile() {
  window.location.href = "profile.html";
}

// ======= ĐĂNG XUẤT =======
function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

// ======= KIỂM TRA TỰ ĐỘNG KHI TẢI TRANG =======
window.onload = updateNavbar;
