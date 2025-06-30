import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';
import { useWalkthrough, WalkthroughStep } from '../contexts/WalkthroughContext';

interface WalkthroughOverlayProps {
  step: WalkthroughStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  isFirstStep,
  isLastStep
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find and highlight the target element
  useEffect(() => {
    const findTarget = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        // Calculate overlay position
        const rect = element.getBoundingClientRect();
        const padding = 8;
        setOverlayPosition({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + (padding * 2),
          height: rect.height + (padding * 2)
        });

        // Add highlight class
        element.classList.add('walkthrough-highlight');
        
        // Scroll element into view if needed
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });

        // Calculate tooltip position based on step position
        setTimeout(() => {
          calculateTooltipPosition(element, step.position);
        }, 100);
      }
    };

    // Try to find target immediately, then retry after a short delay
    findTarget();
    const timer = setTimeout(findTarget, 500);

    return () => {
      clearTimeout(timer);
      if (targetElement) {
        targetElement.classList.remove('walkthrough-highlight');
      }
    };
  }, [step.target, step.position]);

  // Show overlay after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const calculateTooltipPosition = (element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 20;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - padding;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - padding;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + padding;
        break;
      case 'center':
      default:
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 20) left = 20;
    if (left + tooltipRect.width > viewportWidth - 20) {
      left = viewportWidth - tooltipRect.width - 20;
    }
    if (top < 20) top = 20;
    if (top + tooltipRect.height > viewportHeight - 20) {
      top = viewportHeight - tooltipRect.height - 20;
    }

    setTooltipPosition({ top, left });
  };

  const handleAction = () => {
    if (!targetElement) return;

    switch (step.action) {
      case 'click':
        targetElement.click();
        break;
      case 'type':
        if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) {
          targetElement.focus();
          targetElement.value = step.actionValue || '';
          targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
      case 'scroll':
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
    }

    // Auto-advance for non-wait actions
    if (step.action !== 'wait') {
      setTimeout(onNext, 500);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={step.action === 'click' ? handleAction : undefined}
      />
      
      {/* Highlight overlay */}
      {targetElement && (
        <div
          className="fixed z-50 border-2 border-blue-500 bg-blue-500/10 rounded-lg transition-all duration-300"
          style={{
            top: overlayPosition.top,
            left: overlayPosition.left,
            width: overlayPosition.width,
            height: overlayPosition.height
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 mb-4">{step.description}</p>
          
          {/* Action button */}
          {step.action && step.actionText && (
            <button
              onClick={handleAction}
              className="w-full mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} />
              {step.actionText}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              disabled={isFirstStep}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-500">
              {step.id} • {isLastStep ? 'Final step' : 'Click next to continue'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-sm"
            >
              <SkipForward size={16} />
              Skip
            </button>
            <button
              onClick={isLastStep ? onComplete : onNext}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalkthroughOverlay; 