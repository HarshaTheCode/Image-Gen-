import React, { useState, useEffect, useCallback } from 'react';
import { ImageState, AspectRatio } from '../types';
import ImageUploader from './ImageUploader';
import { fileToBase64 } from '../utils/fileUtils';
import { CheckIcon, WarningIcon, PortraitIcon, SquareIcon, LandscapeIcon } from './Icons';

interface UploadStepProps {
  onStartGeneration: (referenceImage: ImageState, userImage: ImageState, aspectRatio: AspectRatio) => void;
  initialError: string | null;
}

const UploadStep: React.FC<UploadStepProps> = ({ onStartGeneration, initialError }) => {
  const [referenceImage, setReferenceImage] = useState<ImageState | null>(null);
  const [userImage, setUserImage] = useState<ImageState | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [consentChecked, setConsentChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  const handleReferenceUpload = useCallback(async (file: File) => {
    try {
      const { base64, previewUrl } = await fileToBase64(file);
      setReferenceImage({ file, base64, previewUrl });
       setError(null);
    } catch (err) {
      setError("Could not process reference image.");
    }
  }, []);

  const handleUserUpload = useCallback(async (file: File) => {
    try {
      const { base64, previewUrl } = await fileToBase64(file);
      setUserImage({ file, base64, previewUrl });
       setError(null);
    } catch (err) {
      setError("Could not process user image.");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceImage && userImage && consentChecked && ageChecked) {
      onStartGeneration(referenceImage, userImage, aspectRatio);
    } else {
      setError("Please upload both images and agree to the terms.");
    }
  };

  const isReady = !!referenceImage && !!userImage && consentChecked && ageChecked;

  const aspectRatioOptions: { value: AspectRatio; label: string; icon: React.FC<{className?: string}> }[] = [
    { value: '3:4', label: 'Portrait', icon: PortraitIcon },
    { value: '1:1', label: 'Square', icon: SquareIcon },
    { value: '4:3', label: 'Landscape', icon: LandscapeIcon },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUploader 
            title="Reference Image"
            description="The photo with the desired style, pose, and scene."
            onFileUpload={handleReferenceUpload}
          />
          <ImageUploader 
            title="Your Photo"
            description="A clear photo of you to be placed in the scene."
            onFileUpload={handleUserUpload}
          />
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-semibold text-brand-text text-center mb-4">Select Aspect Ratio</h3>
            <div className="flex justify-center items-center gap-4">
                {aspectRatioOptions.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setAspectRatio(value)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 w-28 h-28
                            ${aspectRatio === value 
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                                : 'bg-brand-surface border-brand-secondary hover:border-brand-subtle text-brand-subtle'
                            }`}
                        aria-pressed={aspectRatio === value}
                    >
                        <Icon className="h-8 w-8 mb-2" />
                        <span className="font-semibold">{label}</span>
                    </button>
                ))}
            </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center">
            <WarningIcon className="h-5 w-5 mr-3" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 bg-brand-surface p-6 rounded-lg border border-brand-secondary">
          <h3 className="text-lg font-semibold text-brand-text">Terms of Service</h3>
          <div className="space-y-4 mt-4">
            <label className="flex items-start cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 h-5 w-5 rounded bg-brand-secondary border-brand-subtle text-brand-primary focus:ring-brand-primary"
                checked={consentChecked}
                onChange={() => setConsentChecked(!consentChecked)}
              />
              <span className="ml-3 text-brand-subtle">
                I own the rights to use these images and consent to this service producing a new creative image.
              </span>
            </label>
            <label className="flex items-start cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 h-5 w-5 rounded bg-brand-secondary border-brand-subtle text-brand-primary focus:ring-brand-primary"
                checked={ageChecked}
                onChange={() => setAgeChecked(!ageChecked)}
              />
              <span className="ml-3 text-brand-subtle">
                I confirm I am 18 years or older. I understand images may be retained temporarily and can be deleted.
              </span>
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button 
            type="submit"
            disabled={!isReady}
            className="flex items-center justify-center w-full max-w-xs px-8 py-4 bg-brand-primary text-brand-secondary font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            <CheckIcon className="h-6 w-6 mr-2" />
            Generate Your Image
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadStep;
