/**
 * FileHandler - Import/export file operations
 *
 * Patterns 6, 7: FileReader for import, Blob + anchor download for export
 */
export class FileHandler {
  /**
   * Import a file and read its contents as text
   * @param file File to import
   * @returns Promise resolving to file content as UTF-8 text
   */
  static async importFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Export content to a markdown file
   * @param content Content to export
   * @param filename Optional filename (default: document-{timestamp}.md)
   * @returns Object with filename and size in bytes
   */
  static exportFile(content: string, filename?: string): { filename: string; size: number } {
    // Generate default filename if not provided
    const finalFilename = filename || `document-${Date.now()}.md`;

    // Create blob with markdown MIME type
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const size = blob.size;

    // Create temporary download link
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFilename;

    // Trigger download
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    return { filename: finalFilename, size };
  }
}
