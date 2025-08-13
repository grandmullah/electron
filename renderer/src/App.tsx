import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { useAppSelector } from "./store/hooks.js";
import { HomePage } from "./pages/public/HomePage.js";
import { DashboardPage } from "./pages/private/DashboardPage.js";
import { SettingsPage } from "./pages/private/SettingsPage.js";
import { GamesPage } from "./pages/public/GamesPage.js";

type Page = "home" | "dashboard" | "settings" | "games";

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { user } = useAppSelector((state) => state.auth);

  const navigateTo = (page: Page) => {
    // Check if user is trying to access private pages without being logged in
    if ((page === "dashboard" || page === "settings") && !user) {
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
      case "games":
        return <GamesPage onNavigate={navigateTo} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return <div className="app">{renderPage()}</div>;
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};
