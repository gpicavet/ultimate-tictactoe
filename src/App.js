import React from 'react';
import { StyleSheet, Text, Button, View, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Board, MctsPlayer } from './Game.js';

class CellView extends React.Component {
  render() {
    let [celly, cellx] = [this.props.sy * 3 + this.props.y, this.props.sx * 3 + this.props.x];
    let player = this.props.board.getAt(celly,cellx);

    let isValid = this.props.validActions.indexOf(celly*9+cellx)>=0;

    let borderStyle = styles["border" + this.props.y + "x" + this.props.x];
    let borderColor = {borderColor : isValid ? "#ddd" : "#666"};
    return (
      <TouchableWithoutFeedback onPress={
          () => {if(isValid) this.props.onPressCell(celly, cellx);}}>
        <View style={[styles.cell, borderColor, borderStyle]}>
          <Text style={[styles.cellText, styles["cellTextPlayer" + player]]}>
            {player == 1 ? "X" : player == 2 ? "O" : ""}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class SubBoardView extends React.Component {
  render() {
    let borderStyle = styles["border" + this.props.y + "x" + this.props.x];
    const winner = this.props.board.subWinner(this.props.y, this.props.x);
    return (
      winner === 0 ?
        <View style={[styles.subBoard, borderStyle]}>
          {
            Array(9).fill(0).map((element, index) =>
              <CellView
                board={this.props.board}
                validActions={this.props.validActions}
                sx={this.props.x}
                sy={this.props.y}
                x={index % 3}
                y={Math.floor(index / 3)}
                onPressCell={this.props.onPressCell}
                key={index}
              />)
          }
        </View>
        :
        <View style={[styles.subBoard, borderStyle, styles.subBoardWinner]}>
          <Text style={[styles.subBoardText,styles["cellTextPlayer" + winner]]}>{winner == 1 ? "X" : "O"}</Text>
        </View>
    );
  }
}

class BoardView extends React.Component {
  render() {
    return (
      <View style={styles.board}>
        {
          Array(9).fill(0).map((element, index) =>
            <SubBoardView
              board={this.props.board}
              validActions={this.props.validActions}
              x={index % 3}
              y={Math.floor(index / 3)}
              onPressCell={this.props.onPressCell}
              key={index}
            />)
        }
      </View>
    );
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let board = new Board();

    this.mctsPlayer = new MctsPlayer();

    this.state = {
      board: board
    }
  }

  onPressCell(y, x) {
    let move = y * 9 + x;
    this.setState((prev) => {
      let board = this.state.board;
      board.move(move, 1);

      setTimeout(() => {
        let opmove = this.mctsPlayer.getMove(board, move, 2, 100);
        board.move(opmove, 2);
        this.setState((prev) => {
          return { board: board };
        });
      }, 0);

      return { board: board };
    });
  }

  componentDidMount() {
  }

  render() {
    return (
      <View style={styles.container}>
        <BoardView
          board={this.state.board}
          validActions={this.state.board.validActions()}
          onPressCell={(y, x) => this.onPressCell(y, x)}
        />
      </View>
    );
  }
}


const minDim = Math.min(Dimensions.get('window').width, Dimensions.get('window').height);
const subBoardWith = 5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: minDim,
    height: minDim,
  },
  subBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: subBoardWith,
    borderColor: '#1f9',
    width: minDim / 3,
    height: minDim / 3,
  },
  border0x0: {
    borderLeftColor: '#000',
    borderTopColor: '#000',
  },
  border0x1: {
    borderTopColor: '#000',
  },
  border0x2: {
    borderRightColor: '#000',
    borderTopColor: '#000',
  },
  border1x0: {
    borderLeftColor: '#000',
  },
  border1x1: {
  },
  border1x2: {
    borderRightColor: '#000',
  },
  border2x0: {
    borderLeftColor: '#000',
    borderBottomColor: '#000',
  },
  border2x1: {
    borderBottomColor: '#000',
  },
  border2x2: {
    borderRightColor: '#000',
    borderBottomColor: '#000',
  },
  subBoardText: {
    color: 'white',
    fontSize: minDim / 3 - 50,
    textAlign: 'center',
    lineHeight: minDim / 3 - 2*subBoardWith,
  },  
  cell: {
    borderWidth: subBoardWith / 2,
    width: (minDim / 3 - 2 * subBoardWith) / 3,
    height: (minDim / 3 - 2 * subBoardWith) / 3,
  },
  cellText: {
    fontSize: (minDim / 3 - 2 * subBoardWith) / 3 - 50,
    textAlign: 'center',
    lineHeight: (minDim / 3 - 2 * subBoardWith) / 3 - subBoardWith,
  },
  cellTextPlayer1: {
    color: '#a70',
  },
  cellTextPlayer2: {
    color: '#0af',
  },
});
