import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './Icons';

const loadingMessages = [
  "Analyzing reference image style...",
  "Writing a detailed art brief for the AI...",
  "Preparing the digital canvas...",
  "Integrating your likeness into the scene...",
  "Matching lighting and shadows...",
  "Rendering the final portrait...",
  "Applying finishing touches...",
];

const ProcessingStep: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < loadingMessages.length - 1) {
        index++;
        setMessage(loadingMessages[index]);
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <SpinnerIcon className="h-16 w-16 text-brand-primary" />
      <h2 className="mt-8 text-3xl font-bold text-brand-text">
        AI is Recreating Your Portrait
      </h2>
      <p className="mt-4 text-lg text-brand-subtle transition-opacity duration-500 ease-in-out">
        {message}
      </p>
    </div>
  );
};

export default ProcessingStep;