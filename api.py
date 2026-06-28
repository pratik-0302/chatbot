import io
import json
import uuid
from datetime import datetime

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage
from pydantic import BaseModel

from langgraph_backened import chatbot

app = FastAPI(title="Atlas AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_threads: dict[str, dict] = {}
_thread_files: dict[str, dict] = {}   # thread_id -> {name, text}


def _extract_text(filename: str, content: bytes) -> str:
    fname = filename.lower()
    if fname.endswith(".pdf"):
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n\n".join(page.extract_text() or "" for page in reader.pages)
    return content.decode("utf-8", errors="ignore")


def _get_messages(thread_id: str) -> list[dict]:
    try:
        state = chatbot.get_state(config={"configurable": {"thread_id": thread_id}})
        return [
            {
                "id": str(i),
                "role": "user" if isinstance(m, HumanMessage) else "assistant",
                "content": m.content,
            }
            for i, m in enumerate(state.values.get("messages", []))
        ]
    except Exception:
        return []


class ChatRequest(BaseModel):
    message: str
    thread_id: str


class RenameRequest(BaseModel):
    name: str


@app.get("/api/threads")
def list_threads():
    result = []
    for tid, meta in _threads.items():
        msgs = _get_messages(tid)
        preview = next(
            (m["content"][:120] for m in reversed(msgs) if m["role"] == "assistant"), ""
        )
        result.append({
            "id": tid,
            "name": meta["name"],
            "created_at": meta["created_at"],
            "preview": preview,
            "message_count": len(msgs),
            "has_file": tid in _thread_files,
        })
    return sorted(result, key=lambda x: x["created_at"], reverse=True)


@app.post("/api/threads")
def create_thread():
    tid = str(uuid.uuid4())
    _threads[tid] = {"name": "New Chat", "created_at": datetime.now().isoformat()}
    return {"id": tid, **_threads[tid]}


@app.patch("/api/threads/{thread_id}")
def rename_thread(thread_id: str, req: RenameRequest):
    if thread_id not in _threads:
        raise HTTPException(404, "Thread not found")
    _threads[thread_id]["name"] = req.name
    return {"id": thread_id, "name": req.name}


@app.delete("/api/threads/{thread_id}")
def delete_thread(thread_id: str):
    _threads.pop(thread_id, None)
    _thread_files.pop(thread_id, None)
    return {"ok": True}


@app.get("/api/threads/{thread_id}/messages")
def get_messages(thread_id: str):
    return _get_messages(thread_id)


@app.post("/api/upload")
async def upload_file(thread_id: str = Form(...), file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or "file"
    text = _extract_text(filename, content)[:60_000]   # cap at 60k chars
    _thread_files[thread_id] = {"name": filename, "text": text}
    return {"name": filename, "size": len(content), "chars": len(text)}


@app.delete("/api/threads/{thread_id}/file")
def remove_file(thread_id: str):
    _thread_files.pop(thread_id, None)
    return {"ok": True}


@app.post("/api/chat/stream")
def stream_chat(req: ChatRequest):
    if req.thread_id not in _threads:
        _threads[req.thread_id] = {
            "name": "New Chat",
            "created_at": datetime.now().isoformat(),
        }

    def generate():
        config = {"configurable": {"thread_id": req.thread_id}}

        # Inject file context when a file is attached to this thread
        user_message = req.message
        if req.thread_id in _thread_files:
            f = _thread_files[req.thread_id]
            user_message = (
                f"The user has uploaded a file named '{f['name']}'.\n\n"
                f"File contents:\n```\n{f['text']}\n```\n\n"
                f"User question: {req.message}"
            )

        full = ""
        try:
            for chunk, _ in chatbot.stream(
                {"messages": [HumanMessage(content=user_message)]},
                config=config,
                stream_mode="messages",
            ):
                content = getattr(chunk, "content", "")
                if content:
                    full += content
                    yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        if _threads[req.thread_id]["name"] == "New Chat" and req.message:
            _threads[req.thread_id]["name"] = (
                req.message[:45] + "…" if len(req.message) > 45 else req.message
            )

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
