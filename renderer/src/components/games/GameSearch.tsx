import React, { useState, useCallback, useEffect, useRef } from "react";
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
}

export const GameSearch: React.FC<GameSearchProps> = ({
  onGameSelect,
  onAddToBetSlip,
  isSelectionInBetSlip,
  onSearchResultsChange,
}) => {
  const [searchMode, setSearchMode] = useState<
    "id" | "filters" | "autocomplete"
  >("autocomplete");
  const [gameId, setGameId] = useState("");
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [filters, setFilters] = useState<{
    externalId: string;
    status: string;
    sportKey: string;
    search: string;
  }>({
    externalId: "",
    status: "",
    sportKey: "",
    search: "",
  });
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearchById = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setError(null);
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    // Minimum 3 characters for search
    if (searchTerm.trim().length < 3) {
      setError(null);
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedGame(null);

    try {
      const trimmedTerm = searchTerm.trim();

      // If search term is long (30+ chars), likely a full ID - use direct lookup
      // Otherwise use search with partial matching for externalId
      if (trimmedTerm.length >= 30) {
        // Full ID - direct lookup
        const game = await GamesService.fetchGameById(trimmedTerm);
        setSelectedGame(game);
        setSearchResults([game]);
        onSearchResultsChange?.(true);
      } else {
        // Partial ID - use search endpoint which supports partial matching
        const games = await GamesService.searchGames({
          externalId: trimmedTerm,
        });

        if (games.length === 0) {
          setError(`No games found with ID containing "${trimmedTerm}"`);
          onSearchResultsChange?.(false);
        } else {
          setSearchResults(games);
          if (games.length === 1 && games[0]) {
            setSelectedGame(games[0]);
          }
          onSearchResultsChange?.(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch game");
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearchById = useCallback((searchTerm: string) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearchById(searchTerm);
    }, 500); // 500ms debounce delay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autocompleteTimerRef.current) {
        clearTimeout(autocompleteTimerRef.current);
      }
    };
  }, []);

  // Autocomplete search function
  const performAutocomplete = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    // Minimum 2 characters for autocomplete
    if (query.trim().length < 2) {
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const suggestions = await GamesService.autocompleteGames(
        query.trim(),
        20
      );

      if (suggestions.length === 0) {
        setError(`No games found matching "${query.trim()}"`);
        setSearchResults([]);
        onSearchResultsChange?.(false);
      } else {
        // Transform suggestions to Game objects
        const games = suggestions.map((suggestion) =>
          GamesService.transformAutocompleteToGame(suggestion)
        );
        setSearchResults(games);
        if (games.length === 1 && games[0]) {
          setSelectedGame(games[0]);
        }
        onSearchResultsChange?.(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to autocomplete games");
      setSearchResults([]);
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced autocomplete
  const debouncedAutocomplete = useCallback((query: string) => {
    if (autocompleteTimerRef.current) {
      clearTimeout(autocompleteTimerRef.current);
    }

    autocompleteTimerRef.current = setTimeout(() => {
      performAutocomplete(query);
    }, 300); // Faster debounce for autocomplete (300ms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle autocomplete input change
  const handleAutocompleteChange = (value: string) => {
    setAutocompleteQuery(value);
    debouncedAutocomplete(value);
  };

  // Handle input change with debounce
  const handleGameIdChange = (value: string) => {
    setGameId(value);
    debouncedSearchById(value);
  };

  // Manual search button handler (immediate, no debounce)
  const handleSearchById = () => {
    performSearchById(gameId);
  };

  const handleSearchWithFilters = async () => {
    // Check if at least one filter is provided
    const hasFilters =
      (filters.externalId && filters.externalId.trim() !== "") ||
      filters.status ||
      (filters.sportKey && filters.sportKey.trim() !== "") ||
      (filters.search && filters.search.trim() !== "");

    if (!hasFilters) {
      setError("Please provide at least one search filter");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedGame(null);

    try {
      // Build filter object with only non-empty values
      const searchFilters: GameSearchFilters = {};
      if (filters.externalId && filters.externalId.trim() !== "") {
        searchFilters.externalId = filters.externalId.trim();
      }
      if (filters.status && filters.status.trim() !== "") {
        searchFilters.status = filters.status as any;
      }
      if (filters.sportKey && filters.sportKey.trim() !== "") {
        searchFilters.sportKey = filters.sportKey.trim();
      }
      if (filters.search && filters.search.trim() !== "") {
        searchFilters.search = filters.search.trim();
      }

      const games = await GamesService.searchGames(searchFilters);
      setSearchResults(games);

      if (games.length === 0) {
        setError("No games found matching the search criteria");
        onSearchResultsChange?.(false);
      } else {
        onSearchResultsChange?.(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search games");
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setGameId("");
    setAutocompleteQuery("");
    setFilters({
      externalId: "",
      status: "",
      sportKey: "",
      search: "",
    });
    setSearchResults([]);
    setSelectedGame(null);
    setError(null);
    onSearchResultsChange?.(false);

    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (autocompleteTimerRef.current) {
      clearTimeout(autocompleteTimerRef.current);
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

        {/* Search Mode Toggle - Hidden (only Quick Search mode now) */}

        {/* Quick Search (Autocomplete) */}
        {searchMode === "autocomplete" && (
          <Stack spacing={2}>
            <TextField
              label="Quick Search"
              value={autocompleteQuery}
              onChange={(e) => handleAutocompleteChange(e.target.value)}
              placeholder="Type team name, external ID, or any text..."
              fullWidth
              helperText="⚡ Instant search! Type 2+ characters (searches team names, IDs, leagues)"
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
        )}

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
            {searchResults.map((game) => (
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
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
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
