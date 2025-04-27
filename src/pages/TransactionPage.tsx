import { useAuth } from "../context/AuthContext";
import TransactionHistory from "../components/TransactionHistory";

const TransactionsPage = () => {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold pb-4">Your Transactions</h1>
      {user?.uid && <TransactionHistory userId={user.uid} />}
    </div>
  );
};

export default TransactionsPage;
