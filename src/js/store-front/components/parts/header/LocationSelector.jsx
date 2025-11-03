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
            country, latitude,	longitude, location: display_name, accuracy: importance, country_code: country_code?.toUpperCase?.()
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
    api.post('user/locale/update', {payload: newLocation})
    // .then(res => res)
    .catch(err => console.error(err));
  }

  return (
    <div className="xpo_flex xpo_flex-col xpo_w-full xpo_max-w-md xpo_mx-auto xpo_space-y-2">
      <div className="xpo_flex xpo_gap-2 xpo_mb-2">
        <div className="xpo_relative xpo_flex-1">
          <div className="xpo_flex xpo_items-center xpo_gap-2">
            <button
              type="button"
              onClick={handleGeoLocate}
              aria-label={__('Share location', 'site-core')}
              className="xpo_border xpo_border-gray-300 dark:xpo_border-scwhite dark:xpo_bg-scprimary xpo_px-4 xpo_py-2 xpo_rounded xpo_text-sm xpo_transition-colors"
            >
              {loading ? <Loader2 className="xpo_animate-spin" /> : <MapPin />}
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={__('Enter area or ZIP code', 'site-core')}
              className="xpo_flex-1 xpo_border xpo_border-gray-300 dark:xpo_border-scwhite xpo_rounded xpo_px-3 xpo_py-2 xpo_text-sm xpo_text-gray-600 dark:xpo_text-scwhite xpo_bg-scwhite dark:xpo_bg-scprimary"
            />
          </div>
          {filtered.length > 0 && (
            <ul className="xpo_absolute xpo_z-10 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_border xpo_border-gray-300 dark:xpo_border-scwhite xpo_rounded xpo_mt-1 xpo_w-full xpo_max-h-48 xpo_overflow-y-auto">
              {filtered.map((area, Index) => (
                <li
                  key={Index}
                  onClick={() => handleSelect(area)}
                  className="xpo_px-3 xpo_py-2 xpo_cursor-pointer hover:xpo_bg-gray-100 dark:hover:xpo_bg-gray-700 xpo_text-sm"
                >
                  {sprintf(__('%s - %s', 'site-core'), area.NAME, area?.District?.NAME || '')}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="xpo_border xpo_border-gray-300 dark:xpo_border-scwhite dark:xpo_bg-scprimary xpo_px-4 xpo_py-2 xpo_rounded xpo_text-sm xpo_transition-colors"
          onClick={() => alert(selected ? selected.NAME : __('Please select a location', 'site-core'))}
        >
          {__('Apply', 'site-core')}
        </button>
      </div>

      {selected && (
        <div className="xpo_text-xs xpo_text-gray-500 dark:xpo_text-gray-300 xpo_italic xpo_mb-2">
          {sprintf(__('Selected: %s (%s)', 'site-core'), selected.NAME, selected.POST_CODE || __('N/A', 'site-core'))}
        </div>
      )}
    </div>
  );
}
