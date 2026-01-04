// Predefined color palette for tags
export const TAG_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
];

// Convert hex color to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Calculate color distance using Euclidean distance in RGB space
export const colorDistance = (hex1: string, hex2: string): number => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );
};

// Minimum color distance threshold (0-441, higher = more different)
export const MIN_COLOR_DISTANCE = 50;

// Get available colors that are far enough from existing colors
export const getAvailableColors = (
  existingColors: (string | undefined)[],
  usedInCurrentOperation: Set<string> = new Set()
): string[] => {
  const allUsedColors = [
    ...existingColors.filter(Boolean) as string[],
    ...Array.from(usedInCurrentOperation),
  ];

  return TAG_COLORS.filter(candidateColor => {
    return !allUsedColors.some(usedColor => {
      const distance = colorDistance(candidateColor, usedColor);
      return distance < MIN_COLOR_DISTANCE;
    });
  });
};

// Get the first unused color, or a random one if none available
export const getUnusedColor = (
  existingColors: (string | undefined)[],
  usedInCurrentOperation: Set<string> = new Set()
): string => {
  const availableColors = getAvailableColors(existingColors, usedInCurrentOperation);
  return availableColors[0] || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
};

// Check if a color is too close to existing colors
export const isColorTooClose = (
  color: string,
  existingColors: (string | undefined)[]
): boolean => {
  const usedColors = existingColors.filter(Boolean) as string[];
  return usedColors.some(usedColor => {
    const distance = colorDistance(color, usedColor);
    return distance < MIN_COLOR_DISTANCE;
  });
};
