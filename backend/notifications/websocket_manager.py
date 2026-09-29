import asyncio
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger("BuildSureWebSockets")

class ConnectionManager:
    """
    WebSocket Connection Manager for BuildSure AI Real-Time Alert Pipeline.
    Manages active client WebSocket connections grouped by project_id.
    """
    def __init__(self):
        # Maps project_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Global connection list (listeners to all projects)
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, project_id: int):
        """Accepts incoming WebSocket connection and registers client under project_id"""
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)
        self.global_connections.append(websocket)
        logger.info(f"WebSocket client connected to Project #{project_id}. Total active: {len(self.active_connections[project_id])}")

    def disconnect(self, websocket: WebSocket, project_id: int):
        """Removes client connection on disconnect"""
        if project_id in self.active_connections:
            if websocket in self.active_connections[project_id]:
                self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        if websocket in self.global_connections:
            self.global_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected from Project #{project_id}.")

    async def broadcast_to_project(self, project_id: int, message: Dict[str, Any]):
        """Pushes zero-latency JSON alert message to all connected clients for a project"""
        listeners = self.active_connections.get(project_id, [])
        disconnected = []
        for connection in listeners:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error pushing WebSocket message: {e}")
                disconnected.append(connection)

        for dead_conn in disconnected:
            self.disconnect(dead_conn, project_id)

    async def broadcast_global(self, message: Dict[str, Any]):
        """Pushes alert message to all global connected WebSocket clients across all projects"""
        disconnected = []
        for connection in self.global_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                disconnected.append(connection)
        for dead_conn in disconnected:
            if dead_conn in self.global_connections:
                self.global_connections.remove(dead_conn)

    def sync_broadcast_to_project(self, project_id: int, message: Dict[str, Any]):
        """Helper to call broadcast_to_project synchronously from sync routes/events"""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(self.broadcast_to_project(project_id, message))
                asyncio.create_task(self.broadcast_global(message))
            else:
                loop.run_until_complete(self.broadcast_to_project(project_id, message))
        except Exception:
            # Fallback if no event loop running
            asyncio.run(self.broadcast_to_project(project_id, message))

# Global ConnectionManager instance
ws_manager = ConnectionManager()
