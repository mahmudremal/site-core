import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import api from "../../../services/api";
import { sprintf } from "sprintf-js";

export default function LocationSelector({ __, onChangeCountry = null }) {
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (areas?.length) return;
    api.get('/addresses/coverage-area').then(res => res.data)
      .then(data => {
        setAreas(data.coverage.zones.flatMap(z => z.AREAS));
      });
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    if (!value) {
      setFiltered([]);
      return;
    }
    const lower = value.toLowerCase();
    const matches = areas.filter((a) =>
      a.NAME.toLowerCase().includes(lower) || a.POST_CODE == parseInt(value) || a?.District?.NAME?.toLowerCase?.().includes?.(lower)
    );
    setFiltered(matches.slice(0, 6)); // show top 6
  };

  const handleSelect = (area) => {
    setSelected(area);
    setSearch(area.NAME);
    setFiltered([]);
    console.log(area)
    updateLocation({
      country_code: 'BD', country: 'Bangladesh', location: area.NAME
    });
    if (typeof onChangeCountry == 'function') {
      onChangeCountry('BD');
    }
  };

  const handleGeoLocate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    if (!navigator.geolocation) {
      alert(__('Geolocation not supported', 'site-core'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        api.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`)
          .then(res => res.data).then(location => {
            const { display_name, importance, address: { country, country_code } } = location;
            console.log(display_name)
            updateLocation({
              country, latitude, longitude, location: display_name, accuracy: importance, country_code: country_code?.toUpperCase?.()
            });
            if (typeof onChangeCountry == 'function') {
              onChangeCountry(country_code?.toUpperCase?.());
            }
          })
          .then(() => {
            const random = areas[Math.floor(Math.random() * areas.length)];
            setSelected(random);
            setSearch(random.NAME);
          })
          .catch(err => console.log(err?.message))
          .finally(() => setLoading(false));
      },
      (err) => {
        console.log("Could not get location: " + err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const updateLocation = (newLocation) => {
    api.post('user/locale/update', { payload: newLocation })
      // .then(res => res)
      .catch(err => console.error(err));
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto space-y-2">
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGeoLocate}
              aria-label={__('Share location', 'site-core')}
              className="border border-gray-300 dark:border-scwhite dark:bg-scprimary px-4 py-2 rounded text-sm transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" /> : <MapPin />}
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={__('Enter area or ZIP code', 'site-core')}
              className="flex-1 border border-gray-300 dark:border-scwhite rounded px-3 py-2 text-sm text-gray-600 dark:text-scwhite bg-scwhite dark:bg-scprimary"
            />
          </div>
          {filtered.length > 0 && (
            <ul className="absolute z-10 bg-scwhite dark:bg-scprimary border border-gray-300 dark:border-scwhite rounded mt-1 w-full max-h-48 overflow-y-auto">
              {filtered.map((area, Index) => (
                <li
                  key={Index}
                  onClick={() => handleSelect(area)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  {sprintf(__('%s - %s', 'site-core'), area.NAME, area?.District?.NAME || '')}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="border border-gray-300 dark:border-scwhite dark:bg-scprimary px-4 py-2 rounded text-sm transition-colors"
          onClick={() => alert(selected ? selected.NAME : __('Please select a location', 'site-core'))}
        >
          {__('Apply', 'site-core')}
        </button>
      </div>

      {selected && (
        <div className="text-xs text-gray-500 dark:text-gray-300 italic mb-2">
          {sprintf(__('Selected: %s (%s)', 'site-core'), selected.NAME, selected.POST_CODE || __('N/A', 'site-core'))}
        </div>
      )}
    </div>
  );
}
