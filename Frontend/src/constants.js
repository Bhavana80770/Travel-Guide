// --- Voice IDs per language and gender ---
export const VOICES = {
    English: { Male: "Matthew", Female: "Alicia" },
    Hindi: { Male: "Aman", Female: "Namrita" },
    Tamil: { Male: "Murali", Female: "Iniya" },
    Telugu: { Male: "Zion", Female: "Josie" },
};

// --- BCP-47 locale codes ---
export const LOCALES = {
    English: "en-US",
    Hindi: "hi-IN",
    Tamil: "ta-IN",
    Telugu: "te-IN",
};

// --- Destination data ---
export const PLACES = [
    {
        id: "taj-mahal",
        name: "Taj Mahal",
        city: "Agra",
        category: "World Wonder",
        description: "An immense mausoleum of white marble, built in Agra between 1631 and 1648.",
        image:
            "https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Taj_Mahal_%28Edited%29.jpeg",
    },
    {
        id: "red-fort",
        name: "Red Fort",
        city: "New Delhi",
        category: "Historical Fort",
        description:
            "A historic fort in the city of Delhi in India that served as the main residence of the Mughal Emperors.",
        image:
            "https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Delhi_fort.jpg",
    },
    {
        id: "gateway-of-india",
        name: "Gateway of India",
        city: "Mumbai",
        category: "Monument",
        description: "An arch-monument built during the 20th century in Bombay, India.",
        image:
            "https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Mumbai_03-2016_30_Gateway_of_India.jpg",
    },
    {
        id: "hawa-mahal",
        name: "Hawa Mahal",
        city: "Jaipur",
        category: "Architecture",
        description:
            "The 'Palace of Winds', a palace in Jaipur, India, made with the red and pink sandstone.",
        image:
            "https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg",
    },
    {
        id: "golden-temple",
        name: "Golden Temple",
        city: "Amritsar",
        category: "Spiritual",
        description:
            "Also known as Sri Harmandir Sahib, it is the holiest Gurdwara of Sikhism.",
        image:
            "https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/The_Golden_Temple_of_Amrithsar_7.jpg",
    },
    {
        id: "mysore-palace",
        name: "Mysore Palace",
        city: "Mysore",
        category: "Royal Palace",
        description:
            "A historical palace and a royal residence at Mysore in the Indian State of Karnataka.",
        image:
            "https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Mysore_Palace_Morning.jpg",
    },
];

// --- Backend API URL ---
// Use environment variable for production, fallback to local for development
export const GENERATE_AUDIO_GUIDE_API_URL = import.meta.env.VITE_API_URL || "https://travel-guide-wd9z.onrender.com/generate-audio-guide";
