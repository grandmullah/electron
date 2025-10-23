import React, { useState, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import GamesService from "../../services/gamesService";
import { Game, GameSearchFilters } from "../../types/games";
import { GameCard } from "./GameCard";

interface GameSearchProps {
  onGameSelect?: (game: Game) => void;
  onAddToBetSlip?: (
    game: Game,
    betType: string,
    selection: string,
    odds: number
  ) => void;
  isSelectionInBetSlip?: (
    gameId: string,
    betType: string,
    selection: string
  ) => boolean;
  onSearchResultsChange?: (hasResults: boolean) => void;
  leagueGames?: Game[];
  leagueKey?: string;
}

export const GameSearch: React.FC<GameSearchProps> = ({
  onGameSelect,
  onAddToBetSlip,
  isSelectionInBetSlip,
  onSearchResultsChange,
  leagueGames = [],
  leagueKey = "",
}) => {
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(autocompleteQuery);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [autocompleteQuery]);

  // Always use API for autocomplete (both text and index numbers)
  const trimmedQuery = debouncedQuery.trim();
  const shouldFetchFromAPI = trimmedQuery.length >= 2;

  // SWR fetcher for autocomplete - extracts query from the key
  const autocompleteFetcher = async (key: string) => {
    // Extract query from the key format: /autocomplete/{query}
    const query = key.split("/").pop() || "";

    if (!query || query.length < 2) return [];

    console.log("🔍 SWR fetching autocomplete for:", query);
    const suggestions = await GamesService.autocompleteGames(query, 20);

    // Transform suggestions to Game objects
    const games = suggestions.map((suggestion) =>
      GamesService.transformAutocompleteToGame(suggestion)
    );

    console.log("✅ SWR autocomplete results:", games.length);
    return games;
  };

  // Use SWR for text-based autocomplete with debounced query
  const {
    data: apiResults,
    error: apiError,
    isLoading: isLoadingAPI,
  } = useSWR(
    shouldFetchFromAPI ? `/autocomplete/${trimmedQuery}` : null,
    autocompleteFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
      errorRetryCount: 1,
      keepPreviousData: true, // Keep showing previous results while loading new ones
    }
  );

  // Handle search results from API
  useEffect(() => {
    console.log("🔄 Search effect triggered:", {
      debouncedQuery: trimmedQuery,
      shouldFetchFromAPI,
      hasApiResults: !!apiResults,
      apiError: apiError?.message,
      isLoadingAPI,
    });

    if (!trimmedQuery) {
      setSearchResults([]);
      setError(null);
      onSearchResultsChange?.(false);
      return;
    }

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setError(null);
      onSearchResultsChange?.(false);
      return;
    }

    // Handle API errors
    if (apiError) {
      console.error("❌ API error:", apiError);
      setError(apiError.message || "Failed to search games");
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    // Handle API results (for both text and index searches)
    if (apiResults) {
      console.log("📊 Processing API results:", apiResults.length);
      if (apiResults.length === 0) {
        setError(`No games found matching "${trimmedQuery}"`);
        setSearchResults([]);
        onSearchResultsChange?.(false);
      } else {
        setSearchResults(apiResults);
        if (apiResults.length === 1 && apiResults[0]) {
          setSelectedGame(apiResults[0]);
        }
        setError(null);
        onSearchResultsChange?.(true);
      }
    }
  }, [
    trimmedQuery,
    shouldFetchFromAPI,
    apiResults,
    apiError,
    isLoadingAPI,
    onSearchResultsChange,
  ]);

  // Handle autocomplete input change
  const handleAutocompleteChange = (value: string) => {
    setAutocompleteQuery(value);
  };

  const handleClear = () => {
    setAutocompleteQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
    setSelectedGame(null);
    setError(null);
    onSearchResultsChange?.(false);

    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
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

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          sx={{ color: "rgba(255,255,255,0.9)" }}
        >
          🔍 Search Games
        </Typography>

        {/* Quick Search (Autocomplete) - All searches via API (index numbers + text) */}
        <Stack spacing={2}>
          <Alert
            severity="info"
            sx={{
              bgcolor: "rgba(33, 150, 243, 0.1)",
              color: "rgba(255,255,255,0.9)",
              "& .MuiAlert-icon": {
                color: "#42a5f5",
              },
            }}
          >
            🔍 Search by game index number (e.g., 101, 406), team name, or
            external ID
          </Alert>
          <TextField
            label="Quick Search"
            value={autocompleteQuery}
            onChange={(e) => handleAutocompleteChange(e.target.value)}
            placeholder="Type game number, team name, or external ID..."
            fullWidth
            helperText="⚡ Instant API search! Type 2+ characters (supports index numbers and text)"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.7)",
              },
              "& .MuiFormHelperText-root": {
                color: "rgba(76, 175, 80, 0.8)",
                fontWeight: 500,
              },
            }}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              fullWidth
              sx={{
                color: "rgba(255,255,255,0.8)",
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>

        {/* Search by ID - COMMENTED OUT */}

        {/* Search with Filters - COMMENTED OUT
        {searchMode === "filters" && (
          <Stack spacing={2}>
            <TextField
              label="External ID"
              value={filters.externalId}
              onChange={(e) =>
                setFilters({ ...filters, externalId: e.target.value })
              }
              placeholder="e.g., abc123"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
                Status
              </InputLabel>
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                label="Status"
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="finished">Finished</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Sport Key"
              value={filters.sportKey}
              onChange={(e) =>
                setFilters({ ...filters, sportKey: e.target.value })
              }
              placeholder="e.g., soccer_epl"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <TextField
              label="Search (Team Names)"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="e.g., Manchester, Liverpool"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SearchIcon />
                }
                onClick={handleSearchWithFilters}
                disabled={loading}
                fullWidth
              >
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        )} */}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            sx={{ color: "rgba(255,255,255,0.9)" }}
          >
            Search Results ({searchResults.length})
          </Typography>
          <Stack spacing={2}>
            {searchResults.map((game) => {
              const gameNumber = game.team_index?.fullIndex || 0;

              return (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={selectedGame?.id === game.id}
                  onSelect={(g) => {
                    setSelectedGame(g);
                    onGameSelect?.(g);
                  }}
                  onAddToBetSlip={
                    onAddToBetSlip ||
                    (() => {
                      console.log("Add to bet slip not configured");
                    })
                  }
                  isSelectionInBetSlip={isSelectionInBetSlip || (() => false)}
                  expandedGames={expandedGames}
                  onToggleExpanded={toggleExpanded}
                  gameNumber={gameNumber}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Loading State */}
      {isLoadingAPI && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress sx={{ color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mt: 2 }}
          >
            Searching...
          </Typography>
        </Box>
      )}
    </Box>
  );
};
