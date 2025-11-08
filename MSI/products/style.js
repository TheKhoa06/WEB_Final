
// Chuyển ảnh thumbnail thành ảnh chính khi click

document.addEventListener('DOMContentLoaded', function () {
  // Tham chiếu tới ảnh lớn và các thumbnail
  const mainImg = document.querySelector('.product-main-img');
  const thumbs = Array.from(document.querySelectorAll('.product-thumbs .thumb'));

  if (mainImg && thumbs.length) {
    thumbs.forEach(thumb => {
      const img = thumb.querySelector('img');
      thumb.style.cursor = 'pointer';

      // Khi click vào thumbnail (hoặc container) -> đổi src ảnh chính và cập nhật trạng thái active
      thumb.addEventListener('click', function () {
        const large = img?.dataset?.large || img?.src;
        if (large) {
          mainImg.src = large;
        }
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });

      // Click trực tiếp vào img cũng kích hoạt sự kiện trên container
      img?.addEventListener('click', function (e) {
        e.stopPropagation();
        thumb.click();
      });
    });
  }
});

// Xử lý nút 'MUA NGAY' (cẩn trọng nếu có nhiều nút, chỉ lấy nút đầu tiên trong trang này)
const buyBtn = document.querySelector('.btn-primary');
if (buyBtn) {
  buyBtn.addEventListener('click', () => {
    // Thông báo đơn giản bằng alert; thay bằng modal hoặc form nếu cần
    alert('🎉 Cảm ơn bạn đã chọn sản phẩm! Chúng tôi sẽ liên hệ để xác nhận đơn hàng.');
  });
}

// Tính giá sau khuyến mãi và hiển thị (chú ý: nếu HTML có phần tử khác chứa giá cũ, thay đổi này sẽ ghi đè toàn bộ nội dung trong .price-new)
(function updatePrice() {
  const priceEl = document.querySelector('.price-new');
  if (!priceEl) return;
  // Định dạng số theo locale Việt Nam và thêm ký hiệu đồng
  priceEl.textContent = finalPrice.toLocaleString('vi-VN') + '₫';
})();
document.addEventListener('DOMContentLoaded', function() {
  // Xử lý giá sản phẩm
  const priceNew = document.querySelector('.price-new');
  const priceOld = document.querySelector('.price-old');

  if (priceNew && priceOld) {
    // Lấy giá trị từ HTML, không tính toán lại
    const newPrice = priceNew.textContent;
    const oldPrice = priceOld.textContent;

    // Chỉ format lại định dạng số
    priceNew.textContent = formatPrice(parseFloat(newPrice.replace(/[^\d]/g, '')));
    priceOld.textContent = formatPrice(parseFloat(oldPrice.replace(/[^\d]/g, '')));
  }

  // Hàm format giá tiền VND
  function formatPrice(number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency', 
      currency: 'VND'
    }).format(number).replace('VND', '₫');
  }
});
