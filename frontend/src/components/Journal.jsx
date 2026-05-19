import React, { useState, useRef, useEffect } from 'react';
import Badge from './Badge';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import { useAuth } from '../context/AuthContext';
import { saveJournalEntry, getJournalEntries } from '../services/api';


const reflectionQuestions = {
    sad: "What is the heaviest thing you are carrying today? You don't have to solve it, just notice it.",
    anxious: "If your mind were a weather report today, what would it say?",
    angry: "Where do you feel this anger in your body? What does it need you to hear?",
    stressed: "What would it feel like to put this burden down, even just for 5 minutes?",
    neutral: "What small thing today made you feel, even briefly, like yourself?",
    happy: "What helped you feel this way today? How can you protect it?",
    overwhelmed: "If you could do just ONE thing today, what would actually matter most?"
};

const Journal = () => {
    const { user } = useAuth();
    const { state } = useEmotionalOS();
    const [entry, setEntry] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [detectedMood, setDetectedMood] = useState(null);
    const [question, setQuestion] = useState('');
    
    const userCacheKey = `sakina_journal_${user?.id || user?._id || 'guest'}`;
    const [pastEntries, setPastEntries] = useState(() => {
        return JSON.parse(localStorage.getItem(userCacheKey) || '[]');
    });
    const [listening, setListening] = useState(false);
    const textareaRef = useRef(null);

    // Fetch entries on mount
    useEffect(() => {
        const loadEntries = async () => {
            try {
                const res = await getJournalEntries();
                if (res && res.success && res.data) {
                    const formatted = res.data.map(item => ({
                        text: item.text,
                        mood: item.detectedMood || 'neutral',
                        date: new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                        time: new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    }));
                    setPastEntries(formatted);
                    localStorage.setItem(userCacheKey, JSON.stringify(formatted));
                }
            } catch (err) {
                console.error("Failed to load journal entries from DB:", err);
            }
        };
        if (user) {
            loadEntries();
        }
    }, [user, userCacheKey]);

    // Rough client-side mood detection via keywords
    const detectMoodFromText = (text) => {
        const lower = text.toLowerCase();
        if (/sad|cry|depress|hopeless|lonely|loss/.test(lower)) return 'sad';
        if (/anxious|panic|worry|scared|nervous|overwhelm/.test(lower)) return 'anxious';
        if (/angry|rage|frustrat|hate|mad/.test(lower)) return 'angry';
        if (/stress|exhaust|tired|drain|burnout/.test(lower)) return 'stressed';
        if (/happy|joy|grateful|grateful|excit|love/.test(lower)) return 'happy';
        return 'neutral';
    };

    const handleSubmit = async () => {
        if (!entry.trim()) return;
        const mood = detectMoodFromText(entry);
        const q = reflectionQuestions[mood] || reflectionQuestions.neutral;
        setDetectedMood(mood);
        setQuestion(q);
        const newEntry = {
            text: entry,
            mood,
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        // Save to local state
        const updated = [newEntry, ...pastEntries].slice(0, 30);
        setPastEntries(updated);
        localStorage.setItem(userCacheKey, JSON.stringify(updated));
        // Save to MongoDB
        try { await saveJournalEntry(entry, mood, q); } catch (e) { console.warn('DB save failed, using local only', e); }
        setSubmitted(true);
    };

    const handleVoice = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice input requires Chrome browser.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onresult = (e) => {
            setEntry(prev => prev + ' ' + e.results[0][0].transcript);
        };
        recognition.start();
    };

    const moodColors = {
        sad: 'text-indigo-400 bg-indigo-50', anxious: 'text-purple-400 bg-purple-50',
        angry: 'text-rose-400 bg-rose-50', stressed: 'text-amber-400 bg-amber-50',
        happy: 'text-teal-400 bg-teal-50', neutral: 'text-gray-400 bg-gray-50',
        overwhelmed: 'text-slate-400 bg-slate-50'
    };

    return (
        <div className="py-6 font-['Inter'] animate-fade-in space-y-20 pb-32">
            {/* Header */}
            <header className="space-y-6 sm:space-y-8">
                <Badge variant="solid" color="teal" size="sm" className="tracking-[6px] sm:tracking-[8px] uppercase !bg-[#00adef]/10 !text-[#00adef]">Neural Journal v1.0</Badge>
                <h1 className="font-['Inter'] text-5xl sm:text-9xl font-bold text-[#091426] tracking-tighter uppercase leading-[0.8]">
                    Your <br />
                    <span className="text-[#00adef] italic">Thoughts.</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-xl font-medium max-w-xl leading-relaxed opacity-70">
                    Write freely. There is no judgment here. Your AI companion will listen and reflect gently.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* EDITOR */}
                <div className="lg:col-span-7 space-y-8">
                    {!submitted ? (
                        <div className="bg-white rounded-[32px] sm:rounded-[56px] shadow-sakina border border-gray-50 overflow-hidden">
                            {/* Date Header */}
                            <div className="px-6 sm:px-16 pt-8 sm:pt-16 pb-6 sm:pb-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[3px] sm:tracking-[6px] text-gray-300 mb-0.5">Today's Entry</p>
                                    <h3 className="text-lg sm:text-2xl font-bold text-[#091426]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                </div>
                                <button 
                                    onClick={handleVoice}
                                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[14px] sm:rounded-[24px] flex items-center justify-center transition-all ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-50 text-gray-400 hover:bg-[#091426] hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl sm:text-3xl">mic</span>
                                </button>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                                placeholder="What's on your mind today?..."
                                className="w-full h-72 sm:h-96 px-6 sm:px-16 py-6 sm:py-10 text-base sm:text-xl font-medium text-[#091426] leading-relaxed resize-none border-none outline-none bg-transparent placeholder-gray-200"
                            />
                            <div className="px-6 sm:px-16 py-6 sm:py-10 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[4px] text-gray-200">{entry.length} chars</span>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!entry.trim()}
                                    className="px-8 sm:px-16 py-5 sm:py-8 bg-[#091426] text-white rounded-[24px] sm:rounded-[36px] font-black uppercase tracking-[5px] sm:tracking-[10px] text-[8px] sm:text-[10px] hover:bg-[#00adef] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                >Reflect</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in duration-500">
                            {/* Detected Mood */}
                            <div className={`rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 border border-white space-y-3 sm:space-y-4 ${moodColors[detectedMood]?.split(' ')[1] || 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className={`material-symbols-outlined text-2xl sm:text-3xl ${moodColors[detectedMood]?.split(' ')[0]}`}>psychology</span>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[3px] sm:tracking-[5px] text-gray-400">Emotional Tone Detected</p>
                                </div>
                                <p className="text-3xl sm:text-5xl font-['Inter'] font-bold text-[#091426] capitalize tracking-tighter">{detectedMood}.</p>
                            </div>

                            {/* Reflection Question */}
                            <div className="bg-[#091426] rounded-[32px] sm:rounded-[48px] p-10 sm:p-16 text-white space-y-6 sm:space-y-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00adef]/10 to-transparent"></div>
                                <Badge variant="solid" color="teal" size="xs" className="!bg-white/10 tracking-[3px] sm:tracking-[5px]">AI Reflection</Badge>
                                <p className="text-lg sm:text-2xl font-medium leading-relaxed italic relative z-10 opacity-90">
                                    "{question}"
                                </p>
                            </div>
 
                            <button onClick={() => { setSubmitted(false); setEntry(''); }} className="w-full py-6 sm:py-8 border-2 border-dashed border-gray-100 text-gray-400 rounded-[24px] sm:rounded-[40px] font-black uppercase tracking-[5px] sm:tracking-[8px] text-[8px] sm:text-[10px] hover:border-[#00adef] hover:text-[#00adef] transition-all">
                                Write Another Entry
                            </button>
                        </div>
                    )}
                </div>

                {/* PAST ENTRIES */}
                <div className="lg:col-span-5 space-y-6 sm:space-y-8">
                    <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[4px] sm:tracking-[6px] text-gray-300">Emotional Timeline</h3>
                    <div className="space-y-4 sm:space-y-6">
                        {pastEntries.length === 0 && (
                            <div className="text-center py-12 sm:py-20 border-2 border-dashed border-gray-100 rounded-[32px] sm:rounded-[48px]">
                                <p className="text-[8px] sm:text-[10px] text-gray-200 font-black uppercase tracking-[3px] sm:tracking-[5px]">Journal is empty.</p>
                            </div>
                        )}
                        {pastEntries.map((e, i) => (
                            <div key={i} className="bg-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-50 flex gap-4 sm:gap-8 group hover:shadow-sakina transition-all">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${moodColors[e.mood] || 'bg-gray-50 text-gray-400'}`}>
                                    <span className="material-symbols-outlined text-xl sm:text-2xl">edit_note</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] text-gray-300">{e.date}</p>
                                        <Badge variant="subtle" color="teal" size="xs" className="scale-75 sm:scale-100 origin-right capitalize">{e.mood}</Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed truncate">{e.text.slice(0, 90)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Journal;
