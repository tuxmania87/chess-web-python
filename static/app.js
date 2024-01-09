document.addEventListener('DOMContentLoaded', function () {

    function getSearchParameters() {
        var prmstr = window.location.search.substr(1);
        return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
    }
    
    function transformToAssocArray( prmstr ) {
        var params = {};
        var prmarr = prmstr.split("&");
        for ( var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = tmparr[1];
        }
        return params;
    }

    const chessboard = document.getElementById('chessboard');

    const socket = io();


    // Function to handle square click
    function handleSquareClick(event) {
        const clickedSquare = event.target;
        const squareCoordinates = getSquareCoordinates(clickedSquare);
        
        // You can now use squareCoordinates to determine which square was clicked
        console.log('Clicked square:', squareCoordinates);
        var game_id = getSearchParameters()["game_id"]
        socket.emit('click_board', { 'square': squareCoordinates, 'game_id': game_id})
    }

    // Function to get square coordinates (row and column)
    function getSquareCoordinates(square) {
        const chessboardRow = square.parentNode;
        const row = Array.from(chessboardRow.children).indexOf(square);
        
        return row;
    }

    
    // old logic


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
    var game_id = getSearchParameters()["game_id"]
    console.log(getSearchParameters())
    socket.emit('update_chessboard', { 'game_id' : game_id})

    const resetButton = document.getElementsByTagName("button")[0]
    resetButton.addEventListener('click', resetBoard);

    function resetBoard() {
        var game_id = getSearchParameters()["game_id"]
        socket.emit('reset_board',{ 'game_id' : game_id } )
    }

});
