
export const parseFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        
        if (file.name.endsWith('.html') || file.type === 'text/html') {
          // Parse HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(result, 'text/html');
          
          // Remove scripts and styles
          const scripts = doc.getElementsByTagName('script');
          const styles = doc.getElementsByTagName('style');
          for (let i = scripts.length - 1; i >= 0; i--) scripts[i].remove();
          for (let i = styles.length - 1; i >= 0; i--) styles[i].remove();

          const cleanText = doc.body.textContent || "";
          resolve(cleanText.replace(/\s+/g, ' ').trim());
        } else {
          // Treat as Plain Text
          resolve(result.replace(/\s+/g, ' ').trim());
        }
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (err) => reject(err);
    
    // Read both as text
    reader.readAsText(file);
  });
};

export const parseHtmlFiles = async (files: File[]): Promise<string> => {
  const promises = files.map(parseFile);
  const contents = await Promise.all(promises);
  return contents.join('\n\n--- FICHIER SUIVANT ---\n\n');
};