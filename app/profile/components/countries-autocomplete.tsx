import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface CountryOption {
     name: string;
}


interface CountryAutocompleteProps {
     value: string;
     onChange: (value: string) => void;
}


export function CountryAutocomplete({ value, onChange }: CountryAutocompleteProps) {
     const [options, setOptions] = useState<CountryOption[]>([]);
     const [inputValue, setInputValue] = useState('');

     useEffect(() => {
          if (!inputValue) return;

          const fetchCountries = async () => {
               try {
                    const response = await fetch(`https://restcountries.com/v3.1/name/${inputValue}`);
                    const responseData = await response.json();

                    const countryNames = responseData.map((country: any) => ({
                         name: country.name.common,
                    }));

                    setOptions(countryNames);
               } catch (error) {
                    console.error('Failed to fetch countries:', error);
                    setOptions([]);
               }
          };

          const timeoutId = setTimeout(fetchCountries, 300); // debounce a bit

          return () => clearTimeout(timeoutId);
     }, [inputValue]);

     return (
          <Autocomplete
               options={options}
               getOptionLabel={(option) => option.name}
               onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
               onChange={(_, newValue) => {
                    onChange(newValue?.name || '');
               }}
               value={value ? { name: value } : null}
               renderInput={(params) => <TextField {...params} label="Country" />}
               sx={{ my: 2 }}
          />
     );
}
