var socket = io.connect('http://localhost:8080');

let color;
let turn = false;

let tableau = tableFixed;

socket.on('color', function (colorStart) {

    color = colorStart;
    setLineColor(color);

})
socket.on('turn', function(playerTurn){
    turn = playerTurn;
})
socket.on('reset', function(resetValue){
    if (color === 'red'){
        turn = true;
    } else {
        turn = false;
    }
    tableau = tableFixed;
    setTable(tableau);
    setLineColor(color);
})


let idBlocked = [];

const checkWin = colorWin => {

    let winningColor = 'blank';
    let tableChoice = $('#choice');

    // horizontal
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
            if (tableau[i][j].value !== 'white' && tableau[i][j].value === tableau[i][j + 1].value && tableau[i][j].value === tableau[i][j + 2].value && tableau[i][j].value === tableau[i][j + 3].value) {
                winningColor =  colorWin;
            }
        }
    }
    // vertical
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 7; j++) {
            if (tableau[i][j].value !== 'white' && tableau[i][j].value === tableau[i + 1][j].value && tableau[i][j].value === tableau[i + 2][j].value && tableau[i][j].value === tableau[i + 3][j].value) {
                winningColor =  colorWin;
            }
        }
    }
    //diagonale droite
    for (let i = 5; i >= 3; i--) {
        for (let j = 0; j < 4; j++) {
            if (tableau[i][j].value !== 'white' && tableau[i][j].value === tableau[i - 1][j + 1].value && tableau[i][j].value === tableau[i - 2][j + 2].value && tableau[i][j].value === tableau[i - 3][j + 3].value) {
                winningColor = colorWin;
            }
        }
    }
    //diagonale gauche
    for (let i = 5; i >= 3; i--) {
        for (let j = 6; j >= 3; j--) {
            if (tableau[i][j].value !== 'white' && tableau[i][j].value === tableau[i - 1][j - 1].value && tableau[i][j].value === tableau[i - 2][j - 2].value && tableau[i][j].value === tableau[i - 3][j - 3].value) {
                winningColor = colorWin;
            }
        }
    }

    if (winningColor !== 'blank') {
        tableChoice.before('<div id="winning"><p class="'+ winningColor + '">Victoire de ' + winningColor + '</p></div>');
        tableChoice.remove();
    }

    if (idBlocked.length === 7) {
        tableChoice.before('<div id="winning"><p>Match Nul</p></div>');
        tableChoice.remove();
    }

}

const setTable = tableau => {
    $('#table').children().remove();
    for (let i = 0; i < tableau.length; i++) {

        let colortest = [];

        for (let j = 0; j < 7; j++) {
            colortest[j] = tableau[i][j].value;
        }

        $('#table').append('<tr>' +
            '<td><i class="fas fa-circle ' + colortest[0] + '"></i></td>' +
            '<td><i class="fas fa-circle ' + colortest[1] + '"></i></td>' +
            '<td><i class="fas fa-circle ' + colortest[2] + '"></i></td>' +
            '<td><i class="fas fa-circle ' + colortest[3] + '"></i></td>' +
            '<td><i class="fas fa-circle ' + colortest[4] + '"></i></td>' +
            '<td><i class="fas fa-circle ' + colortest[5] + '"></i></td>' +
            '<td><i class="fas fa-circle ' + colortest[6] + '"></i></td>' +
            '</tr>')
    }
}


const setLineColor = setColor => {

    $('#choice').children().remove();

    if(turn){
        $('#choice').append('<tr><td><i class="fas fa-circle ' + setColor + '" id="0"></i></td>\n' +
            '                <td><i class="fas fa-circle ' + setColor + '" id="1"></i></td>\n' +
            '                <td><i class="fas fa-circle ' + setColor + '" id="2"></i></td>\n' +
            '                <td><i class="fas fa-circle ' + setColor + '" id="3"></i></td>\n' +
            '                <td><i class="fas fa-circle ' + setColor + '" id="4"></i></td>\n' +
            '                <td><i class="fas fa-circle ' + setColor + '" id="5"></i></td>\n' +
            '                <td><i class="fas fa-circle ' + setColor + '" id="6"></i></td></tr>');


        for (let j = 0; j < idBlocked.length; j++) {
            $('#' + idBlocked[j] + ' ').removeClass('orange red').addClass('grey disable');
        }


        $('#choice .fas').on('click', event => {

            $('#choice .fas').addClass('disable');

            let $id = $(event.currentTarget).attr('id');

            const heights = ['136px', '222px', '308px', '394px', '480px', '566px'];

            let i;

            for (i = 5; i >= 0; i--) {
                if (tableau[i][$id].value === 'white') {
                    tableau[i][$id].value = color;
                    if (i === 0) {
                        idBlocked.push($id);
                    }
                    break;
                }
            }


            $(event.currentTarget).animate({top: heights[i], left: '1px'}, 700, function () {

                $('#choice .fas').removeClass('disable');

                turn = false;

                setTable(tableau);
                setLineColor(color);

                socket.emit('turn', true);
                socket.emit('message', tableau, idBlocked);

                checkWin(color);

            });


        })
    } else {
        $('#choice').append('<tr><td colspan="7">attente joueur</td></tr>');
    }

}

setTable(tableau);
setLineColor(color);

socket.on('message', function (message, blockedTable) {
    tableau = message;
    idBlocked = blockedTable;

    let testColorWin;

    if (color === 'red') {
        testColorWin = 'orange';
    } else {
        testColorWin = 'red';
    }

    setTable(tableau);
    setLineColor(color);

    checkWin(testColorWin);
})
