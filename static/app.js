document.addEventListener('DOMContentLoaded', function () {
    const chessboard = document.getElementById('chessboard');

    const socket = io();


    // Function to handle square click
    function handleSquareClick(event) {
        const clickedSquare = event.target;
        const squareCoordinates = getSquareCoordinates(clickedSquare);
        
        // You can now use squareCoordinates to determine which square was clicked
        console.log('Clicked square:', squareCoordinates);
        socket.emit('click_board', { 'square': squareCoordinates})
    }

    // Function to get square coordinates (row and column)
    function getSquareCoordinates(square) {
        const chessboardRow = square.parentNode;
        const row = Array.from(chessboardRow.children).indexOf(square);
        
        return row;
    }

    
    // old logic


    
    function click_handler() {
        socket.emit('testcommand', {"content": "x"});
    }

    //const board = new Chess();

    // Example function to handle a move
    function makeMove(fromSquare, toSquare) {
        // Validate the move on the client (additional validation)
        if (!board.move({ from: fromSquare, to: toSquare })) {
            console.log('Invalid move');
            return;
        }

        // Send the move to the server using WebSockets
        socket.emit('move', { fromSquare, toSquare });
    }

    // Your chessboard UI code and event listeners go here

    // Listen for updates from the server
    socket.on('update_board', (data) => {
        // Update the board and UI based on the received data
        board.move({ from: data.fromSquare, to: data.toSquare });
        // Update the UI or perform any other necessary actions
    });

    socket.on('click_response', (data) => {
        alert(data);
    });

    socket.on('draw_chessboard', (data) => {
        renderChessboard(data)
    });

    // Function to render the chessboard
    function renderChessboard(chessboard) {
        const chessboardElement = document.getElementById('chessboard');
        chessboardElement.innerHTML =''


        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.textContent = chessboard[row][col];

                // Apply dark or light class based on the square position
                square.className = (row + col) % 2 === 0 ? 'chess-square light' : 'chess-square dark';

                chessboardElement.appendChild(square);
            }
        }
        // Attach click event listener to each chess square
        const chessSquares = document.querySelectorAll('.chess-square');
        chessSquares.forEach(square => {
            square.addEventListener('click', handleSquareClick);
        });

    }

    socket.emit('update_chessboard')

    const resetButton = document.getElementsByTagName("button")[0]
    resetButton.addEventListener('click', resetBoard);

    function resetBoard() {
        socket.emit('reset_board')
    }

});
