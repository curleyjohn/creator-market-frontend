import { useState } from "react";
import { buyCreator } from "../lib/trading";
import TransactionConfirmation from "./TransactionConfirmation";

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
        <div className="bg-[var(--bg)] p-6 rounded-xl w-full max-w-sm border border-accent">
          <h2 className="text-xl font-bold text-[var(--text)] mb-4">
            Buy {creator.name}
          </h2>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full p-2 border rounded mb-4 text-black"
          />

          {error && (
            <p className="text-red-500 text-sm mb-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1 rounded border text-theme border-accent hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="px-4 py-1 rounded bg-accent text-accent-text font-semibold hover:bg-accent/90 transition-colors"
            >
              {loading ? "Buying..." : "Confirm Buy"}
            </button>
          </div>
        </div>
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
