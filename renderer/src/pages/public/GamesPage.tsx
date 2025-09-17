import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToBetSlip, BetSlipItem } from "../../store/betslipSlice";
import { ManagedUser } from "../../store/agentSlice";
import AgentService from "../../services/agentService";
import GamesService, { Game } from "../../services/gamesService";
// Dynamic import for printService to enable code splitting
import settingsService from "../../services/settingsService";
import { useOdds, useRefreshOdds } from "../../hooks/useOdds";
import { GameCard } from "../../components/games/GameCard";
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
  const [leagueKey, setLeagueKey] = useState<string>("soccer_epl");

  // Use SWR for odds fetching
  const { games, isLoading, error, mutate, isError, isEmpty } =
    useOdds(leagueKey);
  const { refresh } = useRefreshOdds();

  // Agent-specific state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);

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
            
            .game-header {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e9ecef;
            }
            
            .game-teams {
              font-size: 18px;
              font-weight: 700;
              color: #2c3e50;
              text-align: center;
            }
            
            .game-time {
              font-size: 14px;
              color: #6c757d;
              text-align: center;
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
            
            .team-names {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
              text-align: center;
              margin-bottom: 8px;
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
            <p class="subtitle">${
              leagueKey === "soccer_uefa_world_cup_qualifiers"
                ? "UEFA World Cup Qualifiers"
                : leagueKey === "soccer_bundesliga"
                  ? "Bundesliga"
                  : leagueKey === "soccer_laliga"
                    ? "La Liga"
                    : "Premier League"
            } - ${new Date().toLocaleDateString()}</p>
            <p class="timestamp">Last Updated: ${lastUpdated.toLocaleString()}</p>
          </div>
          
          <div class="games-grid">
            ${games
              .map(
                (game) => `
              <div class="game-card">
                <div class="game-header">
                  <div class="game-teams">${game.homeTeam} vs ${game.awayTeam}</div>
                  <div class="game-time">${new Date(game.matchTime).toLocaleDateString()} - ${new Date(game.matchTime).toLocaleTimeString()}</div>
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
                        ${game.homeOdds || "-"}
                      </div>
                      <div class="betting-option-value ${game.drawOdds ? "clickable" : ""}">
                        ${game.drawOdds || "-"}
                      </div>
                      <div class="betting-option-value ${game.awayOdds ? "clickable" : ""}">
                        ${game.awayOdds || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Double Chance Column -->
                  <div class="betting-option-column ${game.doubleChance?.homeOrDraw || game.doubleChance?.drawOrAway || game.doubleChance?.homeOrAway ? "" : "disabled"}">
                    <div class="betting-option-label">Double Chance</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">1 or X</div>
                      <div class="betting-option-sub-label">X or 2</div>
                      <div class="betting-option-sub-label">1 or 2</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.doubleChance?.homeOrDraw ? "clickable" : ""}">
                        ${game.doubleChance?.homeOrDraw || "-"}
                      </div>
                      <div class="betting-option-value ${game.doubleChance?.drawOrAway ? "clickable" : ""}">
                        ${game.doubleChance?.drawOrAway || "-"}
                      </div>
                      <div class="betting-option-value ${game.doubleChance?.homeOrAway ? "clickable" : ""}">
                        ${game.doubleChance?.homeOrAway || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Over/Under Column -->
                  <div class="betting-option-column ${game.overUnder?.over25 || game.overUnder?.under25 ? "" : "disabled"}">
                    <div class="betting-option-label">Over/Under 2.5</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">Over</div>
                      <div class="betting-option-sub-label">Under</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.overUnder?.over25 ? "clickable" : ""}">
                        ${game.overUnder?.over25 || "-"}
                      </div>
                      <div class="betting-option-value ${game.overUnder?.under25 ? "clickable" : ""}">
                        ${game.overUnder?.under25 || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Both Teams to Score Column -->
                  <div class="betting-option-column ${game.bothTeamsToScore?.yes || game.bothTeamsToScore?.no ? "" : "disabled"}">
                    <div class="betting-option-label">Both Teams To Score</div>
                    <div class="betting-option-sub-labels">
                      <div class="betting-option-sub-label">Yes</div>
                      <div class="betting-option-sub-label">No</div>
                    </div>
                    <div class="betting-option-values">
                      <div class="betting-option-value ${game.bothTeamsToScore?.yes ? "clickable" : ""}">
                        ${game.bothTeamsToScore?.yes || "-"}
                      </div>
                      <div class="betting-option-value ${game.bothTeamsToScore?.no ? "clickable" : ""}">
                        ${game.bothTeamsToScore?.no || "-"}
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

    // Use original odds without reduction
    const reducedOdds = odds;

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

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: "#0e1220", minHeight: "100vh" }}>
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    <Box sx={{ bgcolor: "#0e1220", minHeight: "100vh" }}>
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
            background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            border: "1px solid #2a2d3a",
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
              background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
              border: "1px solid #2a2d3a",
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
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
              <Chip
                icon={<SoccerIcon />}
                label="EPL"
                onClick={() => setLeagueKey("soccer_epl")}
                color={leagueKey === "soccer_epl" ? "primary" : "default"}
                variant={leagueKey === "soccer_epl" ? "filled" : "outlined"}
                sx={{
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  backgroundColor:
                    leagueKey === "soccer_epl"
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    leagueKey === "soccer_epl"
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor:
                      leagueKey === "soccer_epl"
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
              <Chip
                icon={<TrophyIcon />}
                label="UEFA Champions League"
                onClick={() => setLeagueKey("soccer_uefa_champions_league")}
                color={
                  leagueKey === "soccer_uefa_champions_league"
                    ? "primary"
                    : "default"
                }
                variant={
                  leagueKey === "soccer_uefa_champions_league"
                    ? "filled"
                    : "outlined"
                }
                sx={{
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  backgroundColor:
                    leagueKey === "soccer_uefa_champions_league"
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    leagueKey === "soccer_uefa_champions_league"
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor:
                      leagueKey === "soccer_uefa_champions_league"
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
              <Chip
                icon={<SoccerIcon />}
                label="Bundesliga"
                onClick={() => setLeagueKey("soccer_bundesliga")}
                color={
                  leagueKey === "soccer_bundesliga" ? "primary" : "default"
                }
                variant={
                  leagueKey === "soccer_bundesliga" ? "filled" : "outlined"
                }
                sx={{
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  backgroundColor:
                    leagueKey === "soccer_bundesliga"
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    leagueKey === "soccer_bundesliga"
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor:
                      leagueKey === "soccer_bundesliga"
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
              <Chip
                icon={<SoccerIcon />}
                label="La Liga"
                onClick={() => setLeagueKey("soccer_laliga")}
                color={leagueKey === "soccer_laliga" ? "primary" : "default"}
                variant={leagueKey === "soccer_laliga" ? "filled" : "outlined"}
                sx={{
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  backgroundColor:
                    leagueKey === "soccer_laliga"
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    leagueKey === "soccer_laliga"
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor:
                      leagueKey === "soccer_laliga"
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
              <Chip
                icon={<SoccerIcon />}
                label="Serie A"
                onClick={() => setLeagueKey("soccer_serie_a")}
                color={leagueKey === "soccer_serie_a" ? "primary" : "default"}
                variant={leagueKey === "soccer_serie_a" ? "filled" : "outlined"}
                sx={{
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  backgroundColor:
                    leagueKey === "soccer_serie_a"
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    leagueKey === "soccer_serie_a"
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor:
                      leagueKey === "soccer_serie_a"
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
              <Chip
                icon={<TrophyIcon />}
                label="UEFA WCQ"
                onClick={() => setLeagueKey("soccer_uefa_world_cup_qualifiers")}
                color={
                  leagueKey === "soccer_uefa_world_cup_qualifiers"
                    ? "primary"
                    : "default"
                }
                variant={
                  leagueKey === "soccer_uefa_world_cup_qualifiers"
                    ? "filled"
                    : "outlined"
                }
                sx={{
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  backgroundColor:
                    leagueKey === "soccer_uefa_world_cup_qualifiers"
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    leagueKey === "soccer_uefa_world_cup_qualifiers"
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor:
                      leagueKey === "soccer_uefa_world_cup_qualifiers"
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
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

            {/* Games Grid */}
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
                    {leagueKey === "soccer_uefa_world_cup_qualifiers"
                      ? "UEFA World Cup Qualifiers"
                      : leagueKey === "soccer_bundesliga"
                        ? "Bundesliga"
                        : "La Liga"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No games available at the moment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The{" "}
                    {leagueKey === "soccer_uefa_world_cup_qualifiers"
                      ? "UEFA World Cup Qualifiers"
                      : leagueKey === "soccer_bundesliga"
                        ? "Bundesliga"
                        : "La Liga"}{" "}
                    endpoint is not yet implemented on the backend.
                    <br />
                    Expected endpoint:{" "}
                    <code>
                      /api/
                      {leagueKey === "soccer_uefa_world_cup_qualifiers"
                        ? "uefa-world-cup-qualifiers"
                        : leagueKey === "soccer_bundesliga"
                          ? "bundesliga"
                          : "laliga"}
                      /odds
                    </code>
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
                    .map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        isSelected={selectedGame?.id === game.id}
                        onSelect={setSelectedGame}
                        onAddToBetSlip={handleAddToBetSlip}
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        expandedGames={expandedGames}
                        onToggleExpanded={toggleExpanded}
                      />
                    ))}
                </Stack>
              )}
            </Box>

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
