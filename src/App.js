import React from 'react';
import { StyleSheet, Text, Button, View, TouchableWithoutFeedback, Modal, Dimensions } from 'react-native';
import { Board, MctsPlayer, PLAYER, OPPONENT, TIE, PLAYING } from './Game.js';

class CellView extends React.Component {
  render() {
    let [subboardy, subboardx] = [Math.floor(this.props.subBoardIndex / 3), this.props.subBoardIndex % 3];
    let [celly, cellx] = [subboardy * 3 + Math.floor(this.props.cellIndex / 3), subboardx * 3 + Math.floor(this.props.cellIndex % 3)];
    let gridPos = celly*9+cellx;

    let player = this.props.board.grid[gridPos];

    let isValid = this.props.validActions.indexOf(gridPos)>=0;

    let borderStyle = styles["border" + this.props.cellIndex];
    let borderColorValid = {borderLeftColor : "#ddd",borderRightColor : "#ddd",borderTopColor : "#ddd",borderBottomColor : "#ddd"};
    let cellColorValid = {backgroundColor : "#222"};
    return (
      <TouchableWithoutFeedback onPress={
          () => {if(isValid) this.props.onPressCell(gridPos);}}>
        <View style={[styles.cell, isValid ? cellColorValid : {}, isValid ? borderColorValid:{}, borderStyle]}>
          <Text style={[styles.cellText, styles["cellTextPlayer" + player]]}>
            {player == 1 ? "X" : player == 2 ? "O" : isValid ? "." : ""}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class SubBoardView extends React.Component {
  render() {
    let borderStyle = styles["border" + this.props.index];
    const winner = this.props.board.subWinners[this.props.index];
    return (
      winner === 0 ?
        <View style={[styles.subBoard, borderStyle]}>
          {
            Array(9).fill(0).map((element, index) =>
              <CellView
                board={this.props.board}
                validActions={this.props.validActions}
                subBoardIndex={this.props.index}
                cellIndex={index}
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
              index={index}
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

    this.state={
      board: board,
      status:PLAYING
    };
  }
    

  init() {
    let board = new Board();

    this.mctsPlayer = new MctsPlayer();

    this.setState({
      board: board,
      status:PLAYING
    });
  }

  onPressCell(gridPos) {
    let move = gridPos;
    this.setState((prev) => {

      let board = this.state.board;
      board.move(move, 1);
      let validActions = board.validActions();
      let status = board.status(validActions);      

      if(status === PLAYING) {
        setTimeout(() => {
          this.setState((prev) => {

            let opmove = this.mctsPlayer.getMove(board, move, 2, 100);
            board.move(opmove, 2);
            let validActions = board.validActions();
            let status = board.status(validActions);      

            return { board: board, status:status };
          });

        }, 0);
      }

      return { board: board, status:status };
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.status!==PLAYING}
          onRequestClose={()=>{this.init()}}>

          <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              justifyContent: 'center',
              alignItems: 'center', 
              backgroundColor : "#fff", 
              height: 200 ,
              width: '90%'
              }}>
              <Text>{this.state.status===PLAYER?"You Win!":this.state.status===OPPONENT?"You Lose!":this.state.status===TIE?"Draw!":""}</Text>
              <Button onPress={()=>{this.init()}} title="restart" ></Button>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}


const minDim = Math.min(Dimensions.get('window').width, Dimensions.get('window').height);
const subBoardBorderWith = 3;
const subBoardBorderPadding = 4;

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
    borderWidth: subBoardBorderWith,
    borderLeftColor: '#1f9',
    borderRightColor: '#1f9',
    borderTopColor: '#1f9',
    borderBottomColor: '#1f9',
    width: minDim / 3,
    height: minDim / 3,
    padding : subBoardBorderPadding
  },
  border0: {
    borderLeftColor: '#000',
    borderTopColor: '#000',
  },
  border1: {
    borderTopColor: '#000',
  },
  border2: {
    borderRightColor: '#000',
    borderTopColor: '#000',
  },
  border3: {
    borderLeftColor: '#000',
  },
  border4: {
  },
  border5: {
    borderRightColor: '#000',
  },
  border6: {
    borderLeftColor: '#000',
    borderBottomColor: '#000',
  },
  border7: {
    borderBottomColor: '#000',
  },
  border8: {
    borderRightColor: '#000',
    borderBottomColor: '#000',
  },
  subBoardText: {
    color: 'white',
    fontSize: minDim / 3 - 50,
    textAlign: 'center',
    lineHeight: minDim / 3 - 2*subBoardBorderWith,
    width:'100%'
  },  
  cell: {
    borderLeftColor: '#666',
    borderRightColor: '#666',
    borderTopColor: '#666',
    borderBottomColor: '#666',
    borderWidth: subBoardBorderWith / 2,
    width: (minDim / 3 - 2 * subBoardBorderWith-2*subBoardBorderPadding) / 3,
    height: (minDim / 3 - 2 * subBoardBorderWith-2*subBoardBorderPadding) / 3,
  },
  cellText: {
    fontSize: (minDim / 3 - 2 * subBoardBorderWith) / 3 - 10,
    textAlign: 'center',
    lineHeight: (minDim / 3 - 2 * subBoardBorderWith) / 3 - subBoardBorderWith,
    width:'100%'
  },
  cellTextPlayer1: {
    color: '#a70',
  },
  cellTextPlayer2: {
    color: '#0af',
  },
});
