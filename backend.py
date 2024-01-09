from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import logging 
import chess
 
class Game:
    def __init__(self) -> None:
        self.buffered_move = None
        self.board = chess.Board()

def get_game(games, id):
    app.logger.info(f"Called get game with {id}")
    if id not in games:
        games[id] = Game()
    return games[id]

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

games = {}
buffered_move = None

@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('update_chessboard')
def update_chessboard(data):
    global games
    game_id = data["game_id"]
    game = get_game(games, game_id)
    emit('draw_chessboard', board_to_array(game.board))

@socketio.on('reset_board')
def reset_board(data):
    global games
    game_id = data["game_id"]
    game = get_game(games, game_id)
    emit('draw_chessboard', board_to_array(game.board))

@socketio.on('click_board')
def click_board_handler(data):
    app.logger.info(f"clicked {data}")
    square = index_to_move(data["square"])

    global games
    game_id = data["game_id"]
    game = get_game(games, game_id)
    
    if game.buffered_move is None:
        game.buffered_move = square
    else:
        try:
            game.board.push_uci(f"{game.buffered_move}{square}") 
            app.logger.info(f"Made move {game.buffered_move}{square}")
        except: 
            pass 
        finally:
            game.buffered_move = None
            emit('draw_chessboard', board_to_array(game.board))

if __name__ == '__main__':
    socketio.run(app, debug=True)
