export default function PlaceCard({ place, isActive, isFaded, onClick }) {
    return (
        <div
            className={`place-card bg-white rounded-[2rem] overflow-hidden border border-gray-100 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:border-orange-100 group relative${isActive ? " active" : ""}`}
            onClick={onClick}
        >
            <div className="overflow-hidden h-[200px] relative">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-gray-800 shadow-sm">
                    {place.city}
                </div>
            </div>
            <div className="p-6">
                <span className="text-[11px] text-[#ff8a1f] font-bold uppercase tracking-widest">
                    {place.category}
                </span>
                <h3 className="mt-2 mb-1 text-xl font-bold text-gray-900 group-hover:text-[#ff8a1f] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {place.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {place.description}
                </p>
            </div>
        </div>
    );
}
