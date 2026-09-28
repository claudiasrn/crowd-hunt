import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
	cleanup();
});

// jsdom doesn't implement <dialog> methods
HTMLDialogElement.prototype.showModal = vi.fn(function () {
	this.open = true;
});
HTMLDialogElement.prototype.close = vi.fn(function () {
	this.open = false;
});