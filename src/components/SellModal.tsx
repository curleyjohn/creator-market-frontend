import { useState } from "react";
import { sellCreator } from "../lib/trading";

const SellModal = ({ userId, creator, ownedQuantity, onClose }: any) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSell = async () => {
    if (quantity > ownedQuantity) {
      setError("You don't own that many");
      return;
    }

    setLoading(true);
    try {
      await sellCreator({
        userId,
        creator,
        quantity: Number(quantity),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[var(--bg)] p-6 rounded-xl w-full max-w-sm border border-accent">
        <h2 className="text-xl font-bold text-[var(--text)] mb-4">
          Sell {creator.name}
        </h2>

        <input
          type="number"
          min="1"
          max={ownedQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4 text-black"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded border text-theme border-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSell}
            disabled={loading}
            className="px-4 py-1 rounded bg-accent text-accent-text font-semibold"
          >
            {loading ? "Selling..." : "Confirm Sell"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
