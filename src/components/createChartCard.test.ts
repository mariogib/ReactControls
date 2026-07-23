/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createCard } from "./createCard.js";
import { createChartCard } from "./createChartCard.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createChartCard renders title and children inside Card", () => {
  const react = createFakeReact();
  const Card = createCard(react);
  const ChartCard = createChartCard(react, Card);

  const element = ChartCard({
    title: "Prompts / day",
    children: "chart",
  });

  assert.equal(element.type, Card);
  assert.equal(element.props.className, "chart-card");
  assert.equal(element.props.onClick, undefined);

  const [header, body] = element.children;
  assert.equal(header.props.className, "chart-card-header");
  assert.equal(header.children[0].type, "h3");
  assert.equal(header.children[0].children[0], "Prompts / day");
  assert.equal(header.children[1], null);
  assert.equal(body.props.className, "chart-card-body");
  assert.deepEqual(body.props.style, { width: "100%", height: 220 });
  assert.equal(body.children[0], "chart");
});

test("createChartCard uses custom height and className", () => {
  const react = createFakeReact();
  const Card = createCard(react);
  const ChartCard = createChartCard(react, Card);

  const element = ChartCard({
    title: "Cost",
    children: null,
    height: 360,
    className: "extra",
  });

  assert.equal(element.props.className, "chart-card extra");
  assert.equal(element.children[1].props.style.height, 360);
});

test("createChartCard becomes linkable when to and onNavigate are set", () => {
  const react = createFakeReact();
  const Card = createCard(react);
  const ChartCard = createChartCard(react, Card);
  const navigated: string[] = [];

  const element = ChartCard({
    title: "Cost / day",
    children: "chart",
    to: "/charts/cost-day",
    onNavigate: (path) => navigated.push(path),
    openLabel: "View detail",
  });

  assert.equal(element.props.className, "chart-card chart-card--link");
  assert.equal(typeof element.props.onClick, "function");
  element.props.onClick();
  assert.deepEqual(navigated, ["/charts/cost-day"]);

  const [header, body] = element.children;
  const openChip = header.children[1];
  assert.equal(openChip.props.className, "chart-card-open");
  assert.equal(openChip.children[0], "View detail");
  assert.equal(typeof body.props.onClick, "function");
});

test("createChartCard does not link when only to is provided", () => {
  const react = createFakeReact();
  const Card = createCard(react);
  const ChartCard = createChartCard(react, Card);

  const element = ChartCard({
    title: "Tokens",
    children: null,
    to: "/charts/tokens-day",
  });

  assert.equal(element.props.className, "chart-card");
  assert.equal(element.props.onClick, undefined);
  assert.equal(element.children[0].children[1], null);
});
