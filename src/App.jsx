import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUserMessage,
  createInteraction,
  fetchHcps,
  fetchInteractions,
  runAgent,
} from "./store";

const emptyForm = {
  hcp_id: "",
  interaction_date: new Date().toISOString().slice(0, 10),
  channel: "In-person",
  title: "",
  objective: "",
  summary: "",
  sentiment: "neutral",
  products_discussed: "",
  follow_up_date: "",
  next_action: "",
};

const demoPrompts = [
  "List all HCPs available in the CRM.",
  "Show me the snapshot for HCP 1.",
  "Log an interaction for HCP 2 via video call about obesity evidence, positive sentiment, and a follow-up next week.",
  "Edit interaction 1 and update the next action to schedule a nurse educator session.",
  "Recommend the next best action for HCP 3 to improve engagement.",
  "Draft a follow-up note for HCP 1 about adherence support.",
];

function App() {
  const dispatch = useDispatch();
  const { hcps, interactions, chatMessages, loading, chatLoading, error } =
    useSelector((state) => state.crm);
  const [formData, setFormData] = useState(emptyForm);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const submitForm = async (event) => {
    event.preventDefault();
    await dispatch(
      createInteraction({
        ...formData,
        hcp_id: Number(formData.hcp_id),
        products_discussed: formData.products_discussed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        follow_up_date: formData.follow_up_date || null,
      }),
    );
    setFormData(emptyForm);
  };

  const sendMessage = async (message) => {
    const value = message.trim();
    if (!value) {
      return;
    }
    dispatch(addUserMessage(value));
    setChatInput("");
    await dispatch(runAgent(value));
    dispatch(fetchInteractions());
  };

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Life Sciences CRM</p>
          <h1>AI-First HCP Interaction Logging</h1>
          <p className="hero-copy">
            A dual-mode log interaction screen for field representatives with a
            structured form and a LangGraph-powered conversational copilot.
          </p>
        </div>
        {/* <div className="hero-card">
          <span>Mandatory stack satisfied</span>
          <strong>React + Redux</strong>
          <strong>FastAPI + LangGraph</strong>
          <strong>Groq-ready with PostgreSQL</strong>
        </div> */}
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Structured Mode</p>
              <h2>Log Interaction Form</h2>
            </div>
            <span className="badge">{hcps.length} HCPs loaded</span>
          </div>

          <form className="form-grid" onSubmit={submitForm}>
            <label>
              HCP
              <select
                value={formData.hcp_id}
                onChange={(e) =>
                  setFormData({ ...formData, hcp_id: e.target.value })
                }
                required
              >
                <option value="">Select HCP</option>
                {hcps.map((hcp) => (
                  <option key={hcp.id} value={hcp.id}>
                    {hcp.full_name} · {hcp.specialty}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Interaction Date
              <input
                type="date"
                value={formData.interaction_date}
                onChange={(e) =>
                  setFormData({ ...formData, interaction_date: e.target.value })
                }
                required
              />
            </label>

            <label>
              Channel
              <select
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
              >
                <option>In-person</option>
                <option>Video call</option>
                <option>Phone</option>
                <option>Email</option>
                <option>WhatsApp</option>
              </select>
            </label>

            <label>
              Sentiment
              <select
                value={formData.sentiment}
                onChange={(e) =>
                  setFormData({ ...formData, sentiment: e.target.value })
                }
              >
                <option>positive</option>
                <option>neutral</option>
                <option>negative</option>
              </select>
            </label>

            <label className="wide">
              Title
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Quarterly product detail"
                required
              />
            </label>

            <label className="wide">
              Objective
              <input
                value={formData.objective}
                onChange={(e) =>
                  setFormData({ ...formData, objective: e.target.value })
                }
                placeholder="Reinforce efficacy data and identify follow-up needs"
                required
              />
            </label>

            <label className="wide">
              Summary
              <textarea
                rows="4"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="Capture the key discussion points, objections, and outcomes."
                required
              />
            </label>

            <label className="wide">
              Products Discussed
              <input
                value={formData.products_discussed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    products_discussed: e.target.value,
                  })
                }
                placeholder="CardioX, LipiFlow"
              />
            </label>

            <label>
              Follow-up Date
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) =>
                  setFormData({ ...formData, follow_up_date: e.target.value })
                }
              />
            </label>

            <label className="wide">
              Next Action
              <textarea
                rows="3"
                value={formData.next_action}
                onChange={(e) =>
                  setFormData({ ...formData, next_action: e.target.value })
                }
                placeholder="Send evidence summary and schedule a follow-up call."
              />
            </label>

            <button type="submit" className="primary">
              Save Interaction
            </button>
          </form>
        </section>

        <section className="panel panel-chat">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Conversational Mode</p>
              <h2>LangGraph CRM Copilot</h2>
            </div>
            <span className="badge">6 tools</span>
          </div>

          <div className="prompt-row">
            {demoPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="chip"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="chat-window">
            {chatMessages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`bubble ${message.role}`}
              >
                <span>{message.role === "assistant" ? "Copilot" : "You"}</span>
                <p>{message.content}</p>
              </article>
            ))}
            {chatLoading ? (
              <article className="bubble assistant">
                <span>Copilot</span>
                <p>Working...</p>
              </article>
            ) : null}
          </div>

          <div className="chat-compose">
            <textarea
              rows="3"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the agent to list HCPs, log a visit, edit a record, or suggest next action."
            />
            <button
              type="button"
              className="primary"
              onClick={() => sendMessage(chatInput)}
            >
              Send
            </button>
          </div>
        </section>
      </main>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recent Activity</p>
            <h2>Interaction Timeline</h2>
          </div>
          <span className="badge">{interactions.length} records</span>
        </div>

        {loading ? <p>Loading CRM data...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <div className="timeline">
          {interactions.map((item) => {
            const hcp = hcps.find((entry) => entry.id === item.hcp_id);
            return (
              <article key={item.id} className="timeline-card">
                <div className="timeline-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{hcp ? hcp.full_name : `HCP ${item.hcp_id}`}</p>
                  </div>
                  <span>{item.interaction_date}</span>
                </div>
                <p>{item.summary}</p>
                <div className="meta">
                  <span>{item.channel}</span>
                  <span>{item.sentiment}</span>
                  <span>
                    {item.products_discussed.join(", ") || "No products tagged"}
                  </span>
                </div>
                <strong>Next action:</strong>
                <p>{item.next_action || "No next action recorded."}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;
