import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToBetSlip, BetSlipItem } from "../../store/betslipSlice";
import { ManagedUser } from "../../store/agentSlice";
import AgentService from "../../services/agentService";
import GamesService, { Game } from "../../services/gamesService";
// Dynamic import for printService to enable code splitting
import settingsService from "../../services/settingsService";
import { API_BASE_URL } from "../../services/apiConfig";
import { useOdds, useRefreshOdds } from "../../hooks/useOdds";
import useSWR from "swr";
import { GameCard } from "../../components/games/GameCard";
import { GameSearch } from "../../components/games/GameSearch";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Snackbar,
  Divider,
  Badge,
  Collapse,
} from "@mui/material";
import {
  SportsSoccer as SoccerIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Science as TestIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

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
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<
    "home" | "draw" | "away" | null
  >(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const [loggedInUser, setLoggedInUser] = useState<string>("John Doe");
  const [leagueKey, setLeagueKey] = useState<string>("");

  // Use SWR for odds fetching
  const { games, isLoading, error, mutate, isError, isEmpty } =
    useOdds(leagueKey);
  const { refresh } = useRefreshOdds();

  // League interface
  interface League {
    key: string;
    sportKey: string;
    name: string;
    displayName: string;
  }

  // SWR fetcher function for leagues
  const leaguesFetcher = async (url: string): Promise<League[]> => {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || "Failed to fetch leagues");
    }
  };

  // SWR hook for leagues - NO fallback data to force using API response
  const {
    data: supportedLeagues,
    error: leaguesError,
    isLoading: leaguesLoading,
    mutate: mutateLeagues,
  } = useSWR<League[]>(`${API_BASE_URL}/leagues/supported`, leaguesFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Dedupe requests for 1 minute
    errorRetryCount: 2,
    onError: (error) => {
      console.error("Error fetching leagues:", error);
    },
  });

  // Set default league key from supported leagues
  useEffect(() => {
    // Wait for leagues to load, then set default
    if (!leaguesLoading && !leagueKey) {
      if (supportedLeagues && supportedLeagues.length > 0) {
        // Use API data - first league from supported leagues
        const defaultLeague = supportedLeagues[0]?.key;
        if (defaultLeague) {
          setLeagueKey(defaultLeague);
        }
      } else if (leaguesError) {
        // Fallback if API fails - use first league from API response structure
        setLeagueKey("soccer_germany_bundesliga");
      }
    }
  }, [supportedLeagues, leagueKey, leaguesLoading, leaguesError]);

  // Agent-specific state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);

  // Game indexes now come from the API via team_index field
  // No local index creation needed

  // Check if user is an agent and load managed users
  useEffect(() => {
    if (user && user.role === "agent") {
      setIsAgentMode(true);
      loadManagedUsers();
    } else {
      setIsAgentMode(false);
      setManagedUsers([]);
      setSelectedUser(null);
    }
  }, [user]);

  // Show refresh notification when data is revalidated
  useEffect(() => {
    if (!isLoading && games.length > 0) {
      setShowRefreshNotification(true);
      setTimeout(() => setShowRefreshNotification(false), 3000);
    }
  }, [games, isLoading]);

  // Manual refresh function for users
  const handleManualRefresh = () => {
    console.log("🔄 Manual odds refresh requested");
    mutate(); // Trigger SWR revalidation
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
                size: A4 landscape;
                margin: 0.5cm;
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
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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
              border-radius: 6px;
              padding: 8px 12px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border: 1px solid #e0e0e0;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              min-height: 40px;
              page-break-inside: avoid;
            }
            
            .game-info-compact {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
              flex: 0 0 auto;
              flex-shrink: 0;
              min-width: 300px;
              max-width: 300px;
              margin-right: 20px;
            }
            
            .game-id-compact {
              background: #f1f3f5;
              color: #495057;
              padding: 3px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 600;
              font-family: 'Monaco', 'Courier New', monospace;
              white-space: nowrap;
            }
            
            .game-header {
              display: flex;
              align-items: center;
              gap: 8px;
              width: 100%;
            }
            
            .game-teams {
              font-size: 11px;
              font-weight: 600;
              color: #212529;
              white-space: nowrap;
              width: 300px;
              min-width: 300px;
              max-width: 300px;
            }
            
            .game-number {
              color: #FFD700;
              font-weight: 700;
              text-shadow: 0 0 3px rgba(255, 215, 0, 0.6);
              background: none;
            }
            
            .vs-separator {
              color: #6c757d;
              font-weight: 400;
              margin: 0 4px;
            }
            
            .game-time {
              font-size: 9px;
              color: #6c757d;
              white-space: nowrap;
              min-width: 90px;
              text-align: left;
              margin-top: 2px;
            }
            
            
            .betting-options {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              flex-wrap: nowrap;
              flex: 1;
              overflow-x: auto;
              padding: 4px 0;
            }
            
            .betting-option-compact {
              display: flex;
              align-items: center;
              gap: 2px;
              min-width: auto;
              white-space: nowrap;
            }
            
            .betting-option-vertical {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3px;
              min-width: 40px;
              max-width: 40px;
              text-align: center;
              flex-shrink: 0;
            }
            
            .betting-option-label-compact {
              font-size: 8px;
              font-weight: 600;
              color: #6c757d;
              text-transform: uppercase;
            }
            
            .betting-option-label-vertical {
              font-size: 8px;
              font-weight: 700;
              color: #495057;
              text-transform: uppercase;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 3px;
              padding: 2px 4px;
              min-width: 22px;
              max-width: 22px;
              text-align: center;
              line-height: 1;
            }
            
            .betting-option-value-compact {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 600;
              color: #212529;
              min-width: 32px;
              text-align: center;
            }
            
            .betting-option-value-vertical {
              background: #e7f5ff;
              border: 1px solid #74c0fc;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 700;
              color: #1971c2;
              min-width: 32px;
              max-width: 32px;
              text-align: center;
              line-height: 1;
            }
            
            .betting-option-value-compact.clickable {
              background: #e7f5ff;
              border-color: #74c0fc;
              color: #1971c2;
            }
            
            .betting-option-compact.disabled .betting-option-value-compact {
              background: #f1f3f5;
              color: #adb5bd;
              border-color: #e9ecef;
            }
            
            .betting-option-vertical.disabled .betting-option-value-vertical {
              background: #f1f3f5;
              color: #adb5bd;
              border-color: #e9ecef;
            }
            
            .betting-option-additional {
              margin-top: 4px;
              text-align: center;
            }
            
            .betting-option-additional small {
              font-size: 9px;
              color: #6c757d;
              font-style: italic;
            }
            
            .totals-section {
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e9ecef;
            }
            
            .totals-section:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            
            .totals-point-label {
              font-size: 10px;
              font-weight: 600;
              color: #495057;
              text-align: center;
              margin-bottom: 4px;
              background: #f8f9fa;
              padding: 2px 4px;
              border-radius: 3px;
            }
            
            .totals-horizontal {
              display: flex;
              gap: 4px;
              justify-content: center;
              flex-wrap: wrap;
              max-width: 100%;
              overflow: hidden;
            }
            
            .totals-point-group {
              display: flex;
              flex-direction: column;
              align-items: center;
              min-width: 24px;
              max-width: 40px;
              flex: 1 1 auto;
              flex-shrink: 1;
            }
            
            .totals-point-group .betting-option-sub-labels {
              display: flex;
              gap: 1px;
              margin-bottom: 1px;
            }
            
            .totals-point-group .betting-option-sub-label {
              font-size: 7px;
              color: #6c757d;
              text-align: center;
              min-width: 10px;
            }
            
            .totals-point-group .betting-option-values {
              display: flex;
              gap: 1px;
            }
            
            .totals-point-group .betting-option-value {
              font-size: 8px;
              padding: 2px 4px;
              min-width: 16px;
              text-align: center;
              border-radius: 2px;
            }
            
            @media print {
              .totals-horizontal {
                gap: 2px;
              }
              
              .totals-point-group {
                min-width: 20px;
                max-width: 35px;
                flex: 1 1 auto;
              }
              
              .totals-point-group .betting-option-value {
                font-size: 7px;
                padding: 2px 3px;
                min-width: 14px;
              }
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
                padding: 0.5cm;
              }
              
              .game-card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #ccc;
                page-break-inside: avoid;
                padding: 6px 10px;
                margin-bottom: 6px;
              }
              
              .games-grid {
                gap: 6px;
              }
              
              .betting-options {
                flex-wrap: nowrap;
                gap: 6px;
                padding: 2px 0;
              }
              
              .game-info-compact {
                flex: 0 0 auto;
                min-width: 250px;
                max-width: 250px;
                margin-right: 15px;
                flex-direction: column;
                gap: 3px;
              }
              
              .game-id-compact {
                font-size: 8px;
                padding: 2px 5px;
              }
              
              .game-teams {
                font-size: 10px;
                width: 250px;
                min-width: 250px;
                max-width: 250px;
              }
              
              .game-number {
                color: #FFD700;
                font-weight: 700;
                text-shadow: none;
                background: none !important;
                background-color: transparent !important;
              }
              
              .game-time {
                font-size: 8px;
                min-width: 70px;
                text-align: left;
                margin-top: 1px;
              }
              
              .betting-option-label-compact {
                font-size: 7px;
              }
              
              .betting-option-value-compact {
                font-size: 8px;
                padding: 2px 4px;
                min-width: 28px;
              }
              
              .betting-option-vertical {
                min-width: 35px;
                max-width: 35px;
                gap: 2px;
              }
              
              .betting-option-label-vertical {
                font-size: 7px;
                padding: 1px 3px;
                min-width: 18px;
                max-width: 18px;
              }
              
              .betting-option-value-vertical {
                font-size: 8px;
                padding: 1px 4px;
                min-width: 28px;
                max-width: 28px;
              }
              
              .print-header {
                padding: 10px;
                margin-bottom: 10px;
              }
              
              .print-header h1 {
                font-size: 20px;
                margin-bottom: 5px;
              }
              
              .print-header .subtitle {
                font-size: 12px;
              }
              
              .print-header .timestamp {
                font-size: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>⚽ Betzone Games & Odds</h1>
            <p class="subtitle">${getLeagueDisplayName(leagueKey)} - ${new Date().toLocaleDateString()}</p>
            <p class="timestamp">Last Updated: ${lastUpdated.toLocaleString()}</p>
          </div>
          
          <div class="games-grid">
            ${games
              .map((game) => {
                const gameNumber = game.team_index?.fullIndex || 0;
                return `
              <div class="game-card">
                <!-- Game Info & Teams - All Horizontal -->
                <div class="game-info-compact">
                  <div class="game-id-compact">...${game.externalId ? game.externalId.slice(-5) : game.id.slice(-5)}</div>
                  <div class="game-header">
                    <div class="game-teams"><span class="game-number">[${gameNumber}]</span> ${game.homeTeam} <span class="vs-separator">vs</span> ${game.awayTeam}</div>
                  </div>
                  <div class="game-time">${new Date(game.matchTime).toLocaleDateString([], { month: "short", day: "numeric" })} ${new Date(game.matchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                
                <!-- Odds - Vertical Layout -->
                <div class="betting-options">
                  <!-- H2H Odds -->
                  <div class="betting-option-vertical ${!game.homeOdds ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">1</div>
                    <div class="betting-option-value-vertical ${game.homeOdds ? "clickable" : ""}">${game.homeOdds || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.drawOdds ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">X</div>
                    <div class="betting-option-value-vertical ${game.drawOdds ? "clickable" : ""}">${game.drawOdds || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.awayOdds ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">2</div>
                    <div class="betting-option-value-vertical ${game.awayOdds ? "clickable" : ""}">${game.awayOdds || "-"}</div>
                  </div>
                  
                  <!-- DC -->
                  <div class="betting-option-vertical ${!game.doubleChance?.homeOrDraw ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">1X</div>
                    <div class="betting-option-value-vertical ${game.doubleChance?.homeOrDraw ? "clickable" : ""}">${game.doubleChance?.homeOrDraw || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.doubleChance?.drawOrAway ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">X2</div>
                    <div class="betting-option-value-vertical ${game.doubleChance?.drawOrAway ? "clickable" : ""}">${game.doubleChance?.drawOrAway || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.doubleChance?.homeOrAway ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">12</div>
                    <div class="betting-option-value-vertical ${game.doubleChance?.homeOrAway ? "clickable" : ""}">${game.doubleChance?.homeOrAway || "-"}</div>
                  </div>
                  
                  <!-- Totals -->
                  ${
                    game.totals && game.totals.length > 0
                      ? game.totals
                          .slice(0, 1)
                          .map(
                            (total) => `
                    <div class="betting-option-vertical ${!total.over ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">O${total.point}</div>
                      <div class="betting-option-value-vertical ${total.over ? "clickable" : ""}">${total.over || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!total.under ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">U${total.point}</div>
                      <div class="betting-option-value-vertical ${total.under ? "clickable" : ""}">${total.under || "-"}</div>
                    </div>
                  `
                          )
                          .join("")
                      : ""
                  }
                  
                  <!-- BTTS -->
                  ${
                    game.bothTeamsToScore?.yes || game.bothTeamsToScore?.no
                      ? `
                    <div class="betting-option-vertical ${!game.bothTeamsToScore?.yes ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">GG</div>
                      <div class="betting-option-value-vertical ${game.bothTeamsToScore?.yes ? "clickable" : ""}">${game.bothTeamsToScore?.yes || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!game.bothTeamsToScore?.no ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">NG</div>
                      <div class="betting-option-value-vertical ${game.bothTeamsToScore?.no ? "clickable" : ""}">${game.bothTeamsToScore?.no || "-"}</div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `;
              })
              .join("")}
          </div>
          
          <div class="print-footer">
            <p>Generated by Betzone on ${new Date().toLocaleString()}</p>
            <p>Total Games: ${games.length}</p>
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

  // Update last updated timestamp when games change
  useEffect(() => {
    if (games.length > 0) {
      setLastUpdated(new Date());
    }
  }, [games]);

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

    const potentialWinnings = betAmount * Number(odds);

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

  const getLeagueIcon = (leagueKey: string) => {
    if (
      leagueKey.includes("uefa") ||
      leagueKey.includes("champions") ||
      leagueKey.includes("world_cup")
    ) {
      return <TrophyIcon />;
    }
    return <SoccerIcon />;
  };

  const getLeagueDisplayName = (leagueKey: string) => {
    const league = supportedLeagues?.find((l) => l.key === leagueKey);
    return league
      ? league.name
      : leagueKey.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
    // Use original odds without reduction
    const reducedOdds = odds;
    // If agent mode and no user selected, show user selector
    if (isAgentMode && !selectedUser) {
      setShowUserSelector(true);
      return;
    }

    // Regular user flow - add to bet slip
    const betSlipItem = {
      id: `${game.id}-${betType}-${selection}`,
      gameId: game.externalId || game.id, // Use externalId for validation API
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      betType,
      selection,
      odds: reducedOdds,
      stake: 0, // No default stake - user must input
      potentialWinnings: 0,
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

    // Use original odds without reduction
    const reducedOdds = odds;

    try {
      const bet = await AgentService.placeBetForUser({
        userId: selectedUser.id,
        betType: "single",
        stake: stake,
        selections: [
          {
            gameId: game.externalId || game.id, // Use externalId for validation API
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

  if (isLoading) {
    return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          minHeight: "100vh",
        }}
      >
        <Header
          onNavigate={onNavigate}
          currentPage="games"
          selectedUser={selectedUser}
          isAgentMode={isAgentMode}
        />
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box position="relative" zIndex={1}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <SoccerIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ⚽ Games & Odds
                    </Typography>
                    {/* <Typography
                      variant="h6"
                      sx={{ opacity: 0.9, fontWeight: 300 }}
                    >
                      Live betting odds and game information
                    </Typography> */}
                  </Box>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={() => onNavigate("home")}
                    sx={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Back to Home
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintGames}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    Print Games
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<TestIcon />}
                    onClick={async () => {
                      try {
                        const { testBixolonPrinter, testPrint } = await import(
                          "../../services/printService"
                        );
                        testBixolonPrinter();
                        testPrint(settingsService.getPrinterLogicalName());
                      } catch (error) {
                        console.error("Error importing print service:", error);
                        alert(
                          "Error: Unable to load print service. Please try again."
                        );
                      }
                    }}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    Test Printer
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>

          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Stack alignItems="center" spacing={3}>
              <CircularProgress size={60} sx={{ color: "primary.main" }} />
              <Typography variant="h5" color="text.secondary">
                Loading games...
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        minHeight: "100vh",
      }}
    >
      <Header
        onNavigate={onNavigate}
        currentPage="games"
        selectedUser={selectedUser}
        isAgentMode={isAgentMode}
      />

      <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
        {/* Header Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <Box position="relative" zIndex={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <SoccerIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    ⚽ Games & Odds
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ opacity: 0.9, fontWeight: 300 }}
                  >
                    Live betting odds and game information
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => onNavigate("home")}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Back to Home
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintGames}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Print Games
                </Button>
                <Button
                  variant="contained"
                  startIcon={<TestIcon />}
                  onClick={async () => {
                    try {
                      const { testBixolonPrinter, testPrint } = await import(
                        "../../services/printService"
                      );
                      testBixolonPrinter();
                      testPrint(settingsService.getPrinterLogicalName());
                    } catch (error) {
                      console.error("Error importing print service:", error);
                      alert(
                        "Error: Unable to load print service. Please try again."
                      );
                    }
                  }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Test Printer
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {/* Main Content with Left Panel and Games */}
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Left Panel - League Selector and Controls */}
          <Paper
            sx={{
              p: 3,
              width: 300,
              height: "fit-content",
              position: "sticky",
              top: 20,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={3}
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Controls
            </Typography>

            <Stack spacing={2} mb={4}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleManualRefresh}
                color="success"
                fullWidth
                sx={{
                  fontWeight: 600,
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Refresh Odds
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => {
                  setShowSearchPanel(!showSearchPanel);
                  if (showSearchPanel) {
                    // Clear search results when closing panel
                    setHasSearchResults(false);
                  }
                }}
                color="primary"
                fullWidth
                sx={{
                  fontWeight: 600,
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {showSearchPanel ? "Hide Search" : "Search Games"}
              </Button>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
                textAlign="center"
              >
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Stack>

            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              mb={2}
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              League Selection
            </Typography>

            <Stack spacing={2} mb={3}>
              {leaguesLoading ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <CircularProgress
                    size={24}
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      mt: 1,
                      display: "block",
                    }}
                  >
                    Loading leagues...
                  </Typography>
                </Box>
              ) : leaguesError ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="caption" sx={{ color: "error.main" }}>
                    Failed to load leagues
                  </Typography>
                </Box>
              ) : (
                supportedLeagues?.map((league) => (
                  <Chip
                    key={league.key}
                    icon={getLeagueIcon(league.key)}
                    label={league.displayName}
                    onClick={() => setLeagueKey(league.key)}
                    color={leagueKey === league.key ? "primary" : "default"}
                    variant={leagueKey === league.key ? "filled" : "outlined"}
                    sx={{
                      fontWeight: 600,
                      width: "100%",
                      justifyContent: "flex-start",
                      backgroundColor:
                        leagueKey === league.key
                          ? "#667eea"
                          : "rgba(255,255,255,0.1)",
                      color:
                        leagueKey === league.key
                          ? "white"
                          : "rgba(255,255,255,0.8)",
                      borderColor: "rgba(255,255,255,0.2)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        backgroundColor:
                          leagueKey === league.key
                            ? "#5a6fd8"
                            : "rgba(255,255,255,0.2)",
                      },
                    }}
                  />
                ))
              )}
            </Stack>

            {/* Agent Mode Indicator */}
            {isAgentMode && (
              <Box>
                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Agent Mode
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    background:
                      "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                    border: "1px solid #90CAF9",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        Agent Mode Active
                      </Typography>
                    </Stack>
                    {selectedUser && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Placing bet for:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedUser.phone_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${selectedUser.balance.toFixed(2)}{" "}
                          {selectedUser.currency}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => setShowUserSelector(true)}
                          sx={{ mt: 1 }}
                        >
                          Change User
                        </Button>
                      </Box>
                    )}
                    {!selectedUser && (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => setShowUserSelector(true)}
                      >
                        Select User
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Right Panel - Games */}
          <Box sx={{ flex: 1 }}>
            {/* Search Panel */}
            <Collapse in={showSearchPanel}>
              <Box sx={{ mb: 3 }}>
                <GameSearch
                  onGameSelect={setSelectedGame}
                  onAddToBetSlip={handleAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  onSearchResultsChange={setHasSearchResults}
                  leagueGames={games}
                  leagueKey={leagueKey}
                />
              </Box>
            </Collapse>

            {/* Error Message */}
            {isError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => mutate()}>
                    Retry
                  </Button>
                }
                sx={{ mb: 3 }}
              >
                {error?.message || "Failed to load games"}
              </Alert>
            )}

            {/* Auto-refresh notification */}
            <Snackbar
              open={showRefreshNotification}
              autoHideDuration={3000}
              onClose={() => setShowRefreshNotification(false)}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                severity="success"
                icon={<RefreshIcon />}
                onClose={() => setShowRefreshNotification(false)}
              >
                Odds automatically refreshed at{" "}
                {new Date().toLocaleTimeString()}
              </Alert>
            </Snackbar>

            {/* Games Grid - Hidden when search results are displayed */}
            {!hasSearchResults && (
              <Box>
                {isEmpty &&
                (leagueKey === "soccer_uefa_world_cup_qualifiers" ||
                  leagueKey === "soccer_bundesliga" ||
                  leagueKey === "soccer_laliga") ? (
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                      border: "1px solid #90CAF9",
                      mb: 3,
                    }}
                  >
                    <TrophyIcon
                      sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="primary.main"
                      gutterBottom
                    >
                      {getLeagueDisplayName(leagueKey)}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      No games available at the moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      The {getLeagueDisplayName(leagueKey)} endpoint is not yet
                      implemented on the backend.
                      <br />
                      Expected endpoint: <code>/api/{leagueKey}/odds</code>
                    </Typography>
                  </Paper>
                ) : isEmpty ? (
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                      border: "1px solid #CE93D8",
                      mb: 3,
                    }}
                  >
                    <SoccerIcon
                      sx={{ fontSize: 64, color: "secondary.main", mb: 2 }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="secondary.main"
                      gutterBottom
                    >
                      No Games Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please try refreshing or check back later
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {games
                      .filter(
                        (game) =>
                          game && game.id && game.homeTeam && game.awayTeam
                      )
                      .map((game) => {
                        const gameNumber = game.team_index?.fullIndex || 0;

                        return (
                          <GameCard
                            key={game.id}
                            game={game}
                            isSelected={selectedGame?.id === game.id}
                            onSelect={setSelectedGame}
                            onAddToBetSlip={handleAddToBetSlip}
                            isSelectionInBetSlip={isSelectionInBetSlip}
                            expandedGames={expandedGames}
                            onToggleExpanded={toggleExpanded}
                            gameNumber={gameNumber}
                          />
                        );
                      })}
                  </Stack>
                )}
              </Box>
            )}

            {/* User Selector Modal */}
            <Dialog
              open={showUserSelector}
              onClose={() => setShowUserSelector(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                },
              }}
            >
              <DialogTitle
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <PersonIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Select User to Place Bet For
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setShowUserSelector(false)}
                  sx={{ color: "white" }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {managedUsers
                    .filter((user) => user.isActive)
                    .map((user) => (
                      <ListItem
                        key={user.id}
                        component="div"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserSelector(false);
                        }}
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {user.phone_number.charAt(1).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="bold">
                              {user.phone_number}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {user.country_code} • {user.currency}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Balance: ${user.balance.toFixed(2)}{" "}
                                {user.currency}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: user.isActive
                                ? "success.main"
                                : "error.main",
                            }}
                          />
                        </Box>
                      </ListItem>
                    ))}
                </List>
              </DialogContent>

              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={() => setShowUserSelector(false)}
                  variant="outlined"
                  startIcon={<CloseIcon />}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
