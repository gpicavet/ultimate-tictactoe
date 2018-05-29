export const PLAYING = -1;
export const TIE = 0;
export const PLAYER = 1;
export const OPPONENT = 2;

const subIndices = [//sub board indice by position
    0, 0, 0, 1, 1, 1, 2, 2, 2,
    0, 0, 0, 1, 1, 1, 2, 2, 2,
    0, 0, 0, 1, 1, 1, 2, 2, 2,
    3, 3, 3, 4, 4, 4, 5, 5, 5,
    3, 3, 3, 4, 4, 4, 5, 5, 5,
    3, 3, 3, 4, 4, 4, 5, 5, 5,
    6, 6, 6, 7, 7, 7, 8, 8, 8,
    6, 6, 6, 7, 7, 7, 8, 8, 8,
    6, 6, 6, 7, 7, 7, 8, 8, 8
];

const nextSubIndices = [//next allowed sub board indice by position
    0, 1, 2, 0, 1, 2, 0, 1, 2,
    3, 4, 5, 3, 4, 5, 3, 4, 5,
    6, 7, 8, 6, 7, 8, 6, 7, 8,
    0, 1, 2, 0, 1, 2, 0, 1, 2,
    3, 4, 5, 3, 4, 5, 3, 4, 5,
    6, 7, 8, 6, 7, 8, 6, 7, 8,
    0, 1, 2, 0, 1, 2, 0, 1, 2,
    3, 4, 5, 3, 4, 5, 3, 4, 5,
    6, 7, 8, 6, 7, 8, 6, 7, 8
];


const posBySubgrid = [//list of possible positions by sub board
    [0, 1, 2, 9, 10, 11, 18, 19, 20],
    [3, 4, 5, 12, 13, 14, 21, 22, 23],
    [6, 7, 8, 15, 16, 17, 24, 25, 26],
    [27, 28, 29, 36, 37, 38, 45, 46, 47],
    [30, 31, 32, 39, 40, 41, 48, 49, 50],
    [33, 34, 35, 42, 43, 44, 51, 52, 53],
    [54, 55, 56, 63, 64, 65, 72, 73, 74],
    [57, 58, 59, 66, 67, 68, 75, 76, 77],
    [60, 61, 62, 69, 70, 71, 78, 79, 80]
];

const wintab = [//all win configurations
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]];

let subWintabs = [];//win configurations by sub board (with absolute position)

for (let i = 0; i < 9; i++) {
    let sni = posBySubgrid[i];
    let wt = [];
    for (let winpos of wintab) {
        wt.push([sni[winpos[0]], sni[winpos[1]], sni[winpos[2]]]);
    }
    subWintabs.push(wt);
}

export class Board {
    constructor() {
        this.grid = Array(9 * 9).fill(0);
        this.subWinners = Array(9).fill(0);
        this.lastMove=-1;
    }

    copy(src) {

        this.grid = src.grid.slice();
        this.subWinners = src.subWinners.slice();
        this.lastMove = src.lastMove;
    }
    /**
     * p = sub grid indices (0..8)
     */
    calcSubWinner(p) {

        let win = 0;

        for (let i = 0; i < 8; i++) {
            const winpos = subWintabs[p][i];

            const first = this.grid[winpos[0]];
            if (first != 0 &&
                first == this.grid[winpos[1]] &&
                first == this.grid[winpos[2]]) {
                win = first;
                break;
            }
        }

        return win;
    }

    move(pos, player) {
        this.grid[pos] = player;
        this.lastMove=pos;
        
        const si = subIndices[pos];//refresh subwinner
        this.subWinners[si] = this.calcSubWinner(si);
    }

    validActions() {
        let validActions_ = [];
        if (this.lastMove != -1) {
            const nextAllowedSub = nextSubIndices[this.lastMove];

            if (this.subWinners[nextAllowedSub] == 0) {
                for (let i = 0; i < 9; i++) {
                    const pos = posBySubgrid[nextAllowedSub][i];
                    if (this.grid[pos] == 0) {
                        validActions_.push(pos);
                    }
                }
            }

            if (validActions_.length == 0) {//sub is won or tie
                for (let s = 0; s < 9; s++) {
                    if (this.subWinners[s] === 0) {
                        for (let i = 0; i < 9; i++) {
                            pos = posBySubgrid[s][i];
                            if (this.grid[pos] === 0) {
                                validActions_.push(pos);
                            }
                        }
                    }
                }
            }

        } else {
            for (let r = 0; r < 9 * 9; r++) {
                validActions_.push(r);
            }
        }

        return validActions_;
    }

