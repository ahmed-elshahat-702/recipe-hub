import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-main">404</h1>
      <h2 className="text-2xl text-main">Page not found</h2>
      <p className="mt-4 text-xl text-foreground/80">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-main text-white rounded hover:bg-mainHover"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
