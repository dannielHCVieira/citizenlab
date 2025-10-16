/**
 * Simple upload adapter for CKEditor 5
 *
 * For now, this uses base64 data URLs.
 * TODO: Replace with actual server upload when we identify the correct API endpoint
 */

interface LoaderType {
  file: Promise<File>;
}

export class UploadAdapter {
  private loader: LoaderType;

  constructor(loader: LoaderType) {
    this.loader = loader;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve({
            default: reader.result, // CKEditor expects { default: url }
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsDataURL(file);
    });

    // TODO: Replace with actual server upload:
    //
    // const formData = new FormData();
    // formData.append('image', file);
    //
    // const response = await fetch('/api/images', {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     // Add auth headers if needed
    //   },
    // });
    //
    // if (!response.ok) {
    //   throw new Error('Upload failed');
    // }
    //
    // const data = await response.json();
    // return {
    //   default: data.url,
    // };
  }

  abort() {
    // Handle abort if needed
  }
}
