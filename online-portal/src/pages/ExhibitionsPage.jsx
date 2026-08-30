import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Search, SlidersHorizontal, Store, Users } from "lucide-react";
import { getExhibitions } from "../services/exhibition.service";

const dateRange = (start, end) => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(`${start}T00:00:00`).toLocaleDateString(undefined, options)} – ${new Date(`${end}T00:00:00`).toLocaleDateString(undefined, options)}`;
};

export default function ExhibitionsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("ALL");
  const [cityOptions, setCityOptions] = useState(["ALL"]);
  const [timeframe, setTimeframe] = useState("ALL");

  useEffect(() => {
    let active = true;
    getExhibitions({ query: query || undefined, city: city === "ALL" ? undefined : city, timeframe })
      .then((data) => {
        if (!active) return;
        setEvents(data);
        setCityOptions((previous) => [...new Set([...previous, ...data.map((event) => event.venue?.city).filter(Boolean)])]);
      })
      .catch((message) => active && setError(message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [query, city, timeframe]);

  const cities = useMemo(() => cityOptions, [cityOptions]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100"><CalendarDays size={14} /> Events & exhibitions</span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">Find your next exhibition</h1>
          <p className="mt-4 max-w-2xl text-blue-100 leading-relaxed">Explore current and upcoming events, compare venues and dates, then select the exhibition where you would like to reserve a stall.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by event, venue, or city" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">
            <option value="ALL">Current & upcoming</option><option value="CURRENT">Current events</option><option value="UPCOMING">Upcoming events</option>
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">
            {cities.map((item) => <option key={item} value={item}>{item === "ALL" ? "All cities" : item}</option>)}
          </select>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><SlidersHorizontal size={14} /> Filters update the event list immediately.</div>

        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="py-20 text-center text-slate-500">Loading exhibitions…</div> : events.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><h2 className="font-bold text-slate-800">No matching exhibitions</h2><p className="mt-2 text-sm text-slate-500">Try a different search or filter.</p></div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <article key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white"><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-black leading-tight">{event.name}</h2><span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{event.status}</span></div></div>
                <div className="p-6"><p className="min-h-12 text-sm leading-relaxed text-slate-600">{event.description || "Event information will be announced shortly."}</p>
                  <dl className="mt-6 space-y-3 text-sm text-slate-600"><div className="flex gap-3"><CalendarDays size={17} className="mt-0.5 shrink-0 text-blue-600" /><div><dt className="font-semibold text-slate-800">Event dates</dt><dd>{dateRange(event.startDate, event.endDate)}</dd></div></div><div className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" /><div><dt className="font-semibold text-slate-800">{event.venue?.name}</dt><dd>{[event.venue?.addressLine1, event.venue?.city, event.venue?.country].filter(Boolean).join(", ")}</dd></div></div><div className="flex gap-3"><Store size={17} className="mt-0.5 shrink-0 text-blue-600" /><div><dt className="font-semibold text-slate-800">Stall availability</dt><dd>{event.availableStalls} of {event.totalStalls} active stalls currently available</dd></div></div>{event.maxStallsPerVendor && <div className="flex gap-3"><Users size={17} className="mt-0.5 shrink-0 text-blue-600" /><div><dt className="font-semibold text-slate-800">Vendor limit</dt><dd>Up to {event.maxStallsPerVendor} stalls per vendor</dd></div></div>}</dl>
                  <button onClick={() => navigate(`/exhibitions/${event.id}/stalls`)} disabled={event.availableStalls === 0} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300">{event.availableStalls === 0 ? "No stalls available" : "View available stalls"}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
