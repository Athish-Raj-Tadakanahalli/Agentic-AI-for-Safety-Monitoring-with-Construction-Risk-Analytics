import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.notifications.websocket_manager import ws_manager

logger = logging.getLogger("BuildSureWebSocketRouter")

router = APIRouter(tags=["Real-Time WebSockets Alerts"])

@router.websocket("/ws/alerts/{project_id}")
async def websocket_alerts_endpoint(websocket: WebSocket, project_id: int):
    """
    Real-time WebSocket connection endpoint for instant emergency alerts.
    Pushes zero-latency PPE breaches, site hazards, and emergency escalations.
    """
    await ws_manager.connect(websocket, project_id)
    try:
        # Send initial connection handshake confirmation
        await websocket.send_json({
            "type": "SYSTEM_CONNECTED",
            "project_id": project_id,
            "message": f"Connected to BuildSure AI Real-Time Alert Stream for Project #{project_id}."
        })

        # Keep-alive loop listening for client messages or ping/pong
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, project_id)
        logger.info(f"WebSocket client disconnected from Project #{project_id}.")
    except Exception as e:
        ws_manager.disconnect(websocket, project_id)
        logger.warning(f"WebSocket connection error on Project #{project_id}: {e}")
