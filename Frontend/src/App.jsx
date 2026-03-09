import { useState } from "react";
import { PLACES } from "./constants";
import Header from "./components/Header";
import CardsGrid from "./components/CardsGrid";
import ExperiencePanel from "./components/ExperiencePanel";

export default function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  function handleSelectPlace(place, fromSearch = false) {
    setSelectedPlace(place);
    if (!fromSearch) setSearchResult(null);
  }

  function handleDeselect() {
    setSelectedPlace(null);
    setSearchResult(null);
  }

  function handleSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found = PLACES.find((p) => p.name.toLowerCase().includes(q));
    if (found) {
      setSearchResult(found);
      handleSelectPlace(found, true);
    } else {
      const custom = {
        id: "search-result",
        name: query.trim(),
        city: "",
        category: "Search Result",
        description: "Destination found via search.",
        image: "",
      };
      setSearchResult(custom);
      handleSelectPlace(custom, true);
    }
  }

  const isFaded = selectedPlace !== null;

  return (
    <div className="min-h-screen text-gray-800 bg-[#fdfbf7] font-sans">
      <Header onSearch={handleSearch} />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {isFaded ? (
            /* Faded layout: active card + experience panel side by side */
            <div className="flex flex-col lg:flex-row items-start justify-center gap-[60px] pt-10 w-full min-h-[600px]">
              {/* Active card column */}
              <div className="cards-grid faded w-full lg:w-auto">
                <CardsGrid
                  places={PLACES}
                  selectedPlace={selectedPlace}
                  searchResult={searchResult}
                  onSelectPlace={handleSelectPlace}
                  isFaded={true}
                />
              </div>
              {/* Experience panel */}
              <ExperiencePanel place={selectedPlace} onClose={handleDeselect} />
            </div>
          ) : (
            /* Normal grid layout */
            <div className="cards cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full mx-auto min-h-[600px] relative">
              <CardsGrid
                places={PLACES}
                selectedPlace={null}
                searchResult={null}
                onSelectPlace={handleSelectPlace}
                isFaded={false}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
