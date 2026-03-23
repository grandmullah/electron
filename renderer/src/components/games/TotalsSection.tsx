import React, { useMemo } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Game } from "../../services/gamesService";
import { BettingOption } from "./BettingOption";

interface TotalsSectionProps {
  game: Game;
  totals?: Array<{
    point: number;
    over: number | string | null;
    under: number | string | null;
  }>;
  /** When set, show only this line (e.g. 2.5 for collapsed O/U 2.5 only) */
  onlyPoint?: number;
  period?: "full-time" | "first-half" | "second-half";
  onAddToBetSlip: (
    game: Game,
    betType: string,
    selection: string,
    odds: number,
    marketKey?: string
  ) => void;
  isSelectionInBetSlip: (
    gameId: string,
    betType: string,
    selection: string
  ) => boolean;
  variant?: "mobile" | "desktop";
}

const TotalsSectionComponent: React.FC<TotalsSectionProps> = ({
  game,
  totals,
  onlyPoint,
  period = "full-time",
  onAddToBetSlip,
  isSelectionInBetSlip,
  variant = "desktop",
}) => {
  if (!totals || totals.length === 0) return null;

  const sortedFilteredTotals = useMemo(() => {
    let workingTotals = totals;
    if (onlyPoint != null) {
      workingTotals = totals.filter((t) => Math.abs(t.point - onlyPoint) < 0.01);
    }
    if (!workingTotals.length) return [];

    const pointSet = new Set(workingTotals.map((t) => t.point.toFixed(3)));
    const hasValue = (value: number) => pointSet.has(value.toFixed(3));

    const filtered = workingTotals.filter((total) => {
      const point = total.point;
      const decimal = point % 1;
      const isWholeNumber = Math.abs(decimal) < 0.001 || Math.abs(decimal - 1) < 0.001;
      if (isWholeNumber) return !hasValue(Math.floor(point) + 0.5);
      if (Math.abs(decimal - 0.25) < 0.001) return !hasValue(Math.floor(point) + 0.5);
      if (Math.abs(decimal - 0.75) < 0.001) return !hasValue(Math.floor(point) + 0.5);
      return true;
    });

    return [...filtered].sort((a, b) => a.point - b.point);
  }, [totals, onlyPoint]);

  if (sortedFilteredTotals.length === 0) return null;

  const getBetType = () => {
    switch (period) {
      case "full-time":
        return "Over/Under";
      case "first-half":
        return "1st Half Over/Under";
      case "second-half":
        return "2nd Half Over/Under";
      default:
        return "Over/Under";
    }
  };

  const getTitle = () => {
    if (onlyPoint != null) return `Over/Under ${onlyPoint}`;
    switch (period) {
      case "full-time":
        return "TOTALS";
      case "first-half":
        return "1ST HALF - TOTALS";
      case "second-half":
        return "2ND HALF - TOTALS";
      default:
        return "TOTALS";
    }
  };

  const betType = getBetType();

  if (variant === "mobile") {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            fontWeight: "bold",
            color: "rgba(255, 255, 255, 0.9)",
            textTransform: "uppercase",
            display: "block",
            mb: 1.5,
          }}
        >
          {getTitle()}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
          {sortedFilteredTotals.map((total) => (
              <Box
                key={total.point}
                sx={{
                  textAlign: "center",
                  py: 1.5,
                  px: 1,
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 1,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  minWidth: "80px",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    color: "rgba(255, 255, 255, 0.7)",
                    display: "block",
                    mb: 0.5,
                    fontWeight: 600,
                  }}
                >
                  O/U {total.point}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.6rem", sm: "0.65rem" },
                    color: "rgba(255, 255, 255, 0.55)",
                    display: "block",
                    mb: 0.35,
                    fontWeight: 600,
                  }}
                >
                  OVER
                </Typography>
                <BettingOption
                  game={game}
                  betType={`${betType} ${total.point}`}
                  selection={`Over ${total.point}`}
                  odds={total.over}
                  label="Over"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    color: "rgba(255, 255, 255, 0.7)",
                    display: "block",
                    mb: 0.5,
                    mt: 1,
                    fontWeight: 600,
                  }}
                >
                  UNDER
                </Typography>
                <BettingOption
                  game={game}
                  betType={`${betType} ${total.point}`}
                  selection={`Under ${total.point}`}
                  odds={total.under}
                  label="Under"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                />
              </Box>
            ))}
        </Stack>
      </Box>
    );
  }

  // Desktop variant
  return (
    <Box
      textAlign="center"
      sx={{
        flex: "1 1 0",
        minWidth: 0,
        px: 0.5,
      }}
    >
      <Typography
        variant="caption"
        fontWeight="bold"
        color="rgba(255,255,255,0.8)"
        gutterBottom
        display="block"
        mb={0.5}
        sx={{
          fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
        }}
      >
        {getTitle()}
      </Typography>

      {/* Totals layout: 3 points per row */}
      <Box sx={{ overflow: "hidden" }}>
        {/* Create rows of 3 totals each */}
        {Array.from(
          { length: Math.ceil(sortedFilteredTotals.length / 3) },
          (_, rowIndex) => (
            <Stack
              key={rowIndex}
              direction="row"
              spacing={{ xs: 0.4, sm: 0.5, md: 0.6 }}
              justifyContent="space-between"
              mb={
                rowIndex < Math.ceil(sortedFilteredTotals.length / 3) - 1 ? 0.5 : 0
              }
              sx={{ overflow: "hidden", width: "100%" }}
            >
              {sortedFilteredTotals
                .slice(rowIndex * 3, (rowIndex + 1) * 3)
                .map((total, index) => (
                  <Box
                    key={rowIndex * 3 + index}
                    textAlign="center"
                    sx={{
                      flex: "1 1 0",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="rgba(255,255,255,0.6)"
                      display="block"
                      mb={0.1}
                      sx={{
                        fontSize: {
                          xs: "0.45rem",
                          sm: "0.5rem",
                          md: "0.55rem",
                        },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      O/U {total.point}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={{ xs: 0.5, sm: 0.6, md: 0.7 }}
                      justifyContent="center"
                    >
                      <Box
                        textAlign="center"
                        sx={{
                          flex: "1 1 0",
                          minWidth: {
                            xs: "24px",
                            sm: "28px",
                            md: "32px",
                          },
                          maxWidth: {
                            xs: "35px",
                            sm: "40px",
                            md: "45px",
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.4)"
                          display="block"
                          mb={0.05}
                          sx={{
                            fontSize: {
                              xs: "0.35rem",
                              sm: "0.4rem",
                              md: "0.45rem",
                            },
                          }}
                        >
                          O
                        </Typography>
                        <BettingOption
                          game={game}
                          betType={`${betType} ${total.point}`}
                          selection={`Over ${total.point}`}
                          odds={total.over}
                          label="Over"
                          onAddToBetSlip={onAddToBetSlip}
                          isSelectionInBetSlip={isSelectionInBetSlip}
                        />
                      </Box>
                      <Box
                        textAlign="center"
                        sx={{
                          flex: "1 1 0",
                          minWidth: {
                            xs: "24px",
                            sm: "28px",
                            md: "32px",
                          },
                          maxWidth: {
                            xs: "35px",
                            sm: "40px",
                            md: "45px",
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.4)"
                          display="block"
                          mb={0.05}
                          sx={{
                            fontSize: {
                              xs: "0.35rem",
                              sm: "0.4rem",
                              md: "0.45rem",
                            },
                          }}
                        >
                          U
                        </Typography>
                        <BettingOption
                          game={game}
                          betType={`${betType} ${total.point}`}
                          selection={`Under ${total.point}`}
                          odds={total.under}
                          label="Under"
                          onAddToBetSlip={onAddToBetSlip}
                          isSelectionInBetSlip={isSelectionInBetSlip}
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
            </Stack>
          )
        )}
      </Box>
    </Box>
  );
};




export const TotalsSection = React.memo(TotalsSectionComponent);
