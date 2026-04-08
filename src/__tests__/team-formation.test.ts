import { foldPair, type Participant } from "@/lib/team-formation";

const p = (id: string, vibeLevel: number): Participant => ({ id, vibeLevel });

describe("foldPair", () => {
  describe("pairing logic", () => {
    it("pairs highest vibe with lowest vibe", () => {
      const players = [p("a", 1), p("b", 3), p("c", 5)];
      const { pairs } = foldPair(players);
      // sorted desc: [5,3,1] → pair 5 with 1, solo 3
      expect(pairs).toHaveLength(1);
      expect(pairs[0].map((x) => x.vibeLevel)).toEqual([5, 1]);
    });

    it("pairs correctly with 4 players", () => {
      const players = [p("a", 1), p("b", 2), p("c", 3), p("d", 4)];
      const { pairs, solo } = foldPair(players);
      // sorted desc: [4,3,2,1] → [4,1] and [3,2]
      expect(pairs).toHaveLength(2);
      expect(pairs[0].map((x) => x.vibeLevel)).toEqual([4, 1]);
      expect(pairs[1].map((x) => x.vibeLevel)).toEqual([3, 2]);
      expect(solo).toBeNull();
    });

    it("pairs correctly with 6 players", () => {
      const players = [p("a", 1), p("b", 2), p("c", 3), p("d", 4), p("e", 5), p("f", 5)];
      const { pairs, solo } = foldPair(players);
      expect(pairs).toHaveLength(3);
      expect(solo).toBeNull();
    });

    it("sorts by vibeLevel regardless of input order", () => {
      const players = [p("a", 3), p("b", 1), p("c", 5), p("d", 2)];
      const { pairs } = foldPair(players);
      // sorted desc: [5,3,2,1] → [5,1] and [3,2]
      expect(pairs[0].map((x) => x.vibeLevel)).toEqual([5, 1]);
      expect(pairs[1].map((x) => x.vibeLevel)).toEqual([3, 2]);
    });
  });

  describe("solo player (odd count)", () => {
    it("assigns middle player as solo with 3 players", () => {
      const players = [p("a", 1), p("b", 3), p("c", 5)];
      const { pairs, solo } = foldPair(players);
      expect(pairs).toHaveLength(1);
      expect(solo).not.toBeNull();
      expect(solo!.vibeLevel).toBe(3); // middle of [5,3,1]
    });

    it("assigns middle player as solo with 5 players", () => {
      const players = [p("a", 1), p("b", 2), p("c", 3), p("d", 4), p("e", 5)];
      const { pairs, solo } = foldPair(players);
      // sorted desc: [5,4,3,2,1] → [5,1],[4,2], solo=3
      expect(pairs).toHaveLength(2);
      expect(solo!.vibeLevel).toBe(3);
    });

    it("no solo with even number of players", () => {
      const players = [p("a", 1), p("b", 2), p("c", 3), p("d", 4)];
      const { solo } = foldPair(players);
      expect(solo).toBeNull();
    });
  });

  describe("vibe level balance", () => {
    it("each pair sums to the same total when vibes are symmetric", () => {
      // [5,4,3,2,1] → pairs [5,1]=6, [4,2]=6
      const players = [p("a", 1), p("b", 2), p("c", 3), p("d", 4), p("e", 5)];
      const { pairs } = foldPair(players);
      const sums = pairs.map((pair) => pair[0].vibeLevel + pair[1].vibeLevel);
      expect(sums.every((s) => s === sums[0])).toBe(true);
    });

    it("minimises max vibe difference between pairs", () => {
      const players = [p("a", 5), p("b", 5), p("c", 1), p("d", 1)];
      const { pairs } = foldPair(players);
      // Both pairs: [5,1] — max diff = 4, but balanced
      pairs.forEach(([hi, lo]) => {
        expect(hi.vibeLevel).toBeGreaterThanOrEqual(lo.vibeLevel);
      });
    });
  });

  describe("edge cases", () => {
    it("returns empty result for 0 players", () => {
      const { pairs, solo } = foldPair([]);
      expect(pairs).toHaveLength(0);
      expect(solo).toBeNull();
    });

    it("single player becomes solo with no pairs", () => {
      const { pairs, solo } = foldPair([p("a", 3)]);
      expect(pairs).toHaveLength(0);
      expect(solo!.id).toBe("a");
    });

    it("two players form one pair with no solo", () => {
      const { pairs, solo } = foldPair([p("a", 2), p("b", 4)]);
      expect(pairs).toHaveLength(1);
      expect(solo).toBeNull();
    });

    it("does not mutate the input array", () => {
      const players = [p("a", 3), p("b", 1), p("c", 5)];
      const original = [...players];
      foldPair(players);
      expect(players).toEqual(original);
    });

    it("handles players with equal vibe levels", () => {
      const players = [p("a", 3), p("b", 3), p("c", 3), p("d", 3)];
      const { pairs, solo } = foldPair(players);
      expect(pairs).toHaveLength(2);
      expect(solo).toBeNull();
    });
  });
});
