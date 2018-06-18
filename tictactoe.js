

const symbols = {'X' : 1, 'O' : 0};

var initGame = function(){
    var matrix = [];
    for(var i=0; i< 3; i++) {
        matrix[i] = [];
        for(var j=0; j < 3; j++) {
            matrix[i][j] = -99;
        }
    }

    return matrix;
}

var makeMove = function(x, y, symbol, matrix) {
    matrix[y][x] = symbol;
    return matrix;
}

var isWin = function(matrix) {
    var winner = -1; // no winner yet
    var count = 0;
    for(var i=0; i< 3; i++) {
        var rowCount = 0;
        var colCount = 0;
        for(var j=0; j<3; j++) {
            rowCount += matrix[i][j];
            colCount += matrix[j][i];
            if(matrix[i][j] !== -99) {
                count++;
            }
        }

        if(rowCount == 3 || colCount == 3) {
            winner = 1;
        } else if(rowCount == 0 || colCount == 0) {
            winner = 0;
        }
    }

    var d1Sum = matrix[0][0] + matrix[1][1] + matrix[2][2];
    var d2Sum = matrix[2][0] + matrix[1][1] + matrix[0][2];
    if(Object.is((d1Sum) % 3, 0)) {
        winner = matrix[0][0];
    }
    if(Object.is((d2Sum) % 3, 0)) {
        winner = matrix[2][0];
    }

    if(count == 9 && winner == -1) {
        winner = -99; //game drawn
    }

    return winner;

}

var rand = function() {
    return Math.random().toString(36).substr(2);
};

var getUniqueToken = function() {
    return rand() + rand();
};

exports.initGame = initGame;
exports.makeMove = makeMove;
exports.isWin = isWin;
exports.getUniqueToken = getUniqueToken;
exports.symbols = symbols;