import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToBetSlip, BetSlipItem } from "../../store/betslipSlice";
import { ManagedUser } from "../../store/agentSlice";
import AgentService from "../../services/agentService";
import GamesService, { Game } from "../../services/gamesService";

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

  // Agent-specific state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);

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
        ? selectedGame.homeOdds
        : selectedBet === "draw"
          ? selectedGame.drawOdds
          : selectedGame.awayOdds;

    if (!odds) {
      alert("Odds not available for this bet");
      return;
    }

    const potentialWinnings = betAmount * odds;

    alert(`Bet placed successfully!
    Game: ${selectedGame.homeTeam} vs ${selectedGame.awayTeam}
    Bet: ${selectedBet.toUpperCase()}
    Amount: $${betAmount}
    Odds: ${odds}
    Potential Winnings: $${potentialWinnings.toFixed(2)}`);

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
      odds,
      stake: 10,
      potentialWinnings: 10 * odds,
      bookmaker: "BetZone",
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
            odds: odds,
            bookmaker: "BetZone",
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
          <button
            className="btn btn-outline"
            onClick={() => onNavigate("home")}
          >
            ← Back to Home
          </button>
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
        {/* League selector buttons */}
        <div className="league-selector" style={{ marginBottom: 16 }}>
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
        </div>
        {/* Agent Mode Indicator */}
        {isAgentMode && (
          <div className="agent-mode-indicator">
            <div className="agent-mode-content">
              <span className="agent-mode-icon">👤</span>
              <span className="agent-mode-text">Agent Mode</span>
              {selectedUser && (
                <div className="selected-user-display">
                  <span className="selected-user-label">Placing bet for:</span>
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
                    {game.homeOdds || "-"}
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
                    {game.drawOdds || "-"}
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
                    {game.awayOdds || "-"}
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
                    {game.doubleChance.homeOrDraw ?? "-"}
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
                    {game.doubleChance.drawOrAway ?? "-"}
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
                    {game.doubleChance.homeOrAway ?? "-"}
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
                    {game.overUnder.over25 ?? "-"}
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
                    {game.overUnder.under25 ?? "-"}
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
                <div className="betting-option-label">Both Teams To Score</div>
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
                    {game.bothTeamsToScore.yes ?? "-"}
                  </div>
                  <div
                    id={`${game.id}-Both Teams To Score-No`}
                    className={`betting-option-value ${
                      game.bothTeamsToScore.no ? "clickable" : ""
                    } ${
                      isSelectionInBetSlip(game.id, "Both Teams To Score", "No")
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
                    {game.bothTeamsToScore.no ?? "-"}
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
              <span className="odds">{selectedGame.homeOdds}</span>
            </button>

            <button
              className={`bet-option ${
                selectedBet === "draw" ? "selected" : ""
              }`}
              onClick={() => setSelectedBet("draw")}
            >
              <span>Draw</span>
              <span className="odds">{selectedGame.drawOdds}</span>
            </button>

            <button
              className={`bet-option ${
                selectedBet === "away" ? "selected" : ""
              }`}
              onClick={() => setSelectedBet("away")}
            >
              <span>{selectedGame.awayTeam}</span>
              <span className="odds">{selectedGame.awayOdds}</span>
            </button>
          </div>

          <div className="bet-amount">
            <label htmlFor="betAmount">Bet Amount ($)</label>
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
                Potential Winnings: $
                {(() => {
                  const odds =
                    selectedBet === "home"
                      ? selectedGame.homeOdds
                      : selectedBet === "draw"
                      ? selectedGame.drawOdds
                      : selectedGame.awayOdds;
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
