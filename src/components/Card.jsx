import React from "react";

const BookCard = ({ book, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl shadow-lg p-4 hover:scale-105 transition-transform duration-200 cursor-pointer"
    >
      <img
        src={book?.thumbnail || "https://via.placeholder.com/150?text=No+Image"}
        alt={book?.title || "No title"}
        className="w-full h-56 object-cover rounded-lg mb-3"
      />

      <h3 className="text-lg font-medium line-clamp-2">{book.title}</h3>
      <p className="text-sm text-gray-400">
        {book?.authors?.join(", ") || "Unknown Author"}
      </p>

      <p className="mt-2 text-sm text-gray-300">
        🌐 {book.allLanguages.join(", ").toUpperCase()}
      </p>

      {book?.rating && <p className="text-yellow-400 mt-1">⭐ {book.rating}</p>}
    </div>
  );
};

export default BookCard;
