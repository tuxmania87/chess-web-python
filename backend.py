from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import logging 
import chess
 
def board_to_array(board):
    bb = []
    bb_row = []
    for i in range(64):
        piece = board.piece_at(i)
        if piece is None:
            bb_row.append('')
        else:
            bb_row.append(piece.symbol())
        if len(bb_row) == 8:
            bb.append(bb_row)
            bb_row = []
    bb.reverse()
    return bb

def index_to_move(index):
    reverted_index = 63-index

    file = 7 - chess.square_file(reverted_index)
    rank = chess.square_rank(reverted_index)

    corrected_square = chess.square_name(chess.square(file, rank))

    return corrected_square

app = Flask(__name__)
socketio = SocketIO(app)

board = chess.Board()

buffered_move = None

@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('update_chessboard')
def update_chessboard():
    global board
    emit('draw_chessboard', board_to_array(board))

@socketio.on('reset_board')
def reset_board():
    global board
    board = chess.Board()
    emit('draw_chessboard', board_to_array(board))

@socketio.on('click_board')
def click_board_handler(data):
    app.logger.info(f"clicked {data}")
    square = index_to_move(data["square"])

    global buffered_move
    global board

    if buffered_move is None:
        buffered_move = square
    else:
        try:
            board.push_uci(f"{buffered_move}{square}") 
            app.logger.info(f"Made move {buffered_move}{square}")
        except: 
            pass 
        finally:
            buffered_move = None
            emit('draw_chessboard', board_to_array(board))

@socketio.on('testcommand')
def click_handler(data):
    logging.info("clicked")
    emit("click_response", {'click_response': 'foobar'}, broadcast=True)    

@socketio.on('move')
def handle_move(data):
    from_square = data.get('fromSquare')
    to_square = data.get('toSquare')

    # Validate the move
    is_valid_move = validate_chess_move(from_square, to_square)

    if is_valid_move:
        # Update the game state
        # Emit the updated state to all connected clients
        emit('update_board', {'fromSquare': from_square, 'toSquare': to_square}, broadcast=True)

def validate_chess_move(from_square, to_square):
    # Implement your move validation logic (e.g., check if the move is legal)
    # For simplicity, this example always returns True
    return True

if __name__ == '__main__':
    socketio.run(app, debug=True)
