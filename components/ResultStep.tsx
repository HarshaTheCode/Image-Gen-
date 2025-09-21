import React, { useState } from 'react';
import { ImageState } from '../types';
import { DownloadIcon, RefreshIcon } from './Icons';

interface ResultStepProps {
  referenceImage: ImageState | null;
  resultImage: string | null;
  onReset: () => void;
}

const ResultStep: React.FC<ResultStepProps> = ({ referenceImage, resultImage, onReset }) => {
  const [showResult, setShowResult] = useState(true);

  const getDisplayedImage = () => {
    if (showResult && resultImage) {
      return { src: resultImage, alt: 'Final result image', label: 'After' };
    }
    if (referenceImage) {
      return { src: referenceImage.previewUrl, alt: 'Original reference image', label: 'Before' };
    }
    return { src: '', alt: 'Placeholder', label: '' };
  };

  const { src, alt, label } = getDisplayedImage();
  const imageName = referenceImage ? `recreated_${referenceImage.file.name}` : 'recreated_image.png';

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center text-brand-primary mb-6">Your Portrait is Ready!</h2>
      
      <div className="w-full max-w-2xl bg-brand-surface p-4 rounded-xl border border-brand-secondary shadow-lg">
        <div className="relative aspect-square w-full">
            <img 
                src={src} 
                alt={alt} 
                className="w-full h-full object-contain rounded-lg" 
            />
            <span className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 text-sm font-bold rounded">
                {label}
            </span>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center space-x-4">
        <span className="text-brand-subtle">Before</span>
        <label htmlFor="toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              id="toggle" 
              type="checkbox" 
              className="sr-only" 
              checked={showResult}
              onChange={() => setShowResult(!showResult)}
            />
            <div className="block bg-brand-secondary w-14 h-8 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-brand-primary w-6 h-6 rounded-full transition-transform ${showResult ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
        <span className="text-brand-primary font-semibold">After</span>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <a 
          href={resultImage || ''}
          download={imageName}
          className="flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-brand-primary text-brand-secondary font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <DownloadIcon className="h-6 w-6 mr-2" />
          Download
        </a>
        <button 
          onClick={onReset}
          className="flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-brand-secondary text-brand-text font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:bg-brand-surface hover:scale-105"
        >
          <RefreshIcon className="h-6 w-6 mr-2" />
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultStep;