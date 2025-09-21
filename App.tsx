import React, { useState, useCallback } from 'react';
import { AppStep, ImageState, AspectRatio } from './types';
import UploadStep from './components/UploadStep';
import ProcessingStep from './components/ProcessingStep';
import ResultStep from './components/ResultStep';
import Header from './components/Header';
import { generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [referenceImage, setReferenceImage] = useState<ImageState | null>(null);
  const [userImage, setUserImage] = useState<ImageState | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartGeneration = useCallback(async (refImg: ImageState, usrImg: ImageState, aspectRatio: AspectRatio) => {
    setReferenceImage(refImg);
    setUserImage(usrImg);
    setStep(AppStep.PROCESSING);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateImage(refImg, usrImg, aspectRatio);
      if (result) {
        setResultImage(`data:image/png;base64,${result}`);
        setStep(AppStep.RESULT);
      } else {
        throw new Error('The AI could not process the images. Please try different photos.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError('Failed to generate image. ' + errorMessage);
      setStep(AppStep.UPLOAD);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStep(AppStep.UPLOAD);
    setReferenceImage(null);
    setUserImage(null);
    setResultImage(null);
    setError(null);
  }, []);

  const renderStep = () => {
    switch (step) {
      case AppStep.PROCESSING:
        return <ProcessingStep />;
      case AppStep.RESULT:
        return (
          <ResultStep
            referenceImage={referenceImage}
            resultImage={resultImage}
            onReset={handleReset}
          />
        );
      case AppStep.UPLOAD:
      default:
        return <UploadStep onStartGeneration={handleStartGeneration} initialError={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-6xl mt-8">
        {renderStep()}
      </main>
      <footer className="w-full max-w-6xl text-center mt-12 pb-4">
        <p className="text-brand-subtle text-sm">
            Disclaimer: This AI tool is for creative exploration. Please use it responsibly.
        </p>
      </footer>
    </div>
  );
};

export default App;
