import { expect, test } from "bun:test";
import { screen } from "../skills/galleon-defillama-yield-screen/scripts/screen.ts";
const token = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const pool = (n: number, base: unknown, total: unknown = 20) => ({ pool: `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`, project: "aave-v3", chain: "Base", underlyingTokens: [token], tvlUsd: 2e6, apyBase: base, apyReward: null, apy: total });
test("base screen preserves null rewards and excludes unknown base rather than ranking total", () => {
 const r = screen({status:"success",data:[pool(1,4),pool(2,5,5),pool(3,null)]}, "Base", token, 1e6, "base");
 expect(r.rows.map(x=>x.apyBase)).toEqual([5,4]); expect(r.excluded.missing_rank_metric).toBe(1); expect(r.rows[0]!.apyReward).toBeNull();
});
test("total objective produces different ranking without inventing base", () => {
 const r = screen({status:"success",data:[pool(1,4,12),pool(2,5,5),pool(3,null,20)]}, "Base", token, 1e6, "total");
 expect(r.rows[0]!.apyBase).toBeNull(); expect(r.rows[0]!.rankValue).toBe(20);
});
test("rejects bridged assets, LP exposures, wrong chains, nonnumeric metrics and small pools", () => {
 const r = screen({status:"success",data:[{...pool(1,4),underlyingTokens:[token,token]}, {...pool(2,5),chain:"Ethereum"},{...pool(3,4),tvlUsd:3},pool(4,"9"), {...pool(5,5),underlyingTokens:["0x"+"1".repeat(40)]}]}, "Base", token, 1e6, "base");
 expect(r.rows).toEqual([]); expect(r.excluded).toEqual({asset_exposure:2,chain:1,tvl:1,missing_rank_metric:1});
});
test("fails invalid envelopes, duplicate identities and malformed filters", () => {
 expect(()=>screen({data:[]}, "Base",token,0,"base")).toThrow("invalid_snapshot");
 expect(()=>screen({status:"success",data:[pool(1,5),pool(1,6)]}, "Base",token,0,"base")).toThrow("duplicate_pool");
 expect(()=>screen({status:"success",data:[]}, "Base",token,-1,"base")).toThrow("invalid_filter");
});

test("project scope excludes unrelated vault strategies before ranking", () => {
 const r = screen({status:"success",data:[pool(1,4),{...pool(2,50),project:"other-vault"}]}, "Base", token, 1e6, "base", "aave-v3");
 expect(r.rows).toHaveLength(1); expect(r.rows[0]!.project).toBe("aave-v3"); expect(r.excluded.project).toBe(1);
});
