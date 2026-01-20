import { describe, it, expect } from "vitest";
import { moveItems } from "../shared/moveItems";

describe("moveItems", () => {
  it("should move last item from source to beginning of target", () => {
    const source = ["a", "b", "c"];
    const target: string[] = [];

    moveItems(source, target);

    expect(source).toEqual(["a", "b"]);
    expect(target).toEqual(["c"]);
  });

  it("should handle multiple consecutive moves", () => {
    const source = ["a", "b", "c", "d"];
    const target: string[] = [];

    moveItems(source, target);
    moveItems(source, target);

    expect(source).toEqual(["a", "b"]);
    expect(target).toEqual(["c", "d"]);
  });

  it("should handle empty source array (no mutation)", () => {
    const source: string[] = [];
    const target = ["x"];

    moveItems(source, target);

    expect(source).toEqual([]);
    expect(target).toEqual(["x"]);
  });

  it("should unshift to target even if target is empty", () => {
    const source = ["a"];
    const target: string[] = [];

    moveItems(source, target);

    expect(source).toEqual([]);
    expect(target).toEqual(["a"]);
  });

  it("should work with objects", () => {
    const obj1 = { id: 1, name: "Alice" };
    const obj2 = { id: 2, name: "Bob" };
    const source = [obj1, obj2];
    const target: typeof source = [];

    moveItems(source, target);

    expect(source).toEqual([obj1]);
    expect(target).toEqual([obj2]);
  });
});

