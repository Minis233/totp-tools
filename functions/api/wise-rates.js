const WISE_CODES = [
  'USD','EUR','CNY','CNH','JPY','GBP','HKD','TWD','KRW','SGD','AUD','CAD','CHF','THB','MYR','IDR','PHP','VND','INR','IRR','RUB','BRL','MXN','NZD','SEK','NOK','DKK','PLN','TRY','AED','SAR','ILS','CZK','HUF','RON','ZAR','CLP','ARS','COP','PEN','EGP','NGN','PKR','BDT','UAH','AFN','ALL','AMD','ANG','AOA','AWG','AZN','BAM','BBD','BGN','BHD','BIF','BMD','BND','BOB','BSD','BTN','BWP','BYN','BZD','CDF','CRC','CUC','CUP','CVE','DJF','DOP','DZD','ERN','ETB','FJD','FKP','GEL','GGP','GHS','GIP','GMD','GNF','GTQ','GYD','HNL','HRK','HTG','IMP','IQD','ISK','JEP','JMD','JOD','KES','KGS','KHR','KMF','KPW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MZN','NAD','NIO','NPR','OMR','PAB','PGK','PYG','QAR','RSD','RWF','SBD','SCR','SDG','SHP','SLE','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','TJS','TMT','TND','TOP','TTD','TZS','UGX','UYU','UZS','VEF','VES','VUV','WST','XAF','XCD','XCG','XOF','XPF','YER','ZMW','ZWG','ZWL'
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
  const cache = context.env?.WISE_CACHE || caches.default;
  const cacheUrl = new URL(url.origin + url.pathname);
  cacheUrl.searchParams.set('source', source);
  if (targetsParam) cacheUrl.searchParams.set('targets', allTargets.join(','));
  else { cacheUrl.searchParams.set('page', String(page)); cacheUrl.searchParams.set('size', String(size)); }
  const cacheRequest = new Request(cacheUrl.toString(), { method: 'GET' });
  const cached = await cache.match(cacheRequest);
  if (cached) return cached;
  const rates = { [source]: 1 };

  async function fetchOne(target) {
    if (target === source) return [target, 1];
    const endpoint = `https://wise.com/rates/live?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`;
    let lastStatus = 0;
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6500);
      let response;
      try {
        response = await fetch(endpoint, { headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' }, signal: controller.signal });
      } finally { clearTimeout(timer); }
      lastStatus = response.status;
      if (response.ok) {
        const data = await response.json();
        const value = Array.isArray(data) ? data[0]?.value : data?.value;
        if (!Number.isFinite(Number(value))) throw new Error('Invalid Wise rate');
        return [target, Number(value)];
      }
      if (![403, 429, 500, 502, 503, 504].includes(response.status)) break;
      await new Promise(resolve => setTimeout(resolve, 180 + Math.random() * 320));
    }
    throw new Error(`Wise ${lastStatus}`);
  }

  const settled = new Array(targets.length);
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const index = cursor++;
      try { settled[index] = { status: 'fulfilled', value: await fetchOne(targets[index]) }; }
      catch (reason) { settled[index] = { status: 'rejected', reason }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, targets.length) }, worker));

  for (const result of settled) {
    if (result.status === 'fulfilled') rates[result.value[0]] = result.value[1];
  }

  const matched = Object.keys(rates).length - 1;
  const minimum = Math.min(targets.length, targetsParam ? Math.min(2, targets.length) : Math.max(3, Math.floor(targets.length * 0.2)));
  if (targets.length && matched < minimum) {
    return Response.json({ error: 'Wise upstream temporarily unavailable', matched, pageTargets: targets.length }, {
      status: 503,
      headers: { 'cache-control': 'no-store', 'retry-after': '15' }
    });
  }

  const totalPages = targetsParam ? null : Math.ceil(allTargets.length / size);
  const response = Response.json({
    provider: 'wise', base: source, date: Date.now(), rates,
    count: Object.keys(rates).length, matched,
    page, size, totalTargets: targetsParam ? null : allTargets.length,
    totalPages, hasMore: targetsParam ? false : page + 1 < totalPages,
    pageTargets: targets.length
  }, { headers: { 'cache-control': 'public, max-age=900, stale-while-revalidate=86400' } });
  context.waitUntil(cache.put(cacheRequest, response.clone()));
  return response;
}
