/* ============================================================
   🎨 BoardBackgroundPopup.presets.js
   - Chứa danh sách preset ảnh và gradient cho chọn nền Board
   - Không có logic, chỉ export dữ liệu tĩnh
   ============================================================ */

/**
 * 🖼 Bộ preset ảnh Unsplash (16:9)
 *  → Tập trung vào texture, ánh sáng, background phù hợp UI tối
 */
export const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&h=450&fit=crop',
];

/**
 * 🌈 Bộ preset màu gradient
 *  → Kết hợp giữa tông xanh Blue Gradient Design System (#3b82f6 → #06b6d4)
 *    và các tông phụ cho cảm giác cao cấp, hiện đại
 */
export const GRADIENT_PRESETS = [
  { name: 'Blue Gradient', value: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Purple Horizon', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Mint Dream', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Golden Hour', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Aurora Mist', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { name: 'Lavender Sky', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { name: 'Cherry Blossom', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Forest Deep', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Nightfall', value: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
  { name: 'Sapphire Glow', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
];


export const FLAT_PRESETS = [
  '#1d4ed8', '#d97706', '#15803d', '#b91c1c',
  '#7e22ce', '#be185d', '#16a34a', '#06b6d4',
  '#94a3b8',
];


