import { ReactNode } from "react";
import Footer from "./Footer";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-w-screen h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
