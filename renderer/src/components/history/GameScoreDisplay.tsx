import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { GameScore } from "../../types/history";

type GameScoreDisplayVariant = "compact" | "detailed";

interface GameScoreDisplayProps {
  score?: GameScore;
  variant?: GameScoreDisplayVariant;
  size?: "small" | "medium";
}

const formatDateTime = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("MMM D, YYYY HH:mm") : value;
};

const getChipStyles = (status?: string) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "finished":
    case "ft":
      return {
        background: "rgba(76, 175, 80, 0.2)",
        color: "#4caf50",
        border: "1px solid rgba(76, 175, 80, 0.3)",
      };
    case "live":
      return {
        background: "rgba(255, 193, 7, 0.18)",
        color: "#ffb300",
        border: "1px solid rgba(255, 193, 7, 0.35)",
      };
    case "scheduled":
    case "upcoming":
      return {
        background: "rgba(33, 150, 243, 0.18)",
        color: "#2196f3",
        border: "1px solid rgba(33, 150, 243, 0.35)",
      };
    default:
      return {
        background: "rgba(255, 255, 255, 0.12)",
        color: "rgba(255, 255, 255, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      };
  }
};

const buildScoreLabel = (score: GameScore): string | null => {
  if (!score) {
    return null;
  }

  const { finalScore, homeScore, awayScore, gameStatus } = score;
  const baseScore =
    finalScore ??
    (homeScore !== undefined && awayScore !== undefined
      ? `${homeScore} - ${awayScore}`
      : null);

  if (!baseScore) {
    return null;
  }

  const statusSuffix = gameStatus?.toLowerCase();

  if (statusSuffix === "finished" || statusSuffix === "ft") {
    return `FT ${baseScore}`;
  }

  if (statusSuffix === "live") {
    return `LIVE ${baseScore}`;
  }

  return baseScore;
};

const GameScoreDisplay = ({
  score,
  variant = "compact",
  size = "small",
}: GameScoreDisplayProps) => {
  if (!score) {
    return null;
  }

  const chipLabel = buildScoreLabel(score);
  if (!chipLabel) {
    return null;
  }

  const halftimeScore =
    score.halftimeHomeScore !== undefined &&
    score.halftimeAwayScore !== undefined
      ? `HT ${score.halftimeHomeScore}-${score.halftimeAwayScore}`
      : null;

  const kickOff = formatDateTime(score.gameTime);
  const updatedAt = formatDateTime(score.lastUpdated);

  const chip = (
    <Chip
      label={chipLabel}
      size={size}
      sx={{
        fontSize: size === "small" ? "0.65rem" : "0.75rem",
        fontWeight: 600,
        height: size === "small" ? 20 : 26,
        ...getChipStyles(score.gameStatus ?? score.status),
      }}
    />
  );

  const tooltipContent = (
    <Stack spacing={0.5} py={0.5}>
      {score.gameStatus && (
        <Typography variant="caption" color="rgba(255,255,255,0.8)">
          Status: {score.gameStatus}
        </Typography>
      )}
      {halftimeScore && (
        <Typography variant="caption" color="rgba(255,255,255,0.7)">
          {halftimeScore}
        </Typography>
      )}
      {kickOff && (
        <Typography variant="caption" color="rgba(255,255,255,0.7)">
          Kick-off: {kickOff}
        </Typography>
      )}
      {updatedAt && (
        <Typography variant="caption" color="rgba(255,255,255,0.7)">
          Updated: {updatedAt}
        </Typography>
      )}
    </Stack>
  );

  const chipWithTooltip =
    score.gameStatus || halftimeScore || kickOff || updatedAt ? (
      <Tooltip title={tooltipContent} arrow enterTouchDelay={0}>
        {chip}
      </Tooltip>
    ) : (
      chip
    );

  if (variant === "compact") {
    return chipWithTooltip;
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {chipWithTooltip}
      <Stack spacing={0.3}>
        {halftimeScore && (
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.65)" }}
          >
            {halftimeScore}
          </Typography>
        )}
        {score.gameStatus && (
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.65)" }}
          >
            Status: {score.gameStatus}
          </Typography>
        )}
        {updatedAt && (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            Updated: {updatedAt}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default GameScoreDisplay;
