// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./page";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Mock router and useSearchParams
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams("");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Auth Context
let mockStatus = "unauthenticated";
const mockLogin = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    status: mockStatus,
    login: mockLogin,
  }),
}));

// Mock Translation Context
vi.mock("../../context/I18nContext", () => ({
  useTranslation: () => ({
    locale: "en-US",
  }),
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus = "unauthenticated";
    mockSearchParams = new URLSearchParams("");
  });

  it("renders Google and GitHub login buttons by default", () => {
    render(<LoginPage />);

    expect(screen.getByText("Continue with Google")).toBeDefined();
    expect(screen.getByText("Continue with GitHub")).toBeDefined();
    expect(screen.getByText("Administrator Portal")).toBeDefined();
    
    // Admin credentials form should not be rendered by default
    expect(screen.queryByTestId("admin-form")).toBeNull();
  });

  it("renders the administrator credentials form when toggled", () => {
    render(<LoginPage />);

    const adminLink = screen.getByText("Administrator Portal");
    fireEvent.click(adminLink);

    expect(screen.getByTestId("admin-form")).toBeDefined();
    expect(screen.getByPlaceholderText("admin")).toBeDefined();
    expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
    expect(screen.getByText("Sign In as Admin")).toBeDefined();
  });

  it("renders the administrator credentials form initially when ?admin=true is in the URL", () => {
    mockSearchParams = new URLSearchParams("admin=true");
    render(<LoginPage />);

    expect(screen.getByTestId("admin-form")).toBeDefined();
  });

  it("shows an error when attempting to login without accepting the regulatory disclaimer", () => {
    mockSearchParams = new URLSearchParams("admin=true");
    render(<LoginPage />);

    // Toggle admin mode to access fields
    const usernameInput = screen.getByPlaceholderText("admin");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByText("Sign In as Admin");

    fireEvent.change(usernameInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "secret_password" } });
    fireEvent.click(submitButton);

    // Disclaimer is not checked, should display error
    expect(screen.getByTestId("login-error")).toBeDefined();
    expect(screen.getByText("Please accept the regulatory disclaimer")).toBeDefined();
  });
});
