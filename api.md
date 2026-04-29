 Documentation
Introduction
Metals.Dev API provides a simple to use, developer friendly, JSON API for spot prices of precious metals, industrial metals and currency conversion rates. We provide affordable pricing, which makes our API perfect for businesses of any size from startups to enterprises in need of reliable Metals API.

The API provides a live feed of Gold, Silver, Platinum & Palladium with a maximum delay of 60 seconds even for the Free Plan.

Powered by 15+ exchanges & data sources for precious metals, industrial metals & currencies, the Metals.Dev API is capable of delivering real-time precious metals rate data. The API comes with multiple endpoints, each serving a different use case.

In this documentation you will learn about API endpoints, responses, and potential errors. In case any question was left unanswered, please contact us and our team will help you out.
Try Metals.Dev API
Select an endpoint to try the API. Usage will count against your monthly quota.
Endpoint
Latest
Currency
USD - United States Dollar
Unit
Troy Ounce (toz)
Copy Code
The below code includes your API Key.

Curl

Python

Javascript

Java

PHP

curl -X GET https://api.metals.dev/v1/latest
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&currency=USD
&unit=toz
-H "Accept: application/json"
API Endpoint
The URL for requesting rates for the selected API endpoint.

https://api.metals.dev/v1/latest
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&currency=USD
&unit=toz
Definitions
Property	Description
API Key	An unique key to each account to authenticate interactions with the API.
Currency	When provided, the API will return the prices for the currency. Default is USD.
Unit	When provided, the API will return the prices converted to the unit. Default is toz (Troy Ounce).
API Key
Your account's API Key can be found on the Dashboard. It is a unique key that must be passed as a parameter to every request to authenticate with Metals.Dev API.

Your API Key should not be shared with anyone. You can generate a new API key on the Dashboard, if required.
Base URL
https://api.metals.dev/v1/
Usage

https://api.metals.dev/v1/latest
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
The above sample includes your account's API Key
Currency
The API returns the rates in USD by default. You can use the 
currency
 parameter to modify this behaviour.
Usage

https://api.metals.dev/v1/latest
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&currency=EUR
The above sample includes your account's API Key
View all the supported currencies.
Unit
The API returns the rates in their default units. For Precious Metals, the default unit will be 'toz' (Troy Ounce). For Industrial Metals, the default unit will be 'mt' (Metric Tonne). You can use the 
unit
 parameter to modify this behaviour.
Usage

https://api.metals.dev/v1/latest
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&unit=g
The above sample includes your account's API Key
View all the supported units.
API Response
The response to all our API endpoints will return a standard JSON format and can be parsed easily irrespective of progamming languages. Every API response will include the following properties.
Property	Description
status	The status of the request. Values are 'success' or 'failure'.
currency	The currency used for the request. Default is USD
unit	The unit used for the request.
timestamp	An ISO timestamp indicating the date & time the data is collected. This value also includes the timezone information.
error_code	An error code will be included when the status is 'failure'.
error_message	An error message containing the description of the failure will be included when the status is 'failure'.
Error Codes
When an API call fails for any reason, a JSON error is returned. The error response always come with an error code and a message.
{
    "status": "failure",
    "error_code": 1101,
    "error_message": "Unauthorized. The API Key provided is invalid."
}
Possible Error Codes
Code	Description
1101	The API Key provided is invalid.
1201	The plan is not active due to failed payments.
1202	The account is not active or disabled.
1203	The quota for the current month including the grace usage is exceeded.
2101	Unsupported input parameters like Metal Code, Authority Code or Unit Code.
2102	Mandatory input parameters missing from the API request.
2103	Unsupported currency code passed as a parameter.
2104	The date format is invalid. Valid date format is "YYYY-MM-DD". Eg: "2023-01-25"
2105	The start date & end date range passed as parameters are invalid or exceeds the range limit.
Access Control / CORS
Metals.Dev supports Cross Origin Resource Sharing (CORS) & Access Control headers. This will enable you to use the Metals.Dev API from both front-end & backend environments.
Learn more about CORS
Available Endpoints
Metals.Dev supports multiple API endpoints, each providing a different functionality. All endpoints are available on all the plans.
Latest Rates
Returns a live feed of exchange rate data for all available metals and currencies.
https://api.metals.dev/v1/latest
Spot Metal Rates
Returns a live feed of any one metal including the Spot, Bid, Ask, Low & High Prices. It will also return the Change & Change Percentage compared to previous market day.
https://api.metals.dev/v1/metal/spot?metal=gold
Authority Metal Rates
Returns a live feed a metal prices published by leading authorities & exchanges like LBMA, LME, MCX, IBJA, etc.
https://api.metals.dev/v1/metal/authority?authority=lbma
Currency Rates
Returns a live feed a 170+ currency conversion rates.
https://api.metals.dev/v1/currencies
Timeseries
Returns daily historical exchange ratess between two specified dates.
https://api.metals.dev/v1/timeseries?start_date=2023-09-24&end_date=2023-10-24
Usage
Returns the current usage, selected plan and the remaining quota left for the billing period.
https://api.metals.dev/usage
Versioning
API versioning allows Metals.Dev to continuously evolve the services provided while offering a predictable path for improvements and deprecations.

