import { useEffect, useRef, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";
import { Link } from "react-router-dom";
import { SMALL_IMG_BASE_URL } from "../utils/constants.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MovieSlider = ({ category }) => {
  const { contentType } = useContentStore();
  const [content, setContent] = useState([]);
  const [showArrows, setShowArrows] = useState(false);

  const sliderRef = useRef(null);

  const formattedCategoryName =
    category.replaceAll("_", " ")[0].toUpperCase() +
    category.replaceAll("_", " ").slice(1);
  const formattedContentType = contentType === "movie" ? "Movies" : "TV Shows";

  useEffect(() => {
    const getContent = async () => {
      const res = await axios.get(`/api/v1/${contentType}/${category}`);
      const resAction = await axios.get(`/api/v1/movie/genre/action`);
      const resComedy = await axios.get(`/api/v1/movie/genre/comedy`);
      const resFantasy = await axios.get(`/api/v1/movie/genre/fantasy`);
      const resDocumentary = await axios.get(`/api/v1/movie/genre/documentary`);

      setContent(res.data.content);
    };

    getContent();
  }, [contentType, category]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    sliderRef.current.scrollBy({
      left: sliderRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="relative bg-black px-5 md:px-20 text-white"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h2 className="mb-4 font-bold text-2xl">
        {formattedCategoryName} {formattedContentType}
      </h2>

      <div
        className="flex space-x-4 overflow-x-scroll scrollbar-hide"
        ref={sliderRef}
      >
        {content.map((item) => (
          <Link
            to={`/watch/${item.id}`}
            className="relative min-w-[250px] group"
            key={item.id}
          >
            <div className="rounded-lg overflow-hidden">
              <img
                src={SMALL_IMG_BASE_URL + item.backdrop_path}
                alt="Movie image"
                className="group-hover:scale-125 transition-transform duration-300 ease-in-out"
              />
            </div>
            <p className="mt-2 text-center">{item.title || item.name}</p>
          </Link>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            className="top-1/2 left-5 md:left-24 z-10 absolute flex justify-center items-center bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white -translate-y-1/2 size-12"
            onClick={scrollLeft}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className="top-1/2 right-5 md:right-24 z-10 absolute flex justify-center items-center bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white -translate-y-1/2 size-12"
            onClick={scrollRight}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
};
export default MovieSlider;
