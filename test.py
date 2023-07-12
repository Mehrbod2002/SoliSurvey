# pip install websocket-client

import websocket

def on_open(ws):
    print("WebSocket connection established.")

def on_message(ws, message): # =>>>> Data inja dryaft mishe 
    print("Received data:", message)
    
    ws.send("logs") # ====> Mesala mishe logs ferstad ta dar marhele baed behom list file haro bede
    

def on_error(ws, error):
    print("WebSocket error:", error)

def on_close(ws):
    print("WebSocket connection closed.")

websocket.enableTrace(True)
ws = websocket.WebSocketApp("ws://192.168.2.1:5001",
                            on_open=on_open,
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.run_forever()
