import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { HomePage } from "./pages/public/HomePage";
import { DashboardPage } from "./pages/private/DashboardPage";
import { SettingsPage } from "./pages/private/SettingsPage";
import { GamesPage } from "./pages/public/GamesPage";
import { AgentPage } from "./pages/private/AgentPage";
import { HistoryPage } from "./pages/private/HistoryPage";
import WindowsPrinterTest from "./components/WindowsPrinterTest";
import AuthService from "./services/authService";
import { loginSuccess, loginStart, loginFailure } from "./store/authSlice";
import { convertAuthUserToUser } from "./store/authSlice";

type Page = "home" | "dashboard" | "settings" | "games" | "agent" | "history" | "printer-test";

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      if (AuthService.isAuthenticated()) {
        console.log("Token found, fetching profile...");
        try {
          dispatch(loginStart());
          const response = await AuthService.getProfile();
          const user = convertAuthUserToUser(response.user);
          dispatch(loginSuccess(user));
          console.log("User authenticated successfully:", user.name);
        } catch (error: any) {
          // Token is invalid or expired
          console.log("Token validation failed:", error.message);
          dispatch(loginFailure(error.message));
          AuthService.logout();
        }
      } else {
        // No token found, ensure loading is set to false
        console.log("No token found, user not authenticated");
        dispatch(loginFailure(""));
      }
    };

    checkAuth();
  }, [dispatch]);

  // Force auth check when user state changes
  useEffect(() => {
    if (!user && !isLoading) {
      // Ensure we're on home page to show auth modal
      setCurrentPage("home");
    }
  }, [user, isLoading]);

  const navigateTo = (page: Page) => {
    // Check if user is trying to access private pages without being logged in
    if (
      (page === "dashboard" ||
        page === "settings" ||
        page === "agent" ||
        page === "history") &&
      !user
    ) {
      // Redirect to home page if not logged in
      setCurrentPage("home");
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={navigateTo} />;
      case "dashboard":
        return user ? (
          <DashboardPage onNavigate={navigateTo} />
        ) : (
          <HomePage onNavigate={navigateTo} />
        );
      case "settings":
        return user ? (
          <SettingsPage onNavigate={navigateTo} />
        ) : (
          <HomePage onNavigate={navigateTo} />
        );
      case "agent":
        return user ? (
          <AgentPage onNavigate={navigateTo} />
        ) : (
          <HomePage onNavigate={navigateTo} />
        );
      case "history":
        return user ? (
          <HistoryPage onNavigate={navigateTo} />
        ) : (
          <HomePage onNavigate={navigateTo} />
        );
      case "games":
        return <GamesPage onNavigate={navigateTo} />;
      case "printer-test":
        return <WindowsPrinterTest />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading && !user) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading BetZone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Add navigation to printer test */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        background: '#007bff',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
      }} onClick={() => navigateTo('printer-test')}>
        🖨️ Printer Test
      </div>
      {renderPage()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};
