//Created by Karsten Hrasna, email: Karsten_Hrasna@student.uml.edu
$(document).ready(function () {

    var widthtotal;
    var width;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_"; // used to randomly generate tiles
    var remaining = 0;
    var totalscore = 0;
    var currentscore = 0;
    var wordDisplay = '';

    for (var i = 0; i < 27; i++) {
        remaining += ScrabbleTiles[chars[i]]["number-remaining"]; //total tile count
    }
    $('#remainder').html('Total remaining tiles: ' + remaining);
    process();

    $('input[type="submit"]').on('click', function () {
        sub(); //submission process
    });

    $('input[value="Restart"]').on('click', function () {
        location.reload(); //restart everything
    });

    $(window).resize(function () {
        tileResize();
    });

    function tileResize() { //resizes everything when window size changes
        widthtotal = $('#holder').width();
        width = widthtotal / 9;
        $('#tiles').css('width', widthtotal);
        $('#tiles').css('height', $('#holder').height());
        $('#tiles').css('top', $('#holder').position().top);
        $('#tiles').css('left', $('#holder').position().left);
        for (var i = 0; i < 7; i++) {
            $('#tile' + i).css('width', width);
            $('#tile' + i).css('height', width);
            $('#tile' + i).css('padding-right', width / 5);
            if ($('#tile' + i).parent().attr('class') != 'col') {
                $('#tile' + i).css('left', width / 4);
                $('#tile' + i).css('top', width / 2);
            }
        }
        $('.col').css('height', width);
        $('.col').css('width', width);
    }

    function process() { //sets up the main page

        $('#tiles').empty();
        $('#board').empty();

        widthtotal = $('#holder').width();
        width = widthtotal / 9;
        createBoard(width);
        generateTiles();
        updateTileCount();

    }

    function currentWord() { //validates the letters in the scrabble line
        wordDisplay = '';
        var valid = true;
        var endFound = false;
        var startFound = false;
        var p = false;
        for (var i = 0; i < 15; i++) {
            var l = Array.from($('#container').children()[i].children);
            if ((l.length == 0 || (l.length == 1 && $(l[0]).is('p'))) && startFound == true) {
                endFound = true;
                console.log('end found1');
            }
            for (var x = 0; x < l.length; x++) {
                if (startFound == false) {
                    if ($(l[x]).is('img') && endFound == false) {
                        startFound = true;
                        console.log('found start'); //first letter found, there can be no spaces until end is found
                        wordDisplay += ($(l[x]).attr('class').split(' ')[1]);
                    }
                } else if (endFound == false) {
                    if ($(l[x]).is('p')) {
                        console.log('is p');
                    } else if ((!$(l[x]).is('img'))) {
                        endFound = true;
                        console.log('end found2');
                    } else if ($(l[x]).is('img')) {
                        console.log('middle tile found'); //after end is found, if another letter is found, then input is invalid
                        wordDisplay += ($(l[x]).attr('class').split(' ')[1]);
                    }
                } else if (endFound == true && $(l[x]).is('img')) {
                    console.log('gap makes word invalid');
                    valid = false;
                    wordDisplay += ' ';
                }
            }
        }
        $('#word').html('Your word: ' + wordDisplay); //update current input display
        if (valid) {
            $('#word').css('color', 'black');
        } else {
            $('#word').html('No spaces allowed between letters');
            $('#word').css('color', 'red'); //error message
        }
        return valid;
    }

    function refreshDrops() { //updates the droppable items each time they are altered
        $('.droppable').droppable({
            drop: function (event, ui) {
                if ($(this).attr('class').split(' ')[0] == 'col' || $(this).is('p')) {
                    ui.draggable.css('position', 'absolute');
                    ui.draggable.css("top", 0); //add tile to div slot
                    ui.draggable.css("left", 0);
                    if (!$(this).is('p')) {
                        $(this).append(ui.draggable);
                    } else {
                        $(this).parent().append(ui.draggable); //if p is on top, jump to parent to add to div
                    }
                    currentWord();
                } else if ($(this).attr('id') == 'tiles') { //if tiles are being dragged back to the tile holder
                    ui.draggable.css('position', 'relative');
                    ui.draggable.css('width', width);
                    ui.draggable.css('height', width);
                    ui.draggable.css('padding-right', width / 5);
                    ui.draggable.css('left', width / 4);
                    ui.draggable.css('top', width / 2);
                    ($(this).append(ui.draggable));
                    currentWord();
                }

            },

            accept: function () {
                if (((($(this).is('div') && ($(this).children().length == 0)) || $(this).is('p') && $(this).parent().children().length == 1)) ||
                    $(this).attr('id') == 'tiles') {
                    return true; //only accepts one tile per block
                } else {
                    return false;
                }
            },
        });
        $('.draggable').draggable({
            revert: function (event, ui) {
                return !event;
            },
        });
    }

    function sub() { //read through tiles in board and determine score
        currentscore = 0;
        var dw = false;
        var dl = false;
        if (currentWord()) { //if input is valid
            for (var i = 0; i < 15; i++) { //iterates through each div in line

                var l = Array.from($('#container').children()[i].children);

                for (var x = 0; x < l.length; x++) {
                    if ($(l[x]).is('img')) { //find img in div and subtract count
                        var letter = $(l[x]).attr('class').split(' ')[1];
                        ScrabbleTiles[letter]["number-remaining"]--;
                        remaining--;
                        $('#remainder').html('Total remaining tiles: ' + remaining);
                        updateTileCount();
                    }
                }
            }
            var elems = Array.from($('#container').find('img'));
            var length = elems.length;
            for (var o = 0; o < length; o++) {
                var id = $(elems[o]).attr('id');
                if (chars.length >= 1) { //add tiles back to tile holder
                    var ch = (Math.floor(Math.random() * chars.length));
                    var t = chars[ch];
                    while (ScrabbleTiles[t]["number-remaining"] == 0) { //if no more letters, find new letter
                        chars = chars.replace(t, '');
                        ch = (Math.floor(Math.random() * chars.length));
                        t = chars[ch];
                    }

                    if (t == '_') {
                        var a = $('<img src="graphics_data/Scrabble_Tile_Blank.jpg" id="' + id + '" class="draggable ' + t + '">');
                    } else {
                        var a = $('<img src="graphics_data/Scrabble_Tile_' + t + '.jpg" id="' + id + '" class="draggable ' + t + '">');
                    }
                    a.css('width', width);
                    a.css('height', width);
                    a.css('padding-right', width / 5);
                    a.css('left', width / 4);
                    a.css('top', width / 2);
                    a.css('z-index', 10000 + i);
                    $('#tiles').append(a);
                    refreshDrops(); //update droppable properties on the new tiles
                }
                var letter = $(elems[o]).attr('class').split(' ')[1];
                var boxtype = $(elems[o]).parent().attr('class').split(' ')[2]
                if (boxtype == 'dl') { //if double letter
                    dl = true;
                }
                if (boxtype == 'dw') { //double word
                    dw = true;
                }
                if (dl) {
                    currentscore += 2 * (ScrabbleTiles[letter]["value"]); //multiply letter val by 2
                    dl = false;
                } else {
                    currentscore += (ScrabbleTiles[letter]["value"]);
                }
            }
            if (dw) {
                currentscore *= 2; //multiply word value by 2
            }
            totalscore += currentscore;
            $('#score').html('Score: ' + totalscore);
            $('#container').find('img').remove();
        } else {

        }
    }

    function generateTiles() { //creates the 7 tiles
        for (var i = 0; i < 7; i++) {

            if (chars.length >= 1) {
                var ch = (Math.floor(Math.random() * chars.length));
                var t = chars[ch];
                while (ScrabbleTiles[t]["number-remaining"] == 0) { //if no more tiles of a certain type, remove from list of chars
                    chars = chars.replace(t, '');
                    ch = (Math.floor(Math.random() * chars.length));
                    t = chars[ch];
                }

                if (t == '_') {
                    var a = $('<img src="graphics_data/Scrabble_Tile_Blank.jpg" id="tile' + i + '" class="draggable ' + t + '">');
                } else {
                    var a = $('<img src="graphics_data/Scrabble_Tile_' + t + '.jpg" id="tile' + i + '" class="draggable ' + t + '">');
                }

                $('#tiles').css('position', 'absolute');
                $('#tiles').css('top', $('#holder').position().top);
                $('#tiles').css('left', $('#holder').position().left);
                $('#tiles').css('width', widthtotal);
                $('#tiles').css('height', $('#holder').height());
                $('#tiles').append(a);
                $('#tile' + i).css('position', 'relative');
                $('#tile' + i).css('width', width);
                $('#tile' + i).css('height', width);
                $('#tile' + i).css('padding-right', width / 5);
                $('#tile' + i).css('left', width / 4);
                $('#tile' + i).css('top', width / 2);
                $('#tile' + i).css('z-index', 10000 + i)
            }
        }

        refreshDrops();
    }

    function updateTileCount() { //displays total tile counts for each letter
        for (var i = 0; i < chars.length; i++) {
            var c = chars[i];
            $('#' + c).html('<p>Remaining ' + c + '\'s: ' + ScrabbleTiles[c]["number-remaining"] + '</p>');
        }

    }

    function createBoard() { //creates the divs which act as a scrabble board line
        for (var col = 0; col < 15; col++) {
            var d = $('<div class="col droppable"></td>');
            d.css('height', width);
            d.css('width', width);
            d.css('position', 'relative');
            d.css('float', 'left');
            d.css('border', '1px solid black');
            d.css('text-align', 'center');

            if (col == 2 || col == 12) {
                d.css('background-color', 'red'); //set the double word divs
                d.html('<p class="droppable dw">DOUBLE WORD SCORE</p>');
                d.addClass('dw');
            }
            if (col == 6 || col == 8) {
                d.css('background-color', 'cyan');
                d.html('<p class="droppable">DOUBLE LETTER SCORE</p>'); //set the double letter divs
                d.addClass('dl');

            }
            $('#container').append(d);
        }
    }

    function containsClass(obj, c) {
        var list = obj.attr('class').split(' '); //iterate through list of classes to find a single class
        for (var x = 0; x < list.length; x++) {
            if (list[x] == c) {
                return true;
            }
        }
        return false;
    }
})