All Metals.Dev API endpoints (except the usage endpoint) are versioned. Minor changes and improvements to Metals.Dev will be carried out without requiring any changes from your end. For breaking changes, a new endpoint version will be released.

When a new version is released, the older version will be marked as deprecated after 1 year and it will be discontinued after 4 years.
Latest Endpoint
The latest endpoint will return a live feed of metal prices & currency conversion rates with a maximum delay of 60 seconds.
API Request

https://api.metals.dev/v1/latest
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&currency=USD
&unit=toz
Request Parameters
Parameter	Required	Description
api_key	Yes	Your account's API Key.
currency	No	Currency code for the rates.
unit	No	Unit to convert the metal rates.
API Response

{
    "status": "success",
    "currency": "USD",
    "unit": "toz",
    "metals": {
        "gold": 1923.86,
        "silver": 22.905,
        "platinum": 916.569,
        "palladium": 1229.684,
        "lbma_gold_am": 1929.75,
        "lbma_gold_pm": 1927.75,
        "lbma_silver": 23.005,
        "lbma_platinum_am": 922,
        "lbma_platinum_pm": 918,
        "lbma_palladium_am": 1251,
        "lbma_palladium_pm": 1241,
        "mcx_gold": 2212.307,
        "mcx_gold_am": 2204.8496,
        "mcx_gold_pm": 2208.3323,
        "mcx_silver": 26.3951,
        "mcx_silver_am": 26.3637,
        "mcx_silver_pm": 26.4216,
        "ibja_gold": 2215.339,
        "copper": 0.2584,
        "aluminum": 0.067,
        "lead": 0.0649,
        "nickel": 0.6355,
        "zinc": 0.0745,
        "lme_copper": 0.2599,
        "lme_aluminum": 0.0671,
        "lme_lead": 0.065,
        "lme_nickel": 0.6384,
        "lme_zinc": 0.074
    },
    "currencies": {
        "AED": 0.27225333,
        "AFN": 0.0116177,
        "ALL": 0.0104,
        "AMD": 0.0025838,
        "ANG": 0.558453,
        "AOA": 0.00156751,
        "ARS": 0.0039,
        "AUD": 0.66825,
        "AWG": 0.558659,
        "AZN": 0.5891,
        "BAM": 0.5563,
        "BBD": 0.5,
        "BDT": 0.0092,
        "BGN": 0.5562,
        "BHD": 2.6524,
        "BIF": 0.000353432,
        "BMD": 1,
        "BND": 0.744701,
        "BOB": 0.1447,
        "BRL": 0.2061,
        "BSD": 1,
        "BTN": 0.012175,
        "BWP": 0.0745,
        "BYN": 0.400026,
        "BYR": 0.0000400026,
        "BZD": 0.496215,
        "CAD": 0.75564,
        "CDF": 0.000424107,
        "CHF": 1.1142,
        "CLP": 0.12521,
        "CNH": 0.138,
        "CNY": 0.13815,
        "COP": 0.024182,
        "CRC": 0.1835,
        "CUC": 1,
        "CUP": 0.0417,
        "CVE": 0.00977794,
        "CYP": 1.8587,
        "CZK": 0.045824,
        "DJF": 0.00562433,
        "DKK": 0.1461,
        "DOP": 0.0181,
        "DZD": 0.0074,
        "EEK": 0.0695,
        "EGP": 0.0324,
        "ERN": 0.0666667,
        "ETB": 0.0182,
        "EUR": 1.08798,
        "FJD": 0.446362,
        "FKP": 1.2701,
        "GBP": 1.27026,
        "GEL": 0.3846,
        "GGP": 1.25588,
        "GHS": 0.0879,
        "GIP": 1.2701,
        "GMD": 0.0164,
        "GNF": 0.000115615,
        "GTQ": 0.1275,
        "GYD": 0.00473476,
        "HKD": 0.12772,
        "HNL": 0.0406,
        "HRK": 0.1444,
        "HTG": 0.00715656,
        "HUF": 0.00289,
        "IDR": 0.066618,
        "ILS": 0.26902,
        "IMP": 1.25588,
        "INR": 0.012171,
        "IQD": 0.000764293,
        "IRR": 0.0000235374,
        "ISK": 0.007288,
        "JEP": 1.25588,
        "JMD": 0.0065,
        "JOD": 1.4096,
        "JPY": 0.0069102,
        "KES": 0.0071,
        "KGS": 0.0114272,
        "KHR": 0.00024198,
        "KMF": 0.00219163,
        "KPW": 0.00111112,
        "KRW": 0.07701,
        "KWD": 3.2538,
        "KYD": 1.21796,
        "KZT": 0.0023,
        "LAK": 0.0000551979,
        "LBP": 0.000066,
        "LKR": 0.3269,
        "LRD": 0.00584534,
        "LSL": 0.05347,
        "LTL": 0.3151,
        "LVL": 1.54786,
        "LYD": 0.206621,
        "MAD": 0.1024,
        "MDL": 5.443,
        "MGA": 0.2206,
        "MKD": 0.0177,
        "MMK": 0.000476086,
        "MNT": 0.2915,
        "MOP": 0.124,
        "MRO": 0.00290743,
        "MRU": 0.0290743,
        "MTL": 0.293496,
        "MUR": 0.0219712,
        "MVR": 0.0650201,
        "MWK": 0.9507,
        "MXN": 0.05859,
        "MXV": 0.447185,
        "MYR": 0.2152,
        "MZN": 0.0156448,
        "NAD": 0.0535,
        "NGN": 1.3075,
        "NIO": 0.0273,
        "NOK": 0.0938,
        "NPR": 0.7609,
        "NTD": 0.0337206,
        "NZD": 0.6194,
        "OMR": 2.5974,
        "PAB": 1,
        "PEN": 0.275718,
        "PGK": 0.282,
        "PHP": 0.018058,
        "PKR": 0.00348093,
        "PLN": 0.2456,
        "PYG": 0.1378,
        "QAR": 0.2743,
        "RON": 0.2197,
        "RSD": 0.0093,
        "RUB": 0.011116,
        "RWF": 0.000880403,
        "SAR": 0.2666,
        "SBD": 0.119489,
        "SCR": 0.074,
        "SDG": 0.00166252,
        "SEK": 0.092316,
        "SGD": 0.7399,
        "SHP": 1.25588,
        "SIT": 0.0045,
        "SKK": 0.036109,
        "SLE": 0.0442672,
        "SLL": 0.0000442672,
        "SOS": 0.00176049,
        "SPL": 6,
        "SRD": 0.0265482,
        "STD": 0.000043779,
        "STN": 0.043779,
        "SVC": 0.114286,
        "SYP": 0.000398005,
        "SZL": 0.0535,
        "THB": 0.028673,
        "TJS": 0.0915504,
        "TMM": 0.0000572483,
        "TMT": 0.286242,
        "TND": 0.3231,
        "TOP": 0.425802,
        "TRY": 0.03834,
        "TTD": 0.1476,
        "TVD": 0.671285,
        "TWD": 0.032118,
        "TZS": 0.0418,
        "UAH": 0.0272,
        "UGX": 0.0271,
        "USD": 1,
        "UYU": 0.0267,
        "UZS": 0.0000875176,
        "VEB": 3.73874e-10,
        "VED": 0.0373873,
        "VEF": 3.73873e-7,
        "VES": 0.03594,
        "VND": 4.207,
        "VUV": 0.0084,
        "WST": 0.3683,
        "XAF": 0.1658,
        "XAG": 22.9155,
        "XAU": 1923.88,
        "XBT": 30826.21,
        "XCD": 0.3704,
        "XDR": 1.33403,
        "XOF": 0.1658,
        "XPD": 1238.13,
        "XPF": 0.00903542,
        "XPT": 919.01,
        "YER": 0.004,
        "ZAR": 0.053469,
        "ZMK": 0.0056,
        "ZMW": 0.0562,
        "ZWD": 0.00276319
    },
    "timestamps": {
        "metal": "2023-07-05T06:16:02.829Z",
        "currency": "2023-07-05T06:16:04.204Z"
    }
}
Spot Metal Endpoint
The spot metal endpoint returns a live feed of any one metal including the Spot Price, Bid, Ask, Low & High Prices with a maximum delay of 60 seconds. It will also return the Change & Change Percentage compared to previous market day.

