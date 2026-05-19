import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMood } from "../services/api";
import { useEmotionalOS } from "../context/EmotionalOSContext.jsx";
import Badge from "./Badge";

const MOODS = [
  { id: "happy",       label: "Serene",      emoji: "✨", score: 5, color: "#00adef",  desc: "Peak Harmony" },
  { id: "calm",        label: "Content",     emoji: "🙂", score: 4, color: "#6366f1",  desc: "Stable State" },
  { id: "balanced",    label: "Balanced",    emoji: "😐", score: 3, color: "#94a3b8",  desc: "Neutral Axis" },
  { id: "anxious",     label: "Anxious",     emoji: "😟", score: 2, color: "#f59e0b",  desc: "System Noise" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😫", score: 1, color: "#f43f5e",  desc: "Critical Load" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const BAR_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MoodTracker = () => {
  const navigate = useNavigate();
  const { dispatch, emitEvent } = useEmotionalOS();
  const [selectedMood, setSelectedMood] = useState("balanced");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [weeklyLog, setWeeklyLog] = useState(() => {
    return JSON.parse(localStorage.getItem("sakina_mood_log") || "[]");
  });

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const calendarDays = [];
  let week = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    week.push(i);
    if (week.length === 7) { calendarDays.push(week); week = []; }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); calendarDays.push(week); }

  // Compute weekly bar chart data (last 7 entries or dummy)
  const chartData = BAR_LABELS.map((label, i) => {
    const entry = weeklyLog[weeklyLog.length - 7 + i];
    return { label, score: entry ? MOODS.find(m => m.id === entry.mood)?.score ?? 3 : null };
  });

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const moodObj = MOODS.find(m => m.id === selectedMood);
      await createMood(moodObj.score, note);

      // Save locally for the chart
      const entry = { mood: selectedMood, note, date: new Date().toISOString() };
      const updated = [...weeklyLog, entry];
      setWeeklyLog(updated);
      localStorage.setItem("sakina_mood_log", JSON.stringify(updated));
      localStorage.setItem("sakina_mood", selectedMood);

      // Sync to Emotional OS
      emitEvent("mood_selected", selectedMood);
      dispatch({ type: "SET_MOOD", payload: selectedMood });

      setFeedback({ type: "success", message: "Emotional state synchronized. Your neural pattern has been updated." });
      setNote("");
      setTimeout(() => setFeedback({ type: "", message: "" }), 5000);
    } catch {
      setFeedback({ type: "error", message: "Sync failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const activeMood = MOODS.find(m => m.id === selectedMood);
  const avgScore = weeklyLog.length > 0 ? (weeklyLog.slice(-7).reduce((a, e) => a + (MOODS.find(m => m.id === e.mood)?.score ?? 3), 0) / Math.min(weeklyLog.length, 7)).toFixed(1) : "—";
  const trend = weeklyLog.length > 1 ? (MOODS.find(m => m.id === weeklyLog.at(-1).mood)?.score > MOODS.find(m => m.id === weeklyLog.at(-2)?.mood)?.score ? "↑ Improving" : "→ Stable") : "Tracking";

  return (
    <div className="py-6 animate-fade-in font-['Inter'] space-y-16 pb-24">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-12">
        <div className="text-left">
          <Badge variant="subtle" color="teal" size="sm" className="mb-4 sm:mb-6 tracking-[3px] sm:tracking-[5px]">Emotional Tracking v2</Badge>
          <h1 className="font-['Inter'] text-4xl sm:text-6xl lg:text-8xl font-bold text-[#091426] tracking-tighter mb-4 sm:mb-6 uppercase leading-[0.85]">Daily <br /><span className="text-[#00adef] italic">Reflection.</span></h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sakina border border-gray-50 text-center flex-shrink-0 min-w-[120px] sm:min-w-[160px]">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">Weekly Avg</p>
            <p className="text-3xl sm:text-5xl font-bold text-[#091426]">{avgScore}<span className="text-sm sm:text-lg text-gray-200">/5</span></p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sakina border border-gray-50 text-center flex-shrink-0 min-w-[120px] sm:min-w-[160px]">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">Trend</p>
            <p className="text-lg sm:text-2xl font-bold text-[#00adef]">{trend}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* LEFT: Calendar + Chart */}
        <div className="lg:col-span-4 space-y-10">

          {/* Mini Bar Chart (Weekly Mood) */}
          <div className="bg-white rounded-[32px] sm:rounded-[56px] p-8 sm:p-12 shadow-sakina border border-gray-50">
            <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[4px] sm:tracking-[6px] text-gray-300 mb-6 sm:mb-10">7-Day Neural Wave</h3>
            <div className="flex items-end gap-2 sm:gap-3 h-24 sm:h-36">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-full rounded-t-xl sm:rounded-t-2xl transition-all duration-1000 relative group" style={{ height: d.score ? `${(d.score / 5) * 100}%` : '10%', background: d.score ? (d.score >= 4 ? '#00adef' : d.score === 3 ? '#94a3b8' : '#f43f5e') : '#f0f4f8' }}>
                    {d.score && <div className="absolute -top-6 sm:top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] sm:text-[10px] font-black text-[#091426]">{d.score}</div>}
                  </div>
                  <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[1px] sm:tracking-[2px] text-gray-300">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-[32px] sm:rounded-[56px] p-8 sm:p-12 shadow-sakina border border-gray-50">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h3 className="font-['Inter'] text-xl sm:text-2xl font-bold text-[#091426] uppercase">{currentMonthName}</h3>
            </div>
            <div className="grid grid-cols-7 mb-4 sm:mb-6">
              {DAYS.map((d, i) => (<div key={i} className="text-center text-[8px] sm:text-[10px] font-black text-gray-200 uppercase tracking-[2px]">{d}</div>))}
            </div>
            <div className="space-y-2 sm:space-y-3">
              {calendarDays.map((wk, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {wk.map((day, di) => (
                    <div key={di} className="aspect-square flex items-center justify-center">
                      {day ? (
                        <button
                          onClick={() => setSelectedDay(day)}
                          className={`w-full h-full rounded-[10px] sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${selectedDay === day ? 'bg-[#00adef] text-white shadow-lg scale-110' : day === currentDate.getDate() ? 'border-2 border-[#00adef] text-[#00adef]' : 'text-gray-400 hover:bg-gray-50'}`}
                        >{day}</button>
                      ) : <div />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: State Selection */}
        <div className="lg:col-span-8 bg-white rounded-[32px] sm:rounded-[56px] p-8 sm:p-16 shadow-sakina border border-gray-50">
          <div className="flex justify-between items-center mb-10 sm:mb-12">
            <div>
              <h2 className="font-['Inter'] text-2xl sm:text-4xl font-bold text-[#091426] tracking-tighter uppercase mb-2">Select State</h2>
              <p className="text-xs sm:text-base text-[#505f76] font-medium">Current: <span className="text-[#00adef] font-bold">{activeMood.desc}</span></p>
            </div>
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-[#f7f9fb] flex items-center justify-center text-2xl sm:text-4xl shadow-inner">{activeMood.emoji}</div>
          </div>

          {/* Mood Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-10 sm:mb-12">
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center gap-3 sm:gap-5 p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] border transition-all duration-500 ${isSelected ? 'border-[#00adef]/30 bg-[#f0f9f8] shadow-xl scale-105' : 'border-transparent bg-[#f7f9fb] hover:bg-white sm:hover:-translate-y-2 hover:shadow-sakina'}`}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-3xl bg-white flex items-center justify-center text-2xl sm:text-4xl shadow-inner">{mood.emoji}</div>
                  <div className="text-center">
                    <span className={`block text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] mb-1 ${isSelected ? 'text-[#00adef]' : 'text-gray-400'}`}>{mood.label}</span>
                    <div className="w-full h-0.5 sm:h-1 rounded-full" style={{ background: isSelected ? mood.color : '#e5e7eb' }}></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Note */}
          <div className="mb-10 sm:mb-12">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[4px] sm:tracking-[6px] mb-4 sm:mb-6 px-2">Reflect on this moment (Optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="How are you feeling, truly?"
              className="w-full bg-[#f7f9fb] border border-gray-100 rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 text-[#091426] text-sm sm:text-lg font-medium outline-none focus:bg-white focus:border-[#00adef]/30 transition-all min-h-[140px] sm:min-h-[180px] resize-none placeholder:text-gray-200"
            />
          </div>

          {feedback.message && (
            <div className={`mb-8 p-8 rounded-[32px] text-sm font-bold flex items-center gap-6 animate-in slide-in-from-top-4 ${feedback.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              <span className="material-symbols-outlined">{feedback.type === "success" ? "check_circle" : "error"}</span>
              {feedback.message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-6 sm:py-8 bg-[#091426] text-white font-black rounded-[24px] sm:rounded-[40px] transition-all flex items-center justify-center gap-4 sm:gap-6 shadow-2xl uppercase text-[10px] sm:text-xs tracking-[6px] sm:tracking-[12px] ${loading ? "opacity-70" : "hover:bg-[#00adef] hover:scale-[1.01] active:scale-95"}`}
          >
            {loading ? (
              <><div className="w-5 h-5 sm:w-6 sm:h-6 border-3 sm:border-4 border-white/30 border-t-white rounded-full animate-spin"></div><span className="tracking-[4px] sm:tracking-[12px]">Syncing...</span></>
            ) : (
              <><span>Log State</span><span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;