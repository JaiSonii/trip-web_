import React, { useState, useEffect, useCallback } from 'react';
import Autosuggest, { SuggestionsFetchRequestedParams, SuggestionSelectedEventData } from 'react-autosuggest';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { indianStates } from '@/utils/utilArray';

interface RouteInputsProps {
    formData: {
        route: {
            origin: string;
            destination: string;
        };
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const cache: { [key: string]: string[] } = {};

const RouteInputs: React.FC<RouteInputsProps> = ({ formData, handleChange }) => {
    const [suggestionsOrigin, setSuggestionsOrigin] = useState<string[]>([]);
    const [suggestionsDestination, setSuggestionsDestination] = useState<string[]>([]);
    const [highlightedSuggestion, setHighlightedSuggestion] = useState<string | null>(null);

    const fetchSuggestions = useCallback(
        debounce(async (value: string, setSuggestions: React.Dispatch<React.SetStateAction<string[]>>) => {
            if (cache[value]) {
                setSuggestions(cache[value]);
                return;
            }
            try {
                const username = 'fragtos'; // Replace with your GeoNames username
                const response = await axios.get(`https://secure.geonames.org/searchJSON?name_startsWith=${value}&maxRows=7&country=IN&username=${username}`);
                const data = response.data;

                const uniqueSuggestions = Array.from(new Set(data.geonames.map((city: any) => city.name + ", " + indianStates[city.adminName1 as string] || city.adminName1)));
                cache[value] = uniqueSuggestions as string[];
                setSuggestions(uniqueSuggestions as []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (formData.route?.origin?.trim().length > 0) {
            fetchSuggestions(formData.route.origin, setSuggestionsOrigin);
        }
    }, [formData.route?.origin, fetchSuggestions]);

    useEffect(() => {
        if (formData.route?.destination?.trim().length > 0) {
            fetchSuggestions(formData.route.destination, setSuggestionsDestination);
        }
    }, [formData.route?.destination, fetchSuggestions]);

    const handleOriginChange = (event: React.ChangeEvent<HTMLInputElement>, { newValue }: { newValue: string }) => {
        handleChange({ ...event, target: { ...event.target, name: 'route.origin', value: newValue } });
    };

    const handleDestinationChange = (event: React.ChangeEvent<HTMLInputElement>, { newValue }: { newValue: string }) => {
        handleChange({ ...event, target: { ...event.target, name: 'route.destination', value: newValue } });
    };

    const handleSuggestionSelected = (setSuggestions: React.Dispatch<React.SetStateAction<string[]>>, fieldName: 'route.origin' | 'route.destination') => (
        event: React.FormEvent<any>,
        { suggestion }: SuggestionSelectedEventData<string>
    ) => {
        handleChange({ target: { name: fieldName, value: suggestion } } as any);
        setSuggestions([]);
    };

    const renderSuggestion = (suggestion: string) => {
        const isHighlighted = suggestion === highlightedSuggestion;
        return (
            <div
                className={`p-2 cursor-pointer ${isHighlighted ? 'bg-gray-200' : ''}`}
                onMouseEnter={() => setHighlightedSuggestion(suggestion)}
                onMouseLeave={() => setHighlightedSuggestion(null)}
            >
                {suggestion}
            </div>
        );
    };

    const inputProps = (placeholder: string, value: string, onChange: (event: any, { newValue }: any) => void) => ({
        placeholder,
        value,
        onChange,
        className: 'w-full p-2 border border-gray-300 rounded-md'
    });

    return (
        <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/2 mb-4 pr-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">From*</label>
                <Autosuggest
                    suggestions={suggestionsOrigin}
                    onSuggestionsFetchRequested={(params: SuggestionsFetchRequestedParams) => fetchSuggestions(params.value, setSuggestionsOrigin)}
                    onSuggestionsClearRequested={() => setSuggestionsOrigin([])}
                    onSuggestionSelected={(event, data) => handleSuggestionSelected(setSuggestionsOrigin, 'route.origin')(event, data)}
                    getSuggestionValue={(suggestion) => suggestion}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps("Enter city", formData.route.origin, handleOriginChange)}
                    shouldRenderSuggestions={(value) => value.trim().length > 0}
                    theme={{
                        container: 'relative',
                        suggestionsContainer: 'absolute mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50',
                        suggestion: 'p-2 cursor-pointer',
                        suggestionHighlighted: 'bg-gray-200',
                    }}
                />
            </div>
            <div className="w-full md:w-1/2 mb-4 pl-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">To*</label>
                <Autosuggest
                    suggestions={suggestionsDestination}
                    onSuggestionsFetchRequested={(params: SuggestionsFetchRequestedParams) => fetchSuggestions(params.value, setSuggestionsDestination)}
                    onSuggestionsClearRequested={() => setSuggestionsDestination([])}
                    onSuggestionSelected={(event, data) => handleSuggestionSelected(setSuggestionsDestination, 'route.destination')(event, data)}
                    getSuggestionValue={(suggestion) => suggestion}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps("Enter city", formData.route.destination, handleDestinationChange)}
                    shouldRenderSuggestions={(value) => value.trim().length > 0}
                    theme={{
                        container: 'relative',
                        suggestionsContainer: 'absolute mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50',
                        suggestion: 'p-2 cursor-pointer',
                        suggestionHighlighted: 'bg-gray-200',
                    }}
                />
            </div>
        </div>
    );
};

export default RouteInputs;
