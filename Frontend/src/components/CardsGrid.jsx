import PlaceCard from "./PlaceCard";

export default function CardsGrid({ places, selectedPlace, searchResult, onSelectPlace, isFaded }) {
    // In faded mode, only show the active card (or search result card)
    if (isFaded) {
        const activePlace = searchResult || selectedPlace;
        if (!activePlace) return null;

        // If it's a search result, show the search preview card
        if (searchResult) {
            return (
                <div className="place-card active bg-white rounded-[2rem] overflow-hidden border border-gray-100 w-full max-w-[360px]">
                    <div className="overflow-hidden h-[200px] relative">
                        {searchResult.image ? (
                            <img
                                src={searchResult.image}
                                alt={searchResult.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                No image available
                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        <span className="text-[11px] text-[#ff8a1f] font-bold uppercase tracking-widest">
                            Search Result
                        </span>
                        <h3
                            className="mt-2 mb-1 text-xl font-bold text-gray-900"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {searchResult.name}
                        </h3>
                        <p className="text-sm text-gray-500">Destination found via search.</p>
                    </div>
                </div>
            );
        }

        // Show the selected place card (from the regular list)
        return (
            <PlaceCard
                key={selectedPlace.id}
                place={selectedPlace}
                isActive={true}
                isFaded={true}
                onClick={() => { }}
            />
        );
    }

    // Normal grid mode — show all cards
    return (
        <>
            {places.map((place) => (
                <PlaceCard
                    key={place.id}
                    place={place}
                    isActive={false}
                    isFaded={false}
                    onClick={() => onSelectPlace(place, false)}
                />
            ))}
        </>
    );
}
