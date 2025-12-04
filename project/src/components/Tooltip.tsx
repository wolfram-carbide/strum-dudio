import { ReactNode, useState } from 'react';

type TooltipProps = {
  children: ReactNode;
  text: string;
};

export function Tooltip({ children, text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-navy-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-navy-900" />
          </div>
        </div>
      )}
    </div>
  );
}
