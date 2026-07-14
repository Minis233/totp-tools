const WISE_CODES = [
  'USD','EUR','CNY','CNH','JPY','GBP','HKD','TWD','KRW','SGD','AUD','CAD','CHF','THB','MYR','IDR','PHP','VND','INR','IRR','RUB','BRL','MXN','NZD','SEK','NOK','DKK','PLN','TRY','AED','SAR','ILS','CZK','HUF','RON','ZAR','CLP','ARS','COP','PEN','EGP','NGN','PKR','BDT','UAH','AFN','ALL','AMD','ANG','AOA','AWG','AZN','BAM','BBD','BGN','BHD','BIF','BMD','BND','BOB','BSD','BTN','BWP','BYN','BZD','CDF','CRC','CUC','CUP','CVE','DJF','DOP','DZD','ERN','ETB','FJD','FKP','GEL','GGP','GHS','GIP','GMD','GNF','GTQ','GYD','HNL','HRK','HTG','IMP','IQD','ISK','JEP','JMD','JOD','KES','KGS','KHR','KMF','KPW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MZN','NAD','NIO','NPR','OMR','PAB','PGK','PYG','QAR','RSD','RWF','SBD','SCR','SDG','SHP','SLE','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','TJS','TMT','TND','TOP','TTD','TZS','UGX','UYU','UZS','VEF','VES','VUV','WST','XAF','XCD','XCG','XOF','XPF','YER','ZMW','ZWG','ZWL'
];

const USD_SNAPSHOT = {"USD":1,"EUR":0.878117,"CNY":6.7843,"CNH":6.7843,"JPY":162.39,"GBP":0.748839,"HKD":7.83725,"TWD":32.2,"KRW":1493.2,"SGD":1.2948,"AUD":1.44561,"CAD":1.41455,"CHF":0.81445,"THB":33.51,"MYR":4.0795,"IDR":18115.5,"PHP":61.6695,"VND":26260.8,"INR":95.9148,"IRR":42000,"RUB":76.65,"BRL":5.13455,"MXN":17.5141,"NZD":1.731,"SEK":9.71224,"NOK":9.77564,"DKK":6.56432,"PLN":3.80545,"TRY":47.033,"AED":3.6728,"SAR":3.7549,"ILS":3.0266,"CZK":21.34,"HUF":315.679,"RON":4.59611,"ZAR":16.4837,"CLP":933.15,"ARS":1483.75,"COP":3237.42,"PEN":3.4223,"EGP":50.24,"NGN":1381.06,"PKR":278.025,"BDT":123.275,"UAH":44.54,"AFN":65.8173,"ALL":82.3015,"AMD":367.149,"ANG":1.79,"AOA":926.255,"AZN":1.69975,"BAM":1.71745,"BBD":2,"BGN":1.71745,"BHD":0.37705,"BIF":2987.32,"BMD":1,"BND":1.2948,"BOB":10.215,"BSD":1,"BTN":95.625,"BWP":14.0548,"BYN":2.85939,"BZD":2,"CDF":2269.64,"CRC":451.01,"CUC":1,"CUP":24,"CVE":97.265,"DJF":178.133,"DOP":58.5105,"DZD":133.183,"ERN":15,"ETB":159,"FJD":2.25276,"FKP":0.748867,"GEL":2.634,"GGP":0.748867,"GHS":11.497,"GIP":0.748867,"GMD":73.1533,"GNF":8769.97,"GTQ":7.6254,"GYD":208.75,"HNL":26.7954,"HRK":6.61625,"HTG":130.571,"IMP":0.748867,"IQD":1310,"ISK":125.745,"JEP":0.748867,"JMD":157.647,"JOD":0.709,"KES":129.3,"KGS":87.4181,"KHR":4037.5,"KMF":432.013,"KPW":899.996,"KWD":0.30775,"KZT":474.205,"LAK":22573,"LBP":89550,"LKR":335.985,"LRD":181.521,"LSL":16.4739,"LYD":6.40385,"MAD":9.3265,"MDL":17.585,"MGA":4283.55,"MKD":54.063,"MMK":2100,"MNT":3581.5,"MOP":8.0724,"MRU":39.9755,"MUR":47.5179,"MVR":15.23,"MWK":1733.67,"MZN":63.5648,"NAD":16.4815,"NIO":36.764,"NPR":153,"OMR":0.385015,"PAB":1,"PGK":4.39754,"PYG":6073.25,"QAR":3.64525,"RSD":103.04,"RWF":1465.39,"SBD":8.09389,"SCR":14.0604,"SDG":600.221,"SHP":0.750497,"SLE":24.0811,"SLL":24081.1,"SOS":571.5,"SRD":37.5989,"STN":21.4254,"SVC":8.75,"SYP":11059.6,"SZL":16.4754,"TJS":9.2375,"TMT":3.5,"TND":2.94915,"TOP":2.3722,"TTD":6.735,"TZS":2631,"UGX":3680.82,"UZS":12090,"VEF":9.9875,"VES":723.094,"VUV":119.8,"WST":2.75179,"XAF":576.002,"XCD":2.7,"XCG":1.79,"XOF":576.002,"XPF":104.935,"YER":238.014,"ZMW":18.0297,"ZWG":26.7077,"ZWL":67007.4,"AWG":1.79,"KYD":0.82,"UYU":40.235};

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
  let fallback = false;
  if (targets.length && matched < minimum && source === 'USD') {
    for (const target of targets) {
      if (Number.isFinite(USD_SNAPSHOT[target])) rates[target] = USD_SNAPSHOT[target];
    }
    fallback = true;
  }
  const finalMatched = Object.keys(rates).length - 1;
  if (targets.length && finalMatched < minimum) {
    return Response.json({ error: 'Wise upstream temporarily unavailable', matched: finalMatched, pageTargets: targets.length }, {
      status: 503,
      headers: { 'cache-control': 'no-store', 'retry-after': '15' }
    });
  }

  const totalPages = targetsParam ? null : Math.ceil(allTargets.length / size);
  const response = Response.json({
    provider: 'wise', base: source, date: fallback ? 1783993478782 : Date.now(), rates,
    count: Object.keys(rates).length, matched: finalMatched, fallback,
    page, size, totalTargets: targetsParam ? null : allTargets.length,
    totalPages, hasMore: targetsParam ? false : page + 1 < totalPages,
    pageTargets: targets.length
  }, { headers: { 'cache-control': 'public, max-age=900, stale-while-revalidate=86400' } });
  context.waitUntil(cache.put(cacheRequest, response.clone()));
  return response;
}
