import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
