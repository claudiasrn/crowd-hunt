import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Timer from "./Timer";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("Timer", () => {
	it("counts up from the start time", () => {
		render(<Timer startTime={Date.now()} finalMs={null} />);

		act(() => {
			vi.advanceTimersByTime(1500);
		});

		expect(screen.getByLabelText("Elapsed time")).toHaveTextContent("1.5s");
	});

	it("shows the final time once it's set", () => {
		render(<Timer startTime={Date.now()} finalMs={42000} />);

		expect(screen.getByLabelText("Elapsed time")).toHaveTextContent("42.0s");
	});

	it("stops counting when the final time is set", () => {
		const start = Date.now();
		const { rerender } = render(<Timer startTime={start} finalMs={null} />);

		rerender(<Timer startTime={start} finalMs={3000} />);
		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(screen.getByLabelText("Elapsed time")).toHaveTextContent("3.0s");
	});
});