import React from "react";

const Hero = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 sm:gap-1">
      <img
        src="./books.png"
        alt="Featured books"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl h-auto object-contain"
      />
      <div className="text-center">
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-snug md:leading-tight">
          Find <span className="text-pink-400">Books</span> You'll Love
          <br />
          Without the Hassle
        </p>
      </div>
    </div>
  );
};

export default Hero;
