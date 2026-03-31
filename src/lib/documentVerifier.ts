export function verifyDocument(fileName: string): Promise<{ pass: boolean; error?: string }> {
  return new Promise((resolve) => {
    const delay = 3000 + Math.random() * 2000 // 3-5 seconds
    setTimeout(() => {
      const lower = fileName.toLowerCase()
      if (lower.includes('issue-type')) {
        resolve({ pass: false, error: "This doesn't appear to be the correct document type." })
      } else if (lower.includes('issue-time')) {
        resolve({ pass: false, error: "This document doesn't appear to cover the required time period." })
      } else if (lower.includes('issue-association')) {
        resolve({ pass: false, error: "This document doesn't appear to be associated with your business or ownership." })
      } else {
        resolve({ pass: true })
      }
    }, delay)
  })
}
