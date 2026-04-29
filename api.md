Free Gold Price API (REST, JSON, PHP)
Important Notice — 27 August 2023: Our API now runs exclusively over HTTPS for enhanced security. If your integration still uses http://, update it to https:// to avoid connection issues.

Live Gold & Silver Price API — Free Tier for Websites
Add reliable, real-time gold and silver prices to your website, blog, or application. Our free tier is built for high availability and simple integration.

Free access — no hidden charges.
Rate limits: 30–60 requests/hour (≈ 44,640 per month, depending on plan/allocation).
Roadmap: additional commodities (e.g., copper, oil) and broader currency coverage.
Why Choose Our API
Developer-friendly, HTTPS JSON endpoints with global coverage and a straightforward free tier.

Free & transparent limits. Up to 30–60 requests per hour (≈ 44,640/month), clearly documented.
Simple integration. Language-agnostic REST + JSON. Ready-to-use PHP and cURL samples (see Section 4).
Global coverage. Gold and silver prices with multi-currency support and common units (gram, ounce, kg, tola, baht, masha, etc.).
Karat conversions built in. 24k down to 10k with formulas/examples in the sample package.
Caching-first pattern. Cron + DB examples to keep pages fast and stay within rate limits.
Security baseline. HTTPS-only endpoints; keep keys server-side (never expose in client code).
Clear activation flow. One proof email (key + site URL) records compliance; no auto-disables, fair grace periods.
Contents
API Registration
How to Pull Real-Time Quotes
Pulling Gold Rates Only
Pulling Both Gold & Silver
Best Practices (Cache + Cron)
Integration Examples (PHP + cURL)
Response Format & Field Reference
Rate Limits & Error Handling
Security & Compliance
Support & Key Status
Terms & Policies
1) API Registration
Create your API key at goldpricez.com/key/registration.
Gold Price API — Key Registration form
API key generated successfully
Activation: Please read the API Terms and complete the required steps. Then send one email to goldpricekg@gmail.com with your API key and website URL so we can record compliance.
2) How to Pull Real-Time Quotes
Download the sample PHP code: pull_gold_rates.zip (WinZip).

Authentication: send your key via header X-API-KEY: YOUR_API_KEY. Responses are JSON. Use https:// endpoints only.

2.1) Pulling Gold Rates Only
curl -X GET \
  -H "X-API-KEY: YOUR_API_KEY" \
  https://goldpricez.com/api/rates/currency/usd/measure/all
Change the currency (e.g., SAR, AUD, GBP, EUR, CAD, INR, PKR, AED) and the unit (e.g., gram, kg, ounce, grain, baht, tola-india, tola-pakistan, masha, etc.).

Examples:

# Specific currency
curl -X GET -H "X-API-KEY: YOUR_API_KEY" \
  https://goldpricez.com/api/rates/currency/gbp/measure/all

# Specific unit
curl -X GET -H "X-API-KEY: YOUR_API_KEY" \
  https://goldpricez.com/api/rates/currency/gbp/measure/gram

curl -X GET -H "X-API-KEY: YOUR_API_KEY" \
  https://goldpricez.com/api/rates/currency/usd/measure/ounce
2.2) Pulling Both Gold & Silver
curl -X GET \
  -H "X-API-KEY: YOUR_API_KEY" \
  https://goldpricez.com/api/rates/currency/gbp/measure/gram/metal/all
3) Best Practices (Cache + Cron)
To stay within rate limits and improve page speed, don’t call the API on every page view. Use a simple cache:

Create a database table (e.g., goldrate). A sample SQL is included in the zip file.
Create a script (e.g., pull_gold_rates.php) to fetch from the API and upsert into goldrate.
Run a cron job every 1–2 minutes:
wget -q -O - https://your-website/pull_gold_rates.php >/dev/null 2>&1
Render prices to users from your database, not directly from the API.
Tip: Implement backoff on errors and respect 429 Too Many Requests responses.

4) Integration Examples (PHP + cURL)
4.1) Minimal PHP (cURL)
<?php
$endpoint = 'https://goldpricez.com/api/rates/currency/usd/measure/all';
$ch = curl_init($endpoint);
curl_setopt_array($ch, [
  CURLOPT_HTTPHEADER     => ['X-API-KEY: ' . getenv('GOLDPRICEZ_API_KEY')],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 10,
]);
$raw = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http === 200 && $raw) {
  $data = json_decode($raw, true);
  // TODO: persist $data to DB, then render from DB in your pages
  echo number_format($data['ounce_in_gbp'] ?? 0, 2);
} else {
  // TODO: log and fallback to last cached value
  http_response_code(503);
  echo 'Service temporarily unavailable';
}
More complete samples (including SQL and helper functions) are in pull_gold_rates.zip.

5) Response Format & Field Reference
5.1) Example (Gold, GBP, all measures)
{
  "ounce_price_usd": "1251.10",
  "gmt_ounce_price_usd_updated": "19-12-2018 01:16:01 pm",
  "ounce_price_ask": "1251.10",
  "ounce_price_bid": "1250.74",
  "ounce_price_usd_today_low": "1248.41",
  "ounce_price_usd_today_high": "1251.63",
  "usd_to_gbp": "0.790239",
  "gmt_gbp_updated": "19-12-2018 09:05:00 am",
  "ounce_in_gbp": 988.6680129,

  "gram_to_ounce_formula": 0.0321,
  "gram_in_usd": 40.16031,
  "gram_in_gbp": 31.73624321409,

  "kg_to_ounce_formula": 32.1507,
  "kg_in_usd": 40223.74077,
  "kg_in_gbp": 31786.368682344,

  "grain_to_ounce_formula": 0.002,
  "grain_in_usd": 2.5022,
  "grain_in_gbp": 1.9773360258,

  "tael-hongkong_to_ounce_formula": 1.21528,
  "tael-hongkong_in_usd": 1520.436808,
  "tael-hongkong_in_gbp": 1201.5084627171,

  "tael-japan_to_ounce_formula": 1.2056,
  "tael-japan_in_usd": 1508.32616,
  "tael-japan_in_gbp": 1191.9381563522,

  "tola-india_to_ounce_formula": 0.375,
  "tola-india_in_usd": 469.1625,
  "tola-india_in_gbp": 370.7505048375,

  "tola-pakistan_to_ounce_formula": 0.40125,
  "tola-pakistan_in_usd": 502.003875,
  "tola-pakistan_in_gbp": 396.70304017612,

  "masha_to_ounce_formula": 0.03119,
  "masha_in_usd": 39.021809,
  "masha_in_gbp": 30.836555322351,

  "ratti_to_ounce_formula": 0.00585,
  "ratti_in_usd": 7.318935,
  "ratti_in_gbp": 5.783707875465
}
5.2) Example (Gold + Silver, GBP, gram)
{
  "ounce_price_usd": "1674.47",
  "gmt_ounce_price_usd_updated": "08-03-2020 04:52:01 am",
  "ounce_price_ask": "1674.47",
  "ounce_price_bid": "1673.90",
  "ounce_price_usd_today_low": "1642.13",
  "ounce_price_usd_today_high": "1692.46",
  "usd_to_gbp": "0.766342",
  "gmt_gbp_updated": "08-03-2020 12:05:16 am",
  "ounce_in_gbp": 1283.21668874,

  "gram_to_ounce_formula": 0.0321,
  "gram_in_usd": 53.750487,
  "gram_in_gbp": 41.191255708554,

  "silver_gram_in_usd": 0.5569029,
  "silver_gram_in_gbp": 0.4267780821918,
  "silver_ounce_in_gbp": 13.295267358,
  "silver_ounce_price_ask_gbp": 13.314425908,
  "silver_ounce_price_bid_gbp": 13.276108808,
  "silver_ounce_price_gbp_today_low": 13.047738892,
  "silver_ounce_price_gbp_today_high": 13.486086516
}
5.3) Field Descriptions (Gold)
#	JSON Field	Example	Description
1	ounce_price_usd	1295.56	Spot ounce price in USD
2	gmt_ounce_price_usd_updated	18-08-2017 12:28:11 pm	Timestamp of USD ounce update (GMT)
3	ounce_price_ask	1295.56	Ask price (USD)
4	ounce_price_bid	1295.10	Bid price (USD)
5	ounce_price_usd_today_low	1288.41	Day low (USD/oz)
6	ounce_price_usd_today_high	1301.63	Day high (USD/oz)
7	usd_to_gbp	0.790239	FX: USD→GBP
8	gmt_gbp_updated	19-12-2018 09:05:00 am	Timestamp of GBP update (GMT)
9	ounce_in_gbp	988.6680129	Ounce price in GBP
10	gram_to_ounce_formula	0.0321	1 gram = 0.0321 troy oz
11	gram_in_usd	41.587476	Gram price in USD
12	gram_in_gbp	32.271881376	Gram price in GBP
13	kg_to_ounce_formula	32.1507	1 kg = 32.1507 troy oz
14	kg_in_usd	41653.160892	Kilogram price in USD
15	kg_in_gbp	32322.852852192	Kilogram price in GBP
16	grain_to_ounce_formula	0.002	1 grain = 0.002 troy oz
17	grain_in_usd	2.59112	Grain price in USD
18	grain_in_gbp	2.01070912	Grain price in GBP
19	tael-hongkong_to_ounce_formula	1.21528	1 HK tael = 1.21528 troy oz
20	tael-hongkong_in_usd	1574.4681568	HK tael price in USD
21	tael-hongkong_in_gbp	1221.7872896768	HK tael price in GBP
22	tael-japan_to_ounce_formula	1.2056	1 JP tael = 1.2056 troy oz
23	tael-japan_in_usd	1561.927136	JP tael price in USD
24	tael-japan_in_gbp	1212.055457536	JP tael price in GBP
25	tola-india_to_ounce_formula	0.375	1 Indian tola = 0.375 troy oz
26	tola-india_in_usd	485.835	Indian tola price in USD
27	tola-india_in_gbp	377.00796	Indian tola price in GBP
28	tola-pakistan_to_ounce_formula	0.40125	1 Pakistan tola = 0.40125 troy oz
29	tola-pakistan_in_usd	519.84345	Pakistan tola price in USD
30	tola-pakistan_in_gbp	403.3985172	Pakistan tola price in GBP
31	masha_to_ounce_formula	0.03119	1 masha = 0.03119 troy oz
32	masha_in_usd	40.4085164	Masha price in USD
33	masha_in_gbp	31.3570087264	Masha price in GBP
34	ratti_to_ounce_formula	0.00585	1 ratti = 0.00585 troy oz
35	ratti_in_usd	7.579026	Ratti price in USD
36	ratti_in_gbp	5.881324176	Ratti price in GBP
5.4) Additional Silver Fields (when metal=all)
silver_ounce_price_usd — Silver ounce in USD
silver_gram_in_usd, silver_gram_in_gbp — Silver gram price
silver_ounce_in_gbp — Silver ounce in GBP
silver_ounce_price_ask_gbp, silver_ounce_price_bid_gbp
silver_ounce_price_gbp_today_low / _high
6) Rate Limits & Error Handling
Free tier: 30–60 requests/hour (plan-dependent). Do not exceed limits.
On sustained violations, IP access may be blocked.
Recommended polling interval: 60–120 seconds via cron + DB cache.
Status Codes
200 OK — Successful response
400 Bad Request — Invalid parameters
401 Unauthorized — Missing/invalid X-API-KEY
403 Forbidden — Key not active or blocked
404 Not Found — Resource or path invalid
429 Too Many Requests — Slow down; implement backoff
5xx Server errors — Retry with exponential backoff
Error Payload (example)
{
  "error": true,
  "code": 429,
  "message": "Too Many Requests. Please reduce frequency."
}
7) Security & Compliance
Use HTTPS only. Never expose your key in client-side code.
Keep keys in server env variables; rotate if compromised.
Cache results; avoid exposing raw endpoints directly to browsers.
8) Support & Key Status
Email: goldpricekg@gmail.com