The below metal codes are supported.
gold
silver
platinum
palladium
aluminum
copper
nickel
lead
zinc
API Request

https://api.metals.dev/v1/metal/spot
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&metal=gold
&currency=USD
Request Parameters
Parameter	Required	Description
api_key	Yes	Your account's API Key.
metal	Yes	Any supported metal code.
currency	No	Currency code for the rate.
API Response

{
    "status": "success",
    "timestamp": "2023-07-05T07:10:01.933Z",
    "currency": "USD",
    "unit": "toz",
    "metal": "gold",
    "rate": {
        "price": 1923.76,
        "ask": 1923.63,
        "bid": 1922.96,
        "high": 1927.17,
        "low": 1920.91,
        "change": -2.67,
        "change_percent": -0.14
    }
}
Authority Endpoint
The authority endpoint returns a live feed a metal prices published by leading authorities & exchanges with a maximum delay of 90 seconds.

The below authority codes are supported.
lbma
lme
mcx
ibja
API Request

https://api.metals.dev/v1/metal/authority
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&authority=lbma
&currency=USD
&unit=toz
Request Parameters
Parameter	Required	Description
api_key	Yes	Your account's API Key.
authority	Yes	Any supported authority code.
currency	No	Currency code for the rate.
unit	No	Unit to convert the metal rates.
Supported Authorities
Code	Title
lbma	London Bullion Market Association
lme	London Metals Exchange
mcx	Multi Commodity Exchange (India)
ibja	India Bullion and Jewellers Association
API Response

