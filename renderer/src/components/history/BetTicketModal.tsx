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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
            }}
          >
            <ReceiptIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Bet Ticket
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ID: {bet.id.substring(0, 8)}...
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

      <DialogContent sx={{ p: 0, background: "#0e1220" }}>
        {/* Ticket Header */}
        <Paper
          sx={{
            p: 3,
            m: 3,
            background: "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 2,
          }}
        >
          <Box textAlign="center" mb={2}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#667eea" }}>
              🎯 BETZONE
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Betting Ticket
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <SportsIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  Type:
                </Typography>
                <Chip
                  label={bet.betType}
                  size="small"
                  color={bet.betType === "single" ? "primary" : "secondary"}
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                {getStatusIconComponent(bet.status)}
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  Status:
                </Typography>
                <Chip
                  label={bet.status}
                  color={getStatusChipColor(bet.status) as any}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Bet Information */}
        <Box p={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "rgba(255,255,255,0.9)" }}>
            💰 Bet Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <MoneyIcon color="primary" fontSize="small" />
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TrendingUpIcon color="success" fontSize="small" />
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
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
            </Grid>
          </Grid>

          {bet.taxPercentage && bet.taxPercentage > 0 && (
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
                      border: "1px solid rgba(255,255,255,0.1)",
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
                        color="warning.main"
                      >
                        -SSP {bet.taxAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
                      border: "1px solid rgba(255,255,255,0.1)",
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
                        color="success.main"
                      >
                        SSP {bet.netWinnings?.toFixed(2) || "0.00"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Selections */}
        <Box p={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "rgba(255,255,255,0.9)" }}>
            🎯 Selections
          </Typography>
          <Stack spacing={2}>
            {bet.selections.map((selection, index) => (
              <Card
                key={index}
                sx={{
                  background:
                    "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "rgba(255,255,255,0.9)" }}>
                        {selection.homeTeam} vs {selection.awayTeam}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                        {selection.betType}
                      </Typography>
                    </Box>
                    <Chip
                      label={`@ ${selection.odds}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {selection.selection}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2, background: "#0e1220" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "rgba(255,255,255,0.8)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
          }}
        >
          Print Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
};
