'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

// images: [{ url, publicId }]
export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function fileToDataUri(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(fileList) {
    setError('');
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(fileList)) {
        const dataUri = await fileToDataUri(file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: dataUri }),
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploaded.push({ url: data.url, publicId: data.publicId });
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error(err);
      setError('One or more images failed to upload. Try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove(publicId) {
    onChange(images.filter((img) => img.publicId !== publicId));
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });
    } catch (err) {
      console.error('Failed to delete from Cloudinary:', err);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.publicId} className="group relative aspect-square overflow-hidden rounded-xl bg-navy-50">
            <Image src={img.url} alt="Product" fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img.publicId)}
              className="absolute right-1.5 top-1.5 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-navy-200 text-xs font-semibold text-navy-400 hover:border-electric hover:text-electric">
          {uploading ? 'Uploading...' : '+ Add Image'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
