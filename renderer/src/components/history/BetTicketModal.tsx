import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  SportsEsports as SportsIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Functions as FunctionsIcon,
} from "@mui/icons-material";
import { DisplayBet } from "../../types/history";

interface BetTicketModalProps {
  bet: DisplayBet;
  onClose: () => void;
  onPrint: (bet: DisplayBet) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const BetTicketModal: React.FC<BetTicketModalProps> = ({
  bet,
  onClose,
  onPrint,
  getStatusColor,
  getStatusIcon,
}) => {
  const getStatusIconComponent = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return <CheckCircleIcon color="success" />;
      case "lost":
        return <CancelIcon color="error" />;
      case "pending":
        return <ScheduleIcon color="warning" />;
      default:
        return <SportsIcon color="primary" />;
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return "success";
      case "lost":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth={true}
      PaperProps={{
        sx: {
          minHeight: "85vh",
          maxHeight: "95vh",
          width: "90vw",
          maxWidth: "900px",
          borderRadius: 4,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "rgba(102, 126, 234, 0.2)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 3,
          px: 3,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.5) 50%, transparent 100%)",
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              width: 40,
              height: 40,
            }}
          >
            <ReceiptIcon />
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Bet Ticket
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ID: {bet.betId ? bet.betId.substring(0, 8) + "..." : "Unknown"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, background: "rgba(0, 0, 0, 0.3)" }}>
        {/* Ticket Header */}
        <Paper
          sx={{
            p: 3,
            m: 3,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 3,
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            color: "white",
          }}
        >
          <Box textAlign="center" mb={2}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: "#667eea" }}
            >
              🎯 BETZONE
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Betting Ticket
            </Typography>
          </Box>

          <Box display="flex" gap={3} flexWrap="wrap">
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Box display="flex" alignItems="center" gap={1}>
                <SportsIcon color="primary" fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Type:
                </Typography>
                <Chip
                  label={bet.betType}
                  size="small"
                  variant="outlined"
                  sx={{
                    background:
                      bet.betType === "single"
                        ? "rgba(102, 126, 234, 0.15)"
                        : "rgba(156, 39, 176, 0.15)",
                    backdropFilter: "blur(10px)",
                    color: bet.betType === "single" ? "#667eea" : "#9c27b0",
                    border:
                      bet.betType === "single"
                        ? "1px solid rgba(102, 126, 234, 0.3)"
                        : "1px solid rgba(156, 39, 176, 0.3)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Box display="flex" alignItems="center" gap={1}>
                {getStatusIconComponent(bet.status)}
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Status:
                </Typography>
                <Chip
                  label={bet.status}
                  size="small"
                  sx={{
                    background:
                      bet.status === "won"
                        ? "rgba(76, 175, 80, 0.2)"
                        : bet.status === "lost"
                          ? "rgba(244, 67, 54, 0.2)"
                          : bet.status === "pending"
                            ? "rgba(255, 152, 0, 0.2)"
                            : "rgba(158, 158, 158, 0.2)",
                    backdropFilter: "blur(10px)",
                    color:
                      bet.status === "won"
                        ? "#4caf50"
                        : bet.status === "lost"
                          ? "#f44336"
                          : bet.status === "pending"
                            ? "#ff9800"
                            : "#9e9e9e",
                    border:
                      bet.status === "won"
                        ? "1px solid rgba(76, 175, 80, 0.3)"
                        : bet.status === "lost"
                          ? "1px solid rgba(244, 67, 54, 0.3)"
                          : bet.status === "pending"
                            ? "1px solid rgba(255, 152, 0, 0.3)"
                            : "1px solid rgba(158, 158, 158, 0.3)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Bet Information */}
        <Box p={3}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "rgba(255,255,255,0.9)", mb: 3 }}
          >
            💰 Bet Details
          </Typography>

          {/* Main Bet Stats - Single Row */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 4,
              p: 3,
              mb: 2,
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <MoneyIcon sx={{ color: "#667eea", fontSize: 32, mb: 1 }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)", display: "block" }}
                  >
                    Stake
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#667eea" }}
                  >
                    SSP {bet.totalStake.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <FunctionsIcon
                    sx={{ color: "#ff9800", fontSize: 32, mb: 1 }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)", display: "block" }}
                  >
                    Odds
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#ff9800" }}
                  >
                    {bet.combinedOdds?.toFixed(2) || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <TrendingUpIcon
                    sx={{ color: "#4caf50", fontSize: 32, mb: 1 }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)", display: "block" }}
                  >
                    Potential
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#4caf50" }}
                  >
                    SSP {bet.potentialWinnings.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              {bet.actualWinnings && (
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <CheckCircleIcon
                      sx={{ color: "#4caf50", fontSize: 32, mb: 1 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)", display: "block" }}
                    >
                      Won
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#4caf50" }}
                    >
                      SSP {bet.actualWinnings.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Tax Information - Compact Row */}
          {bet.taxPercentage && bet.taxPercentage > 0 && (
            <Box
              sx={{
                background: "rgba(255, 152, 0, 0.1)",
                border: "1px solid rgba(255, 152, 0, 0.2)",
                borderRadius: 3,
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                Tax ({bet.taxPercentage}%):{" "}
                <strong>-SSP {bet.taxAmount?.toFixed(2) || "0.00"}</strong>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#4caf50", fontWeight: "bold" }}
              >
                Net: SSP {bet.netWinnings?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Settlement Information */}
        {(bet.settlementReason || bet.settledAt || bet.paymentStatus) && (
          <Box p={3}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "rgba(255,255,255,0.9)", mb: 3 }}
            >
              📋 Settlement Info
            </Typography>

            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Stack spacing={2}>
                {bet.settlementReason && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Reason
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      {bet.settlementReason}
                    </Typography>
                  </Box>
                )}

                {bet.settledAt && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Settled
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      {new Date(bet.settledAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {bet.paymentStatus && (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Payment
                    </Typography>
                    <Chip
                      label={bet.paymentStatus.status
                        .replace("_", " ")
                        .toUpperCase()}
                      size="small"
                      color={
                        bet.paymentStatus.status === "paid"
                          ? "success"
                          : bet.paymentStatus.status === "pending"
                            ? "warning"
                            : bet.paymentStatus.status === "failed"
                              ? "error"
                              : "default"
                      }
                      sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                    />
                    {bet.paymentStatus.message && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          fontStyle: "italic",
                        }}
                      >
                        {bet.paymentStatus.message}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        )}

        <Divider />

        {/* Selections */}
        <Box p={3}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "rgba(255,255,255,0.9)", mb: 3 }}
          >
            🎯 Selections ({bet.selections.length})
          </Typography>

          <Stack spacing={2}>
            {bet.selections.map((selection, index) => (
              <Box
                key={index}
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 3,
                  p: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    transform: "translateX(8px)",
                    borderColor: "rgba(255, 255, 255, 0.25)",
                  },
                }}
              >
                {/* Header Row */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)",
                      width: 28,
                      height: 28,
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Avatar>

                  <Box flex={1}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: "rgba(255,255,255,0.95)", mb: 0.5 }}
                    >
                      {selection.homeTeam} vs {selection.awayTeam}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {selection.betType?.replace("_", " ")} •{" "}
                      {selection.selection}
                    </Typography>
                  </Box>

                  <Box textAlign="right">
                    <Chip
                      label={`@ ${selection.odds?.decimal?.toFixed(2) || "N/A"}`}
                      size="small"
                      sx={{
                        background: "rgba(102, 126, 234, 0.2)",
                        color: "#667eea",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        fontWeight: 600,
                        mb: 1,
                      }}
                    />

                    {selection.selectionOutcome && (
                      <Box>
                        <Chip
                          label={selection.selectionOutcome}
                          size="small"
                          color={
                            selection.selectionOutcome === "won"
                              ? "success"
                              : selection.selectionOutcome === "lost"
                                ? "error"
                                : selection.selectionOutcome === "void"
                                  ? "default"
                                  : "warning"
                          }
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Game Score & Settlement Row */}
                <Box display="flex" alignItems="center" gap={3}>
                  {/* Game Score */}
                  {selection.gameScore &&
                    selection.gameScore.homeScore !== undefined &&
                    selection.gameScore.awayScore !== undefined && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          Score:
                        </Typography>
                        <Chip
                          label={`${selection.gameScore.homeScore} - ${selection.gameScore.awayScore}`}
                          size="small"
                          sx={{
                            background: "rgba(76, 175, 80, 0.2)",
                            color: "#4caf50",
                            border: "1px solid rgba(76, 175, 80, 0.3)",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}

                  {/* Settlement Reason */}
                  {selection.selectionSettlementReason && (
                    <Box flex={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          fontStyle: "italic",
                          fontSize: "0.85rem",
                        }}
                      >
                        "{selection.selectionSettlementReason}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2, background: "rgba(0, 0, 0, 0.3)" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "rgba(255,255,255,1)",
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => onPrint(bet)}
          sx={{
            background: "rgba(102, 126, 234, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(102, 126, 234, 0.3)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(102, 126, 234, 0.9)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Print Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
};
