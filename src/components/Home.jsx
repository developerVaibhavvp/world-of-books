import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Loader from "./Loader";
import Hero from "./Hero";

const API_KEY = import.meta.env.VITE_API_KEY;

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchDefaultBooks = async (query = "") => {
    setLoading(true);
    const endpoint = query
      ? `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}`
      : `https://www.googleapis.com/books/v1/volumes?q=gaur+gopal+das+and+self+help&maxResults=10&key=${API_KEY}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      const bookMap = new Map();
      data.items?.forEach((book) => {
        const info = book.volumeInfo;
        const cleanTitle = info.title
          ?.toLowerCase()
          .replace(/\(.*\)/g, "") // remove text in parentheses
          .replace(/[:\-–].*/g, "") // remove subtitle after ":" or "-"
          .trim();

        if (
          !cleanTitle ||
          cleanTitle.length > 60 ||
          cleanTitle.startsWith("summary") ||
          cleanTitle.startsWith("analysis")
        )
          return;

        if (!bookMap.has(cleanTitle)) {
          bookMap.set(cleanTitle, {
            id: book.id,
            title: info.title,
            authors: info.authors || [],
            thumbnail: info.imageLinks?.thumbnail,
            publishedDate: info.publishedDate || "Unknown",
            publisher: info.publisher,
            description: info.description,
            rating: info.averageRating || null,
            allLanguages: [info.language],
            shortFeedback: info.description
              ? info.description.split(". ")[0] + "."
              : "A popular and well-reviewed book loved by readers.",
            previewLink: info.previewLink,
            category: info.categories || [],
            subtitle: info.subtitle,
            retailPrice: book.saleInfo?.retailPrice?.amount ?? null,
            webLink: book.accessInfo?.webReaderLink,
          });
        } else {
          // Merge additional languages for the same title
          const existing = bookMap.get(cleanTitle);
          if (!existing.allLanguages.includes(info.language)) {
            existing.allLanguages.push(info.language);
          }
          bookMap.set(cleanTitle, existing);
        }
      });

      setBooks(Array.from(bookMap.values())); // convert map to array
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultBooks("");
  }, []);

  useEffect(() => {
    const trimmed = searchTerm.trim();

    // if input is empty, restore defaults immediately
    if (trimmed === "") {
      fetchDefaultBooks("");
      return;
    }

    const handler = setTimeout(() => {
      fetchDefaultBooks(trimmed);
    }, 1500); // 2000ms = 2 seconds

    return () => clearTimeout(handler); // cleanup on next change
  }, [searchTerm]);

  useEffect(() => {
    if (selectedBook) {
      const scrollY = window.scrollY || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      // store current scroll to restore later
      document.body.dataset.scrollY = String(scrollY);
    } else {
      const prev = Number(document.body.dataset.scrollY || 0);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (!Number.isNaN(prev)) {
        window.scrollTo(0, prev);
      }
      delete document.body.dataset.scrollY;
    }

    return () => {
      // cleanup in case component unmounts while modal is open
      const prev = Number(document.body.dataset.scrollY || 0);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (!Number.isNaN(prev)) {
        window.scrollTo(0, prev);
      }
      delete document.body.dataset.scrollY;
    };
  }, [selectedBook]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <Hero />
      <div className="flex justify-center items-center mt-10">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search through any books or writers"
            className="w-full pl-12 pr-4 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <IoCloseSharp
              className="absolute right-1 top-1/3"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)} // 👈 open modal
              className="bg-gray-800 rounded-xl shadow-lg p-4 hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              <img
                src={
                  book.thumbnail ||
                  "https://via.placeholder.com/150?text=No+Image"
                }
                alt={book.title}
                className="w-full h-56 object-contain rounded-lg mb-3"
              />

              <h3 className="text-lg font-medium line-clamp-2">{book.title}</h3>
              <p className="text-sm text-gray-400">
                {book.authors.join(", ") || "Unknown Author"}
              </p>

              <div className="flex justify-between">
                <p className="mt-2 text-sm text-gray-300">
                  🌐 {book.allLanguages.join(", ").toUpperCase()}
                </p>

                {book.rating ? (
                  <p className="text-yellow-400 mt-1 text-sm">
                    ⭐ {book.rating}/5
                  </p>
                ) : (
                  <p className="text-red-400 mt-2 text-sm">
                    No rating available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📘 Modal for book details */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-y-scroll">
          <div className="bg-gray-800 text-white rounded-2xl w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={
                  selectedBook.thumbnail ||
                  "https://via.placeholder.com/150?text=No+Image"
                }
                alt={selectedBook.title}
                className="h-56 object-contain rounded-lg shadow-md w-auto"
              />

              {/* ===== styled info column ===== */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-semibold mb-1 text-center md:text-left">
                  {selectedBook.title}
                </h2>

                <p className="text-gray-400 mb-1 text-center md:text-left">
                  By {selectedBook.authors.join(", ") || "Unknown Author"}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 text-sm text-gray-200">
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h3v2H4v10h12V5h-3V3h3a2 2 0 012 2v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" />
                      <path d="M7 9h6v2H7zM7 12h4v2H7z" />
                    </svg>
                    <span className="text-xs text-gray-300">Category</span>
                    <strong className="ml-1 text-white text-sm">
                      {(selectedBook.category || []).join(", ") || "General"}
                    </strong>
                  </span>

                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-sm text-white">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 1l3 6h6l-4.5 4 1.5 7L12 16l-6 2 1.5-7L3 7h6z" />
                    </svg>
                    <span className="text-xs">Price</span>
                    <strong className="ml-1 text-sm">
                      {selectedBook.retailPrice
                        ? new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(selectedBook.retailPrice)
                        : selectedBook.saleability === "FOR_SALE"
                        ? "Price not listed"
                        : "Not for sale"}
                    </strong>
                  </span>

                  {selectedBook.rating && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500 text-sm text-black">
                      ⭐{" "}
                      <strong className="text-sm">
                        {selectedBook.rating}/5
                      </strong>
                    </span>
                  )}
                </div>

                {selectedBook.subtitle && (
                  <p className="mt-3 italic text-sm text-gray-300 text-center md:text-left">
                    “{selectedBook.subtitle}”
                  </p>
                )}

                <div className="mt-4 bg-gray-900/40 border border-gray-700 rounded-lg p-4 max-h-40 overflow-auto text-sm text-gray-200 leading-relaxed">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    About this book
                  </h3>
                  <p className="whitespace-pre-wrap">
                    {selectedBook.description ||
                      selectedBook.shortFeedback ||
                      "No description available."}
                  </p>
                </div>

                {selectedBook.title && (
                  <div className="flex justify-center md:justify-start gap-2">
                    <a
                      href={`https://www.amazon.in/s?k=${encodeURIComponent(
                        selectedBook.title
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block px-4 py-2 bg-white text-black hover:bg-green-500 rounded-lg text-sm font-medium"
                    >
                      🛒 Buy on Amazon
                    </a>
                  </div>
                )}
              </div>
              {/* ===== end styled info column ===== */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
