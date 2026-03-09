import { useState } from "react";

export default function Header({ onSearch }) {
    const [query, setQuery] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        onSearch(query);
    }

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
            <div className="w-full px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#ff8a1f] to-[#ff6a00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                        <img
                            src="https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/compass-removebg-preview.png"
                            alt="logo"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <div>
                        <div className="font-bold text-lg tracking-tight text-gray-900 leading-none">
                            Travel Guide
                        </div>
                        <div className="hidden sm:block text-[11px] text-gray-500 font-medium tracking-wide mt-1">
                            AI Travel Companion
                        </div>
                    </div>
                </div>

                {/* Search */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 flex-1 justify-end max-w-lg ml-6"
                >
                    <div className="relative w-full max-w-[320px] group">
                        <input
                            id="searchInput"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search destination..."
                            className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#ff8a1f] focus:ring-4 focus:ring-orange-50 transition-all duration-300 placeholder-gray-400 group-hover:bg-white group-hover:shadow-sm"
                        />
                        <div className="absolute right-4 top-2.5 text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    <button
                        id="searchBtn"
                        type="submit"
                        className="hidden sm:block px-6 py-2.5 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-[#ff8a1f] hover:shadow-lg hover:shadow-orange-200 active:scale-95 transition-all duration-300"
                    >
                        Explore
                    </button>
                </form>
            </div>
        </header>
    );
}
