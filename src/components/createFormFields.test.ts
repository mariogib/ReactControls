/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createFormFields } from "./createFormFields.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createFormFields date, time, and datetime variants emit matching input types", () => {
  const ReactLike = createFakeReact();
  const { DateField, TimeField, DateTimeField } = createFormFields(ReactLike);

  const dateElement = DateField({ htmlFor: "start-date", label: "Start date", value: "2026-06-09" });
  const timeElement = TimeField({ htmlFor: "start-time", label: "Start time", value: "09:30" });
  const dateTimeElement = DateTimeField({ htmlFor: "start-at", label: "Start at", value: "2026-06-09T09:30" });

  assert.equal((dateElement.children[1] as { props: { type: string } }).props.type, "date");
  assert.equal((timeElement.children[1] as { props: { type: string } }).props.type, "time");
  assert.equal((dateTimeElement.children[1] as { props: { type: string; step?: number } }).props.type, "datetime-local");
  assert.equal((dateTimeElement.children[1] as { props: { step?: number } }).props.step, 60);
});

test("DateTimeControl configures date, datetime, and datetime-seconds modes", () => {
  const ReactLike = createFakeReact();
  const { DateTimeControl } = createFormFields(ReactLike);

  const dateOnly = DateTimeControl({
    htmlFor: "event-date",
    label: "Event date",
    mode: "date",
    value: "2026-07-20",
  });
  const dateTime = DateTimeControl({
    htmlFor: "event-start",
    label: "Event start",
    mode: "datetime",
    value: "2026-07-20T09:30",
  });
  const withSeconds = DateTimeControl({
    htmlFor: "event-stamp",
    label: "Event stamp",
    mode: "datetime-seconds",
    value: "2026-07-20T09:30:45",
  });

  const dateInput = dateOnly.children[1] as { props: { type: string; className?: string; step?: number } };
  const dateTimeInput = dateTime.children[1] as { props: { type: string; step?: number } };
  const secondsInput = withSeconds.children[1] as { props: { type: string; step?: number } };

  assert.equal(dateInput.props.type, "date");
  assert.equal(dateInput.props.step, undefined);
  assert.match(String(dateOnly.props.className), /date-time-control--date/);

  assert.equal(dateTimeInput.props.type, "datetime-local");
  assert.equal(dateTimeInput.props.step, 60);

  assert.equal(secondsInput.props.type, "datetime-local");
  assert.equal(secondsInput.props.step, 1);
});

test("createFormFields number and currency variants emit numeric inputs with prefix wrapper", () => {
  const ReactLike = createFakeReact();
  const { NumberField, CurrencyField } = createFormFields(ReactLike);

  const numberElement = NumberField({ htmlFor: "age", label: "Age", value: 18, min: 0 });
  const currencyElement = CurrencyField({ htmlFor: "price", label: "Price", value: 12.5, step: "0.01" });

  assert.equal((numberElement.children[1] as { props: { type: string } }).props.type, "number");
  assert.equal((currencyElement.children[1] as { props: { className: string }, children: unknown[] }).props.className, "input-with-prefix");
  assert.equal((((currencyElement.children[1] as { children: unknown[] }).children[1]) as { props: { type: string } }).props.type, "number");
});
