export const PRODUCT_CATEGORIES = [
  'Books',
  'Icons',
  'Prayer Items',
  'Apparel',
  'Accessories',
  'Candles',
  'Music',
  'Teaching Materials',
  'Other',
];

export const formatETB = (amount: number) =>
  new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2,
  }).format(amount);

export const imageFileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
