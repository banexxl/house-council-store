import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface CountryAutocompleteProps {
     value: string;
     onChange: (value: string) => void;
}


export function CountryAutocomplete({ value, onChange }: CountryAutocompleteProps) {
     const [inputValue, setInputValue] = useState('');
     const [options, setOptions] = useState<Country[]>([]);

     useEffect(() => {
          if (!inputValue) return;

          const filteredCountries = countries.filter((country) => country.country_name.toLowerCase().includes(inputValue.toLowerCase()));
          setOptions(filteredCountries);
     }, [inputValue]);

     return (
          <Autocomplete
               options={options}
               getOptionLabel={(option) => `${option.country_name} ${option.dialling_code}`}
               onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
               onChange={(_, newValue) => {
                    onChange(newValue?.country_name || '');
               }}
               value={value ? countries.find((country) => country.country_name === value) : null}
               renderInput={(params) => <TextField {...params} label="Country" />}
               sx={{ my: 2 }}
          />
     );
}

export type Country = {
     code: string;
     country_name: string;
     dialling_code: string;
}

export const countries: Country[] = [
     {
          "code": "AD",
          "country_name": "Andorra",
          "dialling_code": "+376"
     },
     {
          "code": "AE",
          "country_name": "United Arab Emirates",
          "dialling_code": "+971"
     },
     {
          "code": "AF",
          "country_name": "Afghanistan",
          "dialling_code": "+93"
     },
     {
          "code": "AG",
          "country_name": "Antigua",
          "dialling_code": "+1"
     },
     {
          "code": "AI",
          "country_name": "Anguilla",
          "dialling_code": "+1"
     },
     {
          "code": "AL",
          "country_name": "Albania",
          "dialling_code": "+355"
     },
     {
          "code": "AM",
          "country_name": "Armenia",
          "dialling_code": "+374"
     },
     {
          "code": "AN",
          "country_name": "Netherlands Antilles",
          "dialling_code": "+599"
     },
     {
          "code": "AO",
          "country_name": "Angola",
          "dialling_code": "+244"
     },
     {
          "code": "AR",
          "country_name": "Argentina",
          "dialling_code": "+54"
     },
     {
          "code": "AS",
          "country_name": "American Samoa",
          "dialling_code": "+1"
     },
     {
          "code": "AT",
          "country_name": "Austria",
          "dialling_code": "+43"
     },
     {
          "code": "AU",
          "country_name": "Australia",
          "dialling_code": "+61"
     },
     {
          "code": "AW",
          "country_name": "Aruba",
          "dialling_code": "+297"
     },
     {
          "code": "AZ",
          "country_name": "Azerbaijan",
          "dialling_code": "+994"
     },
     {
          "code": "BA",
          "country_name": "Bosnia and Herzegovina",
          "dialling_code": "+387"
     },
     {
          "code": "BB",
          "country_name": "Barbados",
          "dialling_code": "+1"
     },
     {
          "code": "BD",
          "country_name": "Bangladesh",
          "dialling_code": "+880"
     },
     {
          "code": "BE",
          "country_name": "Belgium",
          "dialling_code": "+32"
     },
     {
          "code": "BF",
          "country_name": "Burkina Faso",
          "dialling_code": "+226"
     },
     {
          "code": "BG",
          "country_name": "Bulgaria",
          "dialling_code": "+359"
     },
     {
          "code": "BH",
          "country_name": "Bahrain",
          "dialling_code": "+973"
     },
     {
          "code": "BI",
          "country_name": "Burundi",
          "dialling_code": "+257"
     },
     {
          "code": "BJ",
          "country_name": "Benin",
          "dialling_code": "+229"
     },
     {
          "code": "BL",
          "country_name": "Saint Barthélemy",
          "dialling_code": "+590"
     },
     {
          "code": "BM",
          "country_name": "Bermuda",
          "dialling_code": "+1"
     },
     {
          "code": "BN",
          "country_name": "Brunei",
          "dialling_code": "+673"
     },
     {
          "code": "BO",
          "country_name": "Bolivia",
          "dialling_code": "+591"
     },
     {
          "code": "BR",
          "country_name": "Brazil",
          "dialling_code": "+55"
     },
     {
          "code": "BS",
          "country_name": "The Bahamas",
          "dialling_code": "+1"
     },
     {
          "code": "BT",
          "country_name": "Bhutan",
          "dialling_code": "+975"
     },
     {
          "code": "BW",
          "country_name": "Botswana",
          "dialling_code": "+267"
     },
     {
          "code": "BY",
          "country_name": "Belarus",
          "dialling_code": "+375"
     },
     {
          "code": "BZ",
          "country_name": "Belize",
          "dialling_code": "+501"
     },
     {
          "code": "CA",
          "country_name": "Canada",
          "dialling_code": "+1"
     },
     {
          "code": "CD",
          "country_name": "Democratic Republic of Congo",
          "dialling_code": "+243"
     },
     {
          "code": "CF",
          "country_name": "Central African Republic",
          "dialling_code": "+236"
     },
     {
          "code": "CG",
          "country_name": "Republic of the Congo",
          "dialling_code": "+242"
     },
     {
          "code": "CH",
          "country_name": "Switzerland",
          "dialling_code": "+41"
     },
     {
          "code": "CI",
          "country_name": "Côte d'Ivoire",
          "dialling_code": "+225"
     },
     {
          "code": "CK",
          "country_name": "Cook Islands",
          "dialling_code": "+682"
     },
     {
          "code": "CL",
          "country_name": "Chile",
          "dialling_code": "+56"
     },
     {
          "code": "CM",
          "country_name": "Cameroon",
          "dialling_code": "+237"
     },
     {
          "code": "CN",
          "country_name": "China",
          "dialling_code": "+86"
     },
     {
          "code": "CO",
          "country_name": "Colombia",
          "dialling_code": "+57"
     },
     {
          "code": "CR",
          "country_name": "Costa Rica",
          "dialling_code": "+506"
     },
     {
          "code": "CU",
          "country_name": "Cuba",
          "dialling_code": "+53"
     },
     {
          "code": "CV",
          "country_name": "Cape Verde",
          "dialling_code": "+238"
     },
     {
          "code": "CY",
          "country_name": "Cyprus",
          "dialling_code": "+357"
     },
     {
          "code": "CZ",
          "country_name": "Czech Republic",
          "dialling_code": "+420"
     },
     {
          "code": "DE",
          "country_name": "Germany",
          "dialling_code": "+49"
     },
     {
          "code": "DJ",
          "country_name": "Djibouti",
          "dialling_code": "+253"
     },
     {
          "code": "DK",
          "country_name": "Denmark",
          "dialling_code": "+45"
     },
     {
          "code": "DM",
          "country_name": "Dominica",
          "dialling_code": "+1"
     },
     {
          "code": "DO",
          "country_name": "Dominican Republic",
          "dialling_code": "+1"
     },
     {
          "code": "DZ",
          "country_name": "Algeria",
          "dialling_code": "+213"
     },
     {
          "code": "EC",
          "country_name": "Ecuador",
          "dialling_code": "+593"
     },
     {
          "code": "EE",
          "country_name": "Estonia",
          "dialling_code": "+372"
     },
     {
          "code": "EG",
          "country_name": "Egypt",
          "dialling_code": "+20"
     },
     {
          "code": "ER",
          "country_name": "Eritrea",
          "dialling_code": "+291"
     },
     {
          "code": "ES",
          "country_name": "Spain",
          "dialling_code": "+34"
     },
     {
          "code": "ET",
          "country_name": "Ethiopia",
          "dialling_code": "+251"
     },
     {
          "code": "FI",
          "country_name": "Finland",
          "dialling_code": "+358"
     },
     {
          "code": "FJ",
          "country_name": "Fiji",
          "dialling_code": "+679"
     },
     {
          "code": "FK",
          "country_name": "Falkland Islands",
          "dialling_code": "+500"
     },
     {
          "code": "FM",
          "country_name": "Federated States of Micronesia",
          "dialling_code": "+691"
     },
     {
          "code": "FO",
          "country_name": "Faroe Islands",
          "dialling_code": "+298"
     },
     {
          "code": "FR",
          "country_name": "France",
          "dialling_code": "+33"
     },
     {
          "code": "GA",
          "country_name": "Gabon",
          "dialling_code": "+241"
     },
     {
          "code": "GB",
          "country_name": "United Kingdom",
          "dialling_code": "+44"
     },
     {
          "code": "GD",
          "country_name": "Grenada",
          "dialling_code": "+1"
     },
     {
          "code": "GE",
          "country_name": "Georgia",
          "dialling_code": "+995"
     },
     {
          "code": "GF",
          "country_name": "French Guiana",
          "dialling_code": "+594"
     },
     {
          "code": "GH",
          "country_name": "Ghana",
          "dialling_code": "+233"
     },
     {
          "code": "GI",
          "country_name": "Gibraltar",
          "dialling_code": "+350"
     },
     {
          "code": "GL",
          "country_name": "Greenland",
          "dialling_code": "+299"
     },
     {
          "code": "GM",
          "country_name": "The Gambia",
          "dialling_code": "+220"
     },
     {
          "code": "GN",
          "country_name": "Guinea",
          "dialling_code": "+224"
     },
     {
          "code": "GP",
          "country_name": "Guadeloupe",
          "dialling_code": "+590"
     },
     {
          "code": "GQ",
          "country_name": "Equatorial Guinea",
          "dialling_code": "+240"
     },
     {
          "code": "GR",
          "country_name": "Greece",
          "dialling_code": "+30"
     },
     {
          "code": "GT",
          "country_name": "Guatemala",
          "dialling_code": "+502"
     },
     {
          "code": "GU",
          "country_name": "Guam",
          "dialling_code": "+1"
     },
     {
          "code": "GW",
          "country_name": "Guinea-Bissau",
          "dialling_code": "+245"
     },
     {
          "code": "GY",
          "country_name": "Guyana",
          "dialling_code": "+592"
     },
     {
          "code": "HK",
          "country_name": "Hong Kong",
          "dialling_code": "+852"
     },
     {
          "code": "HN",
          "country_name": "Honduras",
          "dialling_code": "+504"
     },
     {
          "code": "HR",
          "country_name": "Croatia",
          "dialling_code": "+385"
     },
     {
          "code": "HT",
          "country_name": "Haiti",
          "dialling_code": "+509"
     },
     {
          "code": "HU",
          "country_name": "Hungary",
          "dialling_code": "+36"
     },
     {
          "code": "ID",
          "country_name": "Indonesia",
          "dialling_code": "+62"
     },
     {
          "code": "IE",
          "country_name": "Ireland",
          "dialling_code": "+353"
     },
     {
          "code": "IL",
          "country_name": "Israel",
          "dialling_code": "+972"
     },
     {
          "code": "IN",
          "country_name": "India",
          "dialling_code": "+91"
     },
     {
          "code": "IO",
          "country_name": "British Indian Ocean Territory",
          "dialling_code": "+246"
     },
     {
          "code": "IQ",
          "country_name": "Iraq",
          "dialling_code": "+964"
     },
     {
          "code": "IR",
          "country_name": "Iran",
          "dialling_code": "+98"
     },
     {
          "code": "IS",
          "country_name": "Iceland",
          "dialling_code": "+354"
     },
     {
          "code": "IT",
          "country_name": "Italy",
          "dialling_code": "+39"
     },
     {
          "code": "JM",
          "country_name": "Jamaica",
          "dialling_code": "+1"
     },
     {
          "code": "JO",
          "country_name": "Jordan",
          "dialling_code": "+962"
     },
     {
          "code": "JP",
          "country_name": "Japan",
          "dialling_code": "+81"
     },
     {
          "code": "KE",
          "country_name": "Kenya",
          "dialling_code": "+254"
     },
     {
          "code": "KG",
          "country_name": "Kyrgyzstan",
          "dialling_code": "+996"
     },
     {
          "code": "KH",
          "country_name": "Cambodia",
          "dialling_code": "+855"
     },
     {
          "code": "KI",
          "country_name": "Kiribati",
          "dialling_code": "+686"
     },
     {
          "code": "KM",
          "country_name": "Comoros",
          "dialling_code": "+269"
     },
     {
          "code": "KN",
          "country_name": "Saint Kitts and Nevis",
          "dialling_code": "+1"
     },
     {
          "code": "KP",
          "country_name": "North Korea",
          "dialling_code": "+850"
     },
     {
          "code": "KR",
          "country_name": "South Korea",
          "dialling_code": "+82"
     },
     {
          "code": "KW",
          "country_name": "Kuwait",
          "dialling_code": "+965"
     },
     {
          "code": "KY",
          "country_name": "Cayman Islands",
          "dialling_code": "+1"
     },
     {
          "code": "KZ",
          "country_name": "Kazakhstan",
          "dialling_code": "+7"
     },
     {
          "code": "LA",
          "country_name": "Laos",
          "dialling_code": "+856"
     },
     {
          "code": "LB",
          "country_name": "Lebanon",
          "dialling_code": "+961"
     },
     {
          "code": "LC",
          "country_name": "St. Lucia",
          "dialling_code": "+1"
     },
     {
          "code": "LI",
          "country_name": "Liechtenstein",
          "dialling_code": "+423"
     },
     {
          "code": "LK",
          "country_name": "Sri Lanka",
          "dialling_code": "+94"
     },
     {
          "code": "LR",
          "country_name": "Liberia",
          "dialling_code": "+231"
     },
     {
          "code": "LS",
          "country_name": "Lesotho",
          "dialling_code": "+266"
     },
     {
          "code": "LT",
          "country_name": "Lithuania",
          "dialling_code": "+370"
     },
     {
          "code": "LU",
          "country_name": "Luxembourg",
          "dialling_code": "+352"
     },
     {
          "code": "LV",
          "country_name": "Latvia",
          "dialling_code": "+371"
     },
     {
          "code": "LY",
          "country_name": "Libya",
          "dialling_code": "+218"
     },
     {
          "code": "MA",
          "country_name": "Morocco",
          "dialling_code": "+212"
     },
     {
          "code": "MC",
          "country_name": "Monaco",
          "dialling_code": "+377"
     },
     {
          "code": "MD",
          "country_name": "Moldova",
          "dialling_code": "+373"
     },
     {
          "code": "ME",
          "country_name": "Montenegro",
          "dialling_code": "+382"
     },
     {
          "code": "MF",
          "country_name": "Saint Martin",
          "dialling_code": "+590"
     },
     {
          "code": "MG",
          "country_name": "Madagascar",
          "dialling_code": "+261"
     },
     {
          "code": "MH",
          "country_name": "Marshall Islands",
          "dialling_code": "+692"
     },
     {
          "code": "MK",
          "country_name": "Macedonia",
          "dialling_code": "+389"
     },
     {
          "code": "ML",
          "country_name": "Mali",
          "dialling_code": "+223"
     },
     {
          "code": "MM",
          "country_name": "Burma Myanmar",
          "dialling_code": "+95"
     },
     {
          "code": "MN",
          "country_name": "Mongolia",
          "dialling_code": "+976"
     },
     {
          "code": "MO",
          "country_name": "Macau",
          "dialling_code": "+853"
     },
     {
          "code": "MP",
          "country_name": "Northern Mariana Islands",
          "dialling_code": "+1"
     },
     {
          "code": "MQ",
          "country_name": "Martinique",
          "dialling_code": "+596"
     },
     {
          "code": "MR",
          "country_name": "Mauritania",
          "dialling_code": "+222"
     },
     {
          "code": "MS",
          "country_name": "Montserrat",
          "dialling_code": "+1"
     },
     {
          "code": "MT",
          "country_name": "Malta",
          "dialling_code": "+356"
     },
     {
          "code": "MU",
          "country_name": "Mauritius",
          "dialling_code": "+230"
     },
     {
          "code": "MV",
          "country_name": "Maldives",
          "dialling_code": "+960"
     },
     {
          "code": "MW",
          "country_name": "Malawi",
          "dialling_code": "+265"
     },
     {
          "code": "MX",
          "country_name": "Mexico",
          "dialling_code": "+52"
     },
     {
          "code": "MY",
          "country_name": "Malaysia",
          "dialling_code": "+60"
     },
     {
          "code": "MZ",
          "country_name": "Mozambique",
          "dialling_code": "+258"
     },
     {
          "code": "NA",
          "country_name": "Namibia",
          "dialling_code": "+264"
     },
     {
          "code": "NC",
          "country_name": "New Caledonia",
          "dialling_code": "+687"
     },
     {
          "code": "NE",
          "country_name": "Niger",
          "dialling_code": "+227"
     },
     {
          "code": "NF",
          "country_name": "Norfolk Island",
          "dialling_code": "+672"
     },
     {
          "code": "NG",
          "country_name": "Nigeria",
          "dialling_code": "+234"
     },
     {
          "code": "NI",
          "country_name": "Nicaragua",
          "dialling_code": "+505"
     },
     {
          "code": "NL",
          "country_name": "Netherlands",
          "dialling_code": "+31"
     },
     {
          "code": "NO",
          "country_name": "Norway",
          "dialling_code": "+47"
     },
     {
          "code": "NP",
          "country_name": "Nepal",
          "dialling_code": "+977"
     },
     {
          "code": "NR",
          "country_name": "Nauru",
          "dialling_code": "+674"
     },
     {
          "code": "NU",
          "country_name": "Niue",
          "dialling_code": "+683"
     },
     {
          "code": "NZ",
          "country_name": "New Zealand",
          "dialling_code": "+64"
     },
     {
          "code": "OM",
          "country_name": "Oman",
          "dialling_code": "+968"
     },
     {
          "code": "PA",
          "country_name": "Panama",
          "dialling_code": "+507"
     },
     {
          "code": "PE",
          "country_name": "Peru",
          "dialling_code": "+51"
     },
     {
          "code": "PF",
          "country_name": "French Polynesia",
          "dialling_code": "+689"
     },
     {
          "code": "PG",
          "country_name": "Papua New Guinea",
          "dialling_code": "+675"
     },
     {
          "code": "PH",
          "country_name": "Philippines",
          "dialling_code": "+63"
     },
     {
          "code": "PK",
          "country_name": "Pakistan",
          "dialling_code": "+92"
     },
     {
          "code": "PL",
          "country_name": "Poland",
          "dialling_code": "+48"
     },
     {
          "code": "PM",
          "country_name": "Saint Pierre and Miquelon",
          "dialling_code": "+508"
     },
     {
          "code": "PR",
          "country_name": "Puerto Rico",
          "dialling_code": "+1"
     },
     {
          "code": "PS",
          "country_name": "Palestine",
          "dialling_code": "+970"
     },
     {
          "code": "PT",
          "country_name": "Portugal",
          "dialling_code": "+351"
     },
     {
          "code": "PW",
          "country_name": "Palau",
          "dialling_code": "+680"
     },
     {
          "code": "PY",
          "country_name": "Paraguay",
          "dialling_code": "+595"
     },
     {
          "code": "QA",
          "country_name": "Qatar",
          "dialling_code": "+974"
     },
     {
          "code": "RE",
          "country_name": "Réunion",
          "dialling_code": "+262"
     },
     {
          "code": "RO",
          "country_name": "Romania",
          "dialling_code": "+40"
     },
     {
          "code": "RS",
          "country_name": "Serbia",
          "dialling_code": "+381"
     },
     {
          "code": "RU",
          "country_name": "Russia",
          "dialling_code": "+7"
     },
     {
          "code": "RW",
          "country_name": "Rwanda",
          "dialling_code": "+250"
     },
     {
          "code": "SA",
          "country_name": "Saudi Arabia",
          "dialling_code": "+966"
     },
     {
          "code": "SB",
          "country_name": "Solomon Islands",
          "dialling_code": "+677"
     },
     {
          "code": "SC",
          "country_name": "Seychelles",
          "dialling_code": "+248"
     },
     {
          "code": "SD",
          "country_name": "Sudan",
          "dialling_code": "+249"
     },
     {
          "code": "SE",
          "country_name": "Sweden",
          "dialling_code": "+46"
     },
     {
          "code": "SG",
          "country_name": "Singapore",
          "dialling_code": "+65"
     },
     {
          "code": "SH",
          "country_name": "Saint Helena",
          "dialling_code": "+290"
     },
     {
          "code": "SI",
          "country_name": "Slovenia",
          "dialling_code": "+386"
     },
     {
          "code": "SK",
          "country_name": "Slovakia",
          "dialling_code": "+421"
     },
     {
          "code": "SL",
          "country_name": "Sierra Leone",
          "dialling_code": "+232"
     },
     {
          "code": "SM",
          "country_name": "San Marino",
          "dialling_code": "+378"
     },
     {
          "code": "SN",
          "country_name": "Senegal",
          "dialling_code": "+221"
     },
     {
          "code": "SO",
          "country_name": "Somalia",
          "dialling_code": "+252"
     },
     {
          "code": "SR",
          "country_name": "Suriname",
          "dialling_code": "+597"
     },
     {
          "code": "ST",
          "country_name": "São Tomé and Príncipe",
          "dialling_code": "+239"
     },
     {
          "code": "SV",
          "country_name": "El Salvador",
          "dialling_code": "+503"
     },
     {
          "code": "SY",
          "country_name": "Syria",
          "dialling_code": "+963"
     },
     {
          "code": "SZ",
          "country_name": "Swaziland",
          "dialling_code": "+268"
     },
     {
          "code": "TC",
          "country_name": "Turks and Caicos Islands",
          "dialling_code": "+1"
     },
     {
          "code": "TD",
          "country_name": "Chad",
          "dialling_code": "+235"
     },
     {
          "code": "TG",
          "country_name": "Togo",
          "dialling_code": "+228"
     },
     {
          "code": "TH",
          "country_name": "Thailand",
          "dialling_code": "+66"
     },
     {
          "code": "TJ",
          "country_name": "Tajikistan",
          "dialling_code": "+992"
     },
     {
          "code": "TK",
          "country_name": "Tokelau",
          "dialling_code": "+690"
     },
     {
          "code": "TL",
          "country_name": "Timor-Leste",
          "dialling_code": "+670"
     },
     {
          "code": "TM",
          "country_name": "Turkmenistan",
          "dialling_code": "+993"
     },
     {
          "code": "TN",
          "country_name": "Tunisia",
          "dialling_code": "+216"
     },
     {
          "code": "TO",
          "country_name": "Tonga",
          "dialling_code": "+676"
     },
     {
          "code": "TR",
          "country_name": "Turkey",
          "dialling_code": "+90"
     },
     {
          "code": "TT",
          "country_name": "Trinidad and Tobago",
          "dialling_code": "+1"
     },
     {
          "code": "TV",
          "country_name": "Tuvalu",
          "dialling_code": "+688"
     },
     {
          "code": "TW",
          "country_name": "Taiwan",
          "dialling_code": "+886"
     },
     {
          "code": "TZ",
          "country_name": "Tanzania",
          "dialling_code": "+255"
     },
     {
          "code": "UA",
          "country_name": "Ukraine",
          "dialling_code": "+380"
     },
     {
          "code": "UG",
          "country_name": "Uganda",
          "dialling_code": "+256"
     },
     {
          "code": "US",
          "country_name": "United States",
          "dialling_code": "+1"
     },
     {
          "code": "UY",
          "country_name": "Uruguay",
          "dialling_code": "+598"
     },
     {
          "code": "UZ",
          "country_name": "Uzbekistan",
          "dialling_code": "+998"
     },
     {
          "code": "VA",
          "country_name": "Vatican City",
          "dialling_code": "+39"
     },
     {
          "code": "VC",
          "country_name": "Saint Vincent and the Grenadines",
          "dialling_code": "+1"
     },
     {
          "code": "VE",
          "country_name": "Venezuela",
          "dialling_code": "+58"
     },
     {
          "code": "VG",
          "country_name": "British Virgin Islands",
          "dialling_code": "+1"
     },
     {
          "code": "VI",
          "country_name": "US Virgin Islands",
          "dialling_code": "+1"
     },
     {
          "code": "VN",
          "country_name": "Vietnam",
          "dialling_code": "+84"
     },
     {
          "code": "VU",
          "country_name": "Vanuatu",
          "dialling_code": "+678"
     },
     {
          "code": "WF",
          "country_name": "Wallis and Futuna",
          "dialling_code": "+681"
     },
     {
          "code": "WS",
          "country_name": "Samoa",
          "dialling_code": "+685"
     },
     {
          "code": "XK",
          "country_name": "Kosovo",
          "dialling_code": "+381"
     },
     {
          "code": "YE",
          "country_name": "Yemen",
          "dialling_code": "+967"
     },
     {
          "code": "YT",
          "country_name": "Mayotte",
          "dialling_code": "+262"
     },
     {
          "code": "ZA",
          "country_name": "South Africa",
          "dialling_code": "+27"
     },
     {
          "code": "ZM",
          "country_name": "Zambia",
          "dialling_code": "+260"
     },
     {
          "code": "ZW",
          "country_name": "Zimbabwe",
          "dialling_code": "+263"
     }
];
