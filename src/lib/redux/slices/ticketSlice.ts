import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Ticket {
  _id: string;
  adminId:string;
  block: string;
  roomNo: number;
  issue: string;
  date: string;
  status: string;
  remarks: string;
  feedback: number;
  closedTicket: boolean;
  assignDepartment:string;
  assignPerson: string;
  message: string;
  thirdPartyAssign:boolean;
  remarksCount:number;
  photo: string;    
}

export interface CreateTicketPayload {
  requestBy: string;
  requestDepartment: string;
  employeeId: string;
  block: string;
  roomNo: number;
  issue: string;
  assignDepartment: string;
  assignPerson: string;
  message: string;
  photo: string 
}
export interface CreateTicketApiResponse {
  success: boolean;
  message: string;
}

interface TicketState {
  data: Ticket[];
  loading: boolean;
  error: string | null;
  selectedTicket: Ticket | null;
  counts: TicketCounts | null;


}

interface TicketApiResponse {
  success: boolean;
  data: Ticket[];
}

interface TicketCounts {
  newTicket: number;
  completed: number;
  closed: number;
  myTicket: number;
}


const initialState: TicketState = {
  data: [],
  loading: false,
  error: null,
  selectedTicket: null,
  counts: null,


};

// Fetch all tickets
export const fetchTickets = createAsyncThunk('tickets/fetch', async () => {
  const res = await axios.get<TicketApiResponse>(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ticket`);
  return res.data.data;
});

// Updated generateTicket to accept FormData for file uploads
export const generateTicket = createAsyncThunk(
  'tickets/generate',
  async (ticketData: FormData, { rejectWithValue }) => {
    try {
      const res = await axios.post<{ success: boolean; message: string }>(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/ticket`,
        ticketData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data.message;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');
    }
  }
)

export const deleteTicket = createAsyncThunk< string, string, { rejectValue: string }>(
  'tickets/delete',
  async (ticketId, { rejectWithValue }) => {
    try {
      const res = await axios.delete<{ success: boolean; message: string }>(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/ticket/${ticketId}`
      );

      if (res.data.success) {
        return ticketId;
      }

      return rejectWithValue('Failed to delete ticket');
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');
    }
  }
);

export const updateTicket = createAsyncThunk<
  string, // return type (success message)
  { id: string; ticketData: FormData, }, // input payload
  { rejectValue: string } // error type
>('tickets/update', async ({ id, ticketData }, { rejectWithValue }) => {
  try {
    const res = await axios.put<{ success: boolean; message: string }>(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/ticket/${id}`,
      ticketData
    );

    if (res.data.success) {
      return res.data.message;
    }

    return rejectWithValue('Failed to update ticket');
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Unexpected error');
  }
});



// Fetch tickets allotted to the logged-in admin
export const getAllottedTickets = createAsyncThunk(
  'tickets/getAllotted',
  async (status: string = 'Pending', { rejectWithValue }) => {
    try {
      const res = await axios.get<TicketApiResponse>(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/allotted-ticket?status=${status}`
      );
      return res.data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');
    }
  }
);

export const closeTicket = createAsyncThunk<
  string, // return type (ticketId)
  string, // argument type (ticketId)
  { rejectValue: string }
>(
  'tickets/close',
  async (ticketId, { rejectWithValue }) => {
    try {
      const res = await axios.patch<{ success: boolean; message: string }>(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/allotted-ticket`,
        { ticketId } // send ticketId in the request body
      );

      if (res.data.success) {
        return ticketId;
      }

      return rejectWithValue('Failed to close ticket');
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');
    }
  }
);

export const fetchTicketCounts = createAsyncThunk<
  TicketCounts, // return type
  void, // argument type
  { rejectValue: string }
>('tickets/fetchCounts', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<{ success: boolean; data: TicketCounts }>(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/ticket/dashboard`
    );

    if (res.data.success) {
      return res.data.data;
    }

    return rejectWithValue('Failed to fetch ticket counts');
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Unexpected error');
  }
});


const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(generateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTicket.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(generateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(ticket => ticket._id !== action.payload);
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      
      .addCase(getAllottedTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllottedTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getAllottedTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(closeTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeTicket.fulfilled, (state, action) => {
        state.loading = false;
        // Optional: mark ticket as 'Solved' in the data
        const ticket = state.data.find(t => t._id === action.payload);
        if (ticket) {
          ticket.status = 'Solved';
        }
      })
      .addCase(closeTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchTicketCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(fetchTicketCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch ticket counts';
      })
      
      

  },
});

export default ticketSlice.reducer;
