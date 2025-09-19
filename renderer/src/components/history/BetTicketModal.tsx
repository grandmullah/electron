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
      maxWidth="sm"
      fullWidth={false}
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
          width: "420px",
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
            sx={{ color: "rgba(255,255,255,0.9)" }}
          >
            💰 Bet Details
          </Typography>
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 3,
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <MoneyIcon color="primary" fontSize="small" />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Total Stake
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#667eea" }}
                  >
                    SSP {bet.totalStake.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 3,
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <FunctionsIcon color="warning" fontSize="small" />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Total Odds
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#ff9800" }}
                  >
                    {bet.betType === "single"
                      ? bet.combinedOdds?.toFixed(2) || "N/A"
                      : bet.combinedOdds?.toFixed(2) || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 3,
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TrendingUpIcon color="success" fontSize="small" />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Potential Winnings
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#4caf50" }}
                  >
                    SSP {bet.potentialWinnings.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {bet.taxPercentage && bet.taxPercentage > 0 && (
            <Box mt={2}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box sx={{ flex: "1 1 150px", minWidth: "150px" }}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.06)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: 3,
                      boxShadow:
                        "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow:
                          "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                        gutterBottom
                      >
                        Tax ({bet.taxPercentage}%)
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: "#ff9800" }}
                      >
                        -SSP {bet.taxAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: "1 1 150px", minWidth: "150px" }}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.06)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: 3,
                      boxShadow:
                        "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow:
                          "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                        gutterBottom
                      >
                        Net Winnings
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: "#4caf50" }}
                      >
                        SSP {bet.netWinnings?.toFixed(2) || "0.00"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Selections */}
        <Box p={3}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "rgba(255,255,255,0.9)" }}
          >
            🎯 Selections
          </Typography>
          <Stack spacing={2}>
            {bet.selections.map((selection, index) => (
              <Card
                key={index}
                sx={{
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 3,
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        color: "white",
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {selection.homeTeam} vs {selection.awayTeam}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {selection.betType}
                      </Typography>
                    </Box>
                    <Chip
                      label={`@ ${bet.combinedOdds?.toFixed(2) || 'N/A'}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        background: "rgba(102, 126, 234, 0.15)",
                        backdropFilter: "blur(10px)",
                        color: "#667eea",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      background: "rgba(102, 126, 234, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(102, 126, 234, 0.3)",
                      color: "white",
                      borderRadius: 2,
                      textAlign: "center",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {selection.selection}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
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