{
    "status": "success",
    "authority": "lbma",
    "currency": "USD",
    "unit": "default",
    "timestamp": "2023-07-05T07:39:01.363Z",
    "rates": {
        "lbma_gold_am": 1929.75,
        "lbma_gold_pm": 1927.75,
        "lbma_silver": 23.005,
        "lbma_platinum_am": 922,
        "lbma_platinum_pm": 918,
        "lbma_palladium_am": 1251,
        "lbma_palladium_pm": 1241
    }
}
Currency Rates Endpoint
The currency rates endpoint returns a live feed of all the supported currencies with a maximum delay of 120 seconds. By providing a 
from
 parameter, this endpoint can be used to convert currency rates.

View all the supported currencies.
API Request

https://api.metals.dev/v1/currencies
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&base=USD
Request Parameters
Parameter	Required	Description
api_key	Yes	Your account's API Key.
base	No	Currency code for conversion.
API Response

{
    "status": "success",
    "base": "USD",
    "currencies": {
        "AED": 0.27225333,
        "AFN": 0.0116177,
        "ALL": 0.0104,
        "AMD": 0.0025838,
        "ANG": 0.558453,
        "AOA": 0.00156751,
        "ARS": 0.0039,
        "AUD": 0.66813,
        "AWG": 0.558659,
        "AZN": 0.5891,
        "BAM": 0.5567,
        "BBD": 0.5,
        "BDT": 0.0092,
        "BGN": 0.5566,
        "BHD": 2.6524,
        "BIF": 0.000353432,
        "BMD": 1,
        "BND": 0.744701,
        "BOB": 0.1447,
        "BRL": 0.2061,
        "BSD": 1,
        "BTN": 0.01217,
        "BWP": 0.0743,
        "BYN": 0.400026,
        "BYR": 0.0000400026,
        "BZD": 0.496215,
        "CAD": 0.7541,
        "CDF": 0.000424107,
        "CHF": 1.114,
        "CLP": 0.12521,
        "CNH": 0.1379,
        "CNY": 0.13802,
        "COP": 0.024182,
        "CRC": 0.1835,
        "CUC": 1,
        "CUP": 0.0417,
        "CVE": 0.00977794,
        "CYP": 1.8604,
        "CZK": 0.045813,
        "DJF": 0.00562433,
        "DKK": 0.1462,
        "DOP": 0.0181,
        "DZD": 0.0074,
        "EEK": 0.0696,
        "EGP": 0.0324,
        "ERN": 0.0666667,
        "ETB": 0.0182,
        "EUR": 1.08804,
        "FJD": 0.446362,
        "FKP": 1.2711,
        "GBP": 1.27061,
        "GEL": 0.3847,
        "GGP": 1.25588,
        "GHS": 0.0879,
        "GIP": 1.2711,
        "GMD": 0.0164,
        "GNF": 0.000115615,
        "GTQ": 0.1275,
        "GYD": 0.00473476,
        "HKD": 0.12776,
        "HNL": 0.0406,
        "HRK": 0.1445,
        "HTG": 0.00715656,
        "HUF": 0.00289,
        "IDR": 0.066589,
        "ILS": 0.269196,
        "IMP": 1.25588,
        "INR": 0.012163,
        "IQD": 0.000764293,
        "IRR": 0.0000235374,
        "ISK": 0.007294,
        "JEP": 1.25588,
        "JMD": 0.0065,
        "JOD": 1.4096,
        "JPY": 0.006927,
        "KES": 0.0071,
        "KGS": 0.0114272,
        "KHR": 0.00024198,
        "KMF": 0.00219163,
        "KPW": 0.00111112,
        "KRW": 0.07701,
        "KWD": 3.2545,
        "KYD": 1.21796,
        "KZT": 0.0023,
        "LAK": 0.0000551979,
        "LBP": 0.000067,
        "LKR": 0.3265,
        "LRD": 0.00584534,
        "LSL": 0.053459,
        "LTL": 0.3153,
        "LVL": 1.54927,
        "LYD": 0.206621,
        "MAD": 0.1027,
        "MDL": 5.4465,
        "MGA": 0.2206,
        "MKD": 0.0177,
        "MMK": 0.000476086,
        "MNT": 0.2907,
        "MOP": 0.124,
        "MRO": 0.00290743,
        "MRU": 0.0290743,
        "MTL": 0.293496,
        "MUR": 0.0219712,
        "MVR": 0.0650201,
        "MWK": 0.9507,
        "MXN": 0.05858,
        "MXV": 0.447185,
        "MYR": 0.215,
        "MZN": 0.0156448,
        "NAD": 0.053459,
        "NGN": 1.3229,
        "NIO": 0.0273,
        "NOK": 0.0939,
        "NPR": 0.7606,
        "NTD": 0.0337206,
        "NZD": 0.6194,
        "OMR": 2.5957,
        "PAB": 1,
        "PEN": 0.275718,
        "PGK": 0.282,
        "PHP": 0.018052,
        "PKR": 0.00348093,
        "PLN": 0.2449,
        "PYG": 0.1378,
        "QAR": 0.2742,
        "RON": 0.2199,
        "RSD": 0.0093,
        "RUB": 0.011069,
        "RWF": 0.000880403,
        "SAR": 0.2666,
        "SBD": 0.119489,
        "SCR": 0.0725,
        "SDG": 0.00166252,
        "SEK": 0.092108,
        "SGD": 0.7396,
        "SHP": 1.25588,
        "SIT": 0.0045,
        "SKK": 0.036139,
        "SLE": 0.0442672,
        "SLL": 0.0000442672,
        "SOS": 0.00176049,
        "SPL": 6,
        "SRD": 0.0265482,
        "STD": 0.000043779,
        "STN": 0.043779,
        "SVC": 0.114286,
        "SYP": 0.000398005,
        "SZL": 0.053459,
        "THB": 0.028675,
        "TJS": 0.0915504,
        "TMM": 0.0000572483,
        "TMT": 0.286242,
        "TND": 0.3235,
        "TOP": 0.425802,
        "TRY": 0.03833,
        "TTD": 0.1476,
        "TVD": 0.671285,
        "TWD": 0.032108,
        "TZS": 0.0418,
        "UAH": 0.0271,
        "UGX": 0.0271,
        "USD": 1,
        "UYU": 0.0267,
        "UZS": 0.0000875176,
        "VEB": 3.73874e-10,
        "VED": 0.0373873,
        "VEF": 3.73873e-7,
        "VES": 0.03594,
        "VND": 4.2101,
        "VUV": 0.0084,
        "WST": 0.3683,
        "XAF": 0.166,
        "XAG": 22.8488,
        "XAU": 1926.81,
        "XBT": 30772.49,
        "XCD": 0.3704,
        "XDR": 1.33403,
        "XOF": 0.166,
        "XPD": 1240.09,
        "XPF": 0.00903542,
        "XPT": 917.56,
        "YER": 0.004,
        "ZAR": 0.053455,
        "ZMK": 0.0057,
        "ZMW": 0.0567,
        "ZWD": 0.00276319
    },
    "timestamp": "2023-07-05T08:02:02.640Z"
}
Timeseries Endpoint
The timeseries endpoint returns daily historical exchange rates between two dates of your choice. The maximum allowed date limit is 30 days. If rates for more than 30 days are needed, a separate request must be sent.

