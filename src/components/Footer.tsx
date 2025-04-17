const Footer = () => {
  return (
    <footer className="bg-white shadow-inner w-full mt-12">
      <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Creator Market. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
