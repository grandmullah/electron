import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BetSlipItem {
      id: string;
      gameId: string;
      homeTeam: string;
      awayTeam: string;
      betType: string;
      selection: string;
      odds: number;
      stake: number;
      potentialWinnings: number;
}

export interface BetSlipState {
      items: BetSlipItem[];
      isVisible: boolean;
      isMultibetMode: boolean;
      multibetStake: number;
}

const initialState: BetSlipState = {
      items: [],
      isVisible: false,
      isMultibetMode: false,
      multibetStake: 10,
};

export const betslipSlice = createSlice({
      name: 'betslip',
      initialState,
      reducers: {
            addToBetSlip: (state, action: PayloadAction<BetSlipItem>) => {
                  const existingIndex = state.items.findIndex(
                        (item) => item.id === action.payload.id
                  );
                  if (existingIndex >= 0) {
                        // Remove if already in bet slip (toggle behavior)
                        state.items = state.items.filter((item) => item.id !== action.payload.id);
                  } else {
                        state.items.push(action.payload);
                  }
                  // Don't automatically show betslip - only show when user clicks the button
            },
            removeFromBetSlip: (state, action: PayloadAction<string>) => {
                  state.items = state.items.filter((item) => item.id !== action.payload);
                  // Don't automatically hide betslip - let user control visibility
            },
            updateBetSlipStake: (state, action: PayloadAction<{ id: string; stake: number }>) => {
                  const item = state.items.find((item) => item.id === action.payload.id);
                  if (item) {
                        item.stake = action.payload.stake;
                        item.potentialWinnings = action.payload.stake * item.odds;
                  }
            },
            clearBetSlip: (state) => {
                  state.items = [];
                  state.isVisible = false;
                  state.isMultibetMode = false;
                  state.multibetStake = 10;
            },
            toggleBetSlipVisibility: (state) => {
                  state.isVisible = !state.isVisible;
            },
            setBetSlipVisibility: (state, action: PayloadAction<boolean>) => {
                  state.isVisible = action.payload;
            },
            hideBetSlip: (state) => {
                  state.isVisible = false;
            },
            toggleMultibetMode: (state) => {
                  state.isMultibetMode = !state.isMultibetMode;
            },
            setMultibetStake: (state, action: PayloadAction<number>) => {
                  state.multibetStake = action.payload;
            },
      },
});

export const {
      addToBetSlip,
      removeFromBetSlip,
      updateBetSlipStake,
      clearBetSlip,
      toggleBetSlipVisibility,
      setBetSlipVisibility,
      hideBetSlip,
      toggleMultibetMode,
      setMultibetStake,
} = betslipSlice.actions;

export default betslipSlice.reducer; 