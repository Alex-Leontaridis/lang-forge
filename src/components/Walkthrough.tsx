import React from 'react';
import { useWalkthrough } from '../contexts/WalkthroughContext';
import WalkthroughOverlay from './WalkthroughOverlay';

const Walkthrough: React.FC = () => {
  const {
    isActive,
    currentStep,
    currentWalkthrough,
    nextStep,
    previousStep,
    skipWalkthrough,
    completeWalkthrough
  } = useWalkthrough();

  if (!isActive || !currentWalkthrough) {
    return null;
  }

  const currentStepData = currentWalkthrough.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentWalkthrough.steps.length - 1;

  return (
    <WalkthroughOverlay
      step={currentStepData}
      onNext={nextStep}
      onPrevious={previousStep}
      onSkip={skipWalkthrough}
      onComplete={completeWalkthrough}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};

export default Walkthrough; 