    status(validActions) {
        let winner = 0;
        for (let i = 0; i < 8; i++) {
            const winpos = wintab[i];
            const first = this.subWinners[winpos[0]];
            if (first != 0 &&
                first == this.subWinners[winpos[1]] &&
                first == this.subWinners[winpos[2]]) {
                winner = first;
                break;
            }
        }

        if (winner != 0)
            return winner;

        if (validActions.length == 0) {
            let np = 0, no = 0;
            for (let i = 0; i < 9; i++) {
                if (this.subWinners[i] == PLAYER)
                    np++;
                else if (this.subWinners[i] == OPPONENT)
                    no++;
            }
            return np > no ? PLAYER : np < no ? OPPONENT : TIE;
        }

        return PLAYING;
    }
}

class MctsNode {
    constructor(parent, move, player) {
        this.parent=parent;
        this.firstChild=null;
        this.next=null;

        this.move=move;
        this.player=player;
        this.visitCount=0;
        this.winScore=0.0;
    }
}

/**
 * Monte Carlo Tree Search
 */
export class MctsPlayer {
    constructor() {
        this.mcts_iter = 0;
        this.mcts_opponent = 0;
        this.mcts_lastNode = null;
     }
   
    
    selectPromisingNode(fromNode, board, C) {
        let n = fromNode;
        while (n.firstChild != null) {

            let maxUtc = -Number.MAX_VALUE;
            let maxChild = n.firstChild;
            for (let c = n.firstChild; c != null; c = c.next) {
                if (c.visitCount == 0) {//no statistics=>using this node
                    maxChild = c;
                    break;
                }
                let utc = c.winScore / c.visitCount + C * Math.sqrt(Math.log(n.visitCount) / c.visitCount);
                if (utc >= maxUtc) {
                    maxUtc = utc;
                    maxChild = c;
                }
            }

            //update board
            board.move(maxChild.move, maxChild.player);

            n = maxChild;
        }
        return n;
    }

    expandNode(fromNode, validActions) {
        let res = fromNode;
        let last = null;

        let player = 3 - fromNode.player;

        for (let i = 0; i < validActions.length; i++) {

            let pos = validActions[i];

            res = new MctsNode(
                fromNode,
                pos,
                player);

            if (last == null)
                fromNode.firstChild = res;
            else
                last.next = res;

            last = res;
        }

        return res;
    }

    simulateNode(node, board) {
        let validActions = board.validActions();
        let boardStatus = board.status(validActions);
        if (boardStatus == this.mcts_opponent) {
            node.parent.winScore = -Number.MAX_VALUE;
            return boardStatus;
        }
        let player = node.player;

        while (boardStatus == PLAYING) {

            let move = validActions[Math.floor(Math.random() * validActions.length)];

            player = 3 - player;
            board.move(move, player);
            validActions = board.validActions();

            boardStatus = board.status(validActions);
        }

        return boardStatus;
    }

    backPropagate(fromNode, status) {
        for (let n = fromNode; n != null; n = n.parent) {
            n.visitCount++;
            if (n.player == status) {
                n.winScore += 1;
            }
            else if (TIE == status) {
                n.winScore += 0.5;
            }
        }
    }

    getMove(board, opMove, player, maxTime) {

        let C = 0.4; // magic constant

        let start = Date.now();
        let mcts_end = start + maxTime;
        this.mcts_opponent = 3 - player;

        let root;
        //reusing previous Tree gives better results
        if (this.mcts_lastNode == null) {
            root = new MctsNode(null, opMove, this.mcts_opponent);
        } else {
            for (let c = this.mcts_lastNode.firstChild; c != null; c = c.next) {
                if (c.move == opMove) {
                    root = c;
                    root.parent = null;
                    break;
                }
            }
        }
        if (root == null) {
            console.error("ERROR");
            root = new MctsNode(null, opMove, this.mcts_opponent);
        }


        let board2 = new Board();

        this.mcts_iter = 0;

        while (Date.now() < mcts_end) {
            board2.copy(board);

            let promisingNode = this.selectPromisingNode(root, board2, C);

            //expand root or a node with statistics    
            if (promisingNode == root || promisingNode.visitCount > 0) {
                let validActions = board2.validActions();

                if (board2.status(validActions) == PLAYING) {
                    promisingNode = this.expandNode(promisingNode, validActions);
                    board2.move(promisingNode.move, promisingNode.player);
                }
            }

            let simStatus = this.simulateNode(promisingNode, board2);

            this.backPropagate(promisingNode, simStatus);
            this.mcts_iter++;
        }

        let bestNode = root.firstChild;
        for (let c = root.firstChild; c != null; c = c.next) {
            let diff = c.winScore / c.visitCount - bestNode.winScore / bestNode.visitCount;
            if (diff > 0 || (diff == 0 && c.visitCount > bestNode.visitCount)) {
                bestNode = c;
            }
        }

        this.mcts_lastNode = bestNode;

        return bestNode.move;
    }
}