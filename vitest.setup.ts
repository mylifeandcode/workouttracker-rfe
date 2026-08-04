// Registers jest-dom matchers (e.g. toBeInTheDocument) on Vitest's `expect`,
// and unmounts rendered components after each test. We don't enable Vitest
// `globals`, so cleanup is wired up explicitly here.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
