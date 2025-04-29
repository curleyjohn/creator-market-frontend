import { useState } from "react";
import { sellCreator } from "../lib/trading";
import TransactionConfirmation from "./TransactionConfirmation";
import { Transition } from "@headlessui/react";
import { BanknotesIcon } from "@heroicons/react/24/outline";

const SellModal = ({ userId, creator, ownedQuantity, onClose }: any) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSell = async () => {
    setLoading(true);
    try {
      await sellCreator({
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

  const totalValue = quantity * creator.price;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
        <Transition
          show={true}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="bg-[var(--bg)] p-8 rounded-2xl w-full max-w-md border border-accent/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  Sell {creator.name}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Current price: ${creator.price.toFixed(2)} · Owned: {ownedQuantity}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Quantity
                </label>
                <div className="relative">
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={ownedQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] border-accent/20 focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-accent/10">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Total Value</span>
                  <span className="text-lg font-semibold text-[var(--text)]">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-500 text-sm">
                    {error}
                  </p>
                </div>
              </Transition>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg border text-[var(--text)] border-accent/20 hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSell}
                  disabled={loading || quantity > ownedQuantity}
                  className="px-5 py-2.5 rounded-lg bg-accent text-accent-text font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">Processing</span>
                      <div className="w-4 h-4 border-2 border-accent-text border-t-transparent rounded-full animate-spin"></div>
                    </span>
                  ) : (
                    "Confirm Sale"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <TransactionConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        type="sell"
        creatorName={creator.name}
        quantity={quantity}
      />
    </>
  );
};

export default SellModal;
