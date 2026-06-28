import streamlit as st
from langgraph_backened import chatbot
from langchain_core.messages import HumanMessage
import uuid

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="LangGraph Chatbot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Hide default Streamlit chrome */
    #MainMenu, footer, header {visibility: hidden;}

    /* App background */
    .stApp { background-color: #0f1117; }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1d27 0%, #12141e 100%);
        border-right: 1px solid #2e3250;
    }
    [data-testid="stSidebar"] * { color: #e0e0e0 !important; }

    /* Chat messages */
    [data-testid="stChatMessage"] {
        border-radius: 12px;
        margin-bottom: 8px;
        padding: 4px 8px;
    }
    [data-testid="stChatMessage"][data-testid*="user"] {
        background-color: #1e2235;
    }

    /* Input box */
    [data-testid="stChatInput"] textarea {
        background-color: #1e2235 !important;
        border: 1px solid #3a3f5c !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        font-size: 15px !important;
    }
    [data-testid="stChatInput"] textarea:focus {
        border-color: #6c63ff !important;
        box-shadow: 0 0 0 2px rgba(108,99,255,0.25) !important;
    }

    /* Buttons */
    .stButton > button {
        width: 100%;
        border-radius: 8px;
        background: linear-gradient(135deg, #6c63ff, #4a90d9);
        color: white;
        border: none;
        padding: 8px 16px;
        font-weight: 600;
        transition: opacity 0.2s;
    }
    .stButton > button:hover { opacity: 0.85; }

    /* Title gradient */
    .chat-title {
        background: linear-gradient(135deg, #6c63ff, #4a90d9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 2rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: 0.2rem;
    }
    .chat-subtitle {
        color: #7a7f9a;
        font-size: 0.85rem;
        text-align: center;
        margin-bottom: 1.5rem;
    }

    /* Stats badges */
    .badge {
        display: inline-block;
        background: #1e2235;
        border: 1px solid #3a3f5c;
        border-radius: 20px;
        padding: 3px 12px;
        font-size: 0.75rem;
        color: #9a9fc4;
        margin: 2px;
    }

    /* Divider */
    hr { border-color: #2e3250 !important; }
</style>
""", unsafe_allow_html=True)

# ── Session state ─────────────────────────────────────────────────────────────
if 'message_history' not in st.session_state:
    st.session_state['message_history'] = []
if 'thread_id' not in st.session_state:
    st.session_state['thread_id'] = 'thread-1'
if 'message_count' not in st.session_state:
    st.session_state['message_count'] = 0

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🤖 LangGraph Chatbot")
    st.markdown("---")

    st.markdown("### ⚙️ Settings")
    model_info = st.info("**Model:** llama3.2 (Ollama)\n\n**Mode:** Local · No API key needed")

    st.markdown("---")
    st.markdown("### 📊 Session Stats")
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Messages", st.session_state['message_count'])
    with col2:
        st.metric("Thread", st.session_state['thread_id'])

    st.markdown("---")
    st.markdown("### 🔧 Actions")
    if st.button("🗑️ Clear Chat"):
        st.session_state['message_history'] = []
        st.session_state['message_count'] = 0
        st.session_state['thread_id'] = f"thread-{uuid.uuid4().hex[:6]}"
        st.rerun()

    if st.button("🔄 New Thread"):
        st.session_state['message_history'] = []
        st.session_state['message_count'] = 0
        st.session_state['thread_id'] = f"thread-{uuid.uuid4().hex[:6]}"
        st.rerun()

    st.markdown("---")
    st.markdown(
        "<div style='color:#555;font-size:0.75rem;text-align:center'>Powered by LangGraph + Ollama</div>",
        unsafe_allow_html=True,
    )

# ── Main area ─────────────────────────────────────────────────────────────────
st.markdown('<div class="chat-title">🤖 LangGraph Chatbot</div>', unsafe_allow_html=True)
st.markdown('<div class="chat-subtitle">Powered by Llama 3.2 · Running locally via Ollama</div>', unsafe_allow_html=True)

# Render history
for message in st.session_state['message_history']:
    with st.chat_message(message['role'], avatar="🧑" if message['role'] == 'user' else "🤖"):
        st.markdown(message['content'])

# ── Input & response ──────────────────────────────────────────────────────────
user_input = st.chat_input("Ask me anything…")

if user_input:
    CONFIG = {'configurable': {'thread_id': st.session_state['thread_id']}}

    st.session_state['message_history'].append({'role': 'user', 'content': user_input})
    st.session_state['message_count'] += 1
    with st.chat_message('user', avatar="🧑"):
        st.markdown(user_input)

    with st.chat_message('assistant', avatar="🤖"):
        with st.spinner("Thinking…"):
            response = chatbot.invoke(
                {'messages': [HumanMessage(content=user_input)]},
                config=CONFIG,
            )
            ai_message = response['messages'][-1].content

        st.markdown(ai_message)

    st.session_state['message_history'].append({'role': 'assistant', 'content': ai_message})
    st.session_state['message_count'] += 1
    st.rerun()
