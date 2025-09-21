
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, CheckCircleIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  description: string;
  onFileUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFileName(file.name);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-brand-surface p-6 rounded-xl border-2 border-dashed border-brand-secondary flex flex-col justify-center items-center h-96 transition-all duration-300">
      <h3 className="text-xl font-bold text-brand-text mb-1">{title}</h3>
      <p className="text-brand-subtle text-center mb-4">{description}</p>
      
      <div 
        className={`w-full h-full flex flex-col justify-center items-center rounded-lg cursor-pointer ${isDragging ? 'bg-brand-primary/10 border-brand-primary' : 'border-transparent'} border-2 border-dashed`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onBrowseClick}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          aria-label={`Upload ${title}`}
        />
        {imagePreview ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 p-2 rounded-md text-white text-xs truncate">
              <CheckCircleIcon className="h-4 w-4 inline mr-1 text-brand-primary" />
              {fileName}
            </div>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <UploadIcon className="h-12 w-12 mx-auto text-brand-subtle" />
            <p className="mt-2 text-brand-text font-semibold">
              <span className="text-brand-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-brand-subtle mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
