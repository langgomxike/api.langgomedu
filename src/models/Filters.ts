export default class Filters {
      minPrice?: number;
      maxPrice?: number;
      province?: string; // Địa chỉ - tỉnh
      district?: string; // Địa chỉ - quận
      ward?: string; // Địa chỉ - phường
      major?: string; // Ngành học
      classLevelId?: string;
      isOnline?: boolean; // Hình thức học online hay offline
      maxLearners?: number;
      startedAtMin?: number; // Ngày bắt đầu (từ)
      endedAtMax?: number; // Ngày kết thúc (đến)
      genders?: string;
}