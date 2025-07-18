import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// features/Tabletop/tabletopSlice.ts
export interface CardData {
  id: string;
  value: string;
  suit: string;
  faceUp: boolean;
  imageUrl?: string;
}

interface TabletopState {
  deck: CardData[];
  hand: CardData[];
  table: CardData[];
}

const initialState: TabletopState = {
  deck: [],
  hand: [],
  table: [],
};

const tabletopSlice = createSlice({
  name: 'tabletop',
  initialState,
  reducers: {
    shuffleDeck(state) {
      state.deck = [...state.deck].sort(() => Math.random() - 0.5);
    },
    drawCard(state) {
      const card = state.deck.shift();
      if (card) state.hand.push({ ...card, faceUp: true });
    },
    moveToTable(state, action: PayloadAction<string>) {
      const cardIndex = state.hand.findIndex(c => c.id === action.payload);
      if (cardIndex !== -1) {
        const [card] = state.hand.splice(cardIndex, 1);
        state.table.push(card);
      }
    },
    reset(state) {
      state.deck = generateDeck();
      state.hand = [];
      state.table = [];
    },
  },
});

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = [
  'ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'
];

function generateDeck() {
  const deck = [];
  let id = 0;
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        id: `card-${id++}`,
        value: `${value}`,
        suit: `${suit}`,
        name: `${value} of ${suit}`,
        faceUp: false,
        imageUrl: `/cards/${value}_of_${suit}.svg`,
      });
    }
  }
  return deck;
}




export const { shuffleDeck, drawCard, moveToTable, reset } = tabletopSlice.actions;
export default tabletopSlice.reducer;
