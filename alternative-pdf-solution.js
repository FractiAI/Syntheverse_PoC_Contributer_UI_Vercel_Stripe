// Alternative: Simple filename-based PDF extraction
// This avoids all build issues and provides basic functionality

export async function extractTextWithFilename(file) {
  // Extract text from filename only (no PDF parsing)
  const filename = file.name.replace(/\.pdf$/i, '')
  const cleanText = filename
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
    .trim()

  return {
    text: cleanText,
    pages: 1,
    method: 'filename-extraction'
  }
}

// For more advanced extraction without complex dependencies,
// consider using a cloud service or simpler parsing approach
