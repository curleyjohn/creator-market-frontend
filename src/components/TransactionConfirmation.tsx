import { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

interface TransactionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'buy' | 'sell';
  creatorName: string;
  quantity: number;
}

const TransactionConfirmation = ({
  isOpen,
  onClose,
  type,
  creatorName,
  quantity,
}: TransactionConfirmationProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setShow(true);
      timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for fade out animation to complete
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Transition
        show={show}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 translate-y-4"
        enterTo="transform opacity-100 translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 translate-y-0"
        leaveTo="transform opacity-0 translate-y-4"
      >
        <div className="bg-[var(--bg)] p-4 rounded-lg shadow-lg border border-accent flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[var(--text)]">
              {type === 'buy' ? 'Purchase Successful' : 'Sale Successful'}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {type === 'buy' ? 'Bought' : 'Sold'} {quantity} share{quantity !== 1 ? 's' : ''} of {creatorName}
            </p>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default TransactionConfirmation; 