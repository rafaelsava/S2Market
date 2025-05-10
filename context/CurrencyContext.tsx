import React, { createContext, useContext, useEffect, useState } from "react";

type Currency = "COP" | "USD" | "EUR" | "MXN";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<string, number>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "COP",
  setCurrency: () => {},
  rates: {},
  loading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>("COP");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(
          "https://v6.exchangerate-api.com/v6/bf1ee1c1716ab57449f01537/latest/COP"
        );
        const data = await res.json();
        setRates(data.conversion_rates);
        console.log("peticion hecha");
      } catch (error) {
        console.error("Error al obtener tasas de cambio", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
