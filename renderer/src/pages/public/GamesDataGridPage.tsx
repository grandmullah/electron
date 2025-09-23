import React from "react";
import { Container, Typography, Box, Paper, Tabs, Tab } from "@mui/material";
import { GameDataGrid } from "../../components/games/GameDataGrid";
import { GameDataGridCompact } from "../../components/games/GameDataGridCompact";
import { Game } from "../../types/game";
import { useGamesData } from "../../hooks/useDashboardData";
import { useBetSlip } from "../../store/hooks";

export const GamesDataGridPage: React.FC = () => {
  const { data: games, isLoading, error } = useGamesData();
  const { addToBetSlip, isSelectionInBetSlip } = useBetSlip();
  const [tabValue, setTabValue] = React.useState(0);

  const handleAddToBetSlip = (
    game: Game,
    betType: string,
    selection: string,
    odds: number
  ) => {
    addToBetSlip({
      id: `${game.id}_${betType}_${selection}`,
      gameId: game.id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      betType,
      selection,
      odds,
      stake: 0,
      potentialWinnings: 0,
      bookmaker: "default",
      gameTime: `${game.date} ${game.time}`,
      sportKey: "soccer",
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading games...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error">
          Error loading games: {error.message}
        </Typography>
      </Container>
    );
  }

  if (!games || games.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>No games available</Typography>
      </Container>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Games - DataGrid View
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Each game is displayed as its own structured table with all betting
        options
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Simple Format" />
          <Tab label="Compact Format" />
        </Tabs>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {games.map((game) => (
          <Paper key={game.id} elevation={2} sx={{ p: 2 }}>
            {tabValue === 0 ? (
              <GameDataGrid
                game={game}
                onAddToBetSlip={handleAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            ) : (
              <GameDataGridCompact
                game={game}
                onAddToBetSlip={handleAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            )}
          </Paper>
        ))}
      </Box>
    </Container>
  );
};