Timeseries endpoint provides the metal rates in 
USD / toz
.
API Request

https://api.metals.dev/v1/timeseries
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
&start_date=2023-01-01
&end_date=2023-01-10
Request Parameters
Parameter	Required	Description
api_key	Yes	Your account's API Key.
start_date	Yes	Start Date in YYYY-MM-DD format.
end_date	Yes	End Date in YYYY-MM-DD format.
API Response

{
    "status": "success",
    "currency": "USD",
    "unit": "toz",
    "start_date": "2023-01-01",
    "end_date": "2023-01-10",
    "rates": {
        "2023-01-01": {
            "currencies": {
                "AUD": 0.681756,
                "BRL": 0.1888,
                "CAD": 0.738798,
                "CHF": 1.0828,
                "CNY": 0.144986,
                "EUR": 1.0696,
                "GBP": 1.2101,
                "HKD": 0.12805,
                "INR": 0.012082,
                "JPY": 0.00764,
                "SGD": 0.74675,
                "USD": 1
            },
            "date": "2023-01-01",
            "metals": {
                "gold": 1824.0852,
                "palladium": 1782.0547,
                "platinum": 1065.9958,
                "silver": 23.969
            }
        },
        "2023-01-02": {
            "currencies": {
                "AUD": 0.6804,
                "BRL": 0.1864,
                "CAD": 0.7374,
                "CHF": 1.081755,
                "CNY": 0.14499,
                "EUR": 1.06763,
                "GBP": 1.2062,
                "HKD": 0.128128,
                "INR": 0.012085,
                "JPY": 0.007644,
                "SGD": 0.745345,
                "USD": 1
            },
            "date": "2023-01-02",
            "metals": {
                "gold": 1829.2906,
                "palladium": 1794.9777,
                "platinum": 1068.9814,
                "silver": 24.094
            }
        },
        "2023-01-03": {
            "currencies": {
                "AUD": 0.672531,
                "BRL": 0.1825,
                "CAD": 0.73129,
                "CHF": 1.068185,
                "CNY": 0.144645,
                "EUR": 1.05463,
                "GBP": 1.196845,
                "HKD": 0.127982,
                "INR": 0.012079,
                "JPY": 0.007618,
                "SGD": 0.74325,
                "USD": 1
            },
            "date": "2023-01-03",
            "metals": {
                "gold": 1836.4124,
                "palladium": 1720.3413,
                "platinum": 1076.4031,
                "silver": 23.96
            }
        },
        "2023-01-04": {
            "currencies": {
                "AUD": 0.682945,
                "BRL": 0.184087,
                "CAD": 0.74186,
                "CHF": 1.075915,
                "CNY": 0.14519,
                "EUR": 1.060905,
                "GBP": 1.205778,
                "HKD": 0.12794,
                "INR": 0.012097,
                "JPY": 0.007564,
                "SGD": 0.74545,
                "USD": 1
            },
            "date": "2023-01-04",
            "metals": {
                "gold": 1854.8058,
                "palladium": 1784.5989,
                "platinum": 1078.3764,
                "silver": 23.79
            }
        },
        "2023-01-05": {
            "currencies": {
                "AUD": 0.67555,
                "BRL": 0.18685,
                "CAD": 0.737246,
                "CHF": 1.068205,
                "CNY": 0.14535,
                "EUR": 1.052078,
                "GBP": 1.19125,
                "HKD": 0.128003,
                "INR": 0.01211,
                "JPY": 0.007501,
                "SGD": 0.7431,
                "USD": 1
            },
            "date": "2023-01-05",
            "metals": {
                "gold": 1832.8782,
                "palladium": 1736.1714,
                "platinum": 1059.7711,
                "silver": 23.2084
            }
        },
        "2023-01-06": {
            "currencies": {
                "AUD": 0.687521,
                "BRL": 0.191344,
                "CAD": 0.743799,
                "CHF": 1.0778,
                "CNY": 0.146263,
                "EUR": 1.064395,
                "GBP": 1.209234,
                "HKD": 0.128098,
                "INR": 0.012155,
                "JPY": 0.00757,
                "SGD": 0.7472,
                "USD": 1
            },
            "date": "2023-01-06",
            "metals": {
                "gold": 1865.4976,
                "palladium": 1801.1852,
                "platinum": 1089.0043,
                "silver": 23.79
            }
        },
        "2023-01-07": {
            "currencies": {
                "AUD": 0.68755,
                "BRL": 0.191342,
                "CAD": 0.743868,
                "CHF": 1.0781,
                "CNY": 0.146335,
                "EUR": 1.064568,
                "GBP": 1.209217,
                "HKD": 0.1281,
                "INR": 0.012155,
                "JPY": 0.007571,
                "SGD": 0.7472,
                "USD": 1
            },
            "date": "2023-01-07",
            "metals": {
                "gold": 1866.0198,
                "palladium": 1801.1852,
                "platinum": 1103.0588,
                "silver": 23.79
            }
        },
        "2023-01-08": {
            "currencies": {
                "AUD": 0.68946,
                "BRL": 0.191344,
                "CAD": 0.7444,
                "CHF": 1.0789,
                "CNY": 0.146263,
                "EUR": 1.065644,
                "GBP": 1.2115,
                "HKD": 0.12807,
                "INR": 0.012154,
                "JPY": 0.007585,
                "SGD": 0.749698,
                "USD": 1
            },
            "date": "2023-01-08",
            "metals": {
                "gold": 1869.3685,
                "palladium": 1806.1952,
                "platinum": 1101.2246,
                "silver": 23.989
            }
        },
        "2023-01-09": {
            "currencies": {
                "AUD": 0.6912,
                "BRL": 0.1903,
                "CAD": 0.7465,
                "CHF": 1.0858,
                "CNY": 0.14771,
                "EUR": 1.073415,
                "GBP": 1.21865,
                "HKD": 0.12811,
                "INR": 0.012168,
                "JPY": 0.007591,
                "SGD": 0.7518,
                "USD": 1
            },
            "date": "2023-01-09",
            "metals": {
                "gold": 1870.4874,
                "palladium": 1773.9303,
                "platinum": 1084.0931,
                "silver": 23.63
            }
        },
        "2023-01-10": {
            "currencies": {
                "AUD": 0.68942,
                "BRL": 0.192282,
                "CAD": 0.744395,
                "CHF": 1.084085,
                "CNY": 0.147558,
                "EUR": 1.073883,
                "GBP": 1.215377,
                "HKD": 0.12807,
                "INR": 0.012254,
                "JPY": 0.00757,
                "SGD": 0.750861,
                "USD": 1
            },
            "date": "2023-01-10",
            "metals": {
                "gold": 1877.2645,
                "palladium": 1770.4755,
                "platinum": 1079.226,
                "silver": 23.606
            }
        }
    }
}
Usage Endpoint
The usage endpoint returns the current usage and the remaining limit available under the selected plan.
API Request

https://api.metals.dev/usage
?api_key=ZKDJOPK2SDZLYTWAIODO250WAIODO
Request Parameters
Parameter	Required	Description
api_key	Yes	Your account's API Key.
API Response

{
    "status": "success",
    "timestamp": "2023-10-29T12:19:11.066Z",
    "plan": "Platinum",
    "total": 50000,
    "used": 1990,
    "remaining": 48010
}
Get Started
Endpoints
Support
