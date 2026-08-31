import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarDays, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Store, 
  Users, 
  X, 
  ArrowUpDown,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getExhibitions } from "../services/exhibition.service";

const dateRange = (start, end) => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(`${start}T00:00:00`).toLocaleDateString(undefined, options)} – ${new Date(`${end}T00:00:00`).toLocaleDateString(undefined, options)}`;
};

const getStatusColor = (status) => {
  const colors = {
    PUBLISHED: "bg-green-100 text-green-700 border-green-200",
    DRAFT: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[status] || "bg-blue-100 text-blue-700 border-blue-200";
};

const getStatusIcon = (status) => {
  const icons = {
    PUBLISHED: <CheckCircle2 size={12} />,
    DRAFT: <Clock size={12} />,
    CLOSED: <AlertCircle size={12} />,
    CANCELLED: <X size={12} />,
  };
  return icons[status] || <CheckCircle2 size={12} />;
};

// Skeleton loader component
const ExhibitionSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
    <div className="bg-slate-200 h-24"></div>
    <div className="p-6 space-y-4">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      <div className="h-10 bg-slate-200 rounded mt-6"></div>
    </div>
  </div>
);

export default function ExhibitionsPage() {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [city, setCity] = useState("ALL");
  const [cityOptions, setCityOptions] = useState(["ALL"]);
  const [timeframe, setTimeframe] = useState("ALL");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const debounceTimerRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Fetch exhibitions
  useEffect(() => {
    let active = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        const data = await getExhibitions({ 
          query: debouncedQuery || undefined, 
          city: city === "ALL" ? undefined : city, 
          timeframe 
        });
        
        if (!active) return;
        
        setAllEvents(data);
        const uniqueCities = ["ALL", ...new Set(data.map((event) => event.venue?.city).filter(Boolean))];
        setCityOptions(uniqueCities);
      } catch (message) {
        if (active) {
          setError(message);
          setAllEvents([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchData();
      
    return () => { active = false; };
  }, [debouncedQuery, city, timeframe]);

  // Apply client-side sorting
  useEffect(() => {
    const sorted = [...allEvents].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name": {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case "startDate": {
          comparison = new Date(a.startDate) - new Date(b.startDate);
          break;
        }
        case "availability": {
          const availA = a.availableStalls / a.totalStalls;
          const availB = b.availableStalls / b.totalStalls;
          comparison = availB - availA;
          break;
        }
        case "city": {
          comparison = (a.venue?.city || "").localeCompare(b.venue?.city || "");
          break;
        }
        default: {
          comparison = 0;
        }
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setDisplayedEvents(sorted);
  }, [allEvents, sortBy, sortOrder]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setCity("ALL");
    setTimeframe("ALL");
    setSortBy("startDate");
    setSortOrder("asc");
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return query !== "" || city !== "ALL" || timeframe !== "ALL" || sortBy !== "startDate" || sortOrder !== "asc";
  }, [query, city, timeframe, sortBy, sortOrder]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query) count++;
    if (city !== "ALL") count++;
    if (timeframe !== "ALL") count++;
    return count;
  }, [query, city, timeframe]);

  const cities = useMemo(() => cityOptions, [cityOptions]);

  // Calculate availability percentage
  const getAvailabilityPercentage = (event) => {
    if (event.totalStalls === 0) return 0;
    return Math.round((event.availableStalls / event.totalStalls) * 100);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">
            <CalendarDays size={14} aria-hidden="true" /> 
            Events & exhibitions
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Find your next exhibition
          </h1>
          <p className="mt-4 max-w-2xl text-blue-100 leading-relaxed">
            Explore current and upcoming events, compare venues and dates, then select the exhibition where you would like to reserve a stall.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
          {/* Main Filters */}
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
            <label className="relative block" htmlFor="search-exhibitions">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input 
                id="search-exhibitions"
                type="text"
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search by event, venue, or city" 
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                aria-label="Search exhibitions"
              />
            </label>
            
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)} 
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
              aria-label="Filter by timeframe"
            >
              <option value="ALL">Current & upcoming</option>
              <option value="CURRENT">Current events</option>
              <option value="UPCOMING">Upcoming events</option>
            </select>
            
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
              aria-label="Filter by city"
            >
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All cities" : item}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                aria-label="Clear all filters"
              >
                <X size={16} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                aria-expanded={showAdvancedFilters}
                aria-label="Toggle advanced filters"
              >
                <Filter size={14} aria-hidden="true" />
                {showAdvancedFilters ? "Hide" : "Show"} sorting options
              </button>
              
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {activeFilterCount} active filter{activeFilterCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <TrendingUp size={14} aria-hidden="true" />
              {!loading && `${displayedEvents.length} exhibition${displayedEvents.length !== 1 ? "s" : ""} found`}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-slate-700 mb-2">
                  Sort by
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="startDate">Start Date</option>
                  <option value="name">Event Name</option>
                  <option value="availability">Availability</option>
                  <option value="city">City</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort-order" className="block text-sm font-medium text-slate-700 mb-2">
                  Order
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <SlidersHorizontal size={14} aria-hidden="true" /> 
          Filters update the event list automatically.
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3" role="alert">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Unable to load exhibitions</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2" role="status" aria-live="polite" aria-label="Loading exhibitions">
            {[...Array(4)].map((_, index) => (
              <ExhibitionSkeleton key={index} />
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search size={32} className="text-slate-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No matching exhibitions</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Try adjusting your filters or search terms to find more exhibitions." 
                : "There are currently no exhibitions available."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <X size={16} aria-hidden="true" />
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Events Grid */
          <div className="mt-8 grid gap-6 md:grid-cols-2" role="list" aria-label="Exhibition listings">
            {displayedEvents.map((event) => {
              const availabilityPercentage = getAvailabilityPercentage(event);
              
              return (
                <article 
                  key={event.id} 
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-within:ring-4 focus-within:ring-blue-100"
                  role="listitem"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-black leading-tight">
                        {event.name}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="min-h-12 text-sm leading-relaxed text-slate-600">
                      {event.description || "Event information will be announced shortly."}
                    </p>

                    {/* Event Details */}
                    <dl className="mt-6 space-y-3 text-sm text-slate-600">
                      {/* Date */}
                      <div className="flex gap-3">
                        <CalendarDays size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                        <div>
                          <dt className="font-semibold text-slate-800">Event dates</dt>
                          <dd>{dateRange(event.startDate, event.endDate)}</dd>
                        </div>
                      </div>

                      {/* Venue */}
                      <div className="flex gap-3">
                        <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                        <div>
                          <dt className="font-semibold text-slate-800">{event.venue?.name}</dt>
                          <dd>{[event.venue?.addressLine1, event.venue?.city, event.venue?.country].filter(Boolean).join(", ")}</dd>
                        </div>
                      </div>

                      {/* Stall Availability */}
                      <div className="flex gap-3">
                        <Store size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                        <div className="flex-1">
                          <dt className="font-semibold text-slate-800">Stall availability</dt>
                          <dd className="mt-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{event.availableStalls} of {event.totalStalls} available</span>
                              <span className={`font-semibold ${availabilityPercentage > 50 ? "text-green-600" : availabilityPercentage > 20 ? "text-yellow-600" : "text-red-600"}`}>
                                {availabilityPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${availabilityPercentage > 50 ? "bg-green-500" : availabilityPercentage > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${availabilityPercentage}%` }}
                                role="progressbar"
                                aria-valuenow={availabilityPercentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-label={`${availabilityPercentage}% stalls available`}
                              ></div>
                            </div>
                          </dd>
                        </div>
                      </div>

                      {/* Vendor Limit */}
                      {event.maxStallsPerVendor && (
                        <div className="flex gap-3">
                          <Users size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                          <div>
                            <dt className="font-semibold text-slate-800">Vendor limit</dt>
                            <dd>Up to {event.maxStallsPerVendor} stalls per vendor</dd>
                          </div>
                        </div>
                      )}
                    </dl>

                    {/* Action Button */}
                    <button
                      onClick={() => navigate(`/exhibitions/${event.id}/stalls`)}
                      disabled={event.availableStalls === 0}
                      className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      aria-label={event.availableStalls === 0 ? `No stalls available for ${event.name}` : `View available stalls for ${event.name}`}
                    >
                      {event.availableStalls === 0 ? "No stalls available" : "View available stalls"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
