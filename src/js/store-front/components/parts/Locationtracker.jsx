import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";

const platforms = {
  geojs: {
    url: 'https://get.geojs.io/v1/ip/geo.json',
    mapping: {
      accuracy: 'accuracy',
    //   continent_code: 'continent_code',
      country: 'country',
      country_code: 'country_code',
      latitude: 'latitude',
      longitude: 'longitude',
      timezone: 'timezone',
      currency: null,
      location: 'country',
    }
  },
  ipapi: {
    url: 'https://ipapi.co/json',
    mapping: {
      accuracy: null,
    //   continent_code: 'continent_code',
      country: 'country_name',
      country_code: 'country_code',
      latitude: 'latitude',
      longitude: 'longitude',
      timezone: 'timezone',
      currency: 'currency_code',
      location: 'city',
    }
  },
  ipwhois: {
    url: 'https://ipwhois.app/json',
    mapping: {
      accuracy: null,
    //   continent_code: 'continent_code',
      country: 'country',
      country_code: 'country_code',
      latitude: 'latitude',
      longitude: 'longitude',
      timezone: 'timezone',
      location: 'city',
      currency: 'currency_code'
    }
  }
};

export default function Locationtracker({ config }) {
  const [platform, setPlatform] = useState('geojs');

  useEffect(() => {
    const requires = config?.["session.requires"];
    if (!requires || (Object.keys(requires)?.length <= 1 && requires.user_id == '0')) return;
    const { url: request_url, mapping } = platforms[platform];

    axios.get(request_url)
    .then(res => res.data)
    .then(data => {
        const payload = {};
        for (const key in mapping) {
            if (mapping?.[key] && data?.[mapping[key]]) payload[key] = data[mapping[key]];
        }
        api.post('user/locale/update', { payload });
    })
    .catch(err => {});
  }, [platform, config]);

  return null;
}