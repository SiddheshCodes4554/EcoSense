import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLocationStore = create(
    persist(
        (set) => ({
            coordinates: null,
            locationName: null,
            searchHistory: [],
            isTracking: false,
            setCoordinates: (coords) => set({ coordinates: coords }),
            setLocationName: (name) => set({ locationName: name }),
            setIsTracking: (tracking) => set({ isTracking: tracking }),
            addToHistory: (location) => set((state) => ({
                searchHistory: [location, ...state.searchHistory.filter(h => h !== location)].slice(0, 5)
            })),
        }),
        {
            name: 'aqi-location-storage', // unique name
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
