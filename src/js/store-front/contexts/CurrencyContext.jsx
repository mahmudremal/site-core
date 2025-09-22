import { createContext, useEffect, useState } from 'react';
import api from '../services/api';
import { sprintf } from 'sprintf-js';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('en');
  const [currencies, setCurrencies] = useState([
    { code: "bdt", name: "টাকা", flag: "🇧🇩", sign: '৳', prefix: false, rate: 121.76 },
    { code: "usd", name: "USD", flag: "🇺🇸", sign: '$', prefix: true, rate: 1 },
  ]);

  useEffect(() => {
    return;
    api.get(`currencies`)
    .then(res => res.data)
    .then(res => setCurrencies(res))
    .catch(err => console.log(err?.message));
  }, []);

  const money = (amount, currencyCode = null) => {
    const currencyObj = currencies.find(c => c.code == currencyCode || currency);
    return sprintf(
      '%s %s %s',
      currencyObj?.prefix ? currencyObj.sign : '',
      parseFloat(amount).toFixed(2),
      !currencyObj?.prefix ? currencyObj.sign : ''
    ).trim()
  };

  return (
    <CurrencyContext.Provider value={{ money, currencies, currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
