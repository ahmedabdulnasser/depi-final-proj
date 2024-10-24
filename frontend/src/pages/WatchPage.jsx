import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContentStore } from "../store/content";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight, FolderHeart } from "lucide-react";
import ReactPlayer from "react-player";
import { ORIGINAL_IMG_BASE_URL, SMALL_IMG_BASE_URL } from "../utils/constants";
import { formatReleaseDate } from "../utils/dateFunction";
import WatchPageSkeleton from "../components/skeletons/WatchPageSkeleton";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

const WatchPage = () => {
  const { id } = useParams();
  const [trailers, setTrailers] = useState([]);
  const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});
  const [similarContent, setSimilarContent] = useState([]);
  const { contentType } = useContentStore();
  const [isFavorite, setIsFavorite] = useState(false);

  const sliderRef = useRef(null);

  useEffect(() => {
    const getTrailers = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/trailers`);
        setTrailers(res.data.trailers);
      } catch (error) {
        if (error.message.includes("404")) {
          setTrailers([]);
        }
      }
    };

    getTrailers();
  }, [contentType, id]);

  useEffect(() => {
    const getSimilarContent = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/similar`);
        setSimilarContent(res.data.content);
      } catch (error) {
        if (error.message.includes("404")) {
          setSimilarContent([]);
        }
      }
    };

    getSimilarContent();
  }, [contentType, id]);

  useEffect(() => {
    const getContentDetails = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
        // console.log(res.data);
        setContent(res.data.content);
      } catch (error) {
        if (error.message.includes("404")) {
          setContent(null);
        }
      } finally {
        setLoading(false);
      }
    };

    getContentDetails();
  }, [contentType, id]);

  const handleNext = () => {
    if (currentTrailerIdx < trailers.length - 1)
      setCurrentTrailerIdx(currentTrailerIdx + 1);
  };
  const handlePrev = () => {
    if (currentTrailerIdx > 0) setCurrentTrailerIdx(currentTrailerIdx - 1);
  };

  const scrollLeft = () => {
    if (sliderRef.current)
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
  };
  const scrollRight = () => {
    if (sliderRef.current)
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
  };
  useEffect(() => {
    const getFavorites = async () => {
      try {
        const res = await axios.get(`/api/v1/person/favorites`);
        res.data.data.forEach((movie) => {
          if(movie.id === id){
            setIsFavorite(true)
          }
          else{
            setIsFavorite(false)
          }
        })
      } catch (error) {
        if (error.response.status === 404) {
          toast.error("Nothing found unfortunately");
        } else {
          toast.error("An error occurred, please try again later");
        }
      }
    };
    getFavorites();
  }, [id]);

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const res = await axios.get(`/api/v1/person/favorites`);
        const isFavorite = res.data.data.some((item) => item.id === id);
        setIsFavorite(isFavorite);
        console.log(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    getFavorites();
  }, []);

  const handleFavorite = async () => {
    try {
      // Fetch current favorites
      const res = await axios.get(`/api/v1/person/favorites`);

      // Check if the item exists in favorites
      const isFavorite = res.data.data.some((item) => item.id === id);

      if (isFavorite) {
        setIsFavorite(false);
        // Remove from favorites
        const deleteRes = await axios.delete(`/api/v1/person/favorites/${id}`);
        if (deleteRes.status === 200) {
          toast.error("Removed from favorites");
        }
      } else {
        setIsFavorite(true);
        // Add to favorites
        const res = await axios.get(`/api/v1/${contentType}/${id}/details`);

        const postRes = await axios.post(`/api/v1/person/favorites/${id}`, {
          id,
          content: res.data.content,
        });
        if (postRes.status === 200) {
          toast.success("Added to favorites");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="bg-[#003245] p-10 min-h-screen">
        <WatchPageSkeleton />
      </div>
    );

  if (!content) {
    return (
      <div className="bg-[#003245] h-screen text-white">
        <div className="mx-auto max-w-6xl">
          <Navbar />
          <div className="mx-auto mt-40 px-4 py-8 h-full text-center">
            <h2 className="font-bold text-2xl text-balance sm:text-5xl">
              Content not found 😥
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#003245] min-h-screen text-white">
      <div className="mx-auto px-4 py-0 h-full container">
        <Navbar />

        {trailers.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <button
              className={`
							bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
                currentTrailerIdx === 0 ? "opacity-50 cursor-not-allowed " : ""
              }}
							`}
              disabled={currentTrailerIdx === 0}
              onClick={handlePrev}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              className={`
							bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
                currentTrailerIdx === trailers.length - 1
                  ? "opacity-50 cursor-not-allowed "
                  : ""
              }}
							`}
              disabled={currentTrailerIdx === trailers.length - 1}
              onClick={handleNext}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        <div className="mb-4 sm:px-10 md:px-32 p-2">
          {trailers.length > 0 && (
            <ReactPlayer
              controls={true}
              width={"100%"}
              height={"70vh"}
              className="mx-auto rounded-lg overflow-hidden aspect-video"
              url={`https://www.youtube.com/watch?v=${trailers[currentTrailerIdx].key}`}
            />
          )}

          {trailers?.length === 0 && (
            <h2 className="mt-10 text-center text-xl">
              No trailers available for{" "}
              <span className="font-bold text-red-600">
                {content?.title || content?.name}
              </span>{" "}
              😥
            </h2>
          )}
        </div>

        {/* movie details */}
        {/* {console.log(content)} */}
        <div className="flex md:flex-row flex-col justify-between gap-20 mx-auto max-w-6xl">
          <div className="mb-4 md:mb-0">
            <h2 className="font-bold text-5xl text-balance">
              {content?.title || content?.name}
              <span
                onClick={handleFavorite}
                className={`${
                  !isFavorite ? "opacity-70 hover:opacity-100" : "opacity-100"
                } ml-3 transition-all ease-in cursor-pointer`}
              >
                <Heart
                  size={48}
                  className={`inline ${
                    isFavorite ? "text-[red]" : "text-white"
                  }`}
                  fill={isFavorite ? "red" : "white"}
                />
              </span>
            </h2>
            <p className="mt-2 text-lg">
              {formatReleaseDate(
                content?.release_date || content?.first_air_date
              )}{" "}
              |{" "}
              {content?.adult ? (
                <span className="text-red-600">18+</span>
              ) : (
                <span className="text-green-600">PG-13</span>
              )}{" "}
              | {content.vote_average.toFixed(1)} ⭐️
            </p>
            <p className="mt-2 text-2xl">
              {" "}
              {content?.genres.length > 1
                ? content?.genres.map((genre) => genre.name).join(", ")
                : content?.genres[0].name}
            </p>{" "}
            <p>
              Producer: {content?.production_companies[0]?.name || "Unknown"}
            </p>
            <p>
              Languages:{" "}
              {content?.spoken_languages.length > 1
                ? content?.spoken_languages.map((lang) => lang.name).join(", ")
                : content?.spoken_languages[0].name}
            </p>
            <p>
              Countries:{" "}
              {content?.production_countries.length > 1
                ? content?.production_countries.map((c) => c.name).join(", ")
                : content?.production_countries[0].name}
            </p>
            <p className="mt-4 text-2xl italic">{content?.overview}</p>
          </div>
          <img
            src={ORIGINAL_IMG_BASE_URL + content?.poster_path}
            alt="Poster image"
            className="rounded-md max-h-[600px]"
          />
        </div>

        {similarContent.length > 0 && (
          <div className="relative mx-auto mt-4 max-w-5xl">
            <h3 className="mb-4 font-bold text-3xl">Similar Movies/Tv Show</h3>

            <div
              className="flex gap-4 pb-4 overflow-x-scroll group scrollbar-hide"
              ref={sliderRef}
            >
              {similarContent.map((content) => {
                if (content.poster_path === null) return null;
                return (
                  <Link
                    key={content.id}
                    to={`/watch/${content.id}`}
                    className="flex-none w-52"
                  >
                    <img
                      src={SMALL_IMG_BASE_URL + content.poster_path}
                      alt="Poster path"
                      className="rounded-md w-full h-auto"
                    />
                    <h4 className="mt-2 font-semibold text-lg">
                      {content.title || content.name}
                    </h4>
                  </Link>
                );
              })}

              <ChevronRight
                className="top-1/2 right-2 absolute bg-[#003245] opacity-0 group-hover:opacity-100 rounded-full w-8 h-8 text-white transition-all -translate-y-1/2 duration-300 cursor-pointer"
                onClick={scrollRight}
              />
              <ChevronLeft
                className="top-1/2 left-2 absolute bg-[#003245] opacity-0 group-hover:opacity-100 rounded-full w-8 h-8 text-white transition-all -translate-y-1/2 duration-300 cursor-pointer"
                onClick={scrollLeft}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default WatchPage;
