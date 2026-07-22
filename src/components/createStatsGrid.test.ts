/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createStatsGrid } from "./createStatsGrid.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createStatsGrid applies optional accent color as a CSS variable", () => {
  const ReactLike = createFakeReact();
  const StatsGrid = createStatsGrid(ReactLike);

  const element = StatsGrid({
    items: [
      { label: "Active", value: "12", accentColor: "#84cc16" },
      { label: "Draft", value: "4" },
    ],
  });

  const firstCard = element.children[0] as { props: Record<string, unknown> };
  const secondCard = element.children[1] as { props: Record<string, unknown> };

  assert.equal(firstCard.props.className, "stat-card stat-card-accent");
  assert.deepEqual(firstCard.props.style, { "--stat-accent": "#84cc16" });
  assert.equal(secondCard.props.className, "stat-card");
  assert.equal(secondCard.props.style, undefined);
});
