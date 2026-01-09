/**
 * Enable dragging images as files (not just URLs)
 * This allows images to be dragged from the browser to other applications
 */
export const handleImageDragStart = async (
  e: React.DragEvent<HTMLImageElement>,
  imageUrl: string,
  filename?: string
) => {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Determine filename from URL if not provided
    const finalFilename = filename || getFilenameFromUrl(imageUrl);

    // Set drag data with the DownloadURL format
    // This allows the browser to download the file when dropped
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('DownloadURL', `${blob.type}:${finalFilename}:${imageUrl}`);
  } catch (error) {
    console.error('Failed to prepare image for dragging:', error);
    // Fallback: just set the URL
    e.dataTransfer.setData('text/uri-list', imageUrl);
    e.dataTransfer.setData('text/plain', imageUrl);
  }
};

/**
 * Extract filename from URL
 */
const getFilenameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1] || 'image.webp';
  } catch {
    return 'image.webp';
  }
};
