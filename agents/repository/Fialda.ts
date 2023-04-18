import Redis, { RedisOptions } from 'ioredis';
import Cache from 'es-cache';

const config = {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  };

function getRedisConfiguration(): {
    port: Maybe<number>;
    host: Maybe<string>;
    password: Maybe<string>;
} {
    return config;
}

async function getFinancialHighlights (symbol: String): Promise<string> {
      const url = `https://api4.fialda.com/api/services/app/TechnicalAnalysis/GetFinancialHighlights?symbol=${symbol}`
      console.log(`getFinancialHighlights:: Fetching ${url}...`)
      const response = await fetch(url, {
          "headers": {
          ".aspnetcore.culture": "en-US",
          "abp.tenantid": "6",
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "appid": "F7335346-0CB8-49A1-B9CB-A59504CBEF14",
          "cache-control": "private, no-cache, no-store, must-revalidate",
          "sa": "421631180315016268588",
          "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-alt-referer": "https://fwt.fialda.com/co-phieu/SHB/hoso",
          "Referer": "https://fwt.fialda.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": null,
          "method": "GET"
      });
      const result = await response.json();
      var quarter_list = result['result'];
      quarter_list = quarter_list.filter((quarter: any) => quarter.quarter != 0 && quarter.quarter != 5)
      const last_index = quarter_list.length - 1;
      const last_quarter = quarter_list[last_index]
      const text = `
      Thông tin tài chính cơ bản về mã chứng khoán ${symbol} tại thời điểm quý ${last_quarter.quarter}, năm ${last_quarter.year} là:
      EPS: ${(last_quarter.eps).toFixed(2)} đồng / cổ phiếu
      PE: ${(last_quarter.pe).toFixed(2)}
      PB: ${(last_quarter.pb).toFixed(2)}
      Lợi nhuận: ${(last_quarter.profit / 1000000000).toFixed(4)} tỉ đồng
      Tỉ suất lợi nhuận: ${(last_quarter.profitMargin * 100).toFixed(2)}%
      Tăng trưởng lợi nhuận so với cùng kỳ năm trước: ${(last_quarter.profit_Growth_YoY * 100).toFixed(2)}%
      `
      return text;
  }

var cache = new Cache();

function addCache(name: string, callback: (input: string) => any) {
    return async function (input: any) {
      try {
        const key = `${name} - ${input}`;
        console.log(`trying get data from cache: ${key}`)
        const cachedValue = await cache.get(key);
        if (cachedValue) {
          console.log(`cache found: ${cachedValue}`)
          return cachedValue;
        }
        const value = await callback(input);
        console.log(`cache not found, new value fetched: ${value}`)
        await cache.put(key, value);
        return value;
      }
      catch (e) {
        console.log(`Error while caching ${name} - ${input}: ${e}`)
        return `Error while caching ${name} - ${input}: ${e}`;
      }
    };
  }

const getFinancialHighlightsWithCache = addCache('getFinancialHighlights', getFinancialHighlights)

export { getFinancialHighlightsWithCache as getFinancialHighlights }