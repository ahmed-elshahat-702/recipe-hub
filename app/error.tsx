"use client";

const error = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-main">Error</h1>
      <p className="mt-4 text-lg text-foreground/60">
        An error occurred. Please try again later.
      </p>
      <button
        onClick={handleReload}
        className="mt-6 px-4 py-2 bg-main text-white rounded hover:bg-mainHover"
      >
        Reload Page
      </button>
    </div>
  );
};

export default error;
