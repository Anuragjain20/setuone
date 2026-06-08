import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface City {
  slug: string;
  name: string;
  state: string;
  areas: string[];
}

export const CITIES: City[] = [
  { slug: "indore", name: "Indore", state: "Madhya Pradesh", areas: ["Vijay Nagar", "Palasia", "New Palasia", "Sukhliya", "Scheme 54", "Scheme 78", "AB Road", "LIG Colony", "Nipania", "Rajendra Nagar", "Annapurna", "MG Road"] },
  { slug: "bhopal", name: "Bhopal", state: "Madhya Pradesh", areas: ["MP Nagar", "Arera Colony", "Hoshangabad Road", "Kolar Road", "New Market", "Habibganj", "Piplani", "Ayodhya Bypass"] },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", areas: ["Vaishali Nagar", "Mansarovar", "Tonk Road", "C-Scheme", "Malviya Nagar", "Jagatpura", "Raja Park", "Bani Park"] },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", areas: ["Gomtinagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Vikas Nagar", "Alambagh", "Jankipuram"] },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", areas: ["Dharampeth", "Sitabuldi", "Sadar", "Ramdaspeth", "Civil Lines", "Manewada", "Wardhaman Nagar", "Pratap Nagar"] },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", areas: ["Andheri", "Bandra", "Thane", "Borivali", "Dadar", "Kurla", "Mulund", "Powai", "Malad", "Kandivali"] },
  { slug: "pune", name: "Pune", state: "Maharashtra", areas: ["Kothrud", "Wakad", "Baner", "Aundh", "Hadapsar", "Magarpatta", "Viman Nagar", "Kharadi", "Kondhwa", "Katraj"] },
  { slug: "delhi", name: "Delhi", state: "Delhi", areas: ["Dwarka", "Rohini", "Pitampura", "Janakpuri", "Saket", "Lajpat Nagar", "Mayur Vihar", "Vasant Kunj", "Preet Vihar", "Paschim Vihar"] },
  { slug: "bangalore", name: "Bangalore", state: "Karnataka", areas: ["Indiranagar", "Koramangala", "Whitefield", "Marathahalli", "Jayanagar", "HSR Layout", "BTM Layout", "Electronic City", "Hebbal", "Yelahanka"] },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", areas: ["Jubilee Hills", "Banjara Hills", "Gachibowli", "Madhapur", "Kondapur", "Hitech City", "Kukatpally", "Miyapur", "Secunderabad", "Ameerpet"] },
];

interface CityContextValue {
  city: City | null;
  setCity: (city: City) => void;
  cities: City[];
}

const CityContext = createContext<CityContextValue>({
  city: null,
  setCity: () => {},
  cities: CITIES,
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<City | null>(() => {
    const saved = localStorage.getItem("snapfix_city");
    if (saved) {
      try {
        return CITIES.find((c) => c.slug === saved) ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleSetCity = (c: City) => {
    setCity(c);
    localStorage.setItem("snapfix_city", c.slug);
  };

  return (
    <CityContext.Provider value={{ city, setCity: handleSetCity, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
