from prometheus_client import Gauge, Counter, Histogram

active_ws_connections = Gauge(
    "ws_active_connections", "Number of active websocket connections", ["namespace"]
)
ws_messages_received = Counter(
    "ws_messages_received_total",
    "Total websocket messages received",
    ["namespace", "event"],
)
ws_message_processing_seconds = Histogram(
    "ws_message_processing_seconds",
    "WebSocket message processing time",
    ["namespace", "event"],
)
