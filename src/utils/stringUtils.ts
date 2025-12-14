export const removeAccents = (str: string): string => {
  if (!str) return "";
  
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/đ/g, "d")              // Chuyển đ -> d
    .replace(/Đ/g, "D");             // Chuyển Đ -> D
};