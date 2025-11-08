// ======= TẢI THÔNG TIN NGƯỜI DÙNG =======
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Bạn cần đăng nhập trước!");
    window.location.href = "../main.html";
    return;
  }

  // Điền thông tin người dùng
  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;

  // Lắng nghe sự kiện lưu form
  const form = document.getElementById("profileForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    updateProfile();
  });

  // Hiển thị danh sách đơn hàng
  loadOrders(user.email);
}

// ======= CẬP NHẬT THÔNG TIN =======
function updateProfile() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const name = document.getElementById("name").value.trim();
  const newPassword = document.getElementById("password").value.trim();

  users = users.map(u => {
    if (u.email === currentUser.email) {
      u.name = name;
      if (newPassword) u.password = newPassword;
    }
    return u;
  });

  currentUser.name = name;
  if (newPassword) currentUser.password = newPassword;

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  alert("Cập nhật thông tin thành công!");
  document.getElementById("password").value = "";
}
// ======= HIỂN THỊ DANH SÁCH ĐƠN HÀNG =======
function loadOrders(email) {
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const userOrders = allOrders.filter(o => o.email === email);
  const tableBody = document.getElementById("orderTableBody");

  tableBody.innerHTML = "";

  if (userOrders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-muted text-center">Bạn chưa có đơn hàng nào.</td></tr>`;
    return;
  }

  let totalAmount = 0;

  userOrders.forEach(order => {
    totalAmount += order.total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.product}</td>
      <td>${order.quantity}</td>
      <td>${order.total.toLocaleString("vi-VN")}₫</td>
      <td><span class="badge bg-${order.status === "Đang giao" ? "warning" : "success"}">${order.status}</span></td>
      <td>
        <button class="btn btn-danger btn-sm delete-order" data-id="${order.id}">
          Xóa
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // ====== THÊM HÀNG TỔNG TIỀN ======
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
    <td colspan="3" class="fw-bold text-danger">${totalAmount.toLocaleString("vi-VN")}₫</td>
  `;
  tableBody.appendChild(totalRow);

  // ====== GÁN SỰ KIỆN XÓA ======
  const deleteButtons = document.querySelectorAll(".delete-order");
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id");
      deleteOrder(orderId);
    });
  });
}


// ======= XÓA ĐƠN HÀNG =======
function deleteOrder(orderId) {
  if (!confirm("Bạn có chắc muốn xóa đơn hàng này không?")) return;

  let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Ép kiểu để chắc chắn so khớp ID (tránh lỗi số/chuỗi)
  allOrders = allOrders.filter(o => String(o.id) !== String(orderId));

  // Cập nhật lại localStorage
  if (allOrders.length === 0) {
    localStorage.removeItem("orders");
  } else {
    localStorage.setItem("orders", JSON.stringify(allOrders));
  }

  // Render lại danh sách đơn hàng sau khi xóa
  loadOrders(currentUser.email);

  alert("✅ Đã xóa đơn hàng thành công!");
}


// ======= QUAY LẠI =======
function goBack() {
  window.location.href = "main.html";
}

// ======= ĐĂNG XUẤT =======
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "main.html";
}
