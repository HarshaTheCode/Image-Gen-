import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center w-full">
      <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary tracking-tight">
        AI Portrait Studio
      </h1>
      <p className="mt-2 text-lg sm:text-xl text-brand-subtle max-w-2xl mx-auto">
        Recreate any portrait style with your own photo using powerful AI.
      </p>
    </header>
  );
};

export default Header;