import { describe, it, expect, vi, afterEach } from "vitest";
import { parseNumber } from "./csv";
import { BUILTIN, loadSheet, parseSettings } from "./sheet";
import { adjustPrice, adjustedAddons, estimateCustom, findProduct, piecePrice, priceFactor } from "./catalog";
import { safeRates } from "./currency";

afterEach(() => vi.unstubAllGlobals());
describe("safe owner-controlled pricing", () => {
  it("reads Turkish decimals and integer thousands separators", () => {
    expect(["49,69", "49.69", "4.990", "4,990"].map(parseNumber)).toEqual([49.69,49.69,4990,4990]);
    expect(parseNumber("oops")).toBeNull();
  });
  it("uses only upwards 3 percent steps from 49.69", () => {
    const s = BUILTIN.settings;
    expect(priceFactor(51.20,s)).toBe(1.03);
    expect(priceFactor(51,s)).toBe(1);
    expect(priceFactor(40,s)).toBe(1);
    expect(priceFactor(52.68,s)).toBe(1.06);
    expect(priceFactor(60,{...s,auto_price_adjust:false})).toBe(1);
  });
  it("rounds adjusted whole pieces up to 90 and preserves Frame/bar equivalence", () => {
    const frame = findProduct("frame",BUILTIN.products);
    const withBar = findProduct("frame-with-bar",BUILTIN.products);
    if (!frame || !withBar) throw new Error("Missing fixture");
    expect(piecePrice(frame,[],1.03)).toBe(5190);
    expect(piecePrice(frame,[1500],1.03)).toBe(6690);
    expect(piecePrice(frame,[1500],1.03)).toBe(piecePrice(withBar,[],1.03));
    expect(piecePrice(frame,[1500],1.03)-piecePrice(frame,[],1.03)).toBe(1500);
    expect(adjustPrice(7490,1.03)).toBe(7790);
    expect(adjustPrice(5139.7)).toBe(5190);
    expect(adjustPrice(8700,1.03)).toBe(8990);
  });
  it("applies the same adjustment to the loaded estimator total", () => {
    expect(estimateCustom(BUILTIN.estimator,2,["Detailed","No stones","No engraving"],1.03)).toBe(9290);
    expect(estimateCustom(BUILTIN.estimator,2,["Fully iced"],1.03)).toBeNull();
    expect(estimateCustom(BUILTIN.estimator,9,[],1.03)).toBeNull();
  });
  it.each(["", "oops", "0", "999"])("restores an invalid sheet product price %s", async price => {
    vi.stubGlobal("fetch",vi.fn(async (url:string) => new Response(new URL(url).searchParams.get("sheet") === "Products" ? `folder,name,price\nframe,Frame,${price}\n` : "")));
    const data = await loadSheet();
    expect(findProduct("frame",data.products)?.price).toBe(4990);
    expect(data.estimator).toEqual(BUILTIN.estimator);
  });
  it("rejects live rates outside plus/minus 25 percent independently", () => {
    const backup = BUILTIN.settings;
    expect(safeRates({usd_try:100,eur_try:56},backup).usd_try).toBe(49.69);
    expect(safeRates({usd_try:51.2,eur_try:10},backup).eur_try).toBe(55.68);
    expect(safeRates({usd_try:51.2,eur_try:56},backup).usd_try).toBe(51.2);
  });
  it("recomputes add-on prices instead of trusting addon_price_tl", () => {
    const addons = adjustedAddons(BUILTIN.addons.map(a=>({...a,addon_price_tl:99999})),BUILTIN.products,BUILTIN.optionGroups,1.03);
    expect(addons[0]?.normal_price_tl).toBe(5190);
    expect(addons[0]?.addon_price_tl).toBe(3690);
  });
  it("reads settings as text and supports disabling adjustments and rates", () => {
    const s = parseSettings({whatsapp_number:"905053159186",usd_try:"49,69",auto_price_adjust:"no",auto_rates:"no"});
    expect(s.whatsapp_number).toBe("905053159186");
    expect(s.usd_try).toBe(49.69);
    expect(s.auto_price_adjust).toBe(false);
    expect(s.auto_rates).toBe(false);
  });
  it("falls back per failed/empty tab and invalid product row", async () => {
    vi.stubGlobal("fetch",vi.fn(async (url:string) => {
      const tab = new URL(url).searchParams.get("sheet");
      if(tab === "Products") return new Response('folder,name,price\nframe,Frame,0\nstar,Star,8.990\n');
      if(tab === "Settings") return new Response('whatsapp_number,usd_try,eur_try\n905053159186,"49,69","55,68"');
      return new Response("",{status:503});
    }));
    const data = await loadSheet();
    expect(findProduct("frame",data.products)?.price).toBe(4990);
    expect(findProduct("star",data.products)?.price).toBe(8990);
    expect(data.optionGroups).toEqual(BUILTIN.optionGroups);
    expect(data.addons).toEqual(BUILTIN.addons);
    expect(data.estimator.find(r=>r.option==="First tooth")?.price_add_tl).toBe(6490);
    expect(data.faq).toEqual(BUILTIN.faq);
  });
});
