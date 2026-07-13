const WISE_CODES = [
  'USD','EUR','CNY','JPY','GBP','HKD','TWD','KRW','SGD','AUD','CAD','CHF','THB','MYR','IDR','PHP','VND','INR','RUB','BRL','MXN','NZD','SEK','NOK','DKK','PLN','TRY','AED','SAR','ILS','CZK','HUF','RON','ZAR','CLP','ARS','COP','PEN','EGP','NGN','PKR','BDT','UAH','AFN','ALL','AMD','ANG','AOA','AWG','AZN','BAM','BBD','BGN','BHD','BIF','BMD','BND','BOB','BSD','BTN','BWP','BYN','BZD','CDF','CRC','CUP','CVE','DJF','DOP','DZD','ERN','ETB','FJD','FKP','GEL','GGP','GHS','GIP','GMD','GNF','GTQ','GYD','HNL','HRK','HTG','IMP','IQD','ISK','JEP','JMD','JOD','KES','KGS','KHR','KMF','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MZN','NAD','NIO','NPR','OMR','PAB','PGK','PYG','QAR','RSD','RWF','SBD','SCR','SDG','SHP','SOS','SRD','SSP','STN','SYP','SZL','TJS','TMT','TND','TOP','TTD','TZS','UGX','UYU','UZS','VES','VUV','WST','XAF','XCD','XOF','XPF','YER','ZMW'
];

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const source = (url.searchParams.get('source') || 'USD').toUpperCase();
  const targetsParam = url.searchParams.get('targets');
  const page = Math.max(0, Number.parseInt(url.searchParams.get('page') || '0', 10) || 0);
  const size = Math.max(1, Math.min(50, Number.parseInt(url.searchParams.get('size') || '40', 10) || 40));
  const allTargets = targetsParam
    ? [...new Set(targetsParam.split(',').map(x => x.trim().toUpperCase()).filter(Boolean))]
    : WISE_CODES.filter(code => code !== source);
  const targets = targetsParam ? allTargets : allTargets.slice(page * size, (page + 1) * size);
  const rates = { [source]: 1 };

  const settled = await Promise.allSettled(targets.map(async target => {
    if (target === source) return [target, 1];
    const endpoint = `https://wise.com/rates/live?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`;
    const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Wise ${response.status}`);
    const data = await response.json();
    const value = Array.isArray(data) ? data[0]?.value : data?.value;
    if (!Number.isFinite(Number(value))) throw new Error('Invalid Wise rate');
    return [target, Number(value)];
  }));

  for (const result of settled) {
    if (result.status === 'fulfilled') rates[result.value[0]] = result.value[1];
  }

  const totalPages = targetsParam ? null : Math.ceil(allTargets.length / size);
  return Response.json({
    provider: 'wise', base: source, date: Date.now(), rates,
    count: Object.keys(rates).length, matched: Object.keys(rates).length - 1,
    page, size, totalTargets: targetsParam ? null : allTargets.length,
    totalPages, hasMore: targetsParam ? false : page + 1 < totalPages,
    pageTargets: targets.length
  }, { headers: { 'cache-control': 'public, max-age=300' } });
}
