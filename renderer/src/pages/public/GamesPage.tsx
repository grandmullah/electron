import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToBetSlip, BetSlipItem } from "../../store/betslipSlice";
import { ManagedUser } from "../../store/agentSlice";
import AgentService from "../../services/agentService";
import GamesService, { Game } from "../../services/gamesService";
import { testPrint, testBixolonPrinter } from "../../services/printService";
import settingsService from "../../services/settingsService";

interface GamesPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

// Types now come from GamesService

export const GamesPage: React.FC<GamesPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { items: betSlipItems } = useAppSelector((state) => state.betslip);
  const { user } = useAppSelector((state) => state.auth);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<
    "home" | "draw" | "away" | null
  >(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const [loggedInUser, setLoggedInUser] = useState<string>("John Doe");
  const [leagueKey, setLeagueKey] = useState<string>("soccer_epl");

  // Function to apply 4% reduction to odds
  const applyOddsReduction = (
    odds: number | null | undefined
  ): number | null | undefined => {
    if (!odds || odds <= 0) return odds;
    // Apply 4% reduction: multiply by 0.96
    return Math.round(odds * 0.96 * 100) / 100; // Round to 2 decimal places
  };

  // Agent-specific state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);

  useEffect(() => {
    fetchGames();
    // Check if user is an agent and load managed users
    if (user && user.role === "agent") {
      setIsAgentMode(true);
      loadManagedUsers();
    } else {
      setIsAgentMode(false);
      setManagedUsers([]);
      setSelectedUser(null);
    }
  }, [user, leagueKey]);

  // Auto-refresh odds every 10 minutes (600,000 ms)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing odds...");
      fetchGames();
      // Show notification for auto-refresh
      setShowRefreshNotification(true);
      setTimeout(() => setShowRefreshNotification(false), 3000); // Hide after 3 seconds
    }, 600000); // 10 minutes

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [leagueKey]);

  // Manual refresh function for users
  const handleManualRefresh = () => {
    console.log("🔄 Manual odds refresh requested");
    fetchGames();
  };

  // Print games function
  const handlePrintGames = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print games");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Betzone Games & Odds - ${new Date().toLocaleDateString()}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              background: #f8f9fa;
              color: #333;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .print-header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            
            .print-header .subtitle {
              font-size: 16px;
              margin: 0;
              opacity: 0.9;
            }
            
            .print-header .timestamp {
              font-size: 12px;
              margin: 10px 0 0 0;
              opacity: 0.8;
            }
            
            .games-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 20px;
              margin-top: 20px;
            }
            
            .game-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              border: 1px solid #e9ecef;
              transition: all 0.3s ease;
            }
            
            .game-info {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #f1f3f4;
            }
            
            .game-teams {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 10px;
            }
            
            .team {
              text-align: center;
              flex: 1;
            }
            
            .team-name {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
            }
            
            .vs-divider {
              font-size: 14px;
              font-weight: 700;
              color: #6c757d;
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 50%;
              border: 2px solid #dee2e6;
            }
            
            .game-time {
              font-size: 12px;
              color: #6c757d;
              text-align: center;
            }
            
            .betting-options {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 15px;
            }
            
            .betting-option-column {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 12px;
              border: 1px solid #e9ecef;
            }
            
            .betting-option-column.disabled {
              opacity: 0.5;
              background: #f1f3f4;
            }
            
            .betting-option-label {
              font-size: 12px;
              font-weight: 600;
              color: #495057;
              text-align: center;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .betting-option-sub-labels {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4px;
              margin-bottom: 8px;
            }
            
            .betting-option-sub-label {
              font-size: 10px;
              color: #6c757d;
              text-align: center;
              font-weight: 500;
            }
            
            .betting-option-values {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4px;
            }
            
            .betting-option-value {
              background: white;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 8px 4px;
              text-align: center;
              font-size: 12px;
              font-weight: 600;
              color: #2c5aa0;
              min-height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .betting-option-value.clickable {
              background: #e3f2fd;
              border-color: #2196f3;
              cursor: pointer;
            }
            
            .betting-option-value.selected {
              background: #4caf50;
              color: white;
              border-color: #4caf50;
            }
            
            .betting-option-value:not(.clickable) {
              background: #f5f5f5;
              color: #999;
              border-color: #ddd;
            }
            
            /* Over/Under and Both Teams to Score have only 2 options */
            .betting-option-column:nth-child(3) .betting-option-sub-labels,
            .betting-option-column:nth-child(4) .betting-option-sub-labels {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .betting-option-column:nth-child(3) .betting-option-values,
            .betting-option-column:nth-child(4) .betting-option-values {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .print-footer {
              margin-top: 40px;
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            
            .print-footer p {
              margin: 5px 0;
              font-size: 12px;
              color: #6c757d;
            }
            
            @media print {
              body {
                background: white;
                padding: 10px;
              }
              
              .game-card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #ddd;
              }
              
              .games-grid {
                gap: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>⚽ Betzone Games & Odds</h1>
            <p class="subtitle">Premier League - ${new Date().toLocaleDateString()}</p>
            <p class="timestamp">Last Updated: ${lastUpdated.toLocaleString()}</p>
          </div>
          
          <div class="games-grid">
            ${games
              .map(
                (game) => `
              <div class="game-card">
                <div class="game-info">
                  <div class="game-teams">
                    <div class="team">
                      <div class="team-name">${game.homeTeam}</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="team">
                      <div class="team-name">${game.awayTeam}</div>
                    </div>
                  </div>
                  <div class="game-time">
                    ${new Date(game.matchTime).toLocaleDateString()} - ${new Date(game.matchTime).toLocaleTimeString()}
                  </div>
                </div>
                
                <div class="betting-options">
                  <!-- 3 Way Column -->
                  <div class="betting-option-column ${!game.hasValidOdds ? "disabled" : ""}">
                    <div class="betting-option-label">3 Way</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">Home</div>
                      <div class="betting-option-sub-label">Draw</div>
                      <div class="betting-option-sub-label">Away</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.homeOdds ? "clickable" : ""}">
                        ${applyOddsReduction(game.homeOdds) || "-"}
                      </div>
                      <div class="betting-option-value ${game.drawOdds ? "clickable" : ""}">
                        ${applyOddsReduction(game.drawOdds) || "-"}
                      </div>
                      <div class="betting-option-value ${game.awayOdds ? "clickable" : ""}">
                        ${applyOddsReduction(game.awayOdds) || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Double Chance Column -->
                  <div class="betting-option-column ${game.doubleChance.homeOrDraw || game.doubleChance.drawOrAway || game.doubleChance.homeOrAway ? "" : "disabled"}">
                    <div class="betting-option-label">Double Chance</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">1 or X</div>
                      <div class="betting-option-sub-label">X or 2</div>
                      <div class="betting-option-sub-label">1 or 2</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.doubleChance.homeOrDraw ? "clickable" : ""}">
                        ${applyOddsReduction(game.doubleChance.homeOrDraw) || "-"}
                      </div>
                      <div class="betting-option-value ${game.doubleChance.drawOrAway ? "clickable" : ""}">
                        ${applyOddsReduction(game.doubleChance.drawOrAway) || "-"}
                      </div>
                      <div class="betting-option-value ${game.doubleChance.homeOrAway ? "clickable" : ""}">
                        ${applyOddsReduction(game.doubleChance.homeOrAway) || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Over/Under Column -->
                  <div class="betting-option-column ${game.overUnder.over25 || game.overUnder.under25 ? "" : "disabled"}">
                    <div class="betting-option-label">Over/Under 2.5</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">Over</div>
                      <div class="betting-option-sub-label">Under</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.overUnder.over25 ? "clickable" : ""}">
                        ${applyOddsReduction(game.overUnder.over25) || "-"}
                      </div>
                      <div class="betting-option-value ${game.overUnder.under25 ? "clickable" : ""}">
                        ${applyOddsReduction(game.overUnder.under25) || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Both Teams to Score Column -->
                  <div class="betting-option-column ${game.bothTeamsToScore.yes || game.bothTeamsToScore.no ? "" : "disabled"}">
                    <div class="betting-option-label">Both Teams To Score</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">Yes</div>
                      <div class="betting-option-sub-label">No</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.bothTeamsToScore.yes ? "clickable" : ""}">
                        ${applyOddsReduction(game.bothTeamsToScore.yes) || "-"}
                      </div>
                      <div class="betting-option-value ${game.bothTeamsToScore.no ? "clickable" : ""}">
                        ${applyOddsReduction(game.bothTeamsToScore.no) || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="print-footer">
            <p>Generated by Betzone on ${new Date().toLocaleString()}</p>
            <p>Total Games: ${games.length}</p>
            <p>All odds include 4% reduction</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const loadManagedUsers = async () => {
    try {
      const users = await AgentService.getManagedUsers();
      setManagedUsers(users);
    } catch (error) {
      console.error("Failed to load managed users:", error);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedGames = await GamesService.fetchOdds(leagueKey);
      setGames(fetchedGames);
      setLastUpdated(new Date()); // Update timestamp when odds are refreshed
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load games. Please try again later.");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = () => {
    if (!selectedGame || !selectedBet) {
      alert("Please select a game and bet type");
      return;
    }

    const odds =
      selectedBet === "home"
        ? applyOddsReduction(selectedGame.homeOdds)
        : selectedBet === "draw"
          ? applyOddsReduction(selectedGame.drawOdds)
          : applyOddsReduction(selectedGame.awayOdds);

    if (!odds) {
      alert("Odds not available for this bet");
      return;
    }

    const potentialWinnings = betAmount * odds;

    alert(`Bet placed successfully!
    Game: ${selectedGame.homeTeam} vs ${selectedGame.awayTeam}
    Bet: ${selectedBet.toUpperCase()}
    Amount: SSP ${betAmount}
    Odds: ${odds}
    Potential Winnings: SSP ${potentialWinnings.toFixed(2)}`);

    // Reset selections
    setSelectedGame(null);
    setSelectedBet(null);
    setBetAmount(10);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "var(--color-error)";
      case "finished":
        return "var(--color-text-muted)";
      default:
        return "var(--color-success)";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "LIVE";
      case "finished":
        return "FINISHED";
      default:
        return "UPCOMING";
    }
  };

  const toggleExpanded = (gameId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
    }
    setExpandedGames(newExpanded);
  };

  const isSelectionInBetSlip = (
    gameId: string,
    betType: string,
    selection: string
  ): boolean => {
    return betSlipItems.some(
      (item) =>
        item.gameId === gameId &&
        item.betType === betType &&
        item.selection === selection
    );
  };

  const handleAddToBetSlip = (
    game: Game,
    betType: string,
    selection: string,
    odds: number
  ) => {
    // Apply 4% reduction to odds before adding to bet slip
    const reducedOdds = applyOddsReduction(odds) || odds;
    // If agent mode and no user selected, show user selector
    if (isAgentMode && !selectedUser) {
      setShowUserSelector(true);
      return;
    }

    // Regular user flow - add to bet slip
    const betSlipItem = {
      id: `${game.id}-${betType}-${selection}`,
      gameId: game.id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      betType,
      selection,
      odds: reducedOdds,
      stake: user?.bettingLimits?.minStake || 10, // Use user's minimum stake
      potentialWinnings: (user?.bettingLimits?.minStake || 10) * reducedOdds,
      bookmaker: "Betzone",
      gameTime: game.matchTime,
      sportKey:
        game.sportKey ||
        (game.league === "Premier League"
          ? "soccer_epl"
          : "soccer_" + game.league.toLowerCase().replace(/\s+/g, "_")),
    };

    dispatch(addToBetSlip(betSlipItem));

    // Add visual feedback with a brief pulse animation
    const elementId = `${game.id}-${betType}-${selection}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("pulse");
      setTimeout(() => {
        element.classList.remove("pulse");
      }, 600);
    }
  };

  const handleAgentBet = async (
    game: Game,
    betType: string,
    selection: string,
    odds: number,
    stake: number
  ) => {
    if (!selectedUser) {
      setShowUserSelector(true);
      return;
    }

    // Apply 4% reduction to odds before placing bet
    const reducedOdds = applyOddsReduction(odds) || odds;

    try {
      const bet = await AgentService.placeBetForUser({
        userId: selectedUser.id,
        betType: "single",
        stake: stake,
        selections: [
          {
            gameId: game.id,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            betType: betType,
            selection: selection,
            odds: reducedOdds,
            bookmaker: "betzone",
            gameTime: game.matchTime,
            sportKey:
              game.league === "Premier League"
                ? "soccer_epl"
                : "soccer_" + game.league.toLowerCase().replace(/\s+/g, "_"),
          },
        ],
      });

      // Show success message
      alert(`Bet placed successfully for ${selectedUser.phone_number}!`);

      // Reset selection
      setSelectedUser(null);
    } catch (error: any) {
      alert(`Failed to place bet: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="games-page">
        <div className="games-header">
          <h1>⚽ Games & Odds</h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn btn-outline"
              onClick={() => onNavigate("home")}
            >
              ← Back to Home
            </button>
            <button
              onClick={handlePrintGames}
              className="btn-print"
              title="Print games and odds"
            >
              🖨️ Print Games
            </button>

            <button
              onClick={() => {
                testBixolonPrinter();
                testPrint(settingsService.getPrinterLogicalName());
              }}
              className="btn-test"
              title="Test printer functionality"
              style={{
                background: "var(--color-warning)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                marginLeft: "8px",
              }}
            >
              🧪 Test Printer
            </button>
          </div>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        onNavigate={onNavigate}
        currentPage="games"
        selectedUser={selectedUser}
        isAgentMode={isAgentMode}
      />

      <div className="games-content">
        {/* League selector and refresh section */}
        <div className="league-selector" style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setLeagueKey("soccer_epl")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  background:
                    leagueKey === "soccer_epl"
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                  color:
                    leagueKey === "soccer_epl" ? "white" : "var(--color-text)",
                  border:
                    leagueKey === "soccer_epl"
                      ? "none"
                      : "1px solid var(--color-border)",
                  transition: "all 0.2s ease",
                }}
              >
                EPL
              </button>
              {/* Future leagues can be added here */}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: "var(--color-success)",
                color: "white",
                border: "none",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Refresh odds (auto-refresh every 10 minutes)"
            >
              🔄 Refresh Odds
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrintGames}
              className="btn-print"
              title="Print games and odds"
            >
              🖨️ Print Games
            </button>

            {/* Last Updated Timestamp */}
            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                textAlign: "center",
                marginTop: "4px",
              }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          {/* Agent Mode Indicator */}
          {isAgentMode && (
            <div className="agent-mode-indicator">
              <div className="agent-mode-content">
                <span className="agent-mode-icon">👤</span>
                <span className="agent-mode-text">Agent Mode</span>
                {selectedUser && (
                  <div className="selected-user-display">
                    <span className="selected-user-label">
                      Placing bet for:
                    </span>
                    <span className="selected-user-name">
                      {selectedUser.phone_number}
                    </span>
                    <span className="selected-user-balance">
                      ${selectedUser.balance.toFixed(2)} {selectedUser.currency}
                    </span>
                    <button
                      className="change-user-btn"
                      onClick={() => setShowUserSelector(true)}
                    >
                      Change User
                    </button>
                  </div>
                )}
                {!selectedUser && (
                  <button
                    className="select-user-btn"
                    onClick={() => setShowUserSelector(true)}
                  >
                    Select User
                  </button>
                )}
              </div>
            </div>
          )}
          {/* <div className="games-header">
          <h1>⚽ Games & Odds</h1>
        </div> */}

          {/* <div className="games-header">
        <button className="btn btn-outline" onClick={() => onNavigate("home")}>
          ← Back to Home
        </button>
      </div> */}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchGames}>
                Retry
              </button>
            </div>
          )}

          {/* Auto-refresh notification */}
          {showRefreshNotification && (
            <div
              style={{
                background: "var(--color-success)",
                color: "white",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                animation: "slideIn 0.3s ease-out",
              }}
            >
              🔄 Odds automatically refreshed at{" "}
              {new Date().toLocaleTimeString()}
            </div>
          )}

          <div className="games-grid">
            {games.map((game) => (
              <div
                key={game.id}
                className={`game-card ${
                  selectedGame?.id === game.id ? "selected" : ""
                }`}
                onClick={() => setSelectedGame(game)}
              >
                <div className="game-info">
                  <div className="game-teams">
                    <div className="team home-team">
                      <span className="team-name">{game.homeTeam}</span>
                    </div>

                    <div className="vs-divider">VS</div>

                    <div className="team away-team">
                      <span className="team-name">{game.awayTeam}</span>
                    </div>
                  </div>

                  <div className="game-time">
                    {new Date(game.matchTime).toLocaleDateString()} -{" "}
                    {new Date(game.matchTime).toLocaleTimeString()}
                  </div>
                </div>

                {/* Main Odds Column */}
                <div
                  className={`betting-option-column ${
                    !game.hasValidOdds ? "disabled" : ""
                  }`}
                >
                  <div className="betting-option-label">3 Way</div>
                  <div className="betting-option-sub-labels">
                    <div className="betting-option-sub-label">Home</div>
                    <div className="betting-option-sub-label">Draw</div>
                    <div className="betting-option-sub-label">Away</div>
                  </div>
                  <div className="betting-option-values">
                    <div
                      id={`${game.id}-3 Way-Home`}
                      className={`betting-option-value ${
                        game.homeOdds ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "3 Way", "Home")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.homeOdds &&
                        handleAddToBetSlip(game, "3 Way", "Home", game.homeOdds)
                      }
                    >
                      {applyOddsReduction(game.homeOdds) || "-"}
                    </div>
                    <div
                      id={`${game.id}-3 Way-Draw`}
                      className={`betting-option-value ${
                        game.drawOdds ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "3 Way", "Draw")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.drawOdds &&
                        handleAddToBetSlip(game, "3 Way", "Draw", game.drawOdds)
                      }
                    >
                      {applyOddsReduction(game.drawOdds) || "-"}
                    </div>
                    <div
                      id={`${game.id}-3 Way-Away`}
                      className={`betting-option-value ${
                        game.awayOdds ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "3 Way", "Away")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.awayOdds &&
                        handleAddToBetSlip(game, "3 Way", "Away", game.awayOdds)
                      }
                    >
                      {applyOddsReduction(game.awayOdds) || "-"}
                    </div>
                  </div>
                </div>

                {/* Double Chance Column */}
                <div
                  className={`betting-option-column ${
                    game.doubleChance.homeOrDraw ||
                    game.doubleChance.drawOrAway ||
                    game.doubleChance.homeOrAway
                      ? ""
                      : "disabled"
                  }`}
                >
                  <div className="betting-option-label">Double Chance</div>
                  <div className="betting-option-sub-labels">
                    <div className="betting-option-sub-label">1 or X</div>
                    <div className="betting-option-sub-label">X or 2</div>
                    <div className="betting-option-sub-label">1 or 2</div>
                  </div>
                  <div className="betting-option-values">
                    <div
                      id={`${game.id}-Double Chance-1 or X`}
                      className={`betting-option-value ${
                        game.doubleChance.homeOrDraw ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Double Chance", "1 or X")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.doubleChance.homeOrDraw &&
                        handleAddToBetSlip(
                          game,
                          "Double Chance",
                          "1 or X",
                          game.doubleChance.homeOrDraw
                        )
                      }
                    >
                      {applyOddsReduction(game.doubleChance.homeOrDraw) ?? "-"}
                    </div>
                    <div
                      id={`${game.id}-Double Chance-X or 2`}
                      className={`betting-option-value ${
                        game.doubleChance.drawOrAway ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Double Chance", "X or 2")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.doubleChance.drawOrAway &&
                        handleAddToBetSlip(
                          game,
                          "Double Chance",
                          "X or 2",
                          game.doubleChance.drawOrAway
                        )
                      }
                    >
                      {applyOddsReduction(game.doubleChance.drawOrAway) ?? "-"}
                    </div>
                    <div
                      id={`${game.id}-Double Chance-1 or 2`}
                      className={`betting-option-value ${
                        game.doubleChance.homeOrAway ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Double Chance", "1 or 2")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.doubleChance.homeOrAway &&
                        handleAddToBetSlip(
                          game,
                          "Double Chance",
                          "1 or 2",
                          game.doubleChance.homeOrAway
                        )
                      }
                    >
                      {applyOddsReduction(game.doubleChance.homeOrAway) ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Over/Under Column */}
                <div
                  className={`betting-option-column ${
                    game.overUnder.over25 || game.overUnder.under25
                      ? ""
                      : "disabled"
                  }`}
                >
                  <div className="betting-option-label">Over/Under 2.5</div>
                  <div className="betting-option-sub-labels">
                    <div className="betting-option-sub-label">Over</div>
                    <div className="betting-option-sub-label">Under</div>
                  </div>
                  <div className="betting-option-values">
                    <div
                      id={`${game.id}-Over/Under 2.5-Over`}
                      className={`betting-option-value ${
                        game.overUnder.over25 ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Over/Under 2.5", "Over")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.overUnder.over25 &&
                        handleAddToBetSlip(
                          game,
                          "Over/Under 2.5",
                          "Over",
                          game.overUnder.over25
                        )
                      }
                    >
                      {applyOddsReduction(game.overUnder.over25) ?? "-"}
                    </div>
                    <div
                      id={`${game.id}-Over/Under 2.5-Under`}
                      className={`betting-option-value ${
                        game.overUnder.under25 ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Over/Under 2.5", "Under")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.overUnder.under25 &&
                        handleAddToBetSlip(
                          game,
                          "Over/Under 2.5",
                          "Under",
                          game.overUnder.under25
                        )
                      }
                    >
                      {applyOddsReduction(game.overUnder.under25) ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Both Teams to Score Column */}
                <div
                  className={`betting-option-column ${
                    game.bothTeamsToScore.yes || game.bothTeamsToScore.no
                      ? ""
                      : "disabled"
                  }`}
                >
                  <div className="betting-option-label">
                    Both Teams To Score
                  </div>
                  <div className="betting-option-sub-labels">
                    <div className="betting-option-sub-label">Yes</div>
                    <div className="betting-option-sub-label">No</div>
                  </div>
                  <div className="betting-option-values">
                    <div
                      id={`${game.id}-Both Teams To Score-Yes`}
                      className={`betting-option-value ${
                        game.bothTeamsToScore.yes ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(
                          game.id,
                          "Both Teams To Score",
                          "Yes"
                        )
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.bothTeamsToScore.yes &&
                        handleAddToBetSlip(
                          game,
                          "Both Teams To Score",
                          "Yes",
                          game.bothTeamsToScore.yes
                        )
                      }
                    >
                      {applyOddsReduction(game.bothTeamsToScore.yes) ?? "-"}
                    </div>
                    <div
                      id={`${game.id}-Both Teams To Score-No`}
                      className={`betting-option-value ${
                        game.bothTeamsToScore.no ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(
                          game.id,
                          "Both Teams To Score",
                          "No"
                        )
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.bothTeamsToScore.no &&
                        handleAddToBetSlip(
                          game,
                          "Both Teams To Score",
                          "No",
                          game.bothTeamsToScore.no
                        )
                      }
                    >
                      {applyOddsReduction(game.bothTeamsToScore.no) ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Spreads Column */}
                <div
                  className={`betting-option-column ${
                    game.spreads?.homeSpreadOdds || game.spreads?.awaySpreadOdds
                      ? ""
                      : "disabled"
                  }`}
                >
                  <div className="betting-option-label">
                    {game.spreads?.spreadLine
                      ? `Spread ${game.spreads.spreadLine > 0 ? `+${game.spreads.spreadLine}` : game.spreads.spreadLine}`
                      : "Spread"}
                  </div>
                  <div className="betting-option-sub-labels">
                    <div className="betting-option-sub-label">Home</div>
                    <div className="betting-option-sub-label">Away</div>
                  </div>
                  <div className="betting-option-values">
                    <div
                      id={`${game.id}-Spread-Home`}
                      className={`betting-option-value ${
                        game.spreads?.homeSpreadOdds ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Spread", "Home")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.spreads?.homeSpreadOdds &&
                        handleAddToBetSlip(
                          game,
                          "Spread",
                          "Home",
                          game.spreads.homeSpreadOdds
                        )
                      }
                    >
                      {game.spreads?.homeSpreadOdds ?? "-"}
                    </div>
                    <div
                      id={`${game.id}-Spread-Away`}
                      className={`betting-option-value ${
                        game.spreads?.awaySpreadOdds ? "clickable" : ""
                      } ${
                        isSelectionInBetSlip(game.id, "Spread", "Away")
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        game.spreads?.awaySpreadOdds &&
                        handleAddToBetSlip(
                          game,
                          "Spread",
                          "Away",
                          game.spreads.awaySpreadOdds
                        )
                      }
                    >
                      {game.spreads?.awaySpreadOdds ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Expand Arrow */}
                <div
                  className={`expand-arrow ${
                    expandedGames.has(game.id) ? "expanded" : ""
                  }`}
                  onClick={(e) => toggleExpanded(game.id, e)}
                >
                  ▼
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* {selectedGame && (
        <div className="betting-panel">
          <h3>Place Your Bet</h3>
          <div className="selected-game">
            <h4>
              {selectedGame.homeTeam} vs {selectedGame.awayTeam}
            </h4>
            <p>{new Date(selectedGame.matchTime).toLocaleString()}</p>
          </div>

          <div className="bet-options">
            <button
              className={`bet-option ${
                selectedBet === "home" ? "selected" : ""
              }`}
              onClick={() => setSelectedBet("home")}
            >
              <span>{selectedGame.homeTeam}</span>
              <span className="odds">{applyOddsReduction(selectedGame.homeOdds)}</span>
            </button>

            <button
              className={`bet-option ${
                selectedBet === "draw" ? "selected" : ""
              }`}
              onClick={() => setSelectedBet("draw")}
            >
              <span>Draw</span>
              <span className="odds">{applyOddsReduction(selectedGame.drawOdds)}</span>
            </button>

            <button
              className={`bet-option ${
                selectedBet === "away" ? "selected" : ""
              }`}
              onClick={() => setSelectedBet("away")}
            >
              <span>{selectedGame.awayTeam}</span>
              <span className="odds">{applyOddsReduction(selectedGame.awayOdds)}</span>
            </button>
          </div>

          <div className="bet-amount">
            <label htmlFor="betAmount">Bet Amount (SSP)</label>
            <input
              type="number"
              id="betAmount"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min="1"
              max="1000"
            />
          </div>

          {selectedBet && (
            <div className="potential-winnings">
              <p>
                Potential Winnings: SSP
                {(() => {
                  const odds =
                    selectedBet === "home"
                      ? applyOddsReduction(selectedGame.homeOdds)
                      : selectedBet === "draw"
                      ? applyOddsReduction(selectedGame.drawOdds)
                      : applyOddsReduction(selectedGame.awayOdds);
                  return odds ? (betAmount * odds).toFixed(2) : "N/A";
                })()}
              </p>
            </div>
          )}

          <button
            className="btn btn-primary place-bet-btn"
            onClick={handlePlaceBet}
            disabled={!selectedBet}
          >
            Place Bet
          </button>
        </div>
      )} */}
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <div
          className="modal-overlay"
          onClick={() => setShowUserSelector(false)}
        >
          <div
            className="modal-content user-selector-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Select User to Place Bet For</h3>
              <button
                className="modal-close"
                onClick={() => setShowUserSelector(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="users-list">
                {managedUsers
                  .filter((user) => user.isActive)
                  .map((user) => (
                    <div
                      key={user.id}
                      className={`user-selector-item ${
                        selectedUser?.id === user.id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserSelector(false);
                      }}
                    >
                      <div className="user-selector-avatar">
                        <span>{user.phone_number.charAt(1).toUpperCase()}</span>
                      </div>
                      <div className="user-selector-info">
                        <div className="user-selector-name">
                          {user.phone_number}
                        </div>
                        <div className="user-selector-details">
                          {user.country_code} • {user.currency}
                        </div>
                        <div className="user-selector-balance">
                          Balance: ${user.balance.toFixed(2)} {user.currency}
                        </div>
                      </div>
                      <div className="user-selector-status">
                        <span
                          className={`status-indicator ${
                            user.isActive ? "active" : "inactive"
                          }`}
                        ></span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowUserSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
