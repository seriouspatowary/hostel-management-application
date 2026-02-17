// store/slices/messageSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Message {
  _id: string;
  ticketId: string;
  senderAdminId: string;
  receiverAdminId: string;
  remarks: string;
  timestamp: string;
  isMyMessage: boolean;
  createdAt: string;
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  // NEW: Add new message notification properties
  hasNewMessage: boolean;
  newMessageTicketId: string | null;
  newMessageInfo: {
    ticketId: string;
  } | null;
}

interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
}

const initialState: MessageState = {
  messages: [],
  loading: false,
  error: null,
  // NEW: Initialize new message notification state
  hasNewMessage: false,
  newMessageTicketId: null,
  newMessageInfo: null,
};

// Async thunk to create a message
export const createMessage = createAsyncThunk<
  Message,
  { ticketId: string; remarks: string; receiverAdminId: string },
  { rejectValue: string }
>(
  'messages/createMessage',
  async ({ ticketId, remarks, receiverAdminId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SITE_URL}/api/message`, {
        ticketId,
        remarks,
        receiverAdminId,
      });

      return response.data as Message;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');
    }
  }
);

// Async thunk to get messages between two admins
export const getMessages = createAsyncThunk<
  Message[], // return type
  { ticketId: string; requestedAdmin: string }, // argument type
  { rejectValue: string } // error type
>(
  'messages/getMessages',
  async ({ ticketId, requestedAdmin }, { rejectWithValue }) => {
    try {
      const response = await axios.get<GetMessagesResponse>(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/message/${ticketId}/${requestedAdmin}`
      );

      return response.data.messages;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
    // NEW: Set new message flag when a new message arrives
    setNewMessageFlag: (state, action: PayloadAction<{
      ticketId: string;
    }>) => {
      state.hasNewMessage = true;
      state.newMessageTicketId = action.payload.ticketId;
      state.newMessageInfo = action.payload;
    },
    // NEW: Clear all new message flags
    clearNewMessageFlag: (state) => {
      state.hasNewMessage = false;
      state.newMessageTicketId = null;
      state.newMessageInfo = null;
    },
    // NEW: Clear flag for specific ticket
    clearNewMessageFlagForTicket: (state, action: PayloadAction<string>) => {
      if (state.newMessageTicketId === action.payload) {
        state.hasNewMessage = false;
        state.newMessageTicketId = null;
        state.newMessageInfo = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.loading = false;
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Message creation failed';
      })

      // Handle getMessages
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload; // set messages from API
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch messages';
      });
  },
});

// Export all actions including the new ones
export const { 
  setMessages, 
  clearMessages,
  setNewMessageFlag,
  clearNewMessageFlag,
  clearNewMessageFlagForTicket
} = messageSlice.actions;

export default messageSlice.reducer;