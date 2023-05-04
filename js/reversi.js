var reversi = {
    
    game: null,
    score: null,
    rows: 8,
    cols: 8,
    grid: [],
    states: {
        'blank': { 'id' : 0, 'color': 'white' },
        'white': { 'id' : 1, 'color': 'white' },
        'black': { 'id' : 2, 'color': 'black' }
    },
    turn: null,
    
    seconds: 0,
    minutes: 0,
    hours: 0,
    timerRef: null,
    timerInt: null,
    
    init: function(gameId) {
        this.game = document.getElementById(gameId);
           
        // make sure we have a valid element selected
        if (null === this.game) {
            return;
        }
        
        // append .reversi class to the game element
        this.game.className = this.game.className + ' ' + 'reversi';
        
        // prepare and draw grid
        this.prepareGrid();
        
        // place initial items
        this.initGame();
    },
    
    initGame: function() {
        
        // the black player begins the game
        this.setTurn(this.states.black);
        
        // init placement
        this.setItemState(4, 4, this.states.white);
        this.setItemState(4, 5, this.states.black);
        this.setItemState(5, 4, this.states.black);
        this.setItemState(5, 5, this.states.white);
        
        // set initial score
        this.setScore(2, 2);
        
        //Set the timer for the new game
        this.initTimer();
        //Start the timer interval for the new game
        this.startTimer();
    },
    
    passTurn: function() {
    
        var turn = (this.turn.id === this.states.black.id) ? this.states.white : this.states.black;
        //Update who the current turn is for
        this.setTurn(turn);
    },
    
    setTurn: function(state) {
        
        this.turn = state;
        
        var isBlack = (state.id === this.states.black.id);
        //Update which score is underlined
        this.score.black.elem.style.textDecoration = isBlack ? 'underline': '';
        this.score.white.elem.style.textDecoration = isBlack ? '': 'underline';
    },
    
    initItemState: function(elem) {
        
        return {
            'state': this.states.blank,
            'elem': elem
        };
    },
    
    isVisible: function(state) {
        
        return (state.id === this.states.white.id || state.id === this.states.black.id);
    },
    
    isVisibleItem: function(row, col) {
        
        return this.isVisible(this.grid[row][col].state);
    },
    
    isValidPosition: function(row, col) {
        
        return (row >= 1 && row <= this.rows) && (col >= 1 && col <= this.cols);
    },
    
    setItemState: function(row, col, state) {

        if ( ! this.isValidPosition(row, col)) {
            
            return;
        }

        this.grid[row][col].state = state;
        this.grid[row][col].elem.style.visibility =  this.isVisible(state) ? 'visible' : 'hidden';
        this.grid[row][col].elem.style.backgroundColor = state.color;
    },
    
    prepareGrid: function() {
        
        // create table structure for grid
        var table = document.createElement('table');
        
        // apply some base styling for table
        table.setAttribute('border', 0);
        table.setAttribute('cellpadding', 0);
        table.setAttribute('cellspacing', 0);
        
        for (var i = 1; i <= this.rows; i++) {
            
            var tr = document.createElement('tr');
            
            table.appendChild(tr);
            
            this.grid[i] = [];
            
            for (var j = 1; j <= this.cols; j++) {
                
                var td = document.createElement('td');
                
                tr.appendChild(td);
                
                // bind move action to onclick event on each item
                this.bindMove(td, i, j);
                
                // we are also storing html element for better manipulation later
                this.grid[i][j] = this.initItemState(td.appendChild(document.createElement('span')));
            }
        }

        // prepare score bar
        var scoreBar = document.createElement('div'),
            scoreBlack = document.createElement('span'),
            scoreWhite = document.createElement('span');
            
        scoreBlack.className = 'score-node score-black';
        scoreWhite.className = 'score-node score-white';
        
        // append score bar items
        scoreBar.appendChild(scoreBlack);
        scoreBar.appendChild(scoreWhite);
        
        // append score bar
        this.game.appendChild(scoreBar);
        
        // set the score object
        this.score = {
            'black': { 
                'elem': scoreBlack,
                'state': 0
            },
            'white': { 
                'elem': scoreWhite,
                'state': 0
            },
        }

        // prepare the game timer
        this.timerRef = document.createElement('div');
        this.timerRef.className = 'timer-node';

        // append time bar item
        this.game.appendChild(this.timerRef);
        
        // append table
        this.game.appendChild(table);
    },
    
    recalcuteScore: function()  {
       //Check the game board to see what the state of the counters are and re calculate the score.. 
        var scoreWhite = 0,
            scoreBlack = 0;
            
        for (var i = 1; i <= this.rows; i++) {

            for (var j = 1; j <= this.cols; j++) {
                
                if (this.isValidPosition(i, j) && this.isVisibleItem(i, j)) {
                    
                    if (this.grid[i][j].state.id === this.states.black.id) {
                        
                        scoreBlack++;
                    } else {
                        
                        scoreWhite++;
                    }
                }
            }
        }
        
        this.setScore(scoreBlack, scoreWhite);
    },
    
    setScore: function(scoreBlack, scoreWhite) {
        //Set the scores for the game
        this.score.black.state = scoreBlack;
        this.score.white.state = scoreWhite;
        
        this.score.black.elem.innerHTML = '&nbsp;' + scoreBlack + '&nbsp;';
        this.score.white.elem.innerHTML = '&nbsp;' + scoreWhite + '&nbsp;';
    },
    
    isValidMove: function(row, col) {
        //Make sure the user has made a valid move.
        var current = this.turn,
            rowCheck,
            colCheck,
            toCheck = (current.id === this.states.black.id) ? this.states.white : this.states.black;
            
        if ( ! this.isValidPosition(row, col) || this.isVisibleItem(row, col)) {
            
            return false;
        }
        
        // check all eight directions
        for (var rowDir = -1; rowDir <= 1; rowDir++) {
            
            for (var colDir = -1; colDir <= 1; colDir++) {
                
                // dont check the actual position
                if (rowDir === 0 && colDir === 0) {
                    
                    continue;
                }
                
                // move to next item
                rowCheck = row + rowDir;
                colCheck = col + colDir;
                
                // were any items found ?
                var itemFound = false;
                
                // 1. look for valid items
                // 2. look for visible items
                // 3. look for items with opposite color
                while (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === toCheck.id) {
                    
                    // move to next position
                    rowCheck += rowDir;
                    colCheck += colDir;
                    
                    // item found
                    itemFound = true; 
                }
                
                // if some items were found
                if (itemFound) {

                    // now we need to check that the next item is one of ours
                    if (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === current.id) {
                        
                        // we have a valid move
                        return true;
                    }
                }
            }
        }
        
        return false;
    },
    
    canMove: function() {
        
        for (var i = 1; i <= this.rows; i++) {

            for (var j = 1; j <= this.cols; j++) {
                
                if (this.isValidMove(i, j)) {
                    
                    return true;
                }
            }
        }
        
        return false;
    },
    
    bindMove: function(elem, row, col) {
        
        var self = this;
        
        elem.onclick = function(event) {
            try {
              if (self.canMove()) {
                  
                  // if have a valid move
                  if (self.isValidMove(row, col)) {
  
                      // make the move
                      self.move(row, col);
                      
                      // check whether the other player can now move, if not, pass turn back to other player
                      if ( ! self.canMove()) {
                          
                          self.passTurn();
                          
                          // check the end of the game
                          if ( ! self.canMove()) {
  
                              self.endGame();
                          }
                      }
  
                      // in case of full grid, end the game
                      if (self.checkEnd()) {
  
                          self.endGame();
                      }
                  }
              }
            }
            catch(err) {
                //There's been an issue, show the error.
                alert("Error: " + err.message);
            }
        };
    },
    
    endGame: function() {
        //The game has ended, check who won or if it is a draw.
        var result = (this.score.black.state > this.score.white.state) 
            ? 
                1 
            : ( 
                (this.score.white.state > this.score.black.state) ? -1 : 0 
            ), message;
        
        switch (result) {
            
            case 1:  { message = 'Black wins!!!'; } break;
            case -1: { message = 'White wins!!!'; } break;
            case 0:  { message = 'It\'s a draw!!!'; } break;
        }
        
        alert(message);
        
        //Set the timer for the new game
        this.initTimer();
    },
    
    clear: function() {
        //Clear the game board 
        for (var i = 1; i <= this.rows; i++) {

            for (var j = 1; j <= this.cols; j++) {
                
                this.setItemState(i, j, this.states.blank);
            }
        }
    },
    
    reset: function() {

        // clear items
        this.clear();
        
        // reinit game
        this.initGame();
    },
    
    checkEnd: function(lastMove) {
        //Check if the game has ended
        for (var i = 1; i <= this.rows; i++) {

            for (var j = 1; j <= this.cols; j++) {
                
                if (this.isValidPosition(i, j) && ! this.isVisibleItem(i, j)) {
                    
                    return false;
                }
            }
        }
        
        return true;
    },

    move: function(row, col) {

        var finalItems = [],
            current = this.turn,
            rowCheck,
            colCheck,
            toCheck = (current.id === this.states.black.id) ? this.states.white : this.states.black;
        
        // check all eight directions
        for (var rowDir = -1; rowDir <= 1; rowDir++) {
            
            for (var colDir = -1; colDir <= 1; colDir++) {
                
                // dont check the actual position
                if (rowDir === 0 && colDir === 0) {
                    
                    continue;
                }
                
                // move to next item
                rowCheck = row + rowDir;
                colCheck = col + colDir;
                
                // possible items array
                var possibleItems = [];

                // look for valid items
                // look for visible items
                // look for items with opposite color
                while (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === toCheck.id) {
                    
                    possibleItems.push([rowCheck, colCheck]);
                    
                    // move to next position
                    rowCheck += rowDir;
                    colCheck += colDir;
                }
                
                // if some items were found
                if (possibleItems.length) {

                    // now we need to check that the next item is one of ours
                    if (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === current.id) {
                        
                        // push the actual item
                        finalItems.push([row, col]);
                        
                        // push each item actual line
                        for (var item in possibleItems) {
                            
                            finalItems.push(possibleItems[item]);
                        }
                    }
                }
            }
        }
        
        // check for items to check
        if (finalItems.length) {
            
            for (var item in finalItems) {
                
                this.setItemState(finalItems[item][0], finalItems[item][1], current);
            }
        }
        
        // pass turn to the other player
        this.setTurn(toCheck);
        
        // recalculate score each turn
        this.recalcuteScore();
    },
    
    displayTimer: function() {
        //Set the correct timer values
        this.seconds++;
        if(this.seconds == 60){
            this.seconds = 0;
            this.minutes++;
            if(this.minutes == 60){
                this.minutes = 0;
                this.hours++;
            }
        }
       
        let h = this.hours;
        let m = this.minutes;
        let s = this.seconds;
        //Format the timer values for the display
        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        //Show the correct time values;
        this.timerRef.innerHTML = h + ':' + m + ':' + s; 
    },
    
    startTimer: function() {
        //Start the game timer
        this.timerInt = setInterval(() => {this.displayTimer();},1000);
    },

    initTimer: function() {
        //Clear the current interval setting
        clearInterval(this.timerInt);
        //Set the timer values
        this.timerInt = null;
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.timerRef.innerHTML = '00:00:00';
    }

};