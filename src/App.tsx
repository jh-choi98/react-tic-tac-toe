import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import styled from "styled-components";
import History from "./components/History";
import { IMoveData } from "./types/interfaces";

const PLAYER_O = "O";
const PLAYER_X = "X";

const Wrapper = styled.div`
  display: flex;
`;

function App() {
  const [curPlayer, setCurPlayer] = useState(true);
  const [numMoves, setNumMoves] = useState(0);
  const [undoStack, setUndoStack] = useState<IMoveData[]>([]);
  const [redoStack, setRedoStack] = useState<IMoveData[]>([]);
  const [cellStates, setCellStates] = useState<string[]>(Array(9).fill(""));
  const [winner, setWinner] = useState<string | null>(null);

  const handlePlayerMove = (data: IMoveData) => {
    setUndoStack((prevUndoStack) => [...prevUndoStack, data]);
    setRedoStack([]);
    setCellStates((prevStates) => {
      const updatedStates = [...prevStates];
      updatedStates[data.cellId] = curPlayer ? PLAYER_O : PLAYER_X;
      console.log(data.cellId);
      return updatedStates;
    });
    setNumMoves(undoStack.length + 1);
    setCurPlayer((prev) => !prev);
  };
  // const undo = async () => {
  //   if (undoStack.length === 0) return;
  //   const updatedUndoStack = [...undoStack];
  //   const lastElement = updatedUndoStack.pop();
  //   console.log("[updatedUndoStack]: ", updatedUndoStack);
  //   await setUndoStack(updatedUndoStack);
  //   if (!lastElement) return;
  //   setRedoStack((prevRedoStack) => [...prevRedoStack, lastElement]);
  //   setCellStates((prevCellStates) => {
  //     const updatedCellStates = [...prevCellStates];
  //     updatedCellStates[lastElement.cellId] = "";
  //     return updatedCellStates;
  //   });
  //   setCurPlayer((prev) => !prev);
  //   setNumMoves((prevNumMoves) => prevNumMoves - 1);
  // };

  /*
  - React 상태 업데이트 비동기/배칭 처리
    - 한 번의 렌더 사이클에 여러 개의 setState가 발생하면, React는 이를 최적화하여 
    한꺼번에 처리할 수 있다.
    - 따라서 루프 내에서 여러 번 setState를 호출해도, 결과적으로 한 번만 호출된 것처럼 
    보이는 현상이 발생할 수 있다.
  */
  const undoMultiple = (num: number) => {
    let updatedUndoStack = [...undoStack];
    let updatedRedoStack = [...redoStack];
    let updatedCellStates = [...cellStates];
    let updatedNumMoves = numMoves;
    let updatedCurPlayer = curPlayer;

    for (let i = 0; i < num; i++) {
      if (updatedUndoStack.length === 0) break;
      const lastItem = updatedUndoStack.pop();
      if (!lastItem) break;
      updatedRedoStack.push(lastItem);
      updatedCellStates[lastItem.cellId] = "";
      updatedNumMoves--;
      updatedCurPlayer = !updatedCurPlayer;
    }

    setUndoStack(updatedUndoStack);
    setRedoStack(updatedRedoStack);
    setCellStates(updatedCellStates);
    setNumMoves(updatedNumMoves);
    setCurPlayer(updatedCurPlayer);
    setWinner(null);
  };
  // const redo = () => {
  //   if (redoStack.length === 0) return;
  //   const updatedRedoStack = [...redoStack];
  //   const lastElement = updatedRedoStack.pop();
  //   setRedoStack(updatedRedoStack);
  //   if (!lastElement) return;
  //   setUndoStack((prevUndoStack) => [...prevUndoStack, lastElement]);
  //   setCellStates((prevCellStates) => {
  //     const updatedCellStates = [...prevCellStates];
  //     updatedCellStates[lastElement.cellId] = lastElement.player ? PLAYER_O : PLAYER_X;
  //     return updatedCellStates;
  //   });
  //   setCurPlayer((prev) => !prev);
  //   setNumMoves(numMoves + 1);
  // };

  const redoMultiple = (num: number) => {
    let updatedUndoStack = [...undoStack];
    let updatedRedoStack = [...redoStack];
    let updatedCellStates = [...cellStates];
    let updatedNumMoves = numMoves;
    let updatedCurPlayer = curPlayer;

    for (let i = 0; i < num; i++) {
      if (updatedRedoStack.length === 0) break;
      const lastItem = updatedRedoStack.pop();
      if (!lastItem) break;
      updatedUndoStack.push(lastItem);
      updatedCellStates[lastItem.cellId] = lastItem.player
        ? PLAYER_O
        : PLAYER_X;
      updatedNumMoves++;
      updatedCurPlayer = !updatedCurPlayer;
    }

    setUndoStack(updatedUndoStack);
    setRedoStack(updatedRedoStack);
    setCellStates(updatedCellStates);
    setNumMoves(updatedNumMoves);
    setCurPlayer(updatedCurPlayer);
  };
  // async/await은 js의 비동기 함수를 제어하지만, React의 렌더링 사이클과는 직접적으로 연관 x
  const traverseHistory = (targetNumMove: number) => {
    const diff = numMoves - targetNumMove;
    if (diff > 0) {
      undoMultiple(diff);
    } else if (diff < 0) {
      redoMultiple(-diff);
    }
  };

  const calculateWinner = () => {
    const conditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < conditions.length; i++) {
      const [a, b, c] = conditions[i];
      if (
        cellStates[a] &&
        cellStates[b] &&
        cellStates[c] &&
        cellStates[a] === cellStates[b] &&
        cellStates[b] === cellStates[c]
      ) {
        setWinner(cellStates[a]);
        return;
      }
    }
  };

  useEffect(() => {
    calculateWinner();
  }, [cellStates]);

  return (
    <Wrapper>
      <Board
        curPlayerBool={curPlayer}
        onMove={handlePlayerMove}
        moveNumber={numMoves + 1}
        undoStack={undoStack}
        cellStates={cellStates}
        winner={winner}
      />
      <History
        numMoves={numMoves}
        cellStates={cellStates}
        undoStack={undoStack}
        redoStack={redoStack}
        traverseHistory={traverseHistory}
      />
    </Wrapper>
  );
}

export default App;
