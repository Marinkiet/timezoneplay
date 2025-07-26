import { useState, useEffect } from "react";
import cities from "./cities";

const getCurrentTimeInCity = (timezone) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date());
};

export default function TimezoneSwapGame() {
  const [cityOptions, setCityOptions] = useState([]);
  const [timeOptions, setTimeOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [roundLocked, setRoundLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    generateNewRound();
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, []);

  const generateNewRound = () => {
    const shuffled = [...cities].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    const times = selected
      .map((c) => ({
        time: getCurrentTimeInCity(c.timezone),
        timezone: c.timezone,
      }))
      .sort(() => 0.5 - Math.random());

    setCityOptions(selected);
    setTimeOptions(times);
    setMessage("");
    setCurrentCityIndex(0);
    setRoundLocked(false);
    setTimeLeft(10);

    if (timerId) clearInterval(timerId);
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRoundLocked(true);
          setMessage("⏰ Time's up!");
          setTimeout(() => {
            generateNewRound();
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  const handleMatch = (timeObj) => {
    if (roundLocked) return;
    const city = cityOptions[currentCityIndex];
    const correctTime = getCurrentTimeInCity(city.timezone);

    if (correctTime === timeObj.time) {
      setScore((prev) => prev + 1);
      setMessage("🎉 Correct!");
      if (currentCityIndex + 1 < cityOptions.length) {
        setCurrentCityIndex((prev) => prev + 1);
      } else {
        setRoundLocked(true);
        clearInterval(timerId);
        setTimeout(() => {
          generateNewRound();
        }, 1500);
      }
    } else {
      setScore((prev) => (prev > 0 ? prev - 1 : 0));
      setMessage("❌ Try Again!");
    }
  };

  const buttonColors = [
    "from-pink-400 to-pink-600",
    "from-yellow-400 to-yellow-600",
    "from-cyan-400 to-blue-500",
    "from-green-400 to-emerald-500",
  ];

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-pink-200 via-yellow-200 to-blue-300 p-6 font-gaming text-gray-900 select-none"
    >
      <div className="max-w-lg w-full flex flex-col items-center space-y-8">
        {/* Header */}
        <header className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 rounded-xl shadow-md border-2 border-purple-400">
          <h1 className="text-3xl font-extrabold tracking-widest text-purple-700">
            TIMEXXONED
          </h1>
          <div className="text-2xl font-bold text-purple-600">⭐ {score}</div>
        </header>

        {/* City Section */}
        <section className="w-full bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center border-2 border-purple-300">
          <p className="mb-3 text-xl tracking-wide text-purple-600 font-semibold uppercase">
            What time is it in
          </p>
          <div className="flex items-center gap-6 text-6xl font-extrabold text-purple-800">
            <span>{cityOptions[currentCityIndex]?.flag || "❓"}</span>
            <span>{cityOptions[currentCityIndex]?.name || ""}</span>
          </div>
          <p className="mt-4 text-center text-purple-500 font-mono text-base">
            💡 {cityOptions[currentCityIndex]?.fact}
          </p>
          <div className="mt-4 text-lg text-red-600 font-bold">
            ⏳ Time Left: {timeLeft}s
          </div>
        </section>

        {/* Time Options */}
        <section className="w-full grid grid-cols-2 gap-6">
          {timeOptions.map((t, i) => (
            <div
              key={i}
              className={`overflow-hidden shadow-md transform transition hover:scale-110 active:scale-95 ${
                roundLocked ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <button
                onClick={() => handleMatch(t)}
                className={`w-full py-20 px-10 text-4xl font-extrabold bg-gradient-to-r ${
                  buttonColors[i % buttonColors.length]
                } text-white focus:outline-none focus:ring-4 focus:ring-purple-400 rounded-full`}
                type="button"
                aria-label={`Select time option ${t.time}`}
                disabled={roundLocked}
              >
                🕒 {t.time}
              </button>
            </div>
          ))}
        </section>

        {/* Feedback */}
        {message && (
          <p
            className={`mt-4 text-5xl font-extrabold ${
              message.includes("Correct") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {/* Footer */}
        <footer className="text-sm text-purple-700 font-mono tracking-wide text-center">
          Made with 🎈 for a pop @ Marinkie Thupi
        </footer>
      </div>
    </div>
  );
}
