import { useState } from "react";
import { buyCreator } from "../lib/trading";
import TransactionConfirmation from "./TransactionConfirmation";
import { Transition } from "@headlessui/react";

const BuyModal = ({ userId, creator, onClose }: any) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    try {
      await buyCreator({
        userId,
        creator,
        quantity: Number(quantity),
      });
      setShowConfirmation(true);
      // Close modal after a short delay to allow toast to appear
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <Transition
          show={true}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="bg-[var(--bg)] p-6 rounded-xl w-full max-w-sm border border-accent">
            <h2 className="text-xl font-bold text-[var(--text)] mb-4">
              Buy {creator.name}
            </h2>

            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded mb-4 text-black focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                disabled={loading}
              />

            </div>

            <Transition
              show={!!error}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-1"
            >
              <p className="text-red-500 text-sm mb-2">
                {error}
              </p>
            </Transition>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-1 rounded border text-theme border-accent hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={loading}
                className="px-4 py-1 rounded bg-accent text-accent-text font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">Processing</span>
                    <div className="w-4 h-4 border-2 border-accent-text border-t-transparent rounded-full animate-spin"></div>
                  </span>
                ) : (
                  "Confirm Buy"
                )}
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <TransactionConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        type="buy"
        creatorName={creator.name}
        quantity={quantity}
      />
    </>
  );
};

export default BuyModal;
