import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReviewStars } from "./ReviewStars";

describe("ReviewStars", () => {
  it("emite un cambio de valor al seleccionar una estrella", () => {
    const onChange = vi.fn();
    render(<ReviewStars value={0} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /seleccionar 4 estrellas/i }));

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
