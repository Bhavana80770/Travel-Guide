import { useState, useEffect, useRef } from "react";
import { VOICES, LOCALES, GENERATE_AUDIO_GUIDE_API_URL } from "../constants";

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu"];

export default function ExperiencePanel({ place, onClose }) {
    const [length, setLength] = useState("Summary");
    const [voice, setVoice] = useState("Male");
    const [language, setLanguage] = useState("English");

    const [status, setStatus] = useState("idle"); // idle | loading | done | error
    const [transcript, setTranscript] = useState("");
    const [audioBase64, setAudioBase64] = useState(null);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [backendError, setBackendError] = useState("");

    const panelRef = useRef(null);
    const audioRef = useRef(null);

    // Animate panel in
    useEffect(() => {
        const el = panelRef.current;
        if (!el) return;
        el.classList.remove("experience-visible");
        el.classList.add("experience-invisible");
        const raf = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.remove("experience-invisible");
                el.classList.add("experience-visible");
            });
        });
        return () => cancelAnimationFrame(raf);
    }, [place]);

    // Reset audio state when place changes
    useEffect(() => {
        setStatus("idle");
        setTranscript("");
        setAudioBase64(null);
        setTranscriptOpen(false);
        setLength("Summary");
        setVoice("Male");
        setLanguage("English");
    }, [place]);

    async function handleGenerate() {
        setStatus("loading");
        console.log("Calling API URL:", GENERATE_AUDIO_GUIDE_API_URL);
        try {
            const res = await fetch(GENERATE_AUDIO_GUIDE_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    place: place.name,
                    answerType: length,
                    language,
                    voiceId: VOICES[language][voice],
                    locale: LOCALES[language],
                }),
            });
            if (!res.ok) {
                let errorMsg = "Generation failed";
                try {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        errorMsg = errorData.error || errorData.details || errorMsg;
                    } else {
                        // Handle HTML or other non-JSON error responses (like Render timeouts)
                        const text = await res.text();
                        console.error("Non-JSON error response:", text);
                        errorMsg = `Server Error (${res.status}): The backend returned a non-JSON response. This usually means a timeout or server crash.`;
                    }
                } catch (e) {
                    errorMsg = `Error parsing response: ${res.statusText}`;
                }
                throw new Error(errorMsg);
            }
            
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format from server (Expected JSON)");
            }

            const data = await res.json();
            setTranscript(data.description);
            setAudioBase64(data.audioBase64 || null);
            setStatus("done");
        } catch (err) {
            console.error(err);
            setBackendError(err.message);
            setStatus("error");
        }
    }

    const buttonLabel =
        status === "loading"
            ? "⏳ Generating Audio..."
            : status === "done"
                ? "Listen to Audio"
                : status === "error"
                    ? "Generate Audio Guide"
                    : "Generate Audio Guide";

    return (
        <div
            id="experience-panel"
            ref={panelRef}
            className="experience-invisible w-full max-w-[440px] shrink-0"
        >
            {/* Back button */}
            <div className="flex justify-start mb-6">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-[#ff8a1f] hover:border-[#ff8a1f]/30 hover:shadow-sm transition-all flex items-center gap-2 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                    Back to Places
                </button>
            </div>

            {/* Panel card */}
            <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-2xl shadow-gray-200/50">
                {/* Title */}
                <div className="border-b border-dashed border-gray-200 mb-6 pb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff8a1f] bg-orange-50 px-2 py-1 rounded-md">
                        AI Guide Ready
                    </span>
                    <h3
                        className="mt-3 text-3xl font-bold text-gray-900 leading-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {place.name}
                    </h3>
                </div>

                {/* Length toggle */}
                <div className="mb-6">
                    <h4 className="mb-3 text-xs uppercase tracking-widest text-gray-400 font-bold">
                        Duration &amp; Detail
                    </h4>
                    <div className="flex gap-4">
                        {["Summary", "Detailed"].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setLength(opt)}
                                className={`flex-1 p-4 rounded-2xl border text-left cursor-pointer hover:border-[#ff8a1f] transition-all relative overflow-hidden group ${length === opt
                                        ? "bg-[#fff1e5] border-[#ff8a1f] shadow-lg shadow-orange-100"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <strong className="block text-sm mb-1 text-gray-900">
                                    {opt === "Summary" ? "Summarized" : "Detailed"}
                                </strong>
                                <span className="text-xs text-gray-500 group-hover:text-[#ff8a1f]/80">
                                    {opt === "Summary" ? "~1 min overview" : "~3 min guide"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Audio settings */}
                <div className="mb-8">
                    <h4 className="mb-3 text-xs uppercase tracking-widest text-gray-400 font-bold">
                        Audio Settings
                    </h4>
                    <div className="flex gap-3">
                        {/* Language select */}
                        <div className="relative flex-1">
                            <select
                                id="selectLanguage"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full appearance-none px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#ff8a1f] bg-white text-gray-800 shadow-sm"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang}>{lang}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none text-xs">▼</div>
                        </div>

                        {/* Voice toggle */}
                        <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1.5 w-[160px] shadow-inner">
                            {["Male", "Female"].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setVoice(v)}
                                    className={`flex-1 rounded-lg text-xs font-bold transition-all ${voice === v
                                            ? "bg-white text-[#ff8a1f] shadow-sm"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generate button */}
                <button
                    id="generateBtn"
                    onClick={handleGenerate}
                    disabled={status === "loading"}
                    className="w-full py-4 bg-gradient-to-r from-[#ff8a1f] to-[#ff6a00] text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {buttonLabel}
                </button>

                {/* Error message */}
                {status === "error" && (
                    <div className="mt-3 text-center">
                        <p className="text-sm text-red-500 font-medium">
                            Generation failed.
                        </p>
                        {backendError && (
                            <p className="mt-1 text-xs text-red-400 bg-red-50 p-2 rounded-lg border border-red-100 break-words">
                                {backendError}
                            </p>
                        )}
                        <p className="mt-2 text-[10px] text-gray-400">
                            Check your Render dashboard logs for more details.
                        </p>
                    </div>
                )}

                {/* Audio section */}
                {status === "done" && (
                    <div id="audioSection" className="mt-8 pt-6 border-t border-gray-100">
                        {/* Transcript accordion */}
                        <div className="mb-5 border border-gray-200 rounded-2xl bg-gray-50 p-4">
                            <div
                                className="flex justify-between items-center cursor-pointer select-none group"
                                onClick={() => setTranscriptOpen((o) => !o)}
                            >
                                <span className="text-xs font-bold text-gray-500 group-hover:text-[#ff8a1f] transition-colors tracking-wide uppercase">
                                    Read Transcript
                                </span>
                                <span
                                    className={`text-[10px] text-gray-400 transition-transform duration-200 ${transcriptOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    ▼
                                </span>
                            </div>
                            {transcriptOpen && (
                                <div
                                    id="transcriptContent"
                                    className="mt-4 max-h-[160px] overflow-y-auto text-sm leading-7 text-gray-600 pr-2 no-scrollbar"
                                >
                                    <p id="scriptText">{transcript}</p>
                                </div>
                            )}
                        </div>

                        {/* Audio player */}
                        {audioBase64 ? (
                            <audio
                                id="audioPlayer"
                                ref={audioRef}
                                controls
                                className="w-full h-11 rounded-lg shadow-sm"
                                src={`data:audio/mp3;base64,${audioBase64}`}
                            />
                        ) : (
                            <p className="text-sm text-gray-400 text-center">Audio not available.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
