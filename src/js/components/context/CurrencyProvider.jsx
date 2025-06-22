import React, { useState, createContext, useContext, useEffect } from 'react';
import { useSession } from '@context/SessionProvider';
const CurrencyContext = createContext();

import { app_url, rest_url } from '@functions';
import request from '@common/request';

export default function CurrencyProvider({ children }) {
  const { session, setSession } = useSession();
  const [currency, setCurrency] = useState(session?.currency??'AED');
  const [currencyList, setCurrencyList] = useState([]);

  const loadLanguage = () => {
    request(rest_url('/sitecore/v1/currencies/list'))
    .then(data => {
      setCurrencyList(data);
    })
    .catch(console.error);
  }

  const get_currency = (code) => {
    return currencyList.find(c => c.code == code);
  }
  
  const print_money = (amount, againstCurr = false, toCode = false) => {
    const currObj = get_currency(againstCurr ? againstCurr : currency);
    if (! currObj) {return amount;}
    return currObj?.position == 'prefix' ? `${toCode ? currObj.code : currObj.sign} ${amount}` : `${amount} ${toCode ? currObj.code : currObj.sign}`
  }

  const change_currency = (newCurrency) => {
    setCurrency(newCurrency);
    setSession(prev => ({...prev, currency: newCurrency}));
  }
  
  useEffect(() => {
    loadLanguage();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, currencyList, print_money }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);