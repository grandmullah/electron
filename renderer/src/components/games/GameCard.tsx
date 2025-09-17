import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Game } from "../../services/gamesService";

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  onSelect: (game: Game) => void;
  onAddToBetSlip: (
    game: Game,
    betType: string,
    selection: string,
    odds: number
  ) => void;
  isSelectionInBetSlip: (
    gameId: string,
    betType: string,
    selection: string
  ) => boolean;
  expandedGames: Set<string>;
  onToggleExpanded: (gameId: string, event: React.MouseEvent) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected,
  onSelect,
  onAddToBetSlip,
  isSelectionInBetSlip,
  expandedGames,
  onToggleExpanded,
}) => {
  const BettingOption = ({
    betType,
    selection,
    odds,
    label,
  }: {
    betType: string;
    selection: string;
    odds: number | null | undefined;
    label: string;
  }) => {
    const isClickable = !!odds;
    const isSelected = isSelectionInBetSlip(game.id, betType, selection);
    const reducedOdds = odds;

    return (
      <Button
        variant={isSelected ? "contained" : "outlined"}
        size="small"
        disabled={!isClickable}
        onClick={() =>
          isClickable && onAddToBetSlip(game, betType, selection, odds!)
        }
        sx={{
          minWidth: 50,
          height: 32,
          fontSize: "0.75rem",
          fontWeight: 600,
          color: isSelected ? "white" : "white",
          borderColor: isClickable ? "primary.main" : "rgba(255,255,255,0.3)",
          bgcolor: isSelected ? "primary.main" : "rgba(255,255,255,0.1)",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            bgcolor: isClickable ? "primary.main" : "rgba(255,255,255,0.1)",
          },
          "&.Mui-disabled": {
            color: "rgba(255,255,255,0.3)",
            borderColor: "rgba(255,255,255,0.1)",
            bgcolor: "rgba(255,255,255,0.05)",
          },
        }}
      >
        {reducedOdds?.toFixed(2) || "-"}
      </Button>
    );
  };

  return (
    <Card
      sx={{
        mb: 2,
        mx: "25%", // 25% margin on left and right
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        color: "white",
      }}
      onClick={() => onSelect(game)}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Game Header and Odds in One Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          {/* Home Team */}
          <Box textAlign="center" flex={1}>
            <Typography variant="h6" fontWeight="bold" color="white">
              {game.homeTeam}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.6)">
              {new Date(game.matchTime).toLocaleDateString()}
            </Typography>
          </Box>

          {/* VS Divider */}
          <Box
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Typography variant="body2" fontWeight="bold" color="white">
              VS
            </Typography>
          </Box>

          {/* Away Team */}
          <Box textAlign="center" flex={1}>
            <Typography variant="h6" fontWeight="bold" color="white">
              {game.awayTeam}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.6)">
              {new Date(game.matchTime).toLocaleTimeString()}
            </Typography>
          </Box>

          {/* No Odds Available Indicator */}
          {!game.hasValidOdds && (
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                mb: 2,
                bgcolor: "rgba(255,193,7,0.1)",
                border: "1px solid rgba(255,193,7,0.3)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body2"
                color="warning.main"
                fontWeight="bold"
              >
                ⚠️ Odds Not Available
              </Typography>
              <Typography variant="caption" color="rgba(255,193,7,0.8)">
                This game is scheduled but betting odds are not yet available
              </Typography>
            </Box>
          )}

          {/* 3 Way Odds */}
          <Box textAlign="center" minWidth={120}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="rgba(255,255,255,0.8)"
              gutterBottom
              display="block"
            >
              3 WAY
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  1
                </Typography>
                <BettingOption
                  betType="3 Way"
                  selection="Home"
                  odds={game.homeOdds}
                  label="1"
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  X
                </Typography>
                <BettingOption
                  betType="3 Way"
                  selection="Draw"
                  odds={game.drawOdds}
                  label="X"
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  2
                </Typography>
                <BettingOption
                  betType="3 Way"
                  selection="Away"
                  odds={game.awayOdds}
                  label="2"
                />
              </Box>
            </Stack>
          </Box>

          {/* Double Chance Odds */}
          <Box textAlign="center" minWidth={120}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="rgba(255,255,255,0.8)"
              gutterBottom
              display="block"
            >
              DOUBLE CHANCE
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  1X
                </Typography>
                <BettingOption
                  betType="Double Chance"
                  selection="1 or X"
                  odds={game.doubleChance?.homeOrDraw}
                  label="1X"
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  X2
                </Typography>
                <BettingOption
                  betType="Double Chance"
                  selection="X or 2"
                  odds={game.doubleChance?.drawOrAway}
                  label="X2"
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  12
                </Typography>
                <BettingOption
                  betType="Double Chance"
                  selection="1 or 2"
                  odds={game.doubleChance?.homeOrAway}
                  label="12"
                />
              </Box>
            </Stack>
          </Box>

          {/* Over/Under Odds */}
          <Box textAlign="center" minWidth={100}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="rgba(255,255,255,0.8)"
              gutterBottom
              display="block"
            >
              O/U 2.5
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  Over
                </Typography>
                <BettingOption
                  betType="Over/Under 2.5"
                  selection="Over"
                  odds={game.overUnder?.over25}
                  label="Over"
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  Under
                </Typography>
                <BettingOption
                  betType="Over/Under 2.5"
                  selection="Under"
                  odds={game.overUnder?.under25}
                  label="Under"
                />
              </Box>
            </Stack>
          </Box>

          {/* Both Teams to Score Odds */}
          <Box textAlign="center" minWidth={100}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="rgba(255,255,255,0.8)"
              gutterBottom
              display="block"
            >
              BTTS
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  Yes
                </Typography>
                <BettingOption
                  betType="Both Teams To Score"
                  selection="Yes"
                  odds={game.bothTeamsToScore?.yes}
                  label="Yes"
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.6)"
                  display="block"
                  mb={0.5}
                >
                  No
                </Typography>
                <BettingOption
                  betType="Both Teams To Score"
                  selection="No"
                  odds={game.bothTeamsToScore?.no}
                  label="No"
                />
              </Box>
            </Stack>
          </Box>

          {/* Spreads Odds */}
          {(game.spreads?.homeSpreadOdds || game.spreads?.awaySpreadOdds) && (
            <Box textAlign="center" minWidth={100}>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="rgba(255,255,255,0.8)"
                gutterBottom
                display="block"
              >
                {game.spreads?.spreadLine
                  ? `SPREAD ${game.spreads?.spreadLine > 0 ? `+${game.spreads?.spreadLine}` : game.spreads?.spreadLine}`
                  : "SPREAD"}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    Home
                  </Typography>
                  <BettingOption
                    betType="Spread"
                    selection="Home"
                    odds={game.spreads?.homeSpreadOdds}
                    label="Home"
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    Away
                  </Typography>
                  <BettingOption
                    betType="Spread"
                    selection="Away"
                    odds={game.spreads?.awaySpreadOdds}
                    label="Away"
                  />
                </Box>
              </Stack>
            </Box>
          )}

          {/* Expand Arrow */}
          <Box textAlign="center" mt={2}>
            <IconButton
              onClick={(e) => onToggleExpanded(game.id, e)}
              sx={{
                transform: expandedGames.has(game.id)
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
