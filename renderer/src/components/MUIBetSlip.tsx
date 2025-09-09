import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  removeFromBetSlip,
  updateBetSlipStake,
  clearBetSlip,
  hideBetSlip,
  toggleMultibetMode,
  setMultibetStake,
  BetSlipItem,
} from "../store/betslipSlice";
import { placeBets, BetSlipService } from "../services/betslipService";
import { addAgentBet } from "../store/agentSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  TextField,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  SportsSoccer as SoccerIcon,
  Casino as CasinoIcon,
} from "@mui/icons-material";

interface MUIBetSlipProps {
  isVisible: boolean;
  onClose: () => void;
  selectedUser?: { id: string; phone_number: string } | null | undefined;
  isAgentMode?: boolean;
}

export const MUIBetSlip: React.FC<MUIBetSlipProps> = ({
  isVisible,
  onClose,
  selectedUser,
  isAgentMode = false,
}) => {
  const dispatch = useAppDispatch();
  const {
    items: betSlipItems = [],
    isMultibetMode = false,
    multibetStake = 10,
  } = useAppSelector((state) => state.betslip);
  const { user } = useAppSelector((state) => state.auth);
  const { managedUsers } = useAppSelector((state) => state.agent);

  const [isPlacingBets, setIsPlacingBets] = useState(false);
  const [betSlipData, setBetSlipData] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  // Calculate combined odds for multibet
  const calculateCombinedOdds = (bets: BetSlipItem[]): number => {
    if (!bets || bets.length === 0) return 1;
    return bets.reduce((total, bet) => total * bet.odds, 1);
  };

  // Calculate multibet winnings
  const calculateMultibetWinnings = (
    bets: BetSlipItem[],
    stake: number
  ): number => {
    if (!bets || bets.length === 0) return 0;
    const combinedOdds = calculateCombinedOdds(bets);
    return stake * combinedOdds;
  };

  // Validate betslip with limits
  const validateBetslipWithLimits = (
    bets: BetSlipItem[],
    isMultibet: boolean,
    stake: number
  ) => {
    if (!bets || bets.length === 0) {
      return { isValid: false, error: "No bets selected" };
    }

    if (!user?.bettingLimits) {
      return { isValid: true, error: "" };
    }

    const { minStake, maxStake, maxDailyLoss } = user.bettingLimits;

    if (stake < minStake) {
      return {
        isValid: false,
        error: `Minimum stake is ${user.currency} ${minStake.toFixed(2)}`,
      };
    }

    if (stake > maxStake) {
      return {
        isValid: false,
        error: `Maximum stake is ${user.currency} ${maxStake.toFixed(2)}`,
      };
    }

    return { isValid: true, error: "" };
  };

  // Validate selections with API
  const validateSelectionsWithAPI = async (bets: BetSlipItem[]) => {
    if (!bets || bets.length === 0) {
      setValidationData(null);
      return;
    }

    setIsValidating(true);
    try {
      console.log("Validating selections with API:", bets);
      const result = await BetSlipService.validateSelections(bets);
      console.log("API validation result:", result);
      setValidationData(result);
    } catch (error) {
      console.error("API validation failed:", error);
      setValidationData({
        success: false,
        data: {
          isValid: false,
          errors: ["Validation failed: " + (error as Error).message],
        },
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle placing bets
  const handlePlaceBets = async () => {
    if (!betSlipItems || (betSlipItems?.length || 0) === 0) return;

    setIsPlacingBets(true);
    try {
      const isMultibet = (betSlipItems?.length || 0) > 1 || isMultibetMode;
      const stake = isMultibet ? multibetStake : betSlipItems?.[0]?.stake || 0;

      const validation = validateBetslipWithLimits(
        betSlipItems,
        isMultibet,
        stake
      );
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      const result = await placeBets(betSlipItems, isMultibet, stake);

      if (result.success) {
        if (isAgentMode && selectedUser) {
          dispatch(
            addAgentBet({
              id: result.betId || `agent-bet-${Date.now()}`,
              userId: selectedUser.id,
              phoneNumber: selectedUser.phone_number,
              selections: betSlipItems,
              stake,
              isMultibet,
              status: "pending",
              placedAt: new Date().toISOString(),
            })
          );
        }

        dispatch(clearBetSlip());
        onClose();
        alert("Bets placed successfully!");
      } else {
        alert(`Failed to place bets: ${result.error}`);
      }
    } catch (error) {
      console.error("Error placing bets:", error);
      alert("An error occurred while placing bets");
    } finally {
      setIsPlacingBets(false);
    }
  };

  // Load betslip data when items change
  useEffect(() => {
    if (betSlipItems && (betSlipItems?.length || 0) > 0) {
      const isMultibet = (betSlipItems?.length || 0) > 1 || isMultibetMode;
      const stake = isMultibet ? multibetStake : betSlipItems?.[0]?.stake || 0;

      // Calculate betslip data locally
      const data = {
        isMultibet,
        stake,
        totalStake: isMultibet ? multibetStake : betSlipItems?.[0]?.stake || 0,
        combinedOdds: isMultibet
          ? calculateCombinedOdds(betSlipItems)
          : betSlipItems?.[0]?.odds || 1,
        potentialWinnings: isMultibet
          ? calculateMultibetWinnings(betSlipItems, multibetStake)
          : (betSlipItems?.[0]?.stake || 0) * (betSlipItems?.[0]?.odds || 1),
        bets: betSlipItems,
      };
      setBetSlipData(data);

      // Validate selections with API
      validateSelectionsWithAPI(betSlipItems);
    } else {
      setBetSlipData(null);
      setValidationData(null);
    }
  }, [betSlipItems, isMultibetMode, multibetStake]);

  return (
    <Dialog
      open={isVisible}
      onClose={onClose}
      maxWidth="sm"
      fullWidth={false}
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
          width: "420px",
          background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
          border: "1px solid #2a2d3a",
          borderRadius: "16px",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
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
          py: 3,
          px: 3,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <CasinoIcon sx={{ fontSize: 28 }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "rgba(255,255,255,0.9)" }}
          >
            Bet Slip ({betSlipItems?.length || 0} bets)
          </Typography>
        </Box>
        {isAgentMode && selectedUser && (
          <Chip
            label={`Placing for: ${selectedUser.phone_number}`}
            color="secondary"
            variant="filled"
            sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
          />
        )}
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, background: "#0e1220" }}>
        {!betSlipItems || (betSlipItems?.length || 0) === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            p={4}
            sx={{
              background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              },
            }}
          >
            <Box
              sx={{
                background:
                  "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)",
                borderRadius: "50%",
                p: 3,
                mb: 3,
                border: "2px solid rgba(102, 126, 234, 0.3)",
              }}
            >
              <SoccerIcon sx={{ fontSize: 64, color: "#667eea", mb: 0 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 600,
                mb: 1,
              }}
              gutterBottom
            >
              No bets added yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                maxWidth: "280px",
              }}
            >
              Click on odds to add them to your slip and start building your bet
            </Typography>
          </Box>
        ) : (
          <Box
            p={3}
            sx={{
              background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
              minHeight: "400px",
            }}
          >
            {/* Bet Mode Toggle - Only show when single selection */}
            {betSlipItems && (betSlipItems?.length || 0) === 1 && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  background: "#1a1d29",
                  border: "1px solid #2a2d3a",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Bet Mode
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isMultibetMode}
                      onChange={() => dispatch(toggleMultibetMode())}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {isMultibetMode ? "Multibet Mode" : "Single Bet Mode"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {isMultibetMode
                          ? "All selections combined into one bet"
                          : "Each selection as individual bet"}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            )}

            {/* Auto-enable multibet for multiple selections */}
            {(betSlipItems?.length || 0) > 1 && !isMultibetMode && (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  background: "#1a1d29",
                  border: "1px solid #2a2d3a",
                  color: "rgba(255,255,255,0.8)",
                  "& .MuiAlert-icon": {
                    color: "#2196F3",
                  },
                }}
              >
                🔄 Multiple selections detected - automatically switching to
                multibet mode
              </Alert>
            )}

            {/* Multibet Info */}
            {((betSlipItems?.length || 0) > 1 || isMultibetMode) &&
              (betSlipItems?.length || 0) >= 2 && (
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    background: "#1a1d29",
                    border: "1px solid #2a2d3a",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Multibet Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                          gutterBottom
                        >
                          Combined Odds
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {calculateCombinedOdds(betSlipItems).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                          gutterBottom
                        >
                          Potential Winnings
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          $
                          {calculateMultibetWinnings(
                            betSlipItems,
                            multibetStake
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <TextField
                      fullWidth
                      label={`Stake (${user?.currency || "SSP"})`}
                      type="number"
                      value={multibetStake}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (user?.bettingLimits) {
                          const { minStake, maxStake } = user.bettingLimits;
                          if (value >= minStake && value <= maxStake) {
                            dispatch(setMultibetStake(value));
                          }
                        } else {
                          dispatch(setMultibetStake(value));
                        }
                      }}
                      inputProps={{
                        min: user?.bettingLimits?.minStake || 1,
                        max: user?.bettingLimits?.maxStake || 1000,
                        step: 0.01,
                      }}
                      helperText={
                        user?.bettingLimits
                          ? `Min: ${user.currency} ${user.bettingLimits.minStake.toFixed(2)} | Max: ${user.currency} ${user.bettingLimits.maxStake.toFixed(2)}`
                          : ""
                      }
                      sx={{
                        mt: 1,
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& .MuiOutlinedInput-root": {
                          color: "rgba(255,255,255,0.8)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.4)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiFormHelperText-root": {
                          color: "rgba(255,255,255,0.6)",
                        },
                      }}
                    />
                  </Box>
                </Paper>
              )}

            {/* Validation Message */}
            {(betSlipItems?.length || 0) > 0 && (
              <Box mb={3}>
                {(() => {
                  const isMultibet =
                    (betSlipItems?.length || 0) > 1 || isMultibetMode;
                  const stake = isMultibet
                    ? multibetStake
                    : betSlipItems?.[0]?.stake || 0;
                  const validation = validateBetslipWithLimits(
                    betSlipItems,
                    isMultibet,
                    stake
                  );

                  return validation.isValid ? (
                    <Alert severity="success" icon={<TrendingUpIcon />}>
                      ✅ Valid bet selections
                    </Alert>
                  ) : (
                    <Alert severity="error">❌ {validation.error}</Alert>
                  );
                })()}
              </Box>
            )}

            {/* API Validation Status */}
            {validationData && (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  background: validationData.data?.isValid
                    ? "#1a2e1a"
                    : "#2e1a1a",
                  border: validationData.data?.isValid
                    ? "1px solid #4caf50"
                    : "1px solid #f44336",
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {isValidating ? (
                    <CircularProgress size={20} color="primary" />
                  ) : validationData.data?.isValid ? (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#4caf50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#f44336",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✗
                    </Box>
                  )}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: validationData.data?.isValid
                        ? "#4caf50"
                        : "#f44336",
                    }}
                  >
                    {isValidating
                      ? "Validating..."
                      : validationData.data?.isValid
                        ? "Valid Selections"
                        : "Invalid Selections"}
                  </Typography>
                </Box>

                {validationData.data?.errors &&
                  validationData.data.errors.length > 0 && (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
                      >
                        Issues found:
                      </Typography>
                      {validationData.data.errors.map(
                        (error: string, index: number) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: "#f44336", ml: 2 }}
                          >
                            • {error}
                          </Typography>
                        )
                      )}
                    </Box>
                  )}
              </Paper>
            )}

            {/* Bet Items */}
            <Stack spacing={2} mb={3}>
              {betSlipItems.map((bet) => (
                <Card
                  key={bet.id}
                  sx={{
                    background:
                      "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box flex={1}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {bet.homeTeam} vs {bet.awayTeam}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                          gutterBottom
                        >
                          {bet.betType}: {bet.selection} @ {bet.odds}
                        </Typography>
                        {(betSlipItems?.length || 0) === 1 &&
                          !isMultibetMode && (
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                              mt={1}
                            >
                              <TextField
                                label="Stake"
                                type="number"
                                size="small"
                                value={bet.stake}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  if (user?.bettingLimits) {
                                    const { minStake, maxStake } =
                                      user.bettingLimits;
                                    if (
                                      value >= minStake &&
                                      value <= maxStake
                                    ) {
                                      dispatch(
                                        updateBetSlipStake({
                                          id: bet.id,
                                          stake: value,
                                        })
                                      );
                                    }
                                  } else {
                                    dispatch(
                                      updateBetSlipStake({
                                        id: bet.id,
                                        stake: value,
                                      })
                                    );
                                  }
                                }}
                                inputProps={{
                                  min: user?.bettingLimits?.minStake || 1,
                                  max: user?.bettingLimits?.maxStake || 1000,
                                  step: 0.01,
                                }}
                                sx={{
                                  width: 120,
                                  "& .MuiInputLabel-root": {
                                    color: "rgba(255,255,255,0.7)",
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    color: "rgba(255,255,255,0.8)",
                                    "& fieldset": {
                                      borderColor: "rgba(255,255,255,0.2)",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "rgba(255,255,255,0.4)",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#667eea",
                                    },
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "rgba(255,255,255,0.6)" }}
                              >
                                Potential: ${bet.potentialWinnings.toFixed(2)}
                              </Typography>
                            </Box>
                          )}
                      </Box>
                      <IconButton
                        onClick={() => dispatch(removeFromBetSlip(bet.id))}
                        color="error"
                        sx={{
                          "&:hover": {
                            bgcolor: "error.light",
                            color: "white",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, background: "#0e1220" }}>
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
          Cancel
        </Button>
        <Button
          onClick={() => dispatch(clearBetSlip())}
          startIcon={<DeleteIcon />}
          disabled={(betSlipItems?.length || 0) === 0}
          sx={{
            color: "#f44336",
            "&:hover": {
              backgroundColor: "rgba(244, 67, 54, 0.1)",
            },
            "&:disabled": {
              color: "rgba(255,255,255,0.3)",
            },
          }}
        >
          Clear All
        </Button>
        <Button
          onClick={handlePlaceBets}
          variant="contained"
          color="primary"
          startIcon={
            isPlacingBets ? <CircularProgress size={20} /> : <MoneyIcon />
          }
          disabled={
            isPlacingBets ||
            isValidating ||
            (betSlipItems?.length || 0) === 0 ||
            (validationData && !validationData.data?.isValid) ||
            (() => {
              const isMultibet =
                (betSlipItems?.length || 0) > 1 || isMultibetMode;
              const stake = isMultibet
                ? multibetStake
                : betSlipItems?.[0]?.stake || 0;
              const validation = validateBetslipWithLimits(
                betSlipItems,
                isMultibet,
                stake
              );
              return !validation.isValid;
            })()
          }
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
            "&:disabled": {
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.3)",
            },
          }}
        >
          {isPlacingBets
            ? "Placing Bets..."
            : isValidating
              ? "Validating..."
              : validationData && !validationData.data?.isValid
                ? "Invalid Selections"
                : (betSlipItems?.length || 0) > 1
                  ? "Place Multibet"
                  : "Place Bet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