Version: Dec 17, 2025 • Effective: Jan 1, 2026

We may update these Terms from time to time. For material changes, we may provide notice on this page, within the API documentation, the key status page, or other publicly accessible locations. We are not required to provide individual notice. Your continued use of the API on or after the Effective Date constitutes acceptance of the updated Terms.

9) API Terms & Conditions
Access & Pricing. We may offer free or paid access to the API at our discretion. Availability, limits, and pricing (if any) are described on this page and may change over time.
Data Nature. API data is for informational purposes only and does not constitute financial advice.
Future Plans. We may introduce, modify, or discontinue free access, paid plans, or features at any time. Pricing and plan details will be published on this page.
Public Display Requirement. Free API access is limited to data displayed on public webpages that are accessible to all users. Internal systems, private pages, applications, or non-public uses are not included under the free tier.
Attribution (Public Display). If you publicly display API data on a website or other publicly accessible webpage, you must include a visible attribution to our site as the data source, regardless of whether you are using a free or paid plan. Attribution is required only when API data is visible to end users. Example:
<a href="https://goldpricez.com" target="_blank" rel="noopener">GoldPriceZ.com</a>
Acceptable locations: footer, “About,” “Data Sources,” or other publicly visible, relevant pages.
Exactly one attribution per website (domain) is sufficient; site-wide links are not required.
The link must be visible to users and not hidden, cloaked, or placed on doorway or empty pages.
Anchor text should be brand-oriented (e.g., “GoldPriceZ.com” or “Gold Price API by GoldPriceZ”). Avoid keyword-stuffing.
Rel attributes: rel="nofollow", rel="sponsored", or rel="ugc" are acceptable. Followed links are not required.
Indexability by search engines is not required; the page must be publicly reachable by users.
Registration & Records. After adding attribution, email us once at goldpricekg@gmail.com with:
Your API key
The URL where attribution appears
This allows us to record compliance for future reference.
Restrictions. You may not:
Resell, sublicense, or redistribute raw API data to third parties;
Remove, hide, misrepresent, or alter required attribution;
Use the API for unlawful, abusive, or disruptive purposes, or on illegal content;
Expose API keys in client-side code or perform abusive scraping.
Rate Limits. Unless otherwise agreed, each IP or API key is limited to up to 60 requests per hour (or 30–60/hour depending on allocation), measured over a rolling window. We may throttle or temporarily suspend access if limits are exceeded or abuse is detected.
Security. Use HTTPS. Keep API keys confidential and server-side (do not embed in client-side code). Rotate keys if you suspect compromise.
Enforcement. We may monitor compliance with these Terms. If non-compliant with these Terms, or if any other violation occurs, we may suspend or revoke API access immediately, with or without notice, at our discretion. We are not required to provide a grace period or prior warning.
Changes & Termination. We may modify, suspend, discontinue, or monetize the API or any part of it at any time, with or without notice. For material changes, we will make reasonable efforts to post notice on this page. Your continued use after changes constitutes acceptance.
Liability. The API is provided “as is,” without warranties. We accept no liability for losses or damages arising from its use.
Governing Terms. By using the API, you also agree to our Website Terms of Service, Privacy Policy, and Disclaimer.
Amendments. Changes take effect upon posting on this page and apply to new and existing users.
Service Scope. The API service and requirements apply to all users, including any free or paid tiers that may be offered. If we introduce paid tiers or additional services, details will be published on this page. Only the Terms published here govern API usage; email, support messages, or informal correspondence do not create pricing commitments or modify these Terms.
No Guaranteed Free Access. Free access, if offered, is not guaranteed and may be limited, modified, or withdrawn at any time. Continued use of the API requires compliance with the current pricing and plan requirements.
Contact. goldpricekg@gmail.com
Last updated: 17 December 2025
