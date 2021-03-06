import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let classNames = 'square';
    if (props.winningSquare) {
        classNames += ' winning-square'
    }
    return (
        <button className={classNames}
                onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, isWinningSquare) {
        return (
            <Square key={i}
                    value={this.props.squares[i]}
                    winningSquare={isWinningSquare}
                    onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        const winningLine = this.props.winningLine;
        let board = [];
        for (let i = 0; i < 3; i++) {
            let row = [];
            for (let j = 0; j < 3; j++) {
                let key = (i * 2) + i + j;
                row.push(this.renderSquare(key, winningLine ? winningLine.includes(key) : false));
            }
            board.push(
                <div key={i}
                     className="board-row"
                >
                    {row}
                </div>
            );
        }
        return (
            <div>
                {board}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            orderIsAscending: true,
        }
    }

    handleClick(i) {
        const prevSelectedMoveItems = document.getElementsByClassName('selected-move-item');
        if (prevSelectedMoveItems.length) {
            prevSelectedMoveItems[0].classList.remove('selectedMoveItem');
        }

        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        const xIsNext = this.state.xIsNext;
        squares[i] = xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat({
                squares: squares,
            }),
            stepNumber: history.length,
            xIsNext: !xIsNext,
        });
    }

    jumpTo(step) {
        const prevSelectedMoveItems = document.getElementsByClassName('selected-move-item');
        if (prevSelectedMoveItems.length) {
            prevSelectedMoveItems[0].classList.remove('selectedMoveItem');
        }
        document.getElementById(step).classList.add('selectedMoveItem');
        this.setState(
            {
                stepNumber: step,
                xIsNext: (step % 2) === 0,
            }
        )
    }

    toggleOrder() {
        this.setState(
            {
                orderIsAscending: !this.state.orderIsAscending,

            }
        )
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const orderIsAscending = this.state.orderIsAscending;
        const winnerObject = calculateWinner(current.squares);


        let prevStep = history[0];
        let moves = history.map((step, move) => {
            let location;
            for (let i = 0; i < 9; i++) {
                if (step.squares[i] !== prevStep.squares[i]) {
                    location = {
                        col: i % 3,
                        row: Math.floor(i / 3),
                    }
                }
            }
            const desc = move ?
                'Go to move #' + move + ': (col=' + ( location.col + 1 ) + ', row=' + ( location.row + 1 ) + ')' :
                'Go to start';
            prevStep = step;
            return (
                <li key={move}>
                    <button id={move} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        let winningLine;
        if (winnerObject) {
            status = 'Winner: ' + winnerObject.winner;
            winningLine = winnerObject.line;
        } else {
            if (current.squares.includes(null)){
                status = 'Next player: '+ ( this.state.xIsNext ? 'X' : 'O' );
            } else {
                status = 'Draw!'
            }
        }

        let orderToggleButtonText;
        if (orderIsAscending) {
            orderToggleButtonText = 'Descending ';
        } else {
            orderToggleButtonText = 'Ascending';
            moves = moves.reverse();
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                           winningLine={winningLine}
                           onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <button onClick={() => this.toggleOrder()}>
                        {orderToggleButtonText}
                    </button>
                    <ol reversed={!orderIsAscending}>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i],
            };
        }
    }
    return null;
}
