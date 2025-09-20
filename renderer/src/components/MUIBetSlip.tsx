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
import { printThermalTicket } from "../services/printService";
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
  Snackbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  SportsSoccer as SoccerIcon,
  Casino as CasinoIcon,
  Print as PrintIcon,
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successBetData, setSuccessBetData] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
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
  const handlePrintTicket = async () => {
    if (!successBetData) return;

    setIsPrinting(true);
    try {
      await printThermalTicket(
        successBetData,
        user,
        successBetData.combinedOdds
      );
    } catch (error) {
      console.error("Print error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

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

      // Handle different response types for single bets vs multibets
      let success = false;
      let betId = "";
      let error = "";

      if (Array.isArray(result)) {
        // Single bets - result is an array
        success = result.length > 0 && result.every((bet) => bet?.success);
        betId =
          result.length > 0
            ? result[0]?.betId ||
              (result[0] as any)?.data?.betSlip?.id ||
              (result[0] as any)?.data?.betSlip?.betId ||
              ""
            : "";
        error =
          result.length > 0 ? result[0]?.message || "" : "No bets returned";
      } else {
        // Multibet - result is a single object
        success = result?.success || false;
        betId =
          result?.betId ||
          (result as any)?.data?.betSlip?.id ||
          (result as any)?.data?.betSlip?.betId ||
          "";
        error = result?.message || "";
      }

      if (success) {
        if (isAgentMode && selectedUser) {
          dispatch(
            addAgentBet({
              id: betId || `agent-bet-${Date.now()}`,
              userId: selectedUser.id,
              userPhone: selectedUser.phone_number,
              userCountry: "SS",
              agentId: user?.id || "",
              betType: isMultibet ? "multibet" : "single",
              status: "pending",
              totalStake: stake,
              potentialWinnings:
                stake *
                (isMultibet
                  ? calculateCombinedOdds(betSlipItems)
                  : betSlipItems[0]?.odds || 1),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              settledAt: null,
              cancelledAt: null,
              selections: betSlipItems.map((item) => ({
                gameId: item.gameId,
                homeTeam: item.homeTeam,
                awayTeam: item.awayTeam,
                betType: item.betType,
                selection: item.selection,
                odds: item.odds,
                stake: item.stake,
                potentialWinnings: item.stake * item.odds,
              })),
            })
          );
        }

        // Prepare bet data for success dialog and printing (using actual API response)
        const betData = {
          // Use actual API response data if available, otherwise fallback to calculated values
          betSlip: (result as any)?.data?.betSlip || {
            id: betId, // BET-1758282080334-PUBXVCLBP format
            userId: user?.id,
            selections: betSlipItems.map((item) => ({
              gameId: item.gameId,
              homeTeam: item.homeTeam,
              awayTeam: item.awayTeam,
              marketType: item.betType, // h2h, totals, etc.
              outcome: item.selection, // Selected outcome
              odds: {
                decimal: item.odds,
                american: Math.round((item.odds - 1) * 100), // Convert to American odds
                multiplier: item.odds,
              },
              bookmaker: "Betzone",
              gameTime: new Date().toISOString(), // Placeholder - should come from API
              sportKey: "soccer_epl", // Placeholder - should come from API
              validation: {
                oddsVerified: true,
                gameExists: true,
                oddsMatch: true,
              },
            })),
            stake: stake,
            potentialWinnings:
              stake *
              (isMultibet
                ? calculateCombinedOdds(betSlipItems)
                : betSlipItems[0]?.odds || 1),
            taxAmount: 0, // Fallback if not in API response
            netWinnings:
              stake *
              (isMultibet
                ? calculateCombinedOdds(betSlipItems)
                : betSlipItems[0]?.odds || 1),
            odds: {
              decimal: isMultibet
                ? calculateCombinedOdds(betSlipItems)
                : betSlipItems[0]?.odds || 1,
              american: Math.round(
                ((isMultibet
                  ? calculateCombinedOdds(betSlipItems)
                  : betSlipItems[0]?.odds || 1) -
                  1) *
                  100
              ),
              multiplier: isMultibet
                ? calculateCombinedOdds(betSlipItems)
                : betSlipItems[0]?.odds || 1,
            },
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
          },
          // Use actual API response summary if available
          summary: (result as any)?.data?.summary || {
            totalSelections: betSlipItems.length,
            totalStake: stake,
            potentialWinnings:
              stake *
              (isMultibet
                ? calculateCombinedOdds(betSlipItems)
                : betSlipItems[0]?.odds || 1),
            netWinnings:
              stake *
              (isMultibet
                ? calculateCombinedOdds(betSlipItems)
                : betSlipItems[0]?.odds || 1),
            taxAmount: 0, // Fallback if not in API response
          },
          // Additional fields for print service compatibility
          id: betId, // For print service
          betId: betId, // For print service
          betType: isMultibet ? "multibet" : "single",
          totalStake: stake,
          potentialWinnings:
            stake *
            (isMultibet
              ? calculateCombinedOdds(betSlipItems)
              : betSlipItems[0]?.odds || 1),
          combinedOdds: isMultibet
            ? calculateCombinedOdds(betSlipItems)
            : betSlipItems[0]?.odds || 1,
          selections: betSlipItems.map((item, index) => ({
            selectionId: `sel-${betId}-${index}`,
            betId: betId,
            gameId: item.gameId,
            homeTeam: item.homeTeam,
            awayTeam: item.awayTeam,
            betType: item.betType,
            selection: item.selection,
            odds: item.odds,
            stake: item.stake,
            potentialWinnings: item.stake * item.odds,
          })),
          user: user,
          shop: user?.shop || { shopName: "Unknown Shop", shopCode: "unknown" },
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          status: "accepted",
        };

        setSuccessBetData(betData);
        setShowSuccessDialog(true);

        dispatch(clearBetSlip());
        onClose();
      } else {
        alert(`Failed to place bets: ${error}`);
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
    <>
      <Dialog
        open={isVisible}
        onClose={onClose}
        maxWidth="sm"
        fullWidth={false}
        PaperProps={{
          sx: {
            minHeight: "70vh",
            maxHeight: "85vh",
            width: "480px",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
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

        <DialogContent sx={{ p: 0, background: "rgba(255, 255, 255, 0.02)" }}>
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
                Click on odds to add them to your slip and start building your
                bet
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
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Box sx={{ flex: "1 1 150px", minWidth: "150px" }}>
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
                      </Box>
                      <Box sx={{ flex: "1 1 150px", minWidth: "150px" }}>
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
                            SSP{" "}
                            {calculateMultibetWinnings(
                              betSlipItems,
                              multibetStake
                            ).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
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
                                  Potential: SSP{" "}
                                  {bet.potentialWinnings.toFixed(2)}
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

        <DialogActions sx={{ p: 3, background: "rgba(255, 255, 255, 0.02)" }}>
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

      {/* Success Dialog with Print Option */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            background: "rgba(76, 175, 80, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 3,
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "white",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          🎉 Bet Placed Successfully!
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "rgba(255,255,255,0.9)" }}
          >
            Your bet has been placed and accepted.
          </Typography>

          {successBetData && (
            <Paper
              sx={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
              >
                <strong>Bet ID:</strong> {successBetData.betId?.substring(0, 8)}
                ...
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
              >
                <strong>Type:</strong> {successBetData.betType?.toUpperCase()}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
              >
                <strong>Stake:</strong> SSP{" "}
                {successBetData.totalStake?.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
              >
                <strong>Odds:</strong> {successBetData.combinedOdds?.toFixed(2)}
                x
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                <strong>Potential Winnings:</strong> SSP{" "}
                {successBetData.potentialWinnings?.toFixed(2)}
              </Typography>
            </Paper>
          )}

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}
          >
            Would you like to print a thermal receipt?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={handlePrintTicket}
            disabled={isPrinting}
            startIcon={
              isPrinting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PrintIcon />
              )
            }
            sx={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            {isPrinting ? "Printing..." : "🖨️ Print Receipt"}
          </Button>

          <Button
            onClick={() => setShowSuccessDialog(false)}
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              ml: 2,
              "&:hover": {
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
