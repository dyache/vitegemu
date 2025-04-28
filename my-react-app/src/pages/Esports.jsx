import { useEffect, useState } from "react";
import axios from "axios";
import { Tv, MapPin, Calendar, Clock } from "lucide-react"; // assuming you use lucide-react icons

const Esports = () => {
  const [csData, setCsData] = useState([]);
  const [valorantData, setValorantData] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const [csRes, valRes] = await Promise.all([
          axios.get("http://localhost:8000/hltv/matches"),
          axios.get("http://localhost:8000/vlr/matches"),
        ]);

        console.log(csRes.data);
        console.log(valRes.data);

        setCsData(csRes.data); // CS2
        const parsedValRes = JSON.parse(valRes.data);
        setValorantData(parsedValRes.data ?? []);
      } catch (error) {
        console.error("Failed to fetch matches", error);
      }
    };

    fetchMatches();
  }, []);

  const minMatches = Math.min(csData.length, valorantData.length);

  const visibleCs = csData.slice(0, minMatches);
  const visibleVal = valorantData.slice(0, minMatches);

  const renderCsMatch = (match, index) => (
    <div
      key={index}
      className="bg-[#1a2235] border-purple-800 border rounded-md overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">{match.team_left}</span>
          <div className="text-2xl font-bold">0</div>
        </div>

        <div className="flex justify-center my-2">
          <span className="text-xs bg-[#0e131f] px-2 py-1 rounded">vs</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-bold">{match.team_right}</span>
          <div className="text-2xl font-bold">0</div>
        </div>

        {/* Лига */}
        <div className="mt-2 text-center text-xs text-purple-400">
          {match.league || "Unknown League"}
        </div>

        {/* Дата и время */}
        <div className="mt-4 pt-3 border-t border-[#0e131f] flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(match.datetime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(match.datetime).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValorantMatch = (match, index) => (
    <div
      key={index}
      className="bg-[#1a2235] border-purple-800 border rounded-md overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">{match.teams[0]?.name}</span>
          <div className="text-2xl font-bold">{match.teams[0]?.score ?? 0}</div>
        </div>

        <div className="flex justify-center my-2">
          <span className="text-xs bg-[#0e131f] px-2 py-1 rounded">vs</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-bold">{match.teams[1]?.name}</span>
          <div className="text-2xl font-bold">{match.teams[1]?.score ?? 0}</div>
        </div>

        {/* Турнир */}
        <div className="mt-2 text-center text-xs text-purple-400">
          {match.tournament || "Unknown Tournament"}
        </div>

        {/* Дата и время */}
        <div className="mt-4 pt-3 border-t border-[#0e131f] flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(match.utcDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(match.utcDate).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="container mx-auto p-4 mt-8">
      <h1 className="text-3xl font-bold text-center mb-8">Esports Matches</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CS2 Matches */}
        <div className="w-full bg-[#141b2d] border-purple-500 border rounded-xl overflow-hidden">
          <div className="p-4 bg-[#1a2235] border-b border-purple-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-400">
                CS2 Matches
              </h2>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {visibleCs.length > 0 ? (
              visibleCs.map(renderCsMatch)
            ) : (
              <p className="text-gray-400 text-center">No matches found.</p>
            )}
          </div>
        </div>

        {/* Valorant Matches */}
        <div className="w-full bg-[#141b2d] border-purple-500 border rounded-xl overflow-hidden">
          <div className="p-4 bg-[#1a2235] border-b border-purple-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-400">
                Valorant Matches
              </h2>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {visibleVal.length > 0 ? (
              visibleVal.map(renderValorantMatch)
            ) : (
              <p className="text-gray-400 text-center">No matches found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Esports;
