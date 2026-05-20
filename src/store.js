import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const fetchHcps = createAsyncThunk("crm/fetchHcps", async () => {
  const response = await fetch(`${API_BASE}/api/hcps`);
  if (!response.ok) {
    throw new Error("Unable to load HCPs");
  }
  return response.json();
});

export const fetchInteractions = createAsyncThunk("crm/fetchInteractions", async () => {
  const response = await fetch(`${API_BASE}/api/interactions`);
  if (!response.ok) {
    throw new Error("Unable to load interactions");
  }
  return response.json();
});

export const createInteraction = createAsyncThunk(
  "crm/createInteraction",
  async (payload, { dispatch, rejectWithValue }) => {
    const response = await fetch(`${API_BASE}/api/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return rejectWithValue("Unable to save interaction");
    }

    const data = await response.json();
    dispatch(fetchInteractions());
    return data;
  }
);

export const runAgent = createAsyncThunk(
  "crm/runAgent",
  async (message, { rejectWithValue }) => {
    const response = await fetch(`${API_BASE}/api/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.detail || "Agent request failed");
    }
    return data;
  }
);

const crmSlice = createSlice({
  name: "crm",
  initialState: {
    hcps: [],
    interactions: [],
    chatMessages: [
      {
        role: "assistant",
        content:
          "AI CRM copilot ready. Ask me to list HCPs, inspect a profile, log an interaction, edit an interaction, recommend a next step, or draft a follow-up.",
      },
    ],
    loading: false,
    chatLoading: false,
    error: "",
  },
  reducers: {
    addUserMessage(state, action) {
      state.chatMessages.push({ role: "user", content: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcps.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchHcps.fulfilled, (state, action) => {
        state.loading = false;
        state.hcps = action.payload;
      })
      .addCase(fetchHcps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load HCPs";
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.interactions = action.payload;
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.error = action.payload || "Unable to save interaction";
      })
      .addCase(runAgent.pending, (state) => {
        state.chatLoading = true;
        state.error = "";
      })
      .addCase(runAgent.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({ role: "assistant", content: action.payload.reply });
      })
      .addCase(runAgent.rejected, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: "assistant",
          content: typeof action.payload === "string" ? action.payload : "Agent request failed",
        });
      });
  },
});

export const { addUserMessage } = crmSlice.actions;

export const store = configureStore({
  reducer: {
    crm: crmSlice.reducer,
  },
});
