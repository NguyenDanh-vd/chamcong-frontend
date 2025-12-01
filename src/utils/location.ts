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
        enableHighAccuracy: true, 
        timeout: 15000,          
        maximumAge: 0,            
      });
    }
  });
};