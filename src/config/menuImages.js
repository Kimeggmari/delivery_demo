const menuImageOverrides = {
  // Example:
  // c1: "https://example.com/menu/c1.jpg",
};

export function getMenuImageSrc(menuId) {
  return menuImageOverrides[menuId] || [
    `/menu/${menuId}.jpg`,
    `/menu/${menuId}.png`,
    `/menu/${menuId}.webp`,
  ];
}
