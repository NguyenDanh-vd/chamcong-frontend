// File: src/utils/location.ts

// Định nghĩa kiểu dữ liệu trả về cho rõ ràng
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Lấy vị trí GPS hiện tại của người dùng bằng cách sử dụng Promise.
 * @returns {Promise<GeolocationPosition>} Một promise sẽ resolve với đối tượng vị trí.
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    // Kiểm tra xem trình duyệt có hỗ trợ Geolocation không
    if (!navigator.geolocation) {
      reject(new Error("Trình duyệt của bạn không hỗ trợ định vị."));
    } else {
      // Gọi API của trình duyệt
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, // Yêu cầu độ chính xác cao
        timeout: 15000,           // Hết hạn sau 15 giây
        maximumAge: 0,            // Không sử dụng vị trí cũ đã cache
      });
    }
  });
};