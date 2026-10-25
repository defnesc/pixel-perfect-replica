import { afterEach, describe, expect, it, vi } from "vitest";
import { sendToCrm } from "./order";
afterEach(() => vi.unstubAllGlobals());
describe("public CRM order log", () => {
  it("posts JSON to the supplied webhook as no-cors text/plain", () => {
    const fetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal("fetch", fetch);
    const row = { order_id: "GZ-1234", source: "Website cart", language: "TR", items: [], scan: "stl", delivery: "pickup", payment: "Cash in advance", estimated_price: 4990, custom_estimated_price: 10990, currency: "TRY", price_factor: 1, usd_try: 49.69, check_link: "https://example.com/check?o=encoded", status: "1 – Order created on website" };
    sendToCrm(row);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0] ?? [];
    expect(url).toBe("https://script.google.com/macros/s/AKfycbwZQj8t6DtY7NUOBzhxknGDrTqarnfExhsPOEvpKhB0VstaNp1ZjXJMQhq7hLVT17Fn/exec");
    expect(options).toMatchObject({ method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" } });
    expect(JSON.parse(options.body)).toMatchObject(row);
    expect(Object.keys(JSON.parse(options.body)).sort()).toEqual([...Object.keys(row), "created_at"].sort());
  });